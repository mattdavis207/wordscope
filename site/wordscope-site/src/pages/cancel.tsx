"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function Cancel() {
  const [countdown, setCountdown] = useState(5)

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

  // Countdown and redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#01122B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Constellation Background */}
      <canvas
        id="constellation-canvas"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#072141] via-[#01122B] to-[#1c2f47] opacity-50"></div>
      
      <div className="relative bg-[#072141] p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-[#374151] z-10">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="flex items-center justify-center mb-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-lg flex items-center justify-center shadow-lg mr-3 group-hover:scale-110 transition-transform text-center" style={{lineHeight: '48px'}}>
              <span className="text-xl font-bold text-[#BBE1FA]">W</span>
            </div>
            <h1 className="text-2xl font-bold text-[#BBE1FA] group-hover:text-white transition-colors">Wordscope</h1>
          </Link>
        </div>

        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#BBE1FA] mb-2">Subscription Cancelled</h2>
          <p className="text-[#9CA3AF] leading-relaxed mb-6">
            Your Pro subscription has been cancelled. You can still use Wordscope&apos;s free features.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg border-2 border-blue-500"
          >
            Go to Extension
          </button>
          
          <p className="text-sm text-[#9CA3AF]">
            Redirecting to Wordscope in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  )
}
  