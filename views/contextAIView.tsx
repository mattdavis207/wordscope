import React, { useState, useEffect, useRef } from "react"
import { fetchContextAIResponse } from "../context/gpt_handler"
import ChatBubble from "../components/ChatBubble"
import ChatInput from "../components/ChatInput"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

// helper to format numbers consistently
const fmt = (n: number) => n.toLocaleString()

const ContextAIView = ({ word, contextSnippet, url }: { word: string, contextSnippet: string, url: string }) => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai", text: string }[]>([])
  const [globalMessages, setGlobalMessages] = useState<{ sender: "user" | "ai", text: string, word: string, url: string, timestamp: number }[]>([]);
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null);

  const [themes, setThemes] = useState<Theme[]>([]);

  const [appliedTheme, setAppliedTheme] = useState<string>("");
 
  const [tokensLeft, setTokensLeft] = useState<number | null>(null);
  const [lastUsed, setLastUsed] = useState<number | null>(null);  
  const [showUsedFlash, setShowUsedFlash] = useState(false)
  const [prevUsed, setPrevUsed] = useState<number | null>(null)
  const [seeded, setSeeded] = useState(false)

  const outOfTokens = typeof tokensLeft === "number" && tokensLeft <= 0;
  const [hasAnalyzed, setHasAnalyzed] = useState(false)


  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);

  // Seed token amount from server once (nice UX on first open)
  // Always fetch fresh from server to handle subscription status changes
  useEffect(() => {
    const fetchTokens = async () => {
      // Check localStorage first (works in popup)
      let email = localStorage.getItem("userEmail");
      
      // If not found, check chrome.storage (works in content script)
      if (!email) {
        try {
          const { userEmail } = await chrome.storage.local.get("userEmail");
          email = typeof userEmail === "string" && userEmail.trim() ? userEmail.trim() : null;
        } catch (error) {
          // Could not access chrome.storage
        }
      }

      if (!email) {
        // No email found, skipping token fetch
        return;
      }

      // Email found for token fetch

      // Clear any stale token cache first to force fresh data
      chrome.storage.local.remove("tokens_meta");

      try {
        const response = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/usage/balance?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (typeof data.remainingTokens === "number") {
          // Tokens fetched from server
          setTokensLeft(data.remainingTokens);
          chrome.storage.local.set({ tokens_meta: { remainingTokens: data.remainingTokens } });
        }
        // prime prevUsed so no initial flash
        setPrevUsed(null) // or a number if you also fetch lastUsed here
        setSeeded(true)
      } catch (error) {
        // Failed to fetch tokens
      }
    };

    fetchTokens();
  }, []);

  // Keep in sync with writes from fetchContextAIResponse()
  useEffect(() => {
    // Guard: only run in extension context
    if (typeof chrome === "undefined" || !chrome.storage?.onChanged) return

    // Only seed from cache if we haven't already seeded from server
    if (!seeded) {
      chrome.storage.local.get("tokens_meta", (d) => {
        const meta = d?.tokens_meta || {}
        if (typeof meta.remainingTokens === "number") setTokensLeft(meta.remainingTokens)
        if (typeof meta.lastUsed === "number") setLastUsed(meta.lastUsed)
      })
    }

    // Correctly typed listener
    const handleChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      changes,
      areaName
    ) => {
      if (areaName !== "local") return
      const change = changes["tokens_meta"]
      if (change?.newValue) {
        const meta = change.newValue as { remainingTokens?: number; lastUsed?: number }
        if (typeof meta.remainingTokens === "number") setTokensLeft(meta.remainingTokens)
        if (typeof meta.lastUsed === "number") setLastUsed(meta.lastUsed)
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [seeded])

  // whenever lastUsed changes, show a brief flash near the token pill
  useEffect(() => {
    if (typeof lastUsed === "number") {
      setShowUsedFlash(true)
      const t = setTimeout(() => setShowUsedFlash(false), 1800)
      return () => clearTimeout(t)
    }
  }, [lastUsed])

  // whenever lastUsed changes, update prevUsed AFTER render
  useEffect(() => {
    if (!seeded) return
    setPrevUsed(lastUsed ?? null)
  }, [lastUsed, seeded])

  // Then compute whether or not to play animation
  const playFlash = seeded && typeof lastUsed === "number" && lastUsed > 0 && lastUsed !== prevUsed

  // Always scroll on mount
  const scrollToBottomOfChat = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    setTimeout(() => {
      scrollToBottomOfChat()
    }, 200)
  }, []); 
  
  useEffect(() => {
    // Auto-scroll every time messages update
    scrollToBottomOfChat()
  }, [messages]);
  

  const fetchInitialResponse = async () => {

    // Auto Scroll to bottom
    scrollToBottomOfChat()

    if (hasAnalyzed || loading) return;
    setLoading(true)
    const aiResponse = await fetchContextAIResponse(word, contextSnippet, url, [], true)
    const newMessage = { sender: "ai", text: aiResponse } as const;
    const updated = [...messages, newMessage];
    setMessages(updated);

    // Append to global history
    chrome.storage.local.get("contextAI_history", (result) => {
      const prevHistory = result.contextAI_history || [];
      const newEntry = {
        ...newMessage,
        word,
        url,
        timestamp: Date.now(),
      };
      chrome.storage.local.set({ contextAI_history: [...prevHistory, newEntry] });
    });

    setLoading(false);

    // Auto-scroll to bottom after load
    setTimeout(() => {
      scrollToBottomOfChat()
    }, 200);

    setHasAnalyzed(true);
  }

  // Auto-send first message when component mounts
  useEffect(() => {
    // Load messages from global contextAI_history
    chrome.storage.local.get("contextAI_history", (data) => {
      const history = data.contextAI_history || [];

      setMessages(history);
    });
  }, [word, contextSnippet, url])

  useEffect(() => {
    chrome.storage.local.get("contextAI_history", (data) => {
      if (Array.isArray(data.contextAI_history)) {
        setGlobalMessages(data.contextAI_history.reverse()); // optional: show newest first
      }
    });
  }, []);

  // Listen for window focus to refresh tokens when user comes back from payment
  useEffect(() => {
    const handleFocus = () => {
      // Refresh balance when window regains focus (user might have completed payment)
      refreshBalance();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  


  const sendMessage = async (text: string) => {
    const updatedMessages: { sender: "user" | "ai"; text: string }[] = [
      ...messages,
      { sender: "user", text }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    const aiResponse = await fetchContextAIResponse(word, contextSnippet, url, updatedMessages, false);
    const finalMessages: { sender: "user" | "ai"; text: string }[] = [...updatedMessages, { sender: "ai", text: aiResponse }];
    setMessages(finalMessages);

    // Append to contextAI_history
    chrome.storage.local.get("contextAI_history", (result) => {
      const prevHistory = result.contextAI_history || [];
      const newMessages = [
        { sender: "user", text, word, url, timestamp: Date.now() },
        { sender: "ai", text: aiResponse, word, url, timestamp: Date.now() },
      ];
      chrome.storage.local.set({ contextAI_history: [...prevHistory, ...newMessages] });
    });

    setLoading(false);

    // Auto-scroll to bottom after load
    setTimeout(() => {
      scrollToBottomOfChat()
    }, 200);
  }

  // Save messages to storage
  useEffect(() => {
    if (messages.length === 0) return;
    const chatKey = `chat_${word}_${url}`;
    chrome.storage.local.set({ [chatKey]: messages });
  }, [messages]);

  // Clear chat (reset state and fetch initial response again)
  const clearChat = async () => {
    
    setLoading(true)
    setHasAnalyzed(false)
    setMessages([])
    setLoading(false)

    // Remove this specific chat key from storage
    chrome.storage.local.remove("contextAI_history", () => {
      // Chat history cleared
      setLoading(false);
    });
  }

  // (optional) click-to-refresh balance without reloading
  const refreshBalance = async () => {
    // Check localStorage first (works in popup)
    let email = localStorage.getItem("userEmail");
    
    // If not found, check chrome.storage (works in content script)
    if (!email) {
      try {
        const { userEmail } = await chrome.storage.local.get("userEmail");
        email = typeof userEmail === "string" && userEmail.trim() ? userEmail.trim() : null;
      } catch (error) {
        // Could not access chrome.storage
      }
    }
    
    if (!email) return
    try {
      // Clear cache first to ensure fresh data
      chrome.storage.local.remove("tokens_meta")
      
      const r = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/usage/balance?email=${encodeURIComponent(email)}`)
      const d = await r.json()
      if (typeof d.remainingTokens === "number") {
        setTokensLeft(d.remainingTokens)
        chrome.storage.local.set({ tokens_meta: { remainingTokens: d.remainingTokens } })
      }
    } catch {}
  }

  // --- TokenPill component: tidy, clickable, shows tokens left ---
  const TokenPill = () => (
    <button
      onClick={refreshBalance}
      title="Tokens remaining (click to refresh)"
      className="relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-dataText whitespace-nowra bg-dullBox border border-"
      style={{
        lineHeight: 1,
        border: "1px solid var(--border)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#34d399" }} />
      <span className="font-medium">
        {tokensLeft === null ? "…" : `${tokensLeft.toLocaleString()} tokens`}
      </span>
  
      {showUsedFlash && typeof lastUsed === "number" && lastUsed > 0 && (
        <span
          className="absolute select-none"
          style={{
            right: "-10px",
            top: "-8px",
            fontSize: 10,
            fontWeight: 600,
            color: "#fb7185",
            animation: "fadeUp 1.2s ease-in-out forwards", // one-shot
            animationIterationCount: 1
          }}
        >
          −{lastUsed.toLocaleString()}
        </span>
      )}
    </button>
  )
  
  


  // tiny keyframes helper for the flash (Tailwind inline)
  const styleEl = (
    <style>{`
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(6px); }
        10% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(-2px); }
        100% { opacity: 0; transform: translateY(-6px); }
      }
    `}</style>
  )



  return (
    <div className="relative flex flex-col h-full w-full bg-background shadow-lg">
      {styleEl}

      {/* Header */}
      <div className="flex h-12 justify-between items-center px-3 bg-mainBody">
        <h2 className="flex items-center justify-center text-base font-semibold text-text leading-tight h-full">Context AI</h2>

        {/* right side controls */}
        <div className="ml-auto flex items-center gap-2">
          <TokenPill />

          <button
            onClick={fetchInitialResponse}
            disabled={loading || hasAnalyzed || outOfTokens}
            className="inline-flex items-center justify-center h-8 px-3 py-1 text-sm rounded text-dataText disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              backgroundImage: "linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)",
              cursor: loading || hasAnalyzed || outOfTokens ? "not-allowed" : "pointer",
              opacity: loading || hasAnalyzed || outOfTokens ? 0.5 : 1,
              transition: "all 0.2s ease-in-out",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              if (!(loading || hasAnalyzed || outOfTokens)) {
                e.currentTarget.style.backgroundImage =
                  "linear-gradient(to right, #2563EB, #7C3AED, #DB2777)"
              }
            }}
            onMouseLeave={(e) => {
              if (!(loading || hasAnalyzed || outOfTokens)) {
                e.currentTarget.style.backgroundImage =
                  "linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)"
              }
            }}
          >
            {typeof tokensLeft === "number" && tokensLeft <= 0 ? "Out of Tokens" : "Analyze Word"}
          </button>

          <button
            onClick={clearChat}
            className="inline-flex items-center justify-center h-8 px-3 text-sm text-dataText bg-red-500 hover:bg-red-600"
            style={{borderRadius: "0.375rem"}}
          >
            Clear
          </button>
        </div>
      </div>

      {outOfTokens && (
      <div className="px-3 py-1 text-[11px] text-rose-400/90">
        You’ve used all your tokens for this period.
      </div>
      )}

      {/* Optional: a slim info bar under header showing last deduction persistently */}
      {lastUsed !== null && lastUsed > 0 && (
        <div className="px-3 py-1 text-[11px] text-otherText">
          Last response used <span className="font-medium text-dataText">−{fmt(lastUsed)}</span> tokens
        </div>
      )}

      <div>
        {/* Input Bar - Fixed at bottom */}
        <ChatInput onSend={sendMessage} disabled={loading || outOfTokens} />
      </div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ paddingBottom: "4rem", scrollbarWidth: "none" }}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && (
          <ChatBubble sender="ai" text="Thinking..." />
        )}

        <div ref={bottomRef} />
      </div>
      
    </div>
  )
}

export default ContextAIView
