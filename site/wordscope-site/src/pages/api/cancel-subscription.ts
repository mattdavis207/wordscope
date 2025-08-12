import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed")

  const { email } = req.body
  if (!email) return res.status(400).json({ error: "Email is required" })

  try {
    // Find the customer
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return res.status(404).json({ error: "Customer not found" })

    // Find active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
    })
    const subscription = subscriptions.data[0]
    if (!subscription) return res.status(404).json({ error: "No active subscription found" })

    // Cancel subscription
    await stripe.subscriptions.cancel(subscription.id)

    res.status(200).json({ success: true })
  } catch (err) {
    if (err instanceof Error) {
        console.error("⚠️ Webhook signature verification failed.", err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
      } else {
        console.error("⚠️ Unknown error during webhook verification.", err)
        return res.status(400).send("Webhook Error: Unknown error")
      }
  }
}
