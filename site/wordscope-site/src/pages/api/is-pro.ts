import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { redis } from "@/../lib/redis"
import { isTesterEmail } from "@/../lib/testerBypass"
import { withCORS } from "../../../lib/corsMiddleware"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed")

    const email = req.query.email as string
    if (!email) return res.status(400).json({ error: "Email is required" })

    if (isTesterEmail(email)) {
      const verifiedKey = `verified:${email}`
      await redis.set(verifiedKey, JSON.stringify({ verified: true, timestamp: Date.now() }), { ex: 86400 })
      return res.status(200).json({
        isPro: true,
        reason: "tester_bypass",
        isVerified: true
      })
    }

    // First, check if email is verified
    const verifiedKey = `verified:${email}`
    const verificationStatus = await redis.get<string>(verifiedKey)
    
    if (!verificationStatus) {
      return res.status(200).json({ 
        isPro: false, 
        reason: "email_not_verified",
        message: "Please verify your email address first" 
      })
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (!customers.data.length) {
      return res.status(200).json({ isPro: false, reason: "no_customer" })
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
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}
