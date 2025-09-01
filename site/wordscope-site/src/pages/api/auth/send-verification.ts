import type { NextApiRequest, NextApiResponse } from 'next'
import { redis } from '../../../../lib/redis'
import { withCORS } from '../../../../lib/corsMiddleware'

// Force Node.js runtime for email functionality
export const config = {
  runtime: 'nodejs'
}

interface EmailService {
  sendVerificationCode(email: string, code: string): Promise<void>
  testConnection(): Promise<boolean>
}

let emailServiceInstance: EmailService | null = null

// Dynamic import to catch any issues
async function getEmailService(): Promise<EmailService> {
  if (!emailServiceInstance) {
    try {
      const emailModule = await import('../../../../lib/emailService')
      emailServiceInstance = emailModule.emailService
    } catch (importError) {
      console.error('❌ Failed to import email service:', importError)
      throw new Error(`Email service import failed: ${importError instanceof Error ? importError.message : 'Unknown error'}`)
    }
  }
  return emailServiceInstance
}

interface VerificationRequest {
  email: string
}

interface VerificationResponse {
  success: boolean
  message: string
  cooldownSeconds?: number
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResponse>
) {
  // CORS handled by withCORS wrapper

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { email }: VerificationRequest = req.body

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }

    // Rate limiting setup
    const rateLimitKey = `verification_rate:${email}`
    let attempts: string | null = null
    
    // Check rate limiting (skip in development)
    const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV;
    if (!isDev) {
      attempts = await redis.get<string>(rateLimitKey)
      
      if (attempts && parseInt(attempts) >= 3) {
        const ttl = await redis.ttl(rateLimitKey)
        return res.status(429).json({ 
          success: false, 
          message: 'Too many verification attempts. Please try again later.',
          cooldownSeconds: ttl > 0 ? ttl : 900
        })
      }
    } else {
      // Still get attempts for counter in dev
      attempts = await redis.get<string>(rateLimitKey)
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store verification code in Redis (5 minute expiry)
    const verificationKey = `verification:${email}`
    await redis.set(verificationKey, JSON.stringify({
      code: verificationCode,
      timestamp: Date.now(),
      attempts: 0
    }), { ex: 300 })

    // Increment rate limit counter (always track, even in dev)
    if (attempts) {
      await redis.incr(rateLimitKey)
    } else {
      await redis.set(rateLimitKey, '1', { ex: 60 }) // 1 minute in dev, 15 minutes in prod
    }

    // Send verification email
    // Starting email send process
    
    try {
      const service = await getEmailService()
      await service.sendVerificationCode(email, verificationCode)
      // Email sent successfully
    } catch (emailError) {
      console.error('❌ API: Email sending failed:', emailError)
      console.error('📋 API: Error type:', typeof emailError)
      console.error('📋 API: Error name:', emailError instanceof Error ? emailError.name : 'Unknown')
      console.error('📋 API: Error message:', emailError instanceof Error ? emailError.message : 'Unknown')
      
      // Log the code for debugging if email fails
      // Fallback: Email service failed, code stored in Redis
      
      return res.status(500).json({
        success: false,
        message: `Failed to send verification email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address'
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

export default withCORS(handler);