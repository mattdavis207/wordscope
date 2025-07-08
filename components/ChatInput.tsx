import React, { useState } from "react"

const ChatInput = ({ onSend, disabled }: { onSend: (msg: string) => void, disabled: boolean }) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input.trim())
    setInput("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex p-3 bg-[#072141] border-t border-gray-600 rounded-t-lg">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded bg-[#112844] text-white placeholder-gray-400 outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className="ml-2 px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  )
}

export default ChatInput
