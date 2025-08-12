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
  // 1) try cache to avoid Stripe call every time
  const cached = await redis.get<string>(emailCacheKey(email));
  if (cached) return cached;

  // 2) Stripe search (basil supports .search)
  const safe = email.replace(/'/g, "\\'");
  const r = await stripe.customers.search({ query: `email:'${safe}'`, limit: 1 });

  const id = r.data?.[0]?.id ?? null;
  if (id) {
    // cache for a day (optional)
    await redis.set(emailCacheKey(email), id, { ex: 86400 });
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

    const data = await redis.hgetall<{ tokensRemaining?: number; periodEnd?: number }>(quotaKey(customerId));

    return res.status(200).json({
      remainingTokens: data?.tokensRemaining ?? 0,
      periodEnd: data?.periodEnd ?? null
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

