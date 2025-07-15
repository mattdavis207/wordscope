import React, { useState, useEffect } from "react"

import "~/styles/tailwind.css"
import "../styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

const ChatInput = ({ onSend, disabled }: { onSend: (msg: string) => void, disabled: boolean }) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input.trim())
    setInput("")
  }

  const [themes, setThemes] = useState<Theme[]>([]);
  
  const [appliedTheme, setAppliedTheme] = useState<string>("");

  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex p-3 bg-mainBody border-t border-border rounded-t-lg">
      <input
        type="text"
        value={input}
        autoFocus={true}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded bg-dullBox text-dataText placeholder-gray-400 outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className="ml-2 px-4 py-2 bg-blue-500 rounded text-dataText hover:bg-blue-600 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  )
}

export default ChatInput
