import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { redis } from "@/../lib/redis"
import { getTesterCustomerId, isTesterEmail } from "@/../lib/testerBypass"
import { withCORS } from "../../../lib/corsMiddleware"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

const ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development"
const PREFIX = ENV === "production" ? "prod" : "dev"
const quotaKey = (customerId: string) => `${PREFIX}:ws:quota:${customerId}`

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {

    const email = req.query.email as string
    if (!email) return res.status(400).json({ error: "Email is required" })

    if (isTesterEmail(email)) {
      const verifiedKey = `verified:${email}`
      await redis.set(verifiedKey, JSON.stringify({ verified: true, timestamp: Date.now() }), { ex: 86400 })

      const testerCustomerId = getTesterCustomerId(email)
      const testerQuotaKey = quotaKey(testerCustomerId)
      const quota = await redis.hgetall<{ tokensRemaining?: string }>(testerQuotaKey)

      if (!quota?.tokensRemaining || Number(quota.tokensRemaining) <= 0) {
        const periodEnd = Date.now() + 30 * 24 * 60 * 60 * 1000
        await redis.hmset(testerQuotaKey, {
          tokensRemaining: 50000,
          periodEnd
        })
      }

      res.status(200).json({
        isPro: true,
        reason: "tester_bypass",
        isVerified: true
      })
      return
    }

    // First, check if email is verified
    const verifiedKey = `verified:${email}`
    const verificationStatus = await redis.get<string>(verifiedKey)
    
    if (!verificationStatus) {
      res.status(200).json({ 
        isPro: false, 
        reason: "email_not_verified",
        message: "Please verify your email address first" 
      })
      return
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (!customers.data.length) {
      res.status(200).json({ isPro: false, reason: "no_customer" })
      return
    }

    const customerId = customers.data[0].id

    // Get subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    })

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    )

    res.status(200).json({ 
      isPro: !!activeSubscription,
      reason: activeSubscription ? "active_subscription" : "no_subscription",
      isVerified: true
    })
    return
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" })
    return
  }
}


export default withCORS(handler);
