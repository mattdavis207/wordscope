import React, { useState, useEffect, useRef } from "react"
import { fetchContextAIResponse } from "../context/gpt_handler"
import ChatBubble from "../components/ChatBubble"
import ChatInput from "../components/ChatInput"

const ContextAIView = ({ word, contextSnippet, url }: { word: string, contextSnippet: string, url: string }) => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai", text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

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
    <div className="relative flex flex-col h-full w-full bg-[#01122B] text-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-[#072141] rounded-t-xl">
        <h2 className="text-lg font-semibold text-[#BBE1FA]">Context AI</h2>
        <button
          onClick={clearChat}
          className="px-2 py-1 text-sm bg-red-500 rounded hover:bg-red-600"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ paddingBottom: "4rem" }}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && (
          <ChatBubble sender="ai" text="Thinking..." />
        )}
      </div>

      {/* Input Bar - Fixed at bottom */}
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  )
}

export default ContextAIView
