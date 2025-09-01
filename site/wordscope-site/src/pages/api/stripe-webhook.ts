import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { redis } from "@/../lib/redis";
import { emailService } from "@/../lib/emailService";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
  })

const PREFIX = process.env.VERCEL_ENV === "production" ? "prod" : "dev";
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`;


async function topUp(customerId: string, periodEndMs: number) {
    const redisKey = quotaKey(customerId);
    
    await redis.hmset(redisKey, {
        tokensRemaining: 50_000,
        periodEnd: periodEndMs,
    });
    
    // Verify the data was stored correctly
    const verification = await redis.hgetall(redisKey);
}

async function zeroOut(customerId: string) {
  // Clear both tokens and period to avoid any conflicts on re-subscription
  await redis.hmset(quotaKey(customerId), { 
    tokensRemaining: 0,
    periodEnd: 0
  });
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
    // Webhook processing started
    
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
          
          // Send welcome email for new subscriptions
          if (session.customer_email && session.mode === 'subscription') {
            try {
              const customerName = session.customer_details?.name || undefined;
              await emailService.sendSubscriptionWelcomeEmail(session.customer_email, customerName);
            } catch (error) {
              console.error('❌ Failed to send welcome email:', error);
              // Don't fail the webhook for email issues
            }
          }
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
          
          // Send cancellation email
          try {
            // Get customer details to send email
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted && customer.email) {
              const customerName = customer.name || undefined;
              await emailService.sendSubscriptionCancellationEmail(customer.email, customerName);
            }
          } catch (error) {
            console.error('❌ Failed to send cancellation email:', error);
            // Don't fail the webhook for email issues
          }
        }
        break;
      }

      // Handle subscription creation/reactivation (for re-subscribers)
      case "customer.subscription.created": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = event.data.object;
        const customerId = readCustomerId(sub);
        if (customerId && (sub.status === "active" || sub.status === "trialing")) {
          const soft30Days = Date.now() + 30 * 24 * 60 * 60 * 1000;
          await topUp(customerId, soft30Days);
        }
        break;
      }

      // Handle subscription status changes (cancelled to active)
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = event.data.object;
        const customerId = readCustomerId(sub);
        if (customerId && sub.status === "active") {
          // Check if this is a reactivation (previous object was cancelled/inactive)
          const prevSub = event.data.previous_attributes;
          if (prevSub && (prevSub.status === "canceled" || prevSub.status === "incomplete")) {
            const soft30Days = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await topUp(customerId, soft30Days);
          }
        } else if (customerId && (sub.status === "canceled" || sub.status === "past_due")) {
          // Subscription expired or failed payment - zero out tokens
          await zeroOut(customerId);
        }
        break;
      }

      // Handle failed payments that lead to subscription expiration
      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice: any = event.data.object;
        const customerId = readCustomerId(invoice);
        if (customerId) {
          // Check if this is the final failed attempt that will cancel the subscription
          const attemptCount = invoice.attempt_count || 0;
          if (attemptCount >= 4) { // Stripe typically tries 4 times
            await zeroOut(customerId);
          }
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