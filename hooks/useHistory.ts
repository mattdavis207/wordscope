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
    const pageHeight = 280; // Leave margin at bottom
    const lineHeight = 6; // Standard line height
    const maxWidth = 190; // Max text width

    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word));

    let y = 20; // Start position on page with more top margin
    let count = 1; // Fix numbering so it only increments for added words
  
    wordsToExport.forEach(({ word, sources }) => {
      const sourceKey =
        exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k]);
  
      const defs = sources[sourceKey]?.definition?.trim();
      if (!defs) return; // skip if no definition
  
      const firstDef = defs.split("\n")[0]; // Take first definition only
      
      // Calculate how much space this entry will need
      const definitionText = `Definition: ${firstDef}`;
      const wrappedLines = doc.splitTextToSize(definitionText, maxWidth);
      const entryHeight = lineHeight + (wrappedLines.length * lineHeight) + 15; // word + definition + spacing
      
      // Check if we need a new page before adding this entry
      if (y + entryHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }
  
      // Add the word number and title
      doc.setFont("helvetica", "bold");
      doc.text(`${count}. ${word}`, 10, y);
      y += lineHeight + 3; // Small gap after word
      
      // Add the definition with proper wrapping
      doc.setFont("helvetica", "normal");
      doc.text(wrappedLines, 10, y);
      y += (wrappedLines.length * lineHeight) + 12; // Dynamic spacing based on actual lines
  
      count++; // Increment count after adding
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
