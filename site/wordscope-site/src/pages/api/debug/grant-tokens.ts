import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";
import { getTesterCustomerId, isTesterEmail } from "@/../lib/testerBypass";

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env === "production") {
    return res.status(403).json({ error: "Disabled in production" });
  }

  try {
    const { email, tokens = 50000 } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    let customerId: string | undefined;

    if (isTesterEmail(email)) {
      customerId = getTesterCustomerId(email);
    } else {
      const customers = await stripe.customers.list({ email, limit: 1 });
      customerId = customers.data[0]?.id;
    }

    if (!customerId) {
      return res.status(404).json({ error: "No Stripe customer found" });
    }

    // Grant tokens manually
    const periodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const redisKey = quotaKey(customerId);
    
    await redis.hmset(redisKey, {
      tokensRemaining: tokens,
      periodEnd: periodEnd
    });

    // Verify it was set
    const verification = await redis.hgetall(redisKey);

    return res.json({
      success: true,
      customerId,
      tokensGranted: tokens,
      periodEnd: new Date(periodEnd),
      verification
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
