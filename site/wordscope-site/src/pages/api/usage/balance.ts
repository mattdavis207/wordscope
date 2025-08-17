import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis"; // <-- fix the import

// optional: env-based key prefix so dev/prod don’t collide
const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;
const emailCacheKey = (email: string) => `${PREFIX}:ws:email:${email}`;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

// CORS for extension
function setCORS(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

// find Stripe customer by email (no DB needed)
async function customerIdByEmail(email: string): Promise<string | null> {
  console.log(`🔍 Looking up customer for email: ${email}`);
  
  // 1) Get fresh customer ID from Stripe (don't trust cache for balance checks)
  const safe = email.replace(/'/g, "\\'");
  const r = await stripe.customers.search({ query: `email:'${safe}'`, limit: 1 });

  let id = r.data?.[0]?.id ?? null;
  console.log(`🔎 Stripe search result for ${email}: ${id}`);
  
  if (!id) {
    // Try fallback list method
    console.log(`🔄 Trying fallback list method for ${email}`);
    const listResult = await stripe.customers.list({ email, limit: 1 });
    id = listResult.data?.[0]?.id ?? null;
    console.log(`📋 List result: ${id}`);
  }
  
  if (id) {
    // Update cache with current customer ID
    await redis.set(emailCacheKey(email), id, { ex: 86400 });
    console.log(`💾 Updated cached customer ID ${id} for ${email}`);
  }
  
  return id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
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
    
    console.log(`💰 Balance check for ${customerId}:`, {
      rawData: data,
      tokensRemaining,
      periodEnd,
      periodEndDate: periodEnd ? new Date(periodEnd) : null,
      redisKey: quotaKey(customerId)
    });

    return res.status(200).json({
      remainingTokens: tokensRemaining,
      periodEnd: periodEnd
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Surface the actual reason to your logs
    console.error("balance error:", {
      message: e?.message,
      type: e?.type,
      code: e?.code,
      param: e?.param,
      raw: e?.raw,
    });
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}

