"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import './globals.css'
import "./tailwind.css"

export default function Home() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

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
    { name: "Chrome", logo: "/logos/chrome.png", url: "https://chrome.google.com/webstore" },
    { name: "Edge", logo: "/logos/edge.png", url: "https://microsoftedge.microsoft.com/addons" },
    { name: "Brave", logo: "/logos/brave.png", url: "https://chrome.google.com/webstore" },
    { name: "Opera", logo: "/logos/opera.png", url: "https://addons.opera.com" },
    { name: "Vivaldi", logo: "/logos/vivaldi.png", url: "https://chrome.google.com/webstore" },
    { name: "Yandex", logo: "/logos/yandex.png", url: "https://chrome.google.com/webstore" }
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
      <div className="h-20"></div>

      <h1 className="text-6xl text-white font-bold">Test Font Size</h1>

      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#072141] via-[#01122B] to-[#1c2f47] opacity-50"></div>
        <div className="relative w-full flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="mb-12 relative">
            <div className="absolute -inset-6 bg-[#2A4E75] opacity-20 blur-3xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white">W</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-[#BBE1FA] to-[#FFFFFF] bg-clip-text text-transparent leading-tight">
            Your Personal Dictionary
            <br />
            <span className="text-[#2563EB]">& AI Companion</span>
          </h1>
          
          <p className="max-w-3xl text-[#9CA3AF] text-xl md:text-2xl mb-12 leading-relaxed font-light">
            Instantly define, explore, and understand words in context while you browse. 
            Transform any webpage into your personal learning environment.
          </p>

          <div id="download" className="mt-12">
            <p className="text-[#9CA3AF] mb-6 text-lg font-medium">Available for all major browsers:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {browsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  className="group bg-[#1c2f47] hover:bg-[#2A4E75] border border-[#374151] hover:border-[#2563EB] text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-3"
                >
                  <Image 
                    src={browser.logo} 
                    alt={`${browser.name} logo`} 
                    width={24} 
                    height={24}
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
          <h2 className="text-4xl font-bold text-center mb-6">See Wordscope in Action</h2>
          <p className="text-[#9CA3AF] text-center mb-20 max-w-2xl mx-auto text-lg">
            Experience the power of instant definitions and contextual understanding right in your browser.
          </p>
          
          <div className="relative bg-[#01122B] rounded-2xl p-10 border border-[#374151] shadow-2xl">
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
              
              {/* Wordscope Bubble - Always Visible */}
              <div className="absolute top-12 left-24 bg-[#1c2f47] border-2 border-[#2A4E75] rounded-xl p-6 shadow-2xl max-w-sm transform -translate-y-2 z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#2A4E75] rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-[#BBE1FA]">W</span>
                    </div>
                    <h4 className="font-semibold text-[#BBE1FA] text-lg">revolutionary</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 bg-[#2A4E75] hover:bg-[#374151] rounded-lg text-sm transition flex items-center justify-center">🔊</button>
                    <button className="w-8 h-8 bg-[#2A4E75] hover:bg-[#374151] rounded-lg text-sm transition flex items-center justify-center">⭐</button>
                  </div>
                </div>

                {/* Pronunciation */}
                <div className="mb-4 text-[#9CA3AF] text-sm">
                  /ˌrevəˈluːʃəneri/ • <span className="text-[#2563EB]">adjective</span>
                </div>
                
                {/* Definition */}
                <div className="mb-4">
                  <p className="text-[#BBE1FA] font-medium mb-2">Definition:</p>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Involving or causing a complete or dramatic change; radically new or innovative.
                  </p>
                </div>

                {/* Example */}
                <div className="mb-4">
                  <p className="text-[#BBE1FA] font-medium mb-2">Example:</p>
                  <p className="text-[#9CA3AF] text-sm italic leading-relaxed">
                    {'The revolutionary new technology changed everything.'}
                  </p>
                </div>

                {/* Sources */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#2A4E75] text-[#BBE1FA] px-3 py-1 rounded-full text-xs font-medium">Google Dictionary</span>
                  <span className="bg-[#374151] text-[#9CA3AF] px-3 py-1 rounded-full text-xs">Merriam-Webster</span>
                  <span className="bg-[#374151] text-[#9CA3AF] px-3 py-1 rounded-full text-xs">Oxford</span>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-[#374151]">
                  <button className="text-[#2563EB] text-sm font-medium hover:text-[#1e50c3] transition">
                    Add to History
                  </button>
                  <button className="bg-[#2563EB] hover:bg-[#1e50c3] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    Context AI
                  </button>
                </div>

                {/* Arrow pointing to word */}
                <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-[#2A4E75]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Details with Enhanced Dropdowns */}
      <section id="features" className="bg-[#01122B] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Inside Wordscope</h2>
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
        <h2 className="text-4xl font-bold text-center mb-20">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
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
          
          <h2 className="text-4xl font-bold mb-6">
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
              
              <Link
                href="/api/create-stripe-session"
                className="inline-block w-full bg-gradient-to-r from-[#2563EB] to-[#7c3aed] 
                hover:from-[#1e50c3] hover:to-[#6d28d9] text-white font-semibold py-4 px-8 mt-4 rounded-xl 
                transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Upgrade to Pro
              </Link>
              
              <p className="text-[#9CA3AF] text-sm mt-4">Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#072141] py-12 px-6 border-t border-[#374151]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#2A4E75] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-[#BBE1FA]">W</span>
                </div>
                <span className="text-xl font-bold">Wordscope</span>
              </div>
              <p className="text-[#9CA3AF] max-w-md">
                Transform your browsing experience with instant definitions, contextual AI, and powerful learning tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#BBE1FA]">Legal</h4>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li><Link href="#" className="hover:text-[#BBE1FA] transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-[#BBE1FA] transition">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-[#BBE1FA] transition">Cookie Policy</Link></li>
                </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#BBE1FA]">Connect</h4>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li><Link href="#" className="hover:text-[#BBE1FA] transition">Twitter</Link></li>
                <li><Link href="#" className="hover:text-[#BBE1FA] transition">Reddit</Link></li>
                <li><Link href="#" className="hover:text-[#BBE1FA] transition">Github</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#374151] text-center">
            <p className="text-[#9CA3AF]">&copy; 2025 Wordscope. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



// "use client";

// import { useState } from "react";

// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {


//   const [expanded, setExpanded] = useState<string | null>(null);

//   const toggle = (key: string) => setExpanded(expanded === key ? null : key);

//   return (
//     <div className="bg-[#01122B] text-[#BBE1FA] font-sans">
//       {/* Top Header */}
//       <div className="flex items-center justify-between px-6 py-4 bg-[#072141] shadow">
//         <div className="flex items-center space-x-2">
//           <Image src="/logo.png" alt="Wordscope Logo" width={40} height={40} />
//           <span className="text-2xl font-bold">Wordscope</span>
//         </div>
//       </div>

//       {/* Hero Section */}
//       <header className="flex flex-col items-center justify-center text-center py-24 px-4">
//         <h1 className="text-4xl font-bold mb-4">Your Personal Dictionary & AI Companion</h1>
//         <p className="max-w-xl text-[#9CA3AF] text-lg">
//           Instantly define, explore, and understand words in context while you browse.
//         </p>
//         <div className="mt-6 flex flex-wrap justify-center gap-4">
//           {["chrome", "edge", "brave", "opera", "vivaldi", "yandex"].map((browser) => (
//             <a
//               key={browser}
//               href="#"
//               className="bg-[#1c2f47] hover:bg-[#2A4E75] text-white text-sm px-4 py-2 rounded transition"
//               title={`Get on ${browser}`.toUpperCase()}
//             >
//               {browser.charAt(0).toUpperCase() + browser.slice(1)}
//             </a>
//           ))}
//         </div>
//       </header>

//       {/* Feature Details with Dropdowns */}
//       <section className="bg-[#072141] px-6 py-20 max-w-4xl mx-auto">
//         <h2 className="text-3xl font-semibold text-center mb-10">Inside Wordscope</h2>
//         {[
//           {
//             title: "Sources",
//             desc: "Enable/disable and reorder dictionary sources.",
//             details: "Includes Google Dictionary, Wiktionary, WordAPI, Merriam-Webster, and more."
//           },
//           {
//             title: "History Tab",
//             desc: "Track all looked-up words.",
//             details: "Every word you define is saved locally (optionally cloud synced) and shown in a searchable dropdown list."
//           },
//           {
//             title: "Export",
//             desc: "Take your data elsewhere.",
//             details: "Export word lists as CSV, Anki-ready JSON, or sync directly to spaced repetition apps."
//           },
//         ].map(({ title, desc, details }) => (
//           <div key={title} className="mb-6 border border-[#2A4E75] rounded-lg">
//             <button
//               className="w-full text-left px-6 py-4 bg-[#1c2f47] hover:bg-[#2A4E75] text-lg font-semibold focus:outline-none"
//               onClick={() => toggle(title)}
//             >
//               {title} <span className="float-right">{expanded === title ? "−" : "+"}</span>
//             </button>
//             {expanded === title && (
//               <div className="px-6 py-4 text-[#9CA3AF] text-sm border-t border-[#2A4E75]">
//                 <p className="mb-1 font-semibold">{desc}</p>
//                 <p>{details}</p>
//               </div>
//             )}
//           </div>
//         ))}
//       </section>

//       {/* Features Section */}
//       <section className="bg-[#072141] px-6 py-20">
//         <h2 className="text-3xl font-semibold text-center mb-12">Key Features</h2>
//         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {[
//             { title: "Instant Definitions", desc: "Highlight any word to get definitions from multiple sources." },
//             { title: "Source Configuration", desc: "Enable, disable, and reorder your preferred sources." },
//             { title: "Context AI", desc: "Analyze usage of words in sentence and paragraph context." },
//             { title: "History Tracking", desc: "Track, revisit, and export all previous lookups." },
//             { title: "Custom Themes", desc: "Style the extension to your aesthetic with theme control." },
//             { title: "Export & Pro Tools", desc: "Save data and unlock advanced features with Pro." },
//           ].map((feature) => (
//             <div
//               key={feature.title}
//               className="bg-[#1c2f47] p-6 rounded-lg hover:scale-105 transition-transform"
//             >
//               <div className="h-36 bg-[#2A4E75] mb-4 rounded" />
//               <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
//               <p className="text-[#9CA3AF] text-sm">{feature.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Pro Subscription Box */}
//       <section className="py-20 px-6 bg-[#01122B] text-center">
//         <h2 className="text-3xl font-semibold mb-6">Go Pro</h2>
//         <p className="text-[#9CA3AF] max-w-xl mx-auto mb-10">
//           Unlock full power of Wordscope: extended history, export tools, early AI access, and more.
//         </p>
//         <div className="max-w-md mx-auto bg-[#1c2f47] p-8 rounded-lg shadow-lg">
//           <ul className="text-left mb-6 space-y-3 text-sm">
//             <li>✔ Unlimited history</li>
//             <li>✔ Export to Anki/Quizlet</li>
//             <li>✔ Early access to Context AI</li>
//             <li>✔ More source integrations</li>
//             <li>✔ Priority support</li>
//           </ul>
//           <div className="text-2xl font-bold mb-4">$3.99 / month</div>
//           <Link href="/api/create-stripe-session">
//             <a className="inline-block bg-[#2563EB] hover:bg-[#1e50c3] text-white font-semibold py-2 px-6 rounded-lg transition">
//               Upgrade to Pro
//             </a>
//           </Link>
//         </div>
//       </section>

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
