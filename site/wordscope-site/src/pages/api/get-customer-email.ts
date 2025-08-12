import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { session_id } = req.query
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Session ID is required" })
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer"],
    })

    const email = (session.customer as Stripe.Customer)?.email
    if (!email) return res.status(404).json({ error: "Email not found" })

    res.status(200).json({ email })
  } catch (err) {
    console.error("❌ Error fetching customer email:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
