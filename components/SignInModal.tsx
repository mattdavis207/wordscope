import {useState, useEffect } from "react"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

type SignInModalProps = {
    onClose: () => void
    onSignIn: (email: string) => void
  }

export const SignInModal: React.FC<SignInModalProps> = ({ onClose, onSignIn }) => {
    
    const [tempEmail, setTempEmail] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [step, setStep] = useState<'email' | 'verification'>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

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
            const response = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/auth/send-verification`, {
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
            const response = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/auth/verify-email`, {
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
                // Success! Complete sign-in
                localStorage.setItem("userEmail", tempEmail)
                onSignIn(tempEmail)
                onClose()
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
    
    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-mainBody p-6 rounded-xl shadow-lg w-80 relative">
                {/* Header with title and close button */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-text">
                        {step === 'email' ? 'Sign In' : 'Verify Email'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-xl text-otherText hover:text-red-500 transition-colors"
                        title="Close"
                    >
                        ×
                    </button>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Email Input */}
                {step === 'email' && (
                    <>
                        <p className="text-sm text-dataText mb-4">
                            Enter your email to receive a verification code and access Pro features.
                        </p>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)}
                            className="w-full p-2 border rounded mb-4 bg-dullBox text-text"
                            disabled={loading}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && sendVerificationCode()}
                        />
                        <button
                            className={`w-full px-3 py-2 rounded transition-colors ${
                                loading || cooldownSeconds > 0
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-tabActiveBg hover:bg-dullBox cursor-pointer'
                            } text-dataText`}
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
                    </>
                )}

                {/* Step 2: Verification Code Input */}
                {step === 'verification' && (
                    <>
                        <p className="text-sm text-dataText mb-4">
                            Enter the 6-digit code sent to <strong>{tempEmail}</strong>
                        </p>
                        <input
                            type="text"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                setVerificationCode(value)
                            }}
                            className="w-full p-2 border rounded mb-4 bg-dullBox text-text text-center text-lg tracking-wider"
                            disabled={loading}
                            maxLength={6}
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && !loading && verifyCode()}
                        />
                        <div className="flex gap-2">
                            <button
                                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                onClick={goBackToEmail}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                className={`flex-1 px-3 py-2 rounded transition-colors ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-tabActiveBg hover:bg-dullBox cursor-pointer'
                                } text-dataText`}
                                onClick={verifyCode}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                        </div>
                        <button
                            className="w-full mt-2 text-sm text-otherText hover:text-text transition-colors"
                            onClick={() => {
                                setStep('email')
                                setError("")
                            }}
                            disabled={loading}
                        >
                            Resend code to different email
                        </button>
                    </>
                )}
            </div>
        </div>

    )
}