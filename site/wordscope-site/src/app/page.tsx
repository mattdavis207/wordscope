"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import { Bubble } from "../../../content.tsx"
import "./tailwind.css"
import './globals.css'


export default function Home() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  useEffect(() => {
    const canvas = document.getElementById("constellation-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
  
    const points = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
  
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
  
      // Draw points
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
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
          if (dist < 3000) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(187, 225, 250, 0.1)";
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

  const sources = [
    "Google Dictionary", "Wiktionary", "WordAPI", "Merriam-Webster", 
    "FreeDictionaryAPI", "DuckDuckGo", "Youglish", "Lingua Robot"
  ];

  const settings = [
    "Auto-add words to history",
    "Theme customization",
    "Bubble size adjustment", 
    "Default export source",
    "Double-click activation",
    "Alt + click activation",
    "Cmd/Ctrl + click activation",
    "Custom hotkey configuration"
  ];

  const browsers = [
    { name: "Chrome", logo: "/browsers/chrome-logo.png", url: "https://chrome.google.com/webstore" },
    { name: "Edge", logo: "/browsers/edge-logo.png", url: "https://microsoftedge.microsoft.com/addons" },
    { name: "Brave", logo: "/browsers/brave-logo.png", url: "https://chrome.google.com/webstore" },
    { name: "Opera", logo: "/browsers/opera-logo.png", url: "https://addons.opera.com" },
    { name: "Vivaldi", logo: "/browsers/vivaldi-logo.png", url: "https://chrome.google.com/webstore" },
    { name: "Yandex", logo: "/browsers/yandex-logo.png", url: "https://chrome.google.com/webstore" }
  ];

  return (
    <div id="main" className="bg-[#01122B] text-[#BBE1FA] font-sans min-h-screen">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#072141] shadow-lg border-b border-[#374151] backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image 
              src={"/wordscope-logo.png"} 
              alt={"Wordscope Logo"} 
              width={40} 
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
          </div>
          <Link href="/" className="text-2xl font-bold">Wordscope</Link>
        </div>
        <nav className="flex space-x-8 text-[#9CA3AF]">
          <Link href="#features" className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Features</Link>
          <Link href="#pro" className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Pro</Link>
          <Link href="#download" className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Download</Link>
        </nav>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-1"></div>


      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-screen flex items-center">

         {/* Constellation Background */}
          <canvas
            id="constellation-canvas"
            className="absolute inset-0 w-full h-full z-0"
          />

        <div className="absolute inset-0 bg-gradient-to-br from-[#072141] via-[#01122B] to-[#1c2f47] opacity-50"></div>
        <div className="relative w-full flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="mb-12 relative">
            <div className="absolute -inset-6 bg-[#2A4E75] opacity-20 blur-3xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white">W</span>
            </div>
          </div>
          
          <h1 
            className="font-bold mb-8 bg-gradient-to-r from-[#BBE1FA] to-[#FFFFFF] bg-clip-text text-transparent text-center"
            style={{ fontSize: "4.5rem", lineHeight: "1.1" }}>
            Your Personal Dictionary
            <br />
            <span className="text-[#2563EB]">& AI Companion</span>
          </h1>
          
          <p className="max-w-3xl text-[#9CA3AF] text-xl md:text-2xl mb-12 leading-relaxed font-light">
            Instantly define, explore, and understand words in context while you browse. 
            Transform any webpage into your personal learning environment.
          </p>

          <div id="download" className="mt-20">
            <p className="text-[#9CA3AF] mb-6 text-lg font-medium">Available for all major browsers:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {browsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  className="group bg-[#1c2f47] hover:bg-[#2A4E75] border border-[#374151] hover:border-[#2563EB] text-white px-4 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <Image 
                    src={browser.logo} 
                    alt={`${browser.name} logo`} 
                    width={30} 
                    height={30}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium text-lg">{browser.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Feature Demo */}
      <section className="py-24 px-6 bg-[#072141] relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center mb-6" style={{ fontSize: "2.5rem" }}>See Wordscope in Action</h2>
          <p className="text-[#9CA3AF] text-center mb-20 max-w-2xl mx-auto text-lg">
            Experience the power of instant definitions and contextual understanding right in your browser.
          </p>
          
          <div className="relative bg-[#01122B] rounded-2xl p-10 border border-[#374151] shadow-2xl mt-10">
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[#374151]">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="ml-6 bg-[#1c2f47] px-6 py-2 rounded-lg text-[#9CA3AF]">
                example.com/article
              </div>
            </div>
            
            <div className="relative">
              <p className="text-[#BBE1FA] leading-relaxed text-xl mb-6">
                The <span className="bg-[#2563EB] px-2 py-1 rounded-md cursor-pointer hover:bg-[#1e50c3] transition relative">revolutionary</span> approach 
                to language learning involves understanding words in their natural context rather than memorizing isolated definitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Details with Enhanced Dropdowns */}
      <section id="features" className="bg-[#01122B] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: "2.5rem" }}>Inside Wordscope</h2>
          <p className="text-[#9CA3AF] text-center mb-16 max-w-2xl mx-auto">
            Explore the comprehensive features that make Wordscope your ultimate language companion.
          </p>
          
          {[
            {
              title: "Dictionary Sources",
              desc: "Access definitions from multiple trusted sources",
              details: "Configure and prioritize your preferred dictionary sources for the most relevant results.",
              icon: "📚",
              items: sources
            },
            {
              title: "Smart Settings",
              desc: "Customize every aspect of your experience", 
              details: "Fine-tune Wordscope to work exactly how you want it to, with extensive customization options.",
              icon: "⚙️",
              items: settings
            },
            {
              title: "History & Export",
              desc: "Never lose track of words you've learned",
              details: "All your lookups are saved locally and can be exported to various formats for further study.",
              icon: "📊",
              items: ["CSV Export", "TSV Export", "JSON Export", "PDF Export", "Anki Integration", "Searchable History", "Backup & Sync"]
            },
          ].map(({ title, desc, details, icon, items }) => (
            <div key={title} className="mb-6 border border-[#374151] rounded-xl overflow-hidden hover:border-[#2A4E75] transition-colors">
              <button
                className="w-full text-left px-6 py-6 bg-[#1c2f47] hover:bg-[#2A4E75] transition-all duration-300 focus:outline-none group"
                onClick={() => toggle(title)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-[#BBE1FA] group-hover:text-white transition">{title}</h3>
                      <p className="text-[#9CA3AF] text-sm mt-1">{desc}</p>
                    </div>
                  </div>
                  <span className="text-2xl text-[#2A4E75] group-hover:text-[#BBE1FA] transition transform">
                    {expanded === title ? "−" : "+"}
                  </span>
                </div>
              </button>
              
              {expanded === title && (
                <div className="px-6 py-6 bg-[#072141] border-t border-[#374151] animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[#9CA3AF] mb-4">{details}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item, index) => (
                      <div key={index} className="bg-[#1c2f47] px-4 py-3 rounded-lg text-[#BBE1FA] text-sm border border-[#374151] hover:border-[#2A4E75] transition-colors">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#072141] px-6 py-24">
        <h2 className="font-bold text-center" style={{ fontSize: "2.5rem" }}>Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto mt-5">
          {[
            { title: "Instant Definitions", desc: "Highlight any word to get definitions from multiple sources.", icon: "⚡", color: "from-[#2563EB] to-[#1e50c3]" },
            { title: "Source Configuration", desc: "Enable, disable, and reorder your preferred sources.", icon: "🔧", color: "from-[#059669] to-[#047857]" },
            { title: "Context AI", desc: "Analyze usage of words in sentence and paragraph context.", icon: "🧠", color: "from-[#7c3aed] to-[#6d28d9]" },
            { title: "History Tracking", desc: "Track, revisit, and export all previous lookups.", icon: "📈", color: "from-[#dc2626] to-[#b91c1c]" },
            { title: "Custom Themes", desc: "Style the extension to your aesthetic with theme control.", icon: "🎨", color: "from-[#ea580c] to-[#c2410c]" },
            { title: "Export & Pro Tools", desc: "Save data and unlock advanced features with Pro.", icon: "💎", color: "from-[#0891b2] to-[#0e7490]" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group bg-[#1c2f47] p-8 rounded-xl hover:scale-105 transition-all duration-300 border border-[#374151] hover:border-[#2A4E75] hover:shadow-2xl"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} mb-6 rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#BBE1FA] group-hover:text-white transition">{feature.title}</h3>
              <p className="text-[#9CA3AF] group-hover:text-[#BBE1FA] transition leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Subscription */}
      <section id="pro" className="py-24 px-6 bg-[#01122B] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] via-transparent to-[#7c3aed] opacity-5"></div>
        <div className="relative">
          <div className="mb-8">
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7c3aed] text-white px-4 py-2 rounded-full text-sm font-semibold">
              PREMIUM
            </span>
          </div>
          
          <h2 className="font-bold mb-6" style={{ fontSize: "2.5rem" }}>
            Wordscope <span className="bg-gradient-to-r from-[#2563EB] to-[#7c3aed] bg-clip-text text-transparent">Pro</span>
          </h2>
          
          <p className="text-[#9CA3AF] max-w-3xl mx-auto mb-12 text-lg leading-relaxed">
            Wordscope Pro gives you everything you need to take your word exploration to the next level. 
            Unlock access to Context AI with 100 intelligent explanations per month for words in their real-world usage. 
            Export your entire lookup history in CSV, TSV, JSON, or PDF format to study, share, or save for later. 
            Enjoy a premium experience with faster responses, unlimited use of core features, and early access to upcoming tools and enhancements.
          </p>

          <div className="max-w-md mx-auto bg-[#1c2f47] p-8 rounded-2xl shadow-2xl border border-[#374151] relative mt-10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2563EB] to-[#7c3aed] text-white px-6 py-2 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-center mb-6">
                <span className="text-5xl font-bold text-[#BBE1FA]">$4.99</span>
                <span className="text-[#9CA3AF] ml-2">/ month</span>
              </div>
              
              <ul className="text-left mb-8 space-y-4">
                {[
                  "Context AI - 100 explanations/month",
                  "Export to CSV, TSV, JSON, PDF",
                  "Unlimited history storage", 
                  "Premium themes & customization",
                  "Priority customer support",
                  "Early access to new features"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-[#BBE1FA]">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("https://wordscope-extension.vercel.app/api/create-stripe-session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: "test" }),
                    });
                  
                
                    if (!res.ok) {
                      const text = await res.text();
                      console.error("Checkout fetch failed:", res.status, text);
                      alert(`Checkout failed: ${res.status}\n${text}`);
                      return;
                    }
                
                    const data = await res.json();
                    if (data?.url) {
                      window.location.href = data.url;
                    } else {
                      console.error("No URL in response:", data);
                      alert("No checkout URL returned.");
                    }
                  } catch (e) {
                    console.error("Network error:", e);
                    alert("Network error – see console for details.");
                  }
                }}
                className="inline-block w-full bg-gradient-to-r from-[#2563EB] to-[#7c3aed] 
                  hover:from-[#1e50c3] hover:to-[#6d28d9] text-white font-semibold py-4 px-8 mt-4 rounded-xl 
                  transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Upgrade to Pro
              </button>
              
              <p className="text-[#9CA3AF] text-sm mt-4">Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#072141] py-10 px-6 border-t border-[#374151]">
  <div className="max-w-6xl mx-auto w-full flex flex-wrap md:flex-nowrap justify-between gap-8 text-sm text-[#9CA3AF]">

    {/* Left: Branding */}
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-lg flex items-center justify-center shadow-2xl">
          <span className="text-lg font-bold text-[#BBE1FA]">W</span>
        </div>
        <span className="text-xl font-bold text-[#BBE1FA]">Wordscope</span>
      </div>
      <p className="text-[#9CA3AF]">
      Instantly define and explore words in real time as you browse. Wordscope brings contextual AI, trusted dictionary sources, 
      and powerful learning tools together to transform every webpage into a personalized learning environment.
      </p>
    </div>

    {/* Middle: Legal */}
    <div className="min-w-[150px] ml-30">
      <h4 className="font-semibold mb-3 text-[#BBE1FA]">Legal</h4>
      <ul className="space-y-2">
        <li><Link href="#" className="hover:text-[#BBE1FA] transition">Privacy Policy</Link></li>
        <li><Link href="#" className="hover:text-[#BBE1FA] transition">Terms of Service</Link></li>
        <li><Link href="#" className="hover:text-[#BBE1FA] transition">Cookie Policy</Link></li>
      </ul>
    </div>

    {/* Right: Connect */}
    <div className="min-w-[150px]">
      <h4 className="font-semibold mb-3 text-[#BBE1FA]">Connect</h4>
      <ul className="space-y-2">
        <li><Link href="https://x.com/wordscope55" className="hover:text-[#BBE1FA] transition">Twitter</Link></li>
        <li><Link href="https://www.reddit.com/r/wordscope_55/" className="hover:text-[#BBE1FA] transition">Reddit</Link></li>
        <li><Link href="#" className="hover:text-[#BBE1FA] transition">GitHub</Link></li>
      </ul>
    </div>

  </div>

  {/* Bottom bar */}
  <div className="pt-8 border-t border-[#374151] text-center mt-10">
    <p className="text-xs text-[#9CA3AF]">&copy; 2025 Wordscope. All rights reserved.</p>
  </div>
</footer>



    </div>
  );
}

//       {/* Footer */}
//       <footer className="bg-[#072141] py-10 px-6">
//         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#9CA3AF]">
//           <div>
//             <h4 className="font-semibold mb-2 text-white">Legal</h4>
//             <ul className="space-y-1">
//               <li><Link href="#"><a className="hover:underline">Privacy Policy</a></Link></li>
//               <li><Link href="#"><a className="hover:underline">Terms of Service</a></Link></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold mb-2 text-white">Connect</h4>
//             <ul className="space-y-1">
//               <li><Link href="#"><a className="hover:underline">Twitter</a></Link></li>
//               <li><Link href="#"><a className="hover:underline">GitHub</a></Link></li>
//               <li><Link href="#"><a className="hover:underline">Email</a></Link></li>
//             </ul>
//           </div>
//         </div>
//         <p className="text-center text-xs text-[#9CA3AF] mt-10">&copy; 2025 Wordscope. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }
