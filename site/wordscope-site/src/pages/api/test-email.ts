import type { NextApiRequest, NextApiResponse } from 'next'
import { emailService } from '../../../lib/emailService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  // Only allow in development
  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV;
  if (!isDev) {
    return res.status(403).json({ success: false, message: 'Not allowed in production' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    // Test connection first
    const canConnect = await emailService.testConnection()
    if (!canConnect) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email service connection failed' 
      })
    }

    // Send test email
    await emailService.sendVerificationCode(email, '123456')

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Test email error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}