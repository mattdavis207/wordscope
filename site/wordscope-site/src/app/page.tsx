"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import { Bubble } from "../../../content.tsx"
import "./tailwind.css"
import './globals.css'

// Simple themed modal
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#374151] bg-[#01122B] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-[#072141] rounded-t-2xl border-b border-[#374151]">
          <h3 className="text-xl font-semibold text-[#BBE1FA]">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-[#374151] text-[#9CA3AF] hover:text-white hover:border-[#2A4E75]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-[#BBE1FA]">
          {children}
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm leading-6">
      <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Effective Date: August 10, 2025</p>
      <p className="text-[#9CA3AF]"><strong className="text-[#BBE1FA]">Wordscope</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the Wordscope website and browser extension. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our site and extension.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-2">Information We Collect</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li><span className="text-[#BBE1FA] font-medium">Extension data (local only):</span> We store your lookup history (words, definitions metadata, and source preferences) and, if you choose, your email <em>locally</em> via <code>chrome.storage.local</code> on your device. This data does not leave your device unless you export it.</li>
        <li><span className="text-[#BBE1FA] font-medium">Payment:</span> Subscriptions and payments are handled by Stripe on their hosted pages. We do not collect or store your full payment details. Stripe may process basic info (e.g., email) per their policy.</li>
        <li><span className="text-[#BBE1FA] font-medium">Website basics:</span> Our site collects standard logs (e.g., IP, user agent) necessary to serve pages and combat abuse.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">How We Use Information</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li>Provide core functionality (definitions, history, export).</li>
        <li>Remember your settings and preferences.</li>
        <li>Communicate service updates you request (e.g., subscription status).</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Sharing & Disclosure</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li><span className="text-[#BBE1FA] font-medium">Service providers:</span> Stripe for payments. Data shared is limited to what’s necessary for checkout and receipts.</li>
        <li>We do not sell your personal information.</li>
        <li>We may disclose information to comply with the law or protect rights and safety.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Data Retention</h4>
      <p className="text-[#9CA3AF]">Extension data is stored locally until you clear it or uninstall the extension. If you delete your account or request deletion of server-side records (e.g., billing email), we will delete them within 30 days unless retention is required by law.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Security</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li>Data in transit uses HTTPS/TLS on our website and Stripe checkout pages.</li>
        <li>Local extension data resides on your device; protect access to your browser profile.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Third‑Party Services</h4>
      <p className="text-[#9CA3AF]">Wordscope may link to external sites (e.g., Stripe). Their practices are governed by their own policies.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Source Licenses & Copyright</h4>
      <p className="text-[#9CA3AF]">Definitions and examples are retrieved from multiple providers. We respect and comply with each source’s license and attribution requirements. Content from sources remains the property of its respective owners and is displayed for personal use within Wordscope. Exported data should be used consistent with those licenses.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Your Choices</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li>View, export, or clear your local history in the extension.</li>
        <li>Contact us to update or delete server-side records tied to billing.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Changes</h4>
      <p className="text-[#9CA3AF]">We may update this policy. We will update the Effective Date and post changes here.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Contact</h4>
      <p className="text-[#9CA3AF]">Questions? Email us at <a href="mailto:wordscope55@gmail.com" className="underline hover:text-[#BBE1FA]">wordscope55@gmail.com</a>.</p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6 text-sm leading-6">
      <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Effective Date: August 10, 2025</p>
      <p className="text-[#9CA3AF]">These Terms of Service (&quot;Terms&quot;) govern your use of the Wordscope website and browser extension (the &quot;Service&quot;) provided by Wordscope (&quot;we&quot;, &quot;us&quot;). By accessing or using the Service, you agree to these Terms.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-2">Use of the Service</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li>Use the Service only for lawful purposes and in accordance with these Terms.</li>
        <li>You are responsible for safeguarding your browser profile and any credentials used with Stripe checkout.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Accounts & Subscriptions</h4>
      <ul className="list-disc pl-6 md:pl-7 space-y-2 marker:text-[#2A4E75] text-[#9CA3AF]">
        <li>Some features (e.g., Pro) require a paid subscription processed by Stripe.</li>
        <li>We may associate a subscription with your email. Keep it accurate to avoid access issues.</li>
      </ul>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Intellectual Property</h4>
      <p className="text-[#9CA3AF]">The Service, brand, and software are owned by Wordscope. Third‑party dictionary content remains the property of the respective providers and is used under their licenses and terms.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">User Content</h4>
      <p className="text-[#9CA3AF]">If you submit feedback or suggestions, you grant us a non‑exclusive, royalty‑free license to use them to improve the Service.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Third‑Party Links</h4>
      <p className="text-[#9CA3AF]">Links to third‑party services (e.g., Stripe) are provided for convenience. We don&rsquo;t control and aren&rsquo;t responsible for their content or practices.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Modifications</h4>
      <p className="text-[#9CA3AF]">We may modify the Service or these Terms. Continued use after changes constitutes acceptance.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Availability</h4>
      <p className="text-[#9CA3AF]">We strive for high availability but do not guarantee uninterrupted access. Maintenance or outages may occur.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Disclaimer & Limitation of Liability</h4>
      <p className="text-[#9CA3AF]">The Service is provided &quot;as is&quot; to the fullest extent permitted by law. We disclaim warranties and limit liability for damages arising from use of the Service.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Indemnification</h4>
      <p className="text-[#9CA3AF]">You agree to indemnify and hold Wordscope harmless from claims arising from your misuse of the Service or violation of these Terms.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Children</h4>
      <p className="text-[#9CA3AF]">The Service is not intended for children under 13.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Severability & Entire Agreement</h4>
      <p className="text-[#9CA3AF]">If any provision is unenforceable, the remainder remains in effect. These Terms constitute the entire agreement regarding the Service.</p>

      <h4 className="text-[#BBE1FA] font-semibold mt-6">Contact</h4>
      <p className="text-[#9CA3AF]">Contact us at <a href="mailto:wordscope55@gmail.com" className="underline hover:text-[#BBE1FA]">wordscope55@gmail.com</a>.</p>
    </div>
  );
}


// Feature modal details for cards
function FeatureDetails({ title }: { title: string }) {
  const Common = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-4 text-sm leading-6 text-[#9CA3AF]">{children}</div>
  );
  switch (title) {
    case 'Instant Definitions':
      return (
        <Common>
          <p>Highlight a word anywhere and get definitions from multiple sources without leaving the page.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>Multi‑source merge with per‑source details</li>
            <li>Keyboard/mouse triggers (double‑click, modifiers, hotkeys)</li>
            <li>Pronunciation and examples when available</li>
          </ul>
        </Common>
      );
    case 'Source Configuration':
      return (
        <Common>
          <p>Enable/disable sources, reorder priority, and set a default export source.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>Fully local settings in <code>chrome.storage.local</code></li>
            <li>Per‑source license‑aware display</li>
            <li>Quick toggle from the UI</li>
          </ul>
        </Common>
      );
    case 'Context AI':
      return (
        <Common>
          <p>See how a word behaves in real sentences and paragraphs with concise explanations.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>100 explanations/month for Pro</li>
            <li>History‑aware prompts (local)</li>
            <li>Respectful of source licenses—no bulk scraping</li>
          </ul>
        </Common>
      );
    case 'History Tracking':
      return (
        <Common>
          <p>Every lookup is saved locally so you can review and study later.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>Searchable list of saved words</li>
            <li>Per‑source data where available</li>
            <li>Clear/export anytime</li>
          </ul>
        </Common>
      );
    case 'Custom Themes':
      return (
        <Common>
          <p>Tune the look with theme palettes that match your workflow.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>Light/Dark and advanced color tokens</li>
            <li>Instant preview and apply</li>
            <li>Persists locally</li>
          </ul>
        </Common>
      );
    case 'Export & Pro Tools':
      return (
        <Common>
          <p>Get your data out in the formats you need, plus Pro‑only utilities.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>CSV, TSV, JSON, PDF exports</li>
            <li>Anki‑friendly structures</li>
            <li>Email‑based subscription via Stripe (no card data stored by us)</li>
          </ul>
        </Common>
      );
    default:
      return <Common><p>Details coming soon.</p></Common>;
  }
}


export default function Home() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<null | 'privacy' | 'tos'>(null);
  const openPrivacy = () => setActiveModal('privacy');
  const openTos = () => setActiveModal('tos');
  const closeModal = () => setActiveModal(null);

  // Feature modal state
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const openFeature = (title: string) => setActiveFeature(title);
  const closeFeature = () => setActiveFeature(null);

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const header = document.getElementById('site-header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 8; // small gap
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

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
      <div id="site-header" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#072141] shadow-lg border-b border-[#374151] backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <Image 
              src={"/wordscope-logo.png"} 
              alt={"Wordscope Logo"} 
              width={40} 
              height={40}
              className="transition-transform"
            />
          </button>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-2xl font-bold hover:text-white transition-colors cursor-pointer"
          >
            Wordscope
          </button>
        </div>
        <nav className="flex space-x-8 text-[#9CA3AF]">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToId('features'); }} className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Features</a>
          <a href="#pro" onClick={(e) => { e.preventDefault(); scrollToId('pro'); }} className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Pro</a>
          <a href="#download" onClick={(e) => { e.preventDefault(); scrollToId('download'); }} className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Download</a>
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
                The revolutionary approach to expanding your vocabulary involves understanding words in their natural context rather than memorizing isolated definitions.
              </p>
              
              {/* Demo GIF Placeholder */}
              <div className="mt-8 flex justify-center">
                <div className="bg-[#1c2f47] border border-[#374151] rounded-lg p-6 text-center">
                  <div className="w-80 h-48 bg-[#072141] rounded-lg flex items-center justify-center mb-4">
                    <div className="text-[#9CA3AF] text-sm">
                      📹 Demo GIF will go here
                      <br />
                      <span className="text-xs">(showing bubble interaction)</span>
                    </div>
                  </div>
                  <p className="text-[#9CA3AF] text-sm">
                    Hover over any word to see instant definitions from multiple sources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Details with Enhanced Dropdowns */}
      <section id="features" className="bg-[#01122B] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: "2.5rem" }}>Inside Wordscope</h2>
          <p className="text-[#9CA3AF] text-center mb-16 max-w-2xl mx-auto">
            Explore the comprehensive features that make Wordscope your ultimate word companion.
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
            { title: "Instant Definitions", desc: "Triple-click, double-click, or use keyboard shortcuts to get definitions from 8+ sources instantly without leaving your current page.", icon: "⚡", color: "from-[#2563EB] to-[#1e50c3]" },
            { title: "Source Configuration", desc: "Customize priority order of Google Dictionary, Wiktionary, Merriam-Webster, WordAPI, and 4 other trusted sources with full license compliance.", icon: "🔧", color: "from-[#059669] to-[#047857]" },
            { title: "Context AI", desc: "Get intelligent explanations of how words work in real sentences and paragraphs with 100 AI-powered insights per month (Pro feature).", icon: "🧠", color: "from-[#7c3aed] to-[#6d28d9]" },
            { title: "History Tracking", desc: "Automatically save every lookup locally with timestamps, source data, pronunciations, and synonyms - all searchable and exportable.", icon: "📈", color: "from-[#dc2626] to-[#b91c1c]" },
            { title: "Custom Themes", desc: "Choose from light/dark themes or create custom color schemes with advanced tokens that persist across all websites you browse.", icon: "🎨", color: "from-[#ea580c] to-[#c2410c]" },
            { title: "Export & Pro Tools", desc: "Export your entire history in CSV, TSV, JSON, or PDF formats. Anki-friendly structures for flashcard creation and spaced repetition learning.", icon: "💎", color: "from-[#0891b2] to-[#0e7490]" },
          ].map((feature) => (
            <div
              key={feature.title}
              role="button"
              tabIndex={0}
              onClick={() => openFeature(feature.title)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFeature(feature.title); } }}
              className="group cursor-pointer bg-[#1c2f47] p-8 rounded-xl hover:scale-105 transition-all duration-300 border border-[#374151] hover:border-[#2A4E75] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#2A4E75]"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} mb-6 rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#BBE1FA] group-hover:text-white transition">{feature.title}</h3>
              <p className="text-[#9CA3AF] group-hover:text-[#BBE1FA] transition leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        {/* Feature Modal */}
        <Modal isOpen={!!activeFeature} onClose={closeFeature} title={activeFeature || ''}>
          {activeFeature && <FeatureDetails title={activeFeature} />}
        </Modal>
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
            Unlock access to Context AI with 50,000 tokens per month for intelligent explanations of words in their real-world usage. 
            Get unlimited exports of your entire lookup history in CSV, TSV, JSON, or PDF formats to study, share, or save for later. 
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
                  "Context AI - 50,000 tokens/month",
                  "Unlimited exports (CSV, TSV, JSON, PDF)",
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
                    const res = await fetch("https://wordscope-extension.vercel.app/api/create-checkout-session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}), // No email, let Stripe collect it
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
                  hover:from-[#1e50c3] hover:to-[#6d28d9] text-white font-bold py-6 px-10 mt-4 rounded-xl 
                  transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
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
        <li>
          <Link href="#" onClick={(e) => { e.preventDefault(); openPrivacy(); }} className="hover:text-[#BBE1FA] transition">Privacy Policy</Link>
        </li>
        <li>
          <Link href="#" onClick={(e) => { e.preventDefault(); openTos(); }} className="hover:text-[#BBE1FA] transition">Terms of Service</Link>
        </li>
      </ul>
    </div>

    {/* Right: Connect */}
    <div className="min-w-[150px]">
      <h4 className="font-semibold mb-3 text-[#BBE1FA]">Connect</h4>
      <ul className="space-y-2">
        <li><Link href="https://x.com/wordscope55" className="hover:text-[#BBE1FA] transition">Twitter</Link></li>
        <li><Link href="https://www.reddit.com/r/wordscope_55/" className="hover:text-[#BBE1FA] transition">Reddit</Link></li>
        <li><Link href="mailto:wordscope55@gmail.com" className="hover:text-[#BBE1FA] transition">Contact</Link></li>
      </ul>
    </div>

  </div>

  {/* Bottom bar */}
  <div className="pt-8 border-t border-[#374151] text-center mt-10">
    <p className="text-xs text-[#9CA3AF]">&copy; 2025 Wordscope. All rights reserved.</p>
  </div>
</footer>

      {/* Legal Modals */}
      <Modal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <PrivacyContent />
      </Modal>
      <Modal isOpen={activeModal === 'tos'} onClose={closeModal} title="Terms of Service">
        <TermsContent />
      </Modal>

    </div>
  );
}