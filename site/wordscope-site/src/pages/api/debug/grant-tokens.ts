import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { email, tokens = 50000 } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    // Get customer ID
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customerId = customers.data[0]?.id;

    if (!customerId) {
      return res.status(404).json({ error: "No Stripe customer found" });
    }

    // Grant tokens manually
    const periodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const redisKey = quotaKey(customerId);
    
    console.log(`🛠️ MANUAL: Granting ${tokens} tokens to customer ${customerId}`);
    
    await redis.hmset(redisKey, {
      tokensRemaining: tokens,
      periodEnd: periodEnd
    });

    // Verify it was set
    const verification = await redis.hgetall(redisKey);
    
    console.log(`✅ MANUAL: Verification for ${customerId}:`, verification);

    return res.json({
      success: true,
      customerId,
      tokensGranted: tokens,
      periodEnd: new Date(periodEnd),
      verification
    });

  } catch (error) {
    console.error("Manual grant error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}