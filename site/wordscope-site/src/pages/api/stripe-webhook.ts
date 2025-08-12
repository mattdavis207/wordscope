import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
  })

const PREFIX = process.env.VERCEL_ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;


async function topUp(customerId: string, periodEndMs: number) {
    await redis.hmset(quotaKey(customerId), {
        tokensRemaining: 50_000,
        periodEnd: periodEndMs,
    });
}

async function zeroOut(customerId: string) {
await redis.hmset(quotaKey(customerId), { tokensRemaining: 0 });
}

// Safely get a customer id from any object that might have it string-or-object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readCustomerId(obj: any): string | null {
    if (!obj) return null;
    const c = obj.customer;
    if (!c) return null;
    return typeof c === "string" ? c : c.id ?? null;
  }
  
  // For invoices, derive the service period end from line items (works across versions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function readPeriodEndFromInvoice(invoice: any): number | null {
    try {
      const line = invoice?.lines?.data?.[0];
      const endSec = line?.period?.end;
      if (typeof endSec === "number") return endSec * 1000;
    } catch {}
    return null;
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing stripe-signature");
  

  const buf = await buffer(req);
  let event: Stripe.Event;
    
  // Connect to stripe webhook
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return res.status(400).send(`Webhook error: ${e.message || String(e)}`);
  }

  try {
    switch (event.type) {
      // First purchase via Checkout — grant immediately with a soft 30d anchor.
      // The first invoice that follows will correct the period end.
      case "checkout.session.completed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session: any = event.data.object;
        const customerId = readCustomerId(session);
        if (customerId) {
          const soft30Days = Date.now() + 30 * 24 * 60 * 60 * 1000;
          await topUp(customerId, soft30Days);
        }
        break;
      }

      // Monthly renewals and trial-to-paid. We DO NOT read subscription.current_period_end.
      // We take the service window from the invoice line period instead.
      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice: any = event.data.object;
        const customerId = readCustomerId(invoice);
        if (!customerId) break;

        const periodEndMs =
          readPeriodEndFromInvoice(invoice) ?? Date.now() + 30 * 24 * 60 * 60 * 1000;

        await topUp(customerId, periodEndMs);
        break;
      }

      // Handle cancellations (optional but tidy)
      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = event.data.object;
        const customerId = readCustomerId(sub);
        if (customerId) {
          await zeroOut(customerId);
        }
        break;
      }

      // You can ignore other events or add more cases as needed
      default:
        break;
    }

    return res.json({ received: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("Webhook internal error:", e);
    return res.status(500).json({ error: e.message || "Internal Server Error" });
  }
}