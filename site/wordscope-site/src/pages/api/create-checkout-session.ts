import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

// Initialize the cors middleware

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})


// const setCORS = (res: NextApiResponse, origin?: string | null) => {
//   // TEMP: allow localhost + your prod domain; add more if needed
//   const allowed = new Set([
//     "http://localhost:3000",
//     "http://127.0.0.1:3000",
//     "https://wordscope-extension.vercel.app",
//   ]);
//   const allow = origin && allowed.has(origin) ? origin : "*";

//   res.setHeader("Access-Control-Allow-Origin", allow);
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Vary", "Origin");
// };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // setCORS(res)

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  // TEMP BYPASS

  try {
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed")

    const { email } = req.body
    console.log("Creating checkout session for:", email)

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
      // metadata: { email },
      // subscription_data: { metadata: { email } },
      // customer_creation: "always",
      ...(email ? { customer_email: email } : {})
    })

    // Build params incrementally to avoid sending undefined/invalid stuff
    // const params: Stripe.Checkout.SessionCreateParams = {
    //   payment_method_types: ["card"],
    //   mode: "subscription",
    //   ui_mode: "hosted", // explicit; basil supports this
    //   line_items: [
    //     {
    //       price: process.env.STRIPE_PRICE_ID,
    //       quantity: 1,
    //     },
    //   ],
    //   // You must use success_url/cancel_url for hosted Checkout
    //   success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/cancel`,
    //   // Let Checkout pick payment methods automatically; comment out if you really need to force "card"
    //   // automatic_payment_methods: { enabled: true },
    //   customer_creation: "always",
    // }

    // // Only attach metadata if we actually have a string email
    // if (email && typeof email === "string") {
    //   params.customer_email = email
    //   params.metadata = { email } // metadata values must be strings
    //   // If you really want this on the Subscription too:
    //   params.subscription_data = { metadata: { email } }
    // }

    // const session = await stripe.checkout.sessions.create(params)

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error("❌ API error in create-checkout-session:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
