import { useEffect, useState } from "react"
import { useSourceSettings } from "./useSourceSettings"

const HISTORY_KEY = "history"
const AUTO_ADD_KEY = "autoAddToHistory"

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

  // State for tracking auto add settings
  const [autoAddToHistory, setAutoAddToHistory] = useState(true)

  const {sourceOrder, enabledSources, defaultExportSource} = useSourceSettings()

  const isSaved = (word: string) =>
    history.some((entry) => entry.word === word)
  
  const setAutoAdd = (val: boolean) => {
    setAutoAddToHistory(val)
    chrome.storage.local.set({ [AUTO_ADD_KEY]: val }, () => {
        console.log("Saved autoAddToHistory to storage:", val) 
    });
  }

  // Load history on mount
  useEffect(() => {
    chrome.storage.local.get([HISTORY_KEY, AUTO_ADD_KEY], (result) => {
      setHistory(result[HISTORY_KEY] || [])
      setAutoAddToHistory(result[AUTO_ADD_KEY] ?? true)
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
        const sourceKey = defaultExportSource || sourceOrder.find((k) => enabledSources[k])
        const def = sources[sourceKey]?.definition || ""
        return `${word}\t${def.replace(/\n/g, " ")}`
      })
      .join("\n")
  }

  const toggleSave = (word: string, sources: DefinitionRecord["sources"]) => {
    if (isSaved(word)) {
      deleteWord(word)
    } else {
      saveWord(word, sources)
    }
  }



  return {
    history,
    loading,
    saveWord,
    deleteWord,
    clearHistory,
    exportAsTSV,
    isSaved,
    toggleSave,
    autoAddToHistory,
    setAutoAdd, 
    settingsLoading: loading
  }
}
