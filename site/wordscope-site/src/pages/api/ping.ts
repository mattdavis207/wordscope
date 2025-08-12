// src/pages/api/ping.ts (or pages/api/ping.ts depending on chosen option)
import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true });
}
