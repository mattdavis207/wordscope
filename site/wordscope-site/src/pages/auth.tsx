import React, { useState, useEffect } from "react"
import Link from "next/link"

const AuthPage: React.FC = () => {
    const [tempEmail, setTempEmail] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [step, setStep] = useState<'email' | 'verification'>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [cooldownSeconds, setCooldownSeconds] = useState(0)
    const [success, setSuccess] = useState(false)

    // Constellation animation effect
    useEffect(() => {
        const canvas = document.getElementById("constellation-canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
      
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
      
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
      
        const points = Array.from({ length: 150 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        }));
      
        const draw = () => {
          ctx.clearRect(0, 0, width, height);
      
          // Draw points
          for (const p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = "#BBE1FA";
            ctx.fill();
          }
      
          // Connect close points
          for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
              const a = points[i];
              const b = points[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const dist = dx * dx + dy * dy;
              if (dist < 2500) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = "rgba(187, 225, 250, 0.08)";
                ctx.stroke();
              }
            }
          }
      
          // Move points
          for (const p of points) {
            p.x += p.vx;
            p.y += p.vy;
      
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
          }
      
          requestAnimationFrame(draw);
        };
      
        draw();
      
        const handleResize = () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        };
      
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    // Cooldown timer effect
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(cooldownSeconds - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldownSeconds])

    const sendVerificationCode = async () => {
        if (!tempEmail.includes("@")) {
            setError("Please enter a valid email address.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch(`/api/auth/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: tempEmail }),
            })

            const data = await response.json()

            if (data.success) {
                setStep('verification')
                setError("")
            } else {
                setError(data.message || "Failed to send verification code")
                if (data.cooldownSeconds) {
                    setCooldownSeconds(data.cooldownSeconds)
                }
            }
        } catch (error) {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const verifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError("Please enter a valid 6-digit code.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch(`/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: tempEmail,
                    code: verificationCode
                }),
            })

            const data = await response.json()

            if (data.success && data.isVerified) {
                // Success! Communicate with extension
                setSuccess(true)
                
                // Send message for extension content script to pick up and bridge to chrome.storage
                window.postMessage({
                    type: 'AUTH_SUCCESS',
                    email: tempEmail
                }, '*')
                
                // Also try localStorage as a fallback communication method
                try {
                    localStorage.setItem('AUTH_SUCCESS_EMAIL', tempEmail)
                    localStorage.setItem('AUTH_SUCCESS_TIMESTAMP', Date.now().toString())
                    // Auth success saved to localStorage as fallback
                } catch (err) {
                    // Could not set localStorage
                }
                
                // Close window after 3 seconds
                setTimeout(() => {
                    window.close()
                }, 3000)
            } else {
                setError(data.message || "Invalid verification code")
            }
        } catch (error) {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const goBackToEmail = () => {
        setStep('email')
        setVerificationCode("")
        setError("")
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#01122B] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Constellation Background */}
                <canvas
                    id="constellation-canvas"
                    className="absolute inset-0 w-full h-full z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#072141] via-[#01122B] to-[#1c2f47] opacity-50"></div>
                
                <div className="relative bg-[#072141] p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-[#374151] z-10">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-[#BBE1FA] mb-2">Email Verified!</h2>
                        <p className="text-[#9CA3AF] leading-relaxed">
                            Your email <strong className="text-[#BBE1FA]">{tempEmail}</strong> has been successfully verified. 
                            You are now signed in and can access Wordscope Pro.
                        </p>
                    </div>
                    <p className="text-sm text-[#9CA3AF] opacity-75">This page will close automatically in 3 seconds...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#01122B] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Constellation Background */}
            <canvas
                id="constellation-canvas"
                className="absolute inset-0 w-full h-full z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#072141] via-[#01122B] to-[#1c2f47] opacity-50"></div>
            
            <div className="relative bg-[#072141] p-8 rounded-xl shadow-2xl max-w-md w-full border border-[#374151] z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="flex items-center justify-center mb-4 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-lg flex items-center justify-center shadow-lg mr-3 group-hover:scale-110 transition-transform">
                            <span className="text-xl font-bold text-[#BBE1FA]">W</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#BBE1FA] group-hover:text-white transition-colors">Wordscope</h1>
                    </Link>
                    <p className="text-[#9CA3AF]">
                        {step === 'email' ? 'Sign in to access Pro features' : 'Verify your email address'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-[#1c2f47] border border-[#ef4444] text-[#ef4444] rounded text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Email Input */}
                {step === 'email' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#BBE1FA] mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                                className="w-full p-3 border border-[#374151] rounded-lg bg-[#1c2f47] text-[#BBE1FA] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
                                disabled={loading}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && sendVerificationCode()}
                                autoFocus
                            />
                        </div>
                        <button
                            className={`w-full py-3 rounded-lg transition-all font-medium duration-200 transform hover:scale-105 ${
                                loading || cooldownSeconds > 0
                                    ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-500'
                            }`}
                            onClick={sendVerificationCode}
                            disabled={loading || cooldownSeconds > 0}
                        >
                            {loading 
                                ? 'Sending...' 
                                : cooldownSeconds > 0 
                                    ? `Wait ${cooldownSeconds}s` 
                                    : 'Send Verification Code'
                            }
                        </button>
                    </div>
                )}

                {/* Step 2: Verification Code Input */}
                {step === 'verification' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#BBE1FA] mb-2">
                                Verification Code
                            </label>
                            <p className="text-sm text-[#9CA3AF] mb-3">
                                Enter the 6-digit code sent to <strong className="text-[#BBE1FA]">{tempEmail}</strong>
                            </p>
                            <input
                                type="text"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                    setVerificationCode(value)
                                }}
                                className="w-full p-3 border border-[#374151] rounded-lg bg-[#1c2f47] text-[#BBE1FA] placeholder-[#9CA3AF] text-center text-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
                                disabled={loading}
                                maxLength={6}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && !loading && verifyCode()}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-400 transition-all font-medium border-2 border-slate-400"
                                onClick={goBackToEmail}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                className={`flex-1 py-3 rounded-lg transition-all font-medium transform hover:scale-105 ${
                                    loading 
                                        ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-500'
                                }`}
                                onClick={verifyCode}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                        </div>
                        <button
                            className="w-full text-sm text-[#9CA3AF] hover:text-[#BBE1FA] transition-colors"
                            onClick={() => {
                                setStep('email')
                                setError("")
                                setVerificationCode("")
                            }}
                            disabled={loading}
                        >
                            Use different email address
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-[#9CA3AF] hover:text-[#BBE1FA] transition-colors">
                        ← Back to Wordscope
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AuthPage