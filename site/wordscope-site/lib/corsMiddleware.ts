import { NextApiRequest, NextApiResponse } from 'next'

// Allowed origins for your extension and site
const ALLOWED_ORIGINS = [
  // Your Vercel site
  'https://www.wordscope.app',
  'https://wordscope-site.vercel.app', 
  
  // Chrome extension origins (allow any extension ID)
  'chrome-extension://*', // Allow any chrome extension
  
  // Local development
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:3000',
    'http://localhost:1337', // Plasmo dev server
    'chrome-extension://localhost:1337', // Plasmo dev extension
  ] : []),
  
  // Stripe webhook origin
  'https://hooks.stripe.com'
]

export function applyCORS(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin
  const referer = req.headers.referer
  
  // Allow requests with no origin (like Stripe webhooks, server-to-server, chrome extensions)
  if (!origin && !referer) {
    // Additional validation for webhooks
    const userAgent = req.headers['user-agent']
    if (userAgent?.includes('Stripe')) {
      return true // Allow Stripe webhooks
    }
    
    // For debugging APIs, allow if in development
    if (process.env.NODE_ENV === 'development') {
      return true
    }
  }
  
  // Check if origin is allowed
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed => {
    if (allowed.includes('*')) {
      // Wildcard matching for extension IDs during development
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(pattern).test(origin)
    }
    return origin === allowed
  })
  
  // Allow chrome-extension origins
  const isChromeExtension = origin && origin.startsWith('chrome-extension://');
  
  if (isAllowed || isChromeExtension) {
    // Set CORS headers for allowed origins
    res.setHeader('Access-Control-Allow-Origin', origin!)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature')
    
    return true
  }
  
  // Reject unauthorized requests
  res.status(403).json({ 
    error: 'CORS: Origin not allowed',
    origin: origin || 'none',
    referer: referer || 'none',
    debug: true
  })
  return false
}

export function handleCORSPreflight(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method === 'OPTIONS') {
    if (applyCORS(req, res)) {
      res.status(200).end()
    }
    return true // Handled preflight
  }
  return false // Not a preflight request
}

// Wrapper for API routes that need CORS protection
export function withCORS(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Handle preflight requests
    if (handleCORSPreflight(req, res)) {
      return
    }
    
    // Apply CORS and check if allowed
    if (!applyCORS(req, res)) {
      return // Request rejected
    }
    
    // Execute the actual API handler
    return handler(req, res)
  }
}
