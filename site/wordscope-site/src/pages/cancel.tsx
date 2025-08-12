"use client"

import { useEffect } from "react"
import { useRouter, } from "next/navigation"

export default function Cancel() {

    const router = useRouter();
    
    useEffect(() => {
      router.push('/')
    }, [router])
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900 p-6">
      <h1 className="text-4xl font-bold mb-2">Subscription Cancelled</h1>
      <p className="text-lg text-center">
        Your Pro subscription has been cancelled. Returning you to WordScope...
      </p>
    </div>
    )
  }
  