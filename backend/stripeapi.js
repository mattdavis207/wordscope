import Stripe from 'stripe'
import express from 'express'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
const app = express()

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: 'price_12345', quantity: 1 }],
    success_url: 'https://yourextension.com/success',
    cancel_url: 'https://yourextension.com/cancel'
  })
  res.json({ url: session.url })
})

app.listen(4242, () => console.log('Running on port 4242'))
