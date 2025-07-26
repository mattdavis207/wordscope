"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"


export default function Success() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get("session_id")

  useEffect(() => {
    const fetchCustomerEmail = async () => {
      if (!sessionId) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-customer-email?session_id=${sessionId}`)
      const { email } = await res.json()

      if (email) {
        const isProRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/is-pro?email=${email}`)
        const { isPro } = await isProRes.json()
        if (isPro) {
          alert(`🎉 You’re now Pro as ${email}!`)
          router.push("/") // Go back to extension popup
        }
      }
    }
    fetchCustomerEmail()
  }, [router, sessionId])


    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-800">
        <h1 className="text-3xl font-bold mb-4">🎉 Subscription Successful!</h1>
        <p className="text-lg mb-6">
          Thank you for supporting WordScope. Your Pro features are now unlocked.
        </p>
        <Link
          href="chrome://extensions"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Open Extension
        </Link>
      </div>
    )
  }
  