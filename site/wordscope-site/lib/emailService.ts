import nodemailer from 'nodemailer'

// For Vercel Edge runtime compatibility
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  private getConfig(): EmailConfig {
    
    // Using Gmail SMTP for wordscope55@gmail.com
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'wordscope55@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD! // Gmail app password
      }
    }
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const config = this.getConfig()
      this.transporter = nodemailer.createTransport(config)
      
      // Verify connection
      try {
        await this.transporter.verify()
      } catch (error) {
        console.error('❌ Email service connection failed:', error)
        console.error('Connection details:', {
          host: config.host,
          port: config.port,
          user: config.auth.user,
          hasPassword: !!config.auth.pass
        })
        throw new Error(`Failed to connect to email service: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    return this.transporter
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      const transporter = await this.getTransporter()
      
      const mailOptions = {
        from: {
          name: 'Wordscope',
          address: process.env.EMAIL_USER || 'wordscope55@gmail.com'
        },
        to: email,
        subject: 'Your Wordscope Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wordscope - Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #01122B; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #072141; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #072141 0%, #2A4E75 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #374151;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2A4E75 0%, #2563EB 100%); border-radius: 15px; margin: 0 auto 15px auto; text-align: center; line-height: 60px;">
                  <span style="color: #BBE1FA; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif;">W</span>
                </div>
                <h1 style="color: #BBE1FA; font-size: 28px; margin: 0; font-weight: bold;">Wordscope</h1>
                <p style="color: #9CA3AF; font-size: 16px; margin: 10px 0 0 0;">Email Verification</p>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 30px; background-color: #072141;">
                <h2 style="color: #BBE1FA; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                  Verify Your Email Address
                </h2>
                
                <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                  Thank you for signing up for Wordscope Pro! To complete your registration and access premium features, 
                  please use the verification code below:
                </p>

                <!-- Verification Code Box -->
                <div style="background: #01122B; border: 2px solid #374151; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                  <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                  </p>
                  <div style="background: linear-gradient(135deg, #2563EB 0%, #2A4E75 100%); color: #BBE1FA; font-size: 36px; font-weight: bold; padding: 20px 30px; border-radius: 8px; letter-spacing: 6px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                    ${code}
                  </div>
                  <p style="color: #ef4444; font-size: 14px; margin: 15px 0 0 0; font-weight: 600;">
                    <span style="display: inline-block; width: 16px; height: 16px; background-color: #ef4444; border-radius: 50%; margin-right: 8px; position: relative; line-height: 16px; alihn-items: center; justify-content: center;">
                      <span style="transform: translate(-50%, -50%); color: white; font-size: 10px; font-weight: bold; line-height: 1;">!</span>
                    </span>
                    Expires in 5 minutes
                  </p>
                </div>

                <div style="background: #1c2f47; border-left: 4px solid #2563EB; border-radius: 0 8px 8px 0; padding: 20px; margin: 30px 0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="color: #2563EB; font-size: 20px; margin-right: 12px; width: 24px; height: 24px; border: 2px solid #2563EB; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: #2563EB; font-size: 14px; font-weight: bold;">✓</span>
                    </div>
                    <div>
                      <p style="color: #BBE1FA; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                        Security Notice
                      </p>
                      <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.4;">
                        We sent this code because you requested email verification for Wordscope Pro features. 
                        If you didn't make this request, please ignore this email and your account will remain secure.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Features Preview -->
                <div style="margin: 40px 0 30px 0;">
                  <h3 style="color: #BBE1FA; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
                    What's included with Wordscope Pro:
                  </h3>
                  <div style="background: #1c2f47; border: 1px solid #374151; border-radius: 8px; padding: 20px;">
                    <ul style="margin: 0; padding-left: 20px; color: #9CA3AF; font-size: 14px; line-height: 1.8;">
                      <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #2563EB; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Context AI</strong> - 50,000 tokens/month</li>
                      <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #2563EB; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Unlimited exports</strong> (CSV, TSV, JSON, PDF)</li>
                      <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #2563EB; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Unlimited history storage</strong></li>
                      <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #2563EB; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Premium themes</strong> and customization</li>
                      <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #2563EB; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Priority support</strong> and early access to new features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #01122B; padding: 30px 20px; text-align: center; border-top: 1px solid #374151;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 10px 0;">
                  This email was sent by Wordscope - Instantly understand any word, anywhere.
                </p>
                <p style="color: #6b7280; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Wordscope. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Wordscope - Email Verification

Thank you for signing up for Wordscope Pro!

Your verification code is: ${code}

This code will expire in 5 minutes.

Enter this code in the Wordscope extension to complete your email verification and unlock Pro features including:
• Context AI - 50,000 tokens/month
• Unlimited exports (CSV, TSV, JSON, PDF)
• Unlimited history storage
• Premium themes and customization
• Priority support and early access to new features

Security Notice: We sent this code because you requested email verification for Wordscope Pro features. If you didn't make this request, please ignore this email and your account will remain secure.

© ${new Date().getFullYear()} Wordscope. All rights reserved.
        `
      }
      await transporter.sendMail(mailOptions)
      
    } catch (error) {
      console.error('❌ Failed to send verification email:', error)
      console.error('📋 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Send subscription welcome email
  async sendSubscriptionWelcomeEmail(email: string, customerName?: string): Promise<void> {
    try {
      const transporter = await this.getTransporter()
      
      const mailOptions = {
        from: {
          name: 'Wordscope',
          address: process.env.EMAIL_USER || 'wordscope55@gmail.com'
        },
        to: email,
        subject: 'Welcome to Wordscope Pro!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wordscope Pro - Welcome!</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #01122B; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #072141; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #072141 0%, #2A4E75 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #374151;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2A4E75 0%, #2563EB 100%); border-radius: 15px; margin: 0 auto 15px auto; text-align: center; line-height: 60px;">
                  <span style="color: #BBE1FA; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif;">W</span>
                </div>
                <h1 style="color: #BBE1FA; font-size: 28px; margin: 0; font-weight: bold;">Welcome to Wordscope Pro!</h1>
                <p style="color: #9CA3AF; font-size: 16px; margin: 10px 0 0 0;">Your subscription is now active</p>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 30px; background-color: #072141;">
                <div style="text-align: center; margin: 0 0 20px 0;">
                  <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #10b981; border-radius: 50%; margin: 0 auto 15px auto; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    <span style="color: white; font-size: 24px; font-weight: bold; line-height: 0; vertical-align: middle;">✓</span>
                  </div>
                  <h2 style="color: #BBE1FA; font-size: 24px; margin: 0;">
                    Hi${customerName ? ` ${customerName}` : ''}!
                  </h2>
                </div>
                
                <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                  Thank you for subscribing to Wordscope Pro! Your subscription is now active and you have access to all premium features.
                </p>

                <!-- Pro Features -->
                <div style="background: #1c2f47; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <h3 style="color: #BBE1FA; font-size: 18px; margin: 0 0 20px 0; text-align: center;">
                    Your Pro Features:
                  </h3>
                  <ul style="margin: 0; padding-left: 20px; color: #9CA3AF; font-size: 14px; line-height: 1.8;">
                    <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #48bb78; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Context AI</strong> - 50,000 tokens/month</li>
                    <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #48bb78; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Unlimited exports</strong> (CSV, TSV, JSON, PDF)</li>
                    <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #48bb78; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Unlimited history storage</strong></li>
                    <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #48bb78; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Premium themes</strong> and customization</li>
                    <li><span style="display: inline-block; width: 8px; height: 8px; background-color: #48bb78; border-radius: 50%; margin-right: 8px;"></span><strong style="color: #BBE1FA;">Priority support</strong> and early access to new features</li>
                  </ul>
                </div>

                <div style="background: #1c2f47; border-left: 4px solid #48bb78; border-radius: 0 8px 8px 0; padding: 20px; margin: 30px 0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="color: #48bb78; font-size: 20px; margin-right: 12px; width: 24px; height: 24px; border: 2px solid #48bb78; border-radius: 4px; display: flex;">
                      <span style="color: #48bb78; font-size: 14px; font-weight: bold;">✓</span>
                    </div>
                    <div>
                      <p style="color: #BBE1FA; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                        Getting Started
                      </p>
                      <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.4;">
                        Start using Wordscope Pro right away! Simply highlight any word on any webpage and let our AI provide instant, contextual definitions and explanations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #01122B; padding: 30px 20px; text-align: center; border-top: 1px solid #374151;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 10px 0;">
                  Questions? Reply to this email or visit our support center.
                </p>
                <p style="color: #6b7280; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Wordscope. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Wordscope Pro!

Hi${customerName ? ` ${customerName}` : ''}!

Thank you for subscribing to Wordscope Pro! Your subscription is now active and you have access to all premium features:

• Context AI - 50,000 tokens/month
• Unlimited exports (CSV, TSV, JSON, PDF)
• Unlimited history storage
• Premium themes and customization
• Priority support and early access to new features

Start using Wordscope Pro right away! Simply highlight any word on any webpage and let our AI provide instant, contextual definitions and explanations.

Questions? Reply to this email or visit our support center.

© ${new Date().getFullYear()} Wordscope. All rights reserved.
        `
      }

      await transporter.sendMail(mailOptions)
      
    } catch (error) {
      console.error('❌ Failed to send subscription welcome email:', error)
      throw new Error(`Failed to send subscription welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Send subscription cancellation email
  async sendSubscriptionCancellationEmail(email: string, customerName?: string): Promise<void> {
    try {
      const transporter = await this.getTransporter()
      
      const mailOptions = {
        from: {
          name: 'Wordscope',
          address: process.env.EMAIL_USER || 'wordscope55@gmail.com'
        },
        to: email,
        subject: 'Subscription Cancelled - We\'ll Miss You!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wordscope - Subscription Cancelled</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #01122B; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #072141; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #072141 0%, #2A4E75 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #374151;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2A4E75 0%, #2563EB 100%); border-radius: 15px; margin: 0 auto 15px auto; text-align: center; line-height: 60px;">
                  <span style="color: #BBE1FA; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif;">W</span>
                </div>
                <h1 style="color: #BBE1FA; font-size: 28px; margin: 0; font-weight: bold;">Subscription Cancelled</h1>
                <p style="color: #9CA3AF; font-size: 16px; margin: 10px 0 0 0;">We're sorry to see you go</p>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 30px; background-color: #072141;">
                <div style="text-align: center; margin: 0 0 20px 0;">
                  <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #ef4444; border-radius: 50%; margin: 0 auto 15px auto; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                    <span style="color: white; font-size: 20px; font-weight: bold; line-height: 0; vertical-align: middle;">×</span>
                  </div>
                  <h2 style="color: #BBE1FA; font-size: 24px; margin: 0;">
                    Hi${customerName ? ` ${customerName}` : ''}!
                  </h2>
                </div>
                
                <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                  We're sorry to see you go! Your Wordscope Pro subscription has been cancelled and will remain active until the end of your current billing period.
                </p>

                <!-- What Happens Next -->
                <div style="background: #1c2f47; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 20px; margin: 30px 0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: 2px solid #ef4444; border-radius: 4px; margin-right: 12px;">
                      <span style="color: #ef4444; font-size: 14px; font-weight: bold; line-height: 0; vertical-align: middle;">!</span>
                    </div>
                    <div>
                      <p style="color: #BBE1FA; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                        What happens next:
                      </p>
                      <ul style="margin: 0; padding-left: 0; list-style: none; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                        <li style="margin-bottom: 8px;">• You'll continue to have Pro access until your billing period ends</li>
                        <li style="margin-bottom: 8px;">• After that, you'll be moved to our free tier</li>
                        <li style="margin-bottom: 8px;">• All your data and history will be preserved</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin: 25px 0; text-align: center;">
                  Changed your mind? You can resubscribe anytime and pick up right where you left off.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://wordscope-extension.vercel.app" style="background: linear-gradient(135deg, #2563EB 0%, #2A4E75 100%); color: #BBE1FA; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                    Resubscribe to Wordscope Pro
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #01122B; padding: 30px 20px; text-align: center; border-top: 1px solid #374151;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 10px 0;">
                  We'd love to hear your feedback about why you cancelled.
                </p>
                <p style="color: #6b7280; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Wordscope. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Subscription Cancelled - We'll Miss You!

Hi${customerName ? ` ${customerName}` : ''}!

We're sorry to see you go! Your Wordscope Pro subscription has been cancelled and will remain active until the end of your current billing period.

What happens next:
• You'll continue to have Pro access until your billing period ends
• After that, you'll be moved to our free tier
• All your data and history will be preserved

Changed your mind? You can resubscribe anytime and pick up right where you left off.

Visit: https://wordscope-extension.vercel.app

We'd love to hear your feedback about why you cancelled.

© ${new Date().getFullYear()} Wordscope. All rights reserved.
        `
      }

      await transporter.sendMail(mailOptions)
      
    } catch (error) {
      console.error('❌ Failed to send subscription cancellation email:', error)
      throw new Error(`Failed to send subscription cancellation email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      await transporter.verify()
      return true
    } catch (error) {
      console.error('Email service test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()