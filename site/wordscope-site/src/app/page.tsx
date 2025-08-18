"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaBook, 
  FaCog, 
  FaChartLine, 
  FaBolt, 
  FaBrain, 
  FaPalette, 
  FaGem,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaWindowMaximize
} from 'react-icons/fa';
// import { Bubble } from "../../../content.tsx"
import "./tailwind.css"
import './globals.css'

// Simple themed modal
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [frozenTitle, setFrozenTitle] = useState(title);
  const [frozenChildren, setFrozenChildren] = useState(children);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      setFrozenTitle(title);
      setFrozenChildren(children);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, title, children]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isVisible) return null;
  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        animation: isAnimating ? 'fadeIn 0.2s ease-out' : 'fadeOut 0.2s ease-out'
      }}
    >
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={onClose}
        style={{
          animation: isAnimating ? 'fadeIn 0.2s ease-out' : 'fadeOut 0.2s ease-out'
        }}
      />
      <div 
        className="relative w-full max-w-6xl rounded-2xl border border-[#374151] bg-[#01122B] shadow-2xl"
        style={{
          animation: isAnimating ? 'modalSlideIn 0.2s ease-out' : 'modalSlideOut 0.2s ease-out'
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#072141] rounded-t-2xl border-b border-[#374151]">
          <h3 className="text-xl font-semibold text-[#BBE1FA]">{isAnimating ? title : frozenTitle}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-[#374151] text-[#9CA3AF] hover:text-white hover:border-[#2A4E75] transition-colors duration-150"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-[#BBE1FA]">
          {isAnimating ? children : frozenChildren}
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
        <div className="flex flex-col md:flex-row gap-6 text-sm leading-6 text-[#9CA3AF]">
          <div className="md:w-1/2">
            <img 
              src="/Sources Demo.gif" 
              alt="Sources Configuration Demo" 
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ aspectRatio: '16/10' }}
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center mb-4">
              <FaCog className="text-2xl text-[#2563EB] mr-3" />
              <h4 className="text-lg font-semibold text-[#BBE1FA]">Customize Your Sources</h4>
            </div>
            <p className="mb-4">Enable/disable sources, reorder priority, and set a default export source.</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-[#2A4E75]">
              <li>Fully local settings in <code className="bg-[#374151] px-2 py-1 rounded text-sm">chrome.storage.local</code></li>
              <li>Per‑source license‑aware display</li>
              <li>Quick toggle from the UI</li>
            </ul>
          </div>
        </div>
      );
    case 'Context AI':
      return (
        <Common>
          <p>See how a word behaves in real sentences and paragraphs with concise explanations.</p>
          <ul className="list-disc pl-6 space-y-1 marker:text-[#2A4E75]">
            <li>50,000 tokens/month for Pro</li>
            <li>History‑aware prompts (local)</li>
            <li>Respectful of source licenses, no bulk scraping</li>
          </ul>
        </Common>
      );
    case 'History Tracking':
      return (
        <div className="flex flex-col md:flex-row gap-6 text-sm leading-6 text-[#9CA3AF]">
          <div className="md:w-1/2">
            <img 
              src="/History Demo.gif" 
              alt="History Tracking Demo" 
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ aspectRatio: '16/10' }}
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-2xl text-[#2563EB] mr-3" />
              <h4 className="text-lg font-semibold text-[#BBE1FA]">Track Your Progress</h4>
            </div>
            <p className="mb-4">Every lookup is saved locally so you can review and study later.</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-[#2A4E75]">
              <li>Searchable list of saved words</li>
              <li>Per‑source data where available</li>
              <li>Clear/export anytime</li>
            </ul>
          </div>
        </div>
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
            <li>Data formats for external study tools</li>
            <li>Email‑based subscription via Stripe (no card data stored by us)</li>
          </ul>
        </Common>
      );
    default:
      return <Common><p>Details coming soon.</p></Common>;
  }
}


export default function Home() {
  const [activeModal, setActiveModal] = useState<null | 'privacy' | 'tos'>(null);
  const openPrivacy = () => setActiveModal('privacy');
  const openTos = () => setActiveModal('tos');
  const closeModal = () => setActiveModal(null);

  // Feature modal state
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const openFeature = (title: string) => setActiveFeature(title);
  const closeFeature = () => setActiveFeature(null);

  // Slider state for each feature
  const [sliderStates, setSliderStates] = useState<{[key: string]: number}>({});

  // Manual navigation functions
  const nextSlide = (featureTitle: string) => {
    const featureData = getFeatureData(featureTitle);
    if (!featureData?.sliderImages) return;
    
    setSliderStates(prev => {
      const currentIndex = prev[featureTitle] || 0;
      const nextIndex = (currentIndex + 1) % featureData.sliderImages.length;
      return { ...prev, [featureTitle]: nextIndex };
    });
  };

  const prevSlide = (featureTitle: string) => {
    const featureData = getFeatureData(featureTitle);
    if (!featureData?.sliderImages) return;
    
    setSliderStates(prev => {
      const currentIndex = prev[featureTitle] || 0;
      const prevIndex = currentIndex === 0 ? featureData.sliderImages.length - 1 : currentIndex - 1;
      return { ...prev, [featureTitle]: prevIndex };
    });
  };

  const goToSlide = (featureTitle: string, index: number) => {
    setSliderStates(prev => ({
      ...prev,
      [featureTitle]: index
    }));
  };

  // Find the feature data to get actual image count
  const getFeatureData = (title: string) => {
    const features = [
      { 
        title: "Instant Definitions", 
        sliderImages: ["/definitions/Definitions 1.png", "/definitions/Definitions 2.png", "/definitions/Definitions 3.png", "/definitions/Definitions 4.png", "/definitions/Definitions 5.png", "/definitions/Definitions 6.png", "/definitions//definitions/Definitions 7.png", ]
      },
      { 
        title: "Context AI", 
        sliderImages: ["/context-ai/Context AI 1.png", "/context-ai/Context AI 2.png", "/context-ai/Context AI 3.png"]
      },
      { 
        title: "Custom Themes", 
        sliderImages: ["/custom-themes/Custom Themes 1.png", "/custom-themes/Custom Themes 2.png", "/custom-themes/Custom Themes 3.png", "/custom-themes/Custom Themes 4.png", "/custom-themes/Custom Themes 5.png", "/custom-themes/Custom Themes 6.png", "/custom-themes/Custom Themes 7.png", "/custom-themes/Custom Themes 8.png",]
      },
      { 
        title: "Export & Pro Tools", 
        sliderImages: ["/Export Demo 1.png", "/Export Demo 2.png", "/Export Demo 3.png", "/Export Demo 4.png"]
      },
    ];
    return features.find(f => f.title === title);
  };

  // Auto-advance sliders for expanded features
  useEffect(() => {
    if (!activeFeature) return;

    const featureData = getFeatureData(activeFeature);
    if (!featureData?.sliderImages) return;

    const interval = setInterval(() => {
      setSliderStates(prev => {
        const currentIndex = prev[activeFeature] || 0;
        // Use actual image count for this feature
        const nextIndex = (currentIndex + 1) % featureData.sliderImages.length;
        return { ...prev, [activeFeature]: nextIndex };
      });
    }, 4500); // Change image every 4.5 seconds

    return () => clearInterval(interval);
  }, [activeFeature]);

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const header = document.getElementById('site-header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 8; // small gap
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

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
    {
      name: "Google Dictionary",
      description: "Offers concise definitions and part-of-speech tagging from Google search dictionary data. Often used for fast and clean single-line definitions.",
      logo: "/sources/google-dictionary-api-logo.png"
    },
    {
      name: "Wiktionary", 
      description: "An open-content dictionary offering definitions, example usage, etymology, and word structures. Serves as a comprehensive lexical source.",
      logo: "/sources/wiktionary-logo.png"
    },
    {
      name: "Merriam-Webster",
      description: "Delivers definitions and example sentences from Merriam-Webster's dictionary database. Primarily used for accurate and formal reference entries.",
      logo: "/sources/merriam-webster-logo.png"
    },
    {
      name: "WordsAPI",
      description: "Provides structured definitions, examples, synonyms, and hierarchy-based word relationships. Used as a robust semantic source for word understanding.",
      logo: "/sources/wordsapi-logo.png"
    },
    {
      name: "FreeDictionaryAPI",
      description: "Sourced from Wiktionary, this provides both definitions and pronunciation audio.",
      logo: "/sources/freedictionaryapi-logo.png"
    },
    {
      name: "DuckDuckGo",
      description: "Returns concise facts, definitions, or contextual answers via DuckDuckGo's Instant Answer system. Used for quick factual context or external definitions.",
      logo: "/sources/duckduckgo-logo.png"
    },
    {
      name: "YouGlish",
      description: "Provides real-world pronunciation examples from YouTube clips using the queried word. Used to supplement pronunciation with live context.",
      logo: "/sources/youglishapi-logo.png"
    },
    {
      name: "Lingua Robot",
      description: "Provides definitions, parts of speech, and related word data sourced from Wiktionary. Used for core word lookup and lexical relationships.",
      logo: "/sources/linguarobotapi-logo.png"
    }
  ];

  const settings = [
    {
      name: "Auto-add words to history",
      description: "When enabled, every word you look up is automatically saved to your local history. When disabled, you'll need to click the heart icon to manually save words you want to remember.",
      logo: ""
    },
    {
      name: "Theme customization",
      description: "Choose from built-in light/dark themes or create custom color schemes. Adjust bubble colors to match your browsing environment.",
      logo: ""
    },
    {
      name: "Bubble size adjustment",
      description: "Control the width and height of definition bubbles. Make them compact for minimal interference or larger for easier reading of detailed definitions.",
      logo: ""
    },
    {
      name: "Default export source",
      description: "When exporting your word history, choose which dictionary source appears as the primary definition. Useful for maintaining consistency in study materials.",
      logo: ""
    },
    {
      name: "Double-click activation",
      description: "Enable or disable double-clicking words to trigger definitions. When enabled, double-click any word on a webpage to instantly see its definition bubble.",
      logo: ""
    },
    {
      name: "Alt/Shift + click activation",
      description: "Hold Alt (Option on Mac) or shift while clicking any word to show its definition. Perfect for precise word selection without accidentally triggering on normal clicks.",
      logo: ""
    },
    {
      name: "Cmd/Ctrl + click activation",
      description: "Hold Cmd (Mac) or Ctrl (Windows/Linux) while clicking words to show definitions. Familiar keyboard shortcut that works alongside other browser shortcuts.",
      logo: ""
    },
    {
      name: "Custom hotkey configuration",
      description: "Set up personalized keyboard shortcuts for opening the bubble. Highlight a word and use your keyboard shortcuts to lookup definitions.",
      logo: ""
    }
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
          <a href="#download" onClick={(e) => { e.preventDefault();  window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="hover:text-[#BBE1FA] transition-colors duration-200 font-medium">Download</a>
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
                &quot;The revolutionary approach to expanding your vocabulary involves understanding words in their natural context rather than memorizing isolated definitions.&quot; - Wordscope Dev
              </p>
              
              {/* Demo Video */}
              <div className="mt-8 flex justify-center">
                <div className="bg-[#1c2f47] border border-[#374151] rounded-lg p-3 text-center max-w-5xl">
                  <video 
                    className="w-full h-auto rounded-lg shadow-lg mb-4"
                    controls
                    autoPlay
                    muted
                    loop
                    poster="/wordscope-logo.png"
                  >
                    <source src="/Wordscope-Demo-Video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-[#9CA3AF] text-sm">
                    See Wordscope in action - instant definitions from multiple sources on any webpage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Context AI Demo Section */}
      <section className="py-24 px-6 bg-[#01122B] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#7c3aed] to-[#2563EB] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaBrain />
              <span>CONTEXT AI</span>
            </div>
            <h2 className="font-bold mb-6" style={{ fontSize: "2.5rem" }}>
              Smart <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563EB] bg-clip-text text-transparent">Context Understanding</span>
            </h2>
            <p className="text-[#9CA3AF] max-w-2xl mx-auto text-lg">
              Go beyond simple definitions. Context AI analyzes how words work in real sentences, 
              providing intelligent explanations that help you truly understand meaning and usage.
            </p>
          </div>
          
          <div className="relative bg-[#072141] rounded-2xl p-10 border border-[#374151] shadow-2xl">
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[#374151]">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="ml-6 bg-[#1c2f47] px-6 py-2 rounded-lg text-[#9CA3AF]">
                Context AI Analysis
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold text-[#BBE1FA] mb-4">Intelligent Word Analysis</h3>
                <p className="text-[#9CA3AF] mb-6 leading-relaxed">
                  Context AI doesn&apos;t just provide definitions, it explains how words function within their specific context, 
                  helping you understand nuance, tone, and usage patterns that traditional dictionaries miss.
                </p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[#9CA3AF]">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    Contextual meaning analysis
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    Usage pattern recognition
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    Tone and nuance explanation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    50,000 tokens/month with Pro
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1c2f47] border border-[#374151] rounded-lg p-3 text-center max-w-5xl mx-auto">
                <Image 
                  src="/Context AI Demo.gif" 
                  alt="Context AI Demo" 
                  width={1200} 
                  height={900}
                  className="w-full h-auto rounded-lg shadow-lg mb-4"
                />
                <p className="text-[#9CA3AF] text-sm">
                  Context AI explains how words work in real-world usage with intelligent analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Details with Enhanced Hover Dropdowns */}
      <section id="features" className="bg-[#072141] px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: "2.5rem" }}>Inside Wordscope</h2>
          <p className="text-[#9CA3AF] text-center mb-16 text-lg mx-auto mb-4">
            Explore the comprehensive features that make Wordscope your ultimate word companion.
          </p>
          
          {[
            {
              title: "Dictionary Sources",
              desc: "Access definitions from multiple trusted sources",
              details: "Get instant definitions from 8 comprehensive dictionary sources including Google Dictionary, Wiktionary, Merriam-Webster, and WordAPI. Customize priority order, enable/disable sources, and set default export sources with full license compliance.",
              icon: <FaBook size = {30} className="text-xl" />,
              items: sources,
              hasDemo: true,
              demoGif: "/Sources Demo.gif",
              demoDescription: "See how Wordscope instantly pulls definitions from multiple trusted sources, giving you comprehensive word information at a glance.",
              configFeatures: [
                "Fully local settings in chrome.storage.local",
                "Per‑source license‑aware display", 
                "Quick toggle from the UI"
              ]
            },
            {
              title: "Smart Settings",
              desc: "Customize every aspect of your experience", 
              details: "Fine-tune Wordscope to work exactly how you want it to, with extensive customization options including trigger methods, themes, bubble sizing, and export preferences.",
              icon: <FaCog size = {30} className="text-xl" />,
              items: settings,
              hasDemo: true,
              demoGif: "/Settings Demo.mp4",
              demoDescription: "Explore all the customization options available in Wordscope settings, from trigger methods to theme customization."
            },
            {
              title: "History & Export",
              desc: "Never lose track of words you've learned",
              details: "All your lookups are saved locally and can be exported to various formats for further study.",
              icon: <FaChartLine size = {30} className="text-xl" />,
              items: [
                { name: "CSV Export", description: "Export your word history as comma-separated values for spreadsheet analysis", logo: "" },
                { name: "TSV Export", description: "Tab-separated format ideal for data processing and analysis tools", logo: "" },
                { name: "JSON Export", description: "Machine-readable format perfect for developers and data scientists", logo: "" },
                { name: "PDF Export", description: "Professional document format for printing and sharing your word collection", logo: "" },
                { name: "Selectable", description: "Quickly select and include any words you've looked up before export", logo: "" },
              ]
            },
          ].map(({ title, desc, details, icon, items, hasDemo, demoGif, demoDescription, configFeatures }) => (
            <div key={title} className="group mb-6 border border-[#374151] rounded-xl overflow-hidden hover:border-[#2A4E75] transition-colors">
              <div className="w-full text-left px-6 py-6 bg-[#1c2f47] group-hover:bg-[#2A4E75] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-[#BBE1FA] group-hover:text-white transition">{icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#BBE1FA] group-hover:text-white transition">{title}</h3>
                      <p className="text-[#9CA3AF] text-sm mt-1">{desc}</p>
                    </div>
                  </div>
                  <FaChevronDown className="text-[#2A4E75] group-hover:text-[#BBE1FA] transition transform group-hover:rotate-180" />
                </div>
              </div>
              
              <div className="opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-[600px] transition-all duration-500 overflow-hidden">
                <div className="px-6 py-6 bg-[#072141] border-t border-[#374151] max-h-[600px] overflow-y-auto">
                  <p className="text-[#9CA3AF] mb-4">{details}</p>
                  {hasDemo ? (
                    <div className="flex lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="space-y-3 mb-4">
                          {items.map((item, index) => (
                            <div key={index} className="group/item bg-[#1c2f47] rounded-lg border border-[#374151] hover:border-[#2A4E75] transition-all duration-300 overflow-hidden">
                              <div className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  {item.logo && (
                                    <Image 
                                      src={item.logo} 
                                      alt={`${item.name} logo`} 
                                      width={18} 
                                      height={18}
                                      className="rounded"
                                    />
                                  )}
                                  <h4 className="font-medium text-[#BBE1FA] group-hover/item:text-white transition text-sm">
                                    {typeof item === 'string' ? item : item.name}
                                  </h4>
                                </div>
                                {typeof item === 'object' && item.description && (
                                  <div className="opacity-0 max-h-0 group-hover/item:opacity-100 group-hover/item:max-h-16 transition-all duration-300 overflow-hidden">
                                    <p className="text-[#9CA3AF] text-xs leading-relaxed mt-1">
                                      {item.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 bg-[#1c2f47] rounded-lg border border-[#374151] p-4 text-center">
                        {demoGif.endsWith('.mp4') ? (
                          <video 
                            className="w-full h-auto rounded-lg shadow-lg mb-4"
                            controls
                            autoPlay
                            muted
                            loop
                          >
                            <source src={demoGif} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <Image 
                            src={demoGif} 
                            alt={`${title} Demo`} 
                            width={500} 
                            height={350}
                            className="w-full h-auto rounded-lg shadow-lg mb-4"
                          />
                        )}
                        <p className="text-[#9CA3AF] text-sm">
                          {demoDescription}
                        </p>
                        
                        {/* Configuration Features Checklist  */}
                        {configFeatures && (
                          <div className="text-left mt-6">
                            <h4 className="text-[#BBE1FA] font-medium text-base mb-4">Configuration Features</h4>
                            <ul className="space-y-3">
                              {configFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-[#9CA3AF]">
                                  <span className="text-green-400 mr-3">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item, index) => (
                        <div key={index} className="group/item bg-[#1c2f47] rounded-lg border border-[#374151] hover:border-[#2A4E75] transition-all duration-300 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              {item.logo && (
                                <Image 
                                  src={item.logo} 
                                  alt={`${item.name} logo`} 
                                  width={24} 
                                  height={24}
                                  className="rounded"
                                />
                              )}
                              <h4 className="font-medium text-[#BBE1FA] group-hover/item:text-white transition text-sm">
                                {typeof item === 'string' ? item : item.name}
                              </h4>
                            </div>
                            {typeof item === 'object' && item.description && (
                              <div className="opacity-0 max-h-0 group-hover/item:opacity-100 group-hover/item:max-h-32 transition-all duration-300 overflow-hidden">
                                <p className="text-[#9CA3AF] text-xs leading-relaxed mt-2">
                                  {item.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transition Section */}
      <section className="bg-[#01122B] px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold mb-6" style={{ fontSize: "2.25rem" }}>How It All Works Together</h2>
          <p className="text-[#9CA3AF] text-lg leading-relaxed mb-8">
            These powerful technical components seamlessly integrate to deliver an intuitive, 
            lightning-fast word discovery experience that adapts to your learning style.
          </p>
          <div className="flex justify-center items-center space-x-4 text-[#BBE1FA]">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Word</span>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#BBE1FA] to-[#2563EB]"></div>
            <div className="flex items-center space-x-2">
              <FaBook className="text-[#2563EB]" />
              <span className="text-sm">API Sources</span>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#7c3aed]"></div>
            <div className="flex items-center space-x-2">
              <FaBrain className="text-[#7c3aed]" />
              <span className="text-sm">AI Processing</span>
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#7c3aed] to-[#16A34A]"></div>
            <div className="flex items-center space-x-2">
              <FaBolt className="text-[#16A34A]" />
              <span className="text-sm">Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#072141] px-6 py-24">
        <h2 className="font-bold text-center" style={{ fontSize: "2.5rem", marginBottom:'20px' }}>Key Features</h2>
        <div className="max-w-6xl mx-auto space-y-8">
          {[
            { 
              title: "Instant Definitions", 
              desc: "Double-click, right-click, or use keyboard shortcuts to get definitions from 8 sources instantly without leaving your current page.", 
              icon: <FaBolt />, 
              color: "from-[#2563EB] to-[#1e50c3]",
              hasGif: false,
              hasSlider: true,
              sliderImages: [
                "/definitions/Definitions 1.png", 
                "/definitions/Definitions 2.png", 
                "/definitions/Definitions 3.png", 
                "/definitions/Definitions 4.png", 
                "/definitions/Definitions 5.png", 
                "/definitions/Definitions 6.png", 
                "/definitions/Definitions 7.png", 
              ],
              details: "Highlight a word anywhere and get definitions from multiple sources without leaving the page.",
              features: [
                "Multi‑source merge with per‑source details",
                "Keyboard/mouse triggers (double‑click, modifiers, hotkeys)", 
                "Pronunciation and examples when available"
              ]
            },
            { 
              title: "Sidepanel Mode", 
              desc: "Open Wordscope in a dedicated sidepanel workspace alongside your content for continuous word exploration and analysis.", 
              icon: <FaWindowMaximize />, 
              color: "from-[#16a34a] to-[#15803d]",
              hasGif: true,
              gifSrc: "/Sidepanel Demo.gif",
              details: "Open Wordscope in a convenient sidepanel that stays with you as you browse. Look up words, explore definitions, and seamlessly switch back to bubble mode.",
              features: [
                "Persistent workspace alongside content",
                "Enhanced search and comparison capabilities", 
                "Seamless switching between bubble and sidepanel modes",
                "Tab-specific state management",
                "Full access to history and export features"
              ]
            },
            { 
              title: "Context AI", 
              desc: "Get intelligent explanations of how words work in real sentences and paragraphs with 50,000 tokens per month (Pro feature).", 
              icon: <FaBrain />, 
              color: "from-[#7c3aed] to-[#6d28d9]",
              hasGif: false,
              hasSlider: true,
              sliderImages: [
                "/context-ai/Context AI 1.png", 
                "/context-ai/Context AI 2.png", 
                "/context-ai/Context AI 3.png"
              ],
              details: "See how a word behaves in real sentences and paragraphs with concise explanations.",
              features: [
                "50,000 tokens/month for Pro",
                "History‑aware prompts (local)",
                "Respectful of source licenses, no bulk scraping"
              ]
            },
            { 
              title: "History Tracking", 
              desc: "Automatically save every lookup locally with timestamps, source data, pronunciations, and synonyms - all searchable and exportable.", 
              icon: <FaChartLine />, 
              color: "from-[#dc2626] to-[#b91c1c]",
              hasGif: true,
              gifSrc: "/History Demo.gif",
              details: "Every lookup is saved locally so you can review and study later.",
              features: [
                "Searchable list of saved words",
                "Per‑source data where available",
                "Clear/export anytime"
              ]
            },
            { 
              title: "Custom Themes", 
              desc: "Choose from light/dark themes or create custom color schemes with advanced tokens that persist across all websites you browse.", 
              icon: <FaPalette />, 
              color: "from-[#ea580c] to-[#c2410c]",
              hasGif: false,
              hasSlider: true,
              sliderImages: [
                "/custom-themes/Custom Themes 1.png",
                "/custom-themes/Custom Themes 2.png",
                "/custom-themes/Custom Themes 3.png",
                "/custom-themes/Custom Themes 4.png",
                "/custom-themes/Custom Themes 5.png",
                "/custom-themes/Custom Themes 6.png",
                "/custom-themes/Custom Themes 7.png",
                "/custom-themes/Custom Themes 8.png",
              ],
              details: "Tune the look with theme palettes that match your workflow.",
              features: [
                "Light/Dark and advanced color tokens",
                "Instant preview and apply",
                "Persists locally"
              ]
            },
            { 
              title: "Export & Pro Tools", 
              desc: "Export your entire history in CSV, TSV, JSON, or PDF formats for data analysis and external study tools.", 
              icon: <FaGem />, 
              color: "from-[#0891b2] to-[#0e7490]",
              hasGif: false,
              hasSlider: true,
              sliderImages: [
                "/exports/Export Demo 1.png",
                "/exports/Export Demo 2.png", 
                "/exports/Export Demo 3.png",
                "/exports/Export Demo 4.png"
              ],
              details: "Get your data out in the formats you need, plus Pro‑only utilities.",
              features: [
                "CSV, TSV, JSON, PDF exports",
                "Data formats for external study tools",
                "Email‑based subscription via Stripe (no card data stored by us)"
              ]
            },
          ].map((feature) => {
            const isExpanded = activeFeature === feature.title;
            return (
              <div
                key={feature.title}
                className="group bg-[#1c2f47] rounded-xl border border-[#374151] hover:border-[#2A4E75] transition-all duration-300 overflow-hidden"
                onMouseEnter={() => openFeature(feature.title)}
                onMouseLeave={() => closeFeature()}
              >
                {/* Main Feature Card */}
                <div className="p-8 hover:bg-[#2A4E75] transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-3 text-[#BBE1FA] group-hover:text-white transition">{feature.title}</h3>
                        <p className="text-[#9CA3AF] group-hover:text-[#BBE1FA] transition leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                    <FaChevronDown className={`text-[#2A4E75] group-hover:text-[#BBE1FA] transition-all duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8 border-t border-[#374151]">
                    {feature.hasGif ? (
                      <div className="flex md:flex-row gap-8 mt-8">
                        <div className="md:w-1/2 flex flex-col justify-center">
                          <h4 className="text-lg font-semibold text-[#BBE1FA] mb-4">{feature.title} in Action</h4>
                          <p className="text-[#9CA3AF] mb-6 leading-relaxed">{feature.details}</p>
                          <ul className="space-y-3">
                            {feature.features.map((item, idx) => (
                              <li key={idx} className="flex items-center text-[#9CA3AF]">
                                <span className="text-green-400 mr-3">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:w-1/2">
                          <img 
                            src={feature.gifSrc} 
                            alt={`${feature.title} Demo`} 
                            className="w-full rounded-lg shadow-lg object-contain bg-[#072141]"
                            style={{ aspectRatio: '16/10' }}
                          />
                        </div>
                      </div>
                    ) : feature.hasSlider ? (
                      <div className="flex md:flex-row gap-8 mt-8">
                        <div className="md:w-1/2">
                          <div className="relative overflow-hidden rounded-lg shadow-lg bg-[#01122B]" style={{ aspectRatio: '16/10' }}>
                            {feature.sliderImages?.map((image, idx) => {
                              const currentIndex = sliderStates[feature.title] || 0;
                              return (
                                <img
                                  key={idx}
                                  src={image}
                                  alt={`${feature.title} Demo ${idx + 1}`}
                                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                                    idx === currentIndex ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                              );
                            })}
                            
                            {/* Navigation arrows */}
                            <button
                              onClick={() => prevSlide(feature.title)}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] p-2"
                              aria-label="Previous image"
                            >
                              <FaChevronLeft size={32} />
                            </button>
                            <button
                              onClick={() => nextSlide(feature.title)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] p-2"
                              aria-label="Next image"
                            >
                              <FaChevronRight size={32} />
                            </button>
                            
                            {/* Clickable slider indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {feature.sliderImages?.map((_, idx) => {
                                const currentIndex = sliderStates[feature.title] || 0;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => goToSlide(feature.title, idx)}
                                    className={`w-3 h-3 rounded-full ${
                                      idx === currentIndex ? 'bg-[#9CA3AF]' : 'bg-[#9CA3AF]/40'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="md:w-1/2 flex flex-col justify-center">
                          <h4 className="text-lg font-semibold text-[#BBE1FA] mb-4">{feature.title} Features</h4>
                          <p className="text-[#9CA3AF] mb-6 leading-relaxed">{feature.details}</p>
                          <ul className="space-y-3">
                            {feature.features.map((item, idx) => (
                              <li key={idx} className="flex items-center text-[#9CA3AF]">
                                <span className="text-green-400 mr-3">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-[#BBE1FA] mb-4">{feature.title} Details</h4>
                        <p className="text-[#9CA3AF] mb-6 leading-relaxed">{feature.details}</p>
                        <ul className="grid md:grid-cols-2 gap-3">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="flex items-center text-[#9CA3AF]">
                              <span className="text-green-400 mr-3">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
        <div className="w-12 h-12 bg-gradient-to-br from-[#2A4E75] to-[#2563EB] rounded-lg flex items-center justify-center shadow-2xl">
          <span className="text-xl font-bold text-[#BBE1FA]">W</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[#BBE1FA]">Wordscope</span>
          <a href="mailto:wordscope55@gmail.com" className="text-sm text-[#9CA3AF] hover:text-[#BBE1FA] transition">wordscope55@gmail.com</a>
        </div>
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