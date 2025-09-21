import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";

// optional: env-based key prefix so dev/prod don’t collide
const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;
const emailCacheKey = (email: string) => `${PREFIX}:ws:email:${email}`;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

// CORS handled by withCORS wrapper

// find Stripe customer by email (no DB needed)
async function customerIdByEmail(email: string): Promise<string | null> {
  // Looking up customer
  
  // 1) Get fresh customer ID from Stripe (don't trust cache for balance checks)
  const safe = email.replace(/'/g, "\\'");
  const r = await stripe.customers.search({ query: `email:'${safe}'`, limit: 1 });

  let id = r.data?.[0]?.id ?? null;
  // Search completed
  
  if (!id) {
    // Try fallback list method
    // Trying fallback method
    const listResult = await stripe.customers.list({ email, limit: 1 });
    id = listResult.data?.[0]?.id ?? null;
    // Fallback completed
  }
  
  if (id) {
    // Update cache with current customer ID
    await redis.set(emailCacheKey(email), id, { ex: 86400 });
    // Cache updated
  }
  
  return id;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers to allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method !== "GET")   return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const email = (req.query.email as string | undefined)?.trim();
    if (!email) return res.status(400).json({ error: "email is required" });

    const customerId = await customerIdByEmail(email);
    if (!customerId) return res.status(404).json({ error: "Stripe customer not found for email" });

    const data = await redis.hgetall(quotaKey(customerId));
    
    // Convert to numbers explicitly (Redis returns strings)
    const tokensRemaining = data?.tokensRemaining ? Number(data.tokensRemaining) : 0;
    const periodEnd = data?.periodEnd ? Number(data.periodEnd) : null;

    return res.status(200).json({
      remainingTokens: tokensRemaining,
      periodEnd: periodEnd
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Surface the actual reason to your logs
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}

export default handler;

