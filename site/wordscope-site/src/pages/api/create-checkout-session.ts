import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { withCORS } from "../../../lib/corsMiddleware"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})


// CORS handled by withCORS wrapper

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS handled by withCORS wrapper
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  // TEMP BYPASS

  try {
    if (req.method !== "POST") {
      res.status(405).end("Method Not Allowed");
      return;
    }

    const { email } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/cancel`,
      
      // Enable automatic tax collection
      automatic_tax: {
        enabled: true,
      },
      
      // Collect customer address for tax calculation
      billing_address_collection: "required",
      
      // Collect phone number for better customer service
      phone_number_collection: {
        enabled: true
      },
      
      // Allow promotion codes
      allow_promotion_codes: true,
  
      ...(email && email !== "test" && typeof email === "string" && email.includes("@") ? { customer_email: email } : {})
    })

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ API error in create-checkout-session:", err)
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withCORS(handler);
