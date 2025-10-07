import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";
import { DEC_IF_ENOUGH } from "@/../lib/redisScripts";
import { getTesterCustomerId, isTesterEmail } from "@/../lib/testerBypass";
import { withCORS } from "../../../lib/corsMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
  })

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const PREFIX = ENV === "production" ? "prod" : "dev";
const quotaKey     = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;
const emailCacheKey = (email: string)    => `${PREFIX}:ws:email:${email.toLowerCase()}`;

// Resolve customer by email, with Redis cache + list fallback
async function resolveCustomerIdByEmail(email: string): Promise<string | null> {
    if (isTesterEmail(email)) {
      const testerId = getTesterCustomerId(email)
      await redis.set(emailCacheKey(email), testerId, { ex: 86400 })
      return testerId
    }

    // 1) try cache
    const cached = await redis.get<string>(emailCacheKey(email));
    if (cached) return cached;
  
    // 2) Stripe search
    try {
      const safe = email.replace(/'/g, "\\'");
      const sr = await stripe.customers.search({ query: `email:'${safe}'`, limit: 1 });
      const id = sr.data?.[0]?.id ?? null;
      if (id) {
        await redis.set(emailCacheKey(email), id, { ex: 86400 });
        return id;
      }
    } catch {}
  
    // 3) fallback
    const list = await stripe.customers.list({ email, limit: 1 });
    const id = list.data?.[0]?.id ?? null;
    if (id) await redis.set(emailCacheKey(email), id, { ex: 86400 });
    return id;
}

  function normalizeEmail(input: unknown): string | null {
    if (Array.isArray(input)) input = input[0]; // take first if array
    if (typeof input !== "string") return null;
    const e = input.trim().toLowerCase();
    return e.length ? e : null;
  }

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { rawEmail, messages, max_tokens = 500, temperature = 0.7 } = req.body as {
            rawEmail?: string;
            messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
            max_tokens?: number;
            temperature?: number;
        };

        // Processing email parameter

        const email = normalizeEmail(req.body?.email);
        if (!email) return res.status(400).json({ error: "email is required" });
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "messages is required" });
        }

        // Derive customerId from email (no client pass-through)
        const customerId = await resolveCustomerIdByEmail(email);
        if (!customerId) {
            // The user hasn’t completed checkout (no Stripe customer yet)
            return res.status(404).json({ error: "Stripe customer not found for email" });
        }

        // Check quota
        const key = quotaKey(customerId);
        let quota = await redis.hgetall<{ tokensRemaining?: number; periodEnd?: number }>(key);

        if (isTesterEmail(email) && (!quota?.tokensRemaining || quota.tokensRemaining <= 0)) {
            const periodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await redis.hmset(key, {
                tokensRemaining: 50000,
                periodEnd
            });
            quota = { tokensRemaining: 50000, periodEnd };
        }
        if (!quota?.tokensRemaining || quota.tokensRemaining <= 0) {
            return res.status(402).json({ error: "Token limit reached", remainingTokens: 0 });
        }

        // Call OpenAI
        const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`
            },
            body: JSON.stringify({
            model: "gpt-4o",
            messages,
            max_tokens,
            temperature
            })
        });

        if (!oaRes.ok) {
            const e = await oaRes.json().catch(() => ({}));
            return res.status(500).json({ error: e?.error?.message || "OpenAI error" });
        }

        const data = await oaRes.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        const used = data.usage?.completion_tokens ?? 0; // Only count output tokens

        // Atomic decrement
        const remainingTokens = await redis.eval(DEC_IF_ENOUGH, [key], [String(used)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((remainingTokens as any)?.err === "insufficient") {
            return res.status(402).json({ error: "Token limit reached", remainingTokens: 0 });
        }

        // Optional: also refresh the email→customerId cache (longer TTL)
        await redis.set(emailCacheKey(email.toLowerCase()), customerId, { ex: 7 * 86400 });

        return res.json({ text, used, remainingTokens });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
        return res.status(500).json({ error: e.message || "Internal Server Error" });
    }
}

export default withCORS(handler);
