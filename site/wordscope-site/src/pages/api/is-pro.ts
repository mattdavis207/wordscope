import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed")

    const email = req.query.email as string
    if (!email) return res.status(400).json({ error: "Email is required" })

    console.log("📩 Checking Pro status for email:", email)

    // Find customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (!customers.data.length) {
      console.log("No customer found for email:", email)
      return res.status(200).json({ isPro: false })
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

    console.log("📦 Active subscription found:", !!activeSubscription)

    res.status(200).json({ isPro: !!activeSubscription })
  } catch (err) {
    console.error("❌ API error in is-pro:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
