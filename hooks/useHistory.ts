import { useEffect, useState } from "react"

const HISTORY_KEY = "history"

export interface DefinitionRecord {
  word: string
  timestamp: number
  sources: {
    [key: string]: {
      definition: string
      synonyms?: string[]
      antonyms?: string[]
      phoneticText?: string
      pronunciationAudio?: string
      extrasFetched?: boolean
    }
  }
  pageUrl: string
}

export function useHistory() {
  const [history, setHistory] = useState<DefinitionRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Load history on mount
  useEffect(() => {
    chrome.storage.local.get([HISTORY_KEY], (result) => {
      setHistory(result[HISTORY_KEY] || [])
      setLoading(false)
    })
  }, [])

  // Add or update a word
  const saveWord = (word: string, sources: DefinitionRecord["sources"]) => {
    
    const newEntry: DefinitionRecord = {
      word,
      timestamp: Date.now(),
      sources,
      pageUrl: window.location.href
    }

    setHistory((prev) => {
      const existingIndex = prev.findIndex((e) => e.word === word)
      const updated = [...prev]

      if (existingIndex >= 0) {
        updated.splice(existingIndex, 1) // Remove old
      }

      updated.unshift(newEntry)
      chrome.storage.local.set({ [HISTORY_KEY]: updated })
      return updated
    })
  }

  const deleteWord = (word: string) => {
    setHistory((prev) => {
      const updated = prev.filter((entry) => entry.word !== word)
      chrome.storage.local.set({ [HISTORY_KEY]: updated })
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    chrome.storage.local.remove(HISTORY_KEY)
  }

  const exportAsTSV = () => {
    return history
      .map(({ word, sources }) => {
        const def = sources["wordsapi"]?.definition || ""
        return `${word}\t${def.replace(/\n/g, " ")}`
      })
      .join("\n")
  }

  return {
    history,
    loading,
    saveWord,
    deleteWord,
    clearHistory,
    exportAsTSV
  }
}
