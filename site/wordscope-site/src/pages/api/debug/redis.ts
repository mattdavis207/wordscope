import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;
const emailCacheKey = (email: string) => `${PREFIX}:ws:email:${email}`;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env === "production") {
    return res.status(403).json({ error: "Disabled in production" });
  }

  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email required" });

    // Get customer ID
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customerId = customers.data[0]?.id;

    if (!customerId) {
      return res.json({
        email,
        error: "No Stripe customer found",
        redisData: null
      });
    }

    // Get Redis data
    const redisKey = quotaKey(customerId);
    const emailKey = emailCacheKey(email);
    
    const [quotaData, cachedCustomerId] = await Promise.all([
      redis.hgetall(redisKey),
      redis.get(emailKey)
    ]);

    // Get subscription info
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5
    });

    return res.json({
      email,
      customerId,
      redisQuotaKey: redisKey,
      redisEmailKey: emailKey,
      quotaData,
      cachedCustomerId,
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        created: sub.created,
        rawSubData: sub // Include raw subscription data for debugging
      }))
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
