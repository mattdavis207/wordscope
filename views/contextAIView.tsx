import React, { useState, useEffect, useRef } from "react"
import { fetchContextAIResponse } from "../backend/gpt_handler"
import ChatBubble from "../components/ChatBubble"
import ChatInput from "../components/ChatInput"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

const ContextAIView = ({ word, contextSnippet, url }: { word: string, contextSnippet: string, url: string }) => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai", text: string }[]>([])
  const [globalMessages, setGlobalMessages] = useState<{ sender: "user" | "ai", text: string, word: string, url: string, timestamp: number }[]>([]);
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null);

  const [themes, setThemes] = useState<Theme[]>([]);

  const [appliedTheme, setAppliedTheme] = useState<string>("");

  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);

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
      console.log(`Cleared chat history for "contextAI_history"`);
      setLoading(false);
    });
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-background shadow-lg">
      {/* Header */}
      <div className="flex h-12 justify-between items-center px-3 bg-mainBody">
        <h2 className="flex items-center justify-center text-base font-semibold text-text leading-tight h-full">Context AI</h2>
        <button
          onClick={fetchInitialResponse}
          disabled={loading || hasAnalyzed}
          className="px-2 py-1 text-sm rounded text-dataText"
          style={{
            padding: "0.25rem 0.5rem", // Tailwind: px-2 py-1
            fontSize: "0.875rem",      // Tailwind: text-sm
            borderRadius: "0.375rem",  // Tailwind: rounded
            backgroundImage: "linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)",
            cursor: loading || hasAnalyzed ? "not-allowed" : "pointer",
            opacity: loading || hasAnalyzed ? 0.5 : 1,
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            if (!(loading || hasAnalyzed)) {
              e.currentTarget.style.backgroundImage =
                "linear-gradient(to right, #2563EB, #7C3AED, #DB2777)";
            }
          }}
          onMouseLeave={(e) => {
            if (!(loading || hasAnalyzed)) {
              e.currentTarget.style.backgroundImage =
                "linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)";
            }
          }}
        >
          Analyze Word
        </button>
        <button
          onClick={clearChat}
          className="px-2 text-sm text-dataText bg-red-500 rounded hover:bg-red-600"
        >
          Clear Chat
        </button>
      </div>

      <div>
        {/* Input Bar - Fixed at bottom */}
        <ChatInput onSend={sendMessage} disabled={loading} />
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
