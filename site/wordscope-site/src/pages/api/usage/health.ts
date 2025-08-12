// pages/api/kv/health.ts (Pages Router) OR app/api/kv/health/route.ts (App Router)
import type { NextApiRequest, NextApiResponse } from "next";
import { redis } from "@/../lib/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({ ok: false, error: "Missing Upstash env vars" });
    }

    const pong = await redis.ping();
    await redis.set("ws:test", Date.now());
    const val = await redis.get("ws:test");
    return res.status(200).json({ ok: true, pong, val });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("KV health error:", e);
    return res.status(500).json({
      ok: false,
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
  }
}
