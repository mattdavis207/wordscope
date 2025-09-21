import type { NextApiRequest, NextApiResponse } from 'next'
import { redis } from '../../../../lib/redis'
import { withCORS } from '../../../../lib/corsMiddleware'
import { isTesterEmail } from '../../../../lib/testerBypass'

interface CheckRequest {
  email: string
}

interface CheckResponse {
  success: boolean
  isVerified: boolean
  message?: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse>
) {
  // CORS handled by withCORS wrapper

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, isVerified: false, message: 'Method not allowed' })
  }

  try {
    const email = req.method === 'POST' ? req.body.email : req.query.email as string

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, isVerified: false, message: 'Invalid email address' })
    }

    if (isTesterEmail(email)) {
      return res.status(200).json({
        success: true,
        isVerified: true,
        message: 'Tester email auto-verified'
      })
    }

    // Check if email is verified in Redis cache
    const verifiedKey = `verified:${email}`
    const verificationStatus = await redis.get<string>(verifiedKey)
    
    if (verificationStatus) {
      const data = JSON.parse(verificationStatus)
      if (data.verified) {
        return res.status(200).json({
          success: true,
          isVerified: true,
          message: 'Email is verified'
        })
      }
    }

    return res.status(200).json({
      success: true,
      isVerified: false,
      message: 'Email is not verified'
    })

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      isVerified: false,
      message: 'Internal server error' 
    })
  }
}

export default withCORS(handler);