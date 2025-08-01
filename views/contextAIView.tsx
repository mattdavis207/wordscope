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
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const [themes, setThemes] = useState<Theme[]>([]);

  const [appliedTheme, setAppliedTheme] = useState<string>("");

  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  // Auto-send first message when component mounts
  useEffect(() => {
    const fetchInitialResponse = async () => {
      setLoading(true)
      const aiResponse = await fetchContextAIResponse(word, contextSnippet, url, [], true)
      setMessages([{ sender: "ai", text: aiResponse }])
      setLoading(false)
    }
    fetchInitialResponse()
  }, [word, contextSnippet, url])


  const sendMessage = async (text: string) => {
    setMessages([...messages, { sender: "user", text }])
    setLoading(true)

    const aiResponse = await fetchContextAIResponse(word, contextSnippet, url, [...messages, { sender: "user", text }], false)
    setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }])
    setLoading(false)
  }


  // Clear chat (reset state and fetch initial response again)
  const clearChat = async () => {
    setMessages([])
    setLoading(true)
    const aiResponse = await fetchContextAIResponse(
      word, contextSnippet, url, [], true
    )
    setMessages([{ sender: "ai", text: aiResponse }])
    setLoading(false)
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-background shadow-lg">
      {/* Header */}
      <div className="flex h-12 justify-between items-center px-3 bg-mainBody">
        <h2 className="flex items-center justify-center text-base font-semibold text-text leading-tight h-full">Context AI</h2>
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
      </div>
      
    </div>
  )
}

export default ContextAIView
