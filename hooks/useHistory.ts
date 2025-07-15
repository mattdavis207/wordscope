import { useEffect, useState } from "react"
import { useSourceSettings } from "./useSourceSettings"
import { jsPDF } from "jspdf";

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
      console.log("[useHistory] Loaded history from storage:", result[HISTORY_KEY]);
      setHistory(result[HISTORY_KEY] || [])
      setAutoAddToHistory(result[AUTO_ADD_KEY] ?? true)
      setLoading(false)
    })
  }, [])

  // Add or update a word
  const saveWord = (word: string, sources: DefinitionRecord["sources"], pageUrl: string) => {
    const newEntry: DefinitionRecord = {
      word,
      timestamp: Date.now(),
      sources,
      pageUrl
    };
  
    // Update local variable
    const updated = [newEntry, ...history.filter((e) => e.word !== word)];

    console.log("[useHistory] Saving new word:", newEntry);
    console.log("[useHistory] Updated history before storage:", updated);
  
    // Save to state and storage together
    setHistory(updated);
    chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
      console.log("History updated in storage:", updated);
    });
  };

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

  const exportAsTSV = (exportSource: string, includeAllWords: boolean, selectedWords: string[]) => {
    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word));
  
    return wordsToExport
      .map(({ word, sources }) => {
        const sourceKey = exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k]);
        const defs = sources[sourceKey]?.definition?.trim();
  
        if (!defs) return null;
  
        const firstDef = defs.split("\n")[0]; 
        return `${word}\t${firstDef.replace(/\n/g, " ")}`;
      })
      .filter(Boolean) // Remove nulls
      .join("\n");
  };
  


  const exportAsCSV = (exportSource: string, includeAllWords: boolean, selectedWords: string[]) => {
    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word));
  
    return wordsToExport
      .map(({ word, sources }) => {
        const sourceKey = exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k]);
        const defs = sources[sourceKey]?.definition?.trim();
  
        if (!defs) return null; 
  
        const firstDef = defs.split("\n")[0];
        return `"${word}","${firstDef.replace(/\n/g, " ").replace(/"/g, '""')}"`;
      })
      .filter(Boolean)
      .join("\n");
  };

  const exportAsJSON = (exportSource: string, includeAllWords: boolean, selectedWords: string[]) => {
    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word));
  
    const data = wordsToExport
      .map(({ word, sources }) => {
        const sourceKey = exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k]);
        const defs = sources[sourceKey]?.definition?.trim();
  
        if (!defs) return null; 
  
        const firstDef = defs.split("\n")[0];
        return { word, definition: firstDef };
      })
      .filter(Boolean);
  
    return JSON.stringify(data, null, 2);
  };

  

  const exportAsPDF = (exportSource: string, includeAllWords: boolean, selectedWords: string[]) => {
    const doc = new jsPDF();

    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word));

    let y = 10; // Start position on page
    let count = 1; // Fix numbering so it only increments for added words
  
    wordsToExport.forEach(({ word, sources }) => {
      const sourceKey =
        exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k]);
  
      const defs = sources[sourceKey]?.definition?.trim();
      if (!defs) return; // skip if no definition
  
      const firstDef = defs.split("\n")[0]; // Take first definition only
  
      // Fix numbering (use count, not index)
      doc.text(`${count}. ${word}`, 10, y);
  
      y += 7;
  
      // Wrap long definition text to prevent cutoff
      doc.text(`Definition: ${firstDef}`, 10, y, { maxWidth: 190 });
      y += 12; // Add space between entries
  
      count++; // Increment count after adding
  
      // Start new page if we reach bottom
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });
  
    doc.save("dictionary_history.pdf");
  };


  const toggleSave = (word: string, sources: DefinitionRecord["sources"]) => {
    if (isSaved(word)) {
      deleteWord(word)
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabUrl = tabs[0]?.url;
        const safeUrl = activeTabUrl?.startsWith("http")
          ? activeTabUrl
          : null; // fallback if it's chrome:// or extension://
        saveWord(word, sources, safeUrl);
      });
    }
  }

  return {
    history,
    setHistory,
    loading,
    saveWord,
    deleteWord,
    clearHistory,
    exportAsTSV,
    exportAsCSV,
    exportAsJSON,
    exportAsPDF,
    isSaved,
    toggleSave,
    autoAddToHistory,
    setAutoAdd, 
    settingsLoading: loading
  }
}
