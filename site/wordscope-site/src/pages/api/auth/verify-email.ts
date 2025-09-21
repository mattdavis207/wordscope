import type { NextApiRequest, NextApiResponse } from 'next'
import { redis } from '../../../../lib/redis'
import { withCORS } from '../../../../lib/corsMiddleware'
import { isTesterEmail } from '../../../../lib/testerBypass'

interface VerifyRequest {
  email: string
  code: string
}

interface VerifyResponse {
  success: boolean
  message: string
  isVerified?: boolean
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  // CORS handled by withCORS wrapper

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { email, code }: VerifyRequest = req.body

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Invalid verification code format' })
    }

    if (isTesterEmail(email)) {
      const verifiedKey = `verified:${email}`
      await redis.set(verifiedKey, JSON.stringify({ verified: true, timestamp: Date.now() }), { ex: 86400 })
      return res.status(200).json({
        success: true,
        message: 'Tester email auto-verified',
        isVerified: true
      })
    }

    // Get stored verification data
    const verificationKey = `verification:${email}`
    const storedData = await redis.get(verificationKey)
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code expired or not found' 
      })
    }

    // Handle both string and object responses from Redis
    let verificationData
    if (typeof storedData === 'string') {
      verificationData = JSON.parse(storedData)
    } else if (typeof storedData === 'object') {
      verificationData = storedData
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification data format' 
      })
    }
    
    // Check attempt limits (max 3 attempts per code)
    if (verificationData.attempts >= 3) {
      await redis.del(verificationKey) // Delete after max attempts
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new code.' 
      })
    }

    // Verify the code
    if (verificationData.code !== code) {
      // Increment attempt counter
      verificationData.attempts += 1
      await redis.set(verificationKey, JSON.stringify(verificationData), { ex: 300 })
      
      return res.status(400).json({ 
        success: false, 
        message: `Invalid verification code. ${3 - verificationData.attempts} attempts remaining.` 
      })
    }

    // Code is valid! Clean up verification data
    await redis.del(verificationKey)

    // Store verified status in Redis cache (24 hours)
    const verifiedKey = `verified:${email}`
    await redis.set(verifiedKey, JSON.stringify({
      verified: true,
      timestamp: Date.now()
    }), { ex: 86400 })

    return res.status(200).json({
      success: true,
      message: 'Email successfully verified',
      isVerified: true
    })

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

export default withCORS(handler);
