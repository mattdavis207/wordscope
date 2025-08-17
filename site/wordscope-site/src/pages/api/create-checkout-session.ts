import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

// Initialize the cors middleware

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})


const setCORS = (res: NextApiResponse, req: NextApiRequest) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://wordscope-extension.vercel.app"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCORS(res, req)

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
  
      ...(email && email !== "test" && typeof email === "string" && email.includes("@") ? { customer_email: email } : {})
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error("❌ API error in create-checkout-session:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
