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
    chrome.storage.local.set({ [AUTO_ADD_KEY]: val });
  }

  // Load history on mount
  useEffect(() => {
    chrome.storage.local.get([HISTORY_KEY, AUTO_ADD_KEY], (result) => {
      // History loaded from storage
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

    // Saving new word to history
  
    // Save to state and storage together
    setHistory(updated);
    chrome.storage.local.set({ [HISTORY_KEY]: updated });
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

  

  const exportAsPDF = async (
    exportSource: string,
    includeAllWords: boolean,
    selectedWords: string[]
  ): Promise<Uint8Array | null> => {
    const wordsToExport = includeAllWords
      ? history
      : history.filter((h) => selectedWords.includes(h.word))

    if (wordsToExport.length === 0) {
      return null
    }

    const wrapText = (text: string, maxChars: number) => {
      const words = text.split(/\s+/).filter(Boolean)
      const lines: string[] = []
      let current = ""

      words.forEach((word) => {
        const candidate = current.length ? `${current} ${word}` : word
        if (candidate.length <= maxChars) {
          current = candidate
        } else {
          if (current) lines.push(current)
          current = word
        }
      })

      if (current) {
        lines.push(current)
      }

      return lines
    }

    const escapePdfText = (text: string) =>
      text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

    const lines: string[] = []
    let count = 1

    wordsToExport.forEach(({ word, sources }) => {
      const sourceKey =
        exportSource || defaultExportSource || sourceOrder.find((k) => enabledSources[k])

      const defs = sources[sourceKey]?.definition?.trim()
      if (!defs) {
        return
      }

      const firstDef = defs.split("\n")[0]
      lines.push(`${count}. ${word}`)
      wrapText(`Definition: ${firstDef}`, 70).forEach((line) => lines.push(line))
      lines.push(" ")
      count += 1
    })

    while (lines.length && lines[lines.length - 1].trim() === "") {
      lines.pop()
    }

    if (!lines.length) {
      return null
    }

    const pageWidth = 612
    const pageHeight = 792
    const margin = 72
    const lineHeight = 18
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight)

    const pages: string[][] = []
    for (let i = 0; i < lines.length; i += maxLinesPerPage) {
      pages.push(lines.slice(i, i + maxLinesPerPage))
    }

    const encoder = new TextEncoder()
    type PdfObject = { id: number; render: () => string }
    const objects: PdfObject[] = []
    const addObject = (render: () => string) => {
      const id = objects.length + 1
      objects.push({ id, render })
      return id
    }

    const fontId = addObject(() => "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    const pageIds: number[] = []
    let pagesId = 0

    const buildStream = (pageLines: string[]) => {
      const content: string[] = [
        "BT",
        "/F1 12 Tf",
        `${lineHeight} TL`,
        `${margin} ${pageHeight - margin} Td`
      ]

      pageLines.forEach((line, index) => {
        if (index > 0) {
          content.push("T*")
        }
        content.push(`(${escapePdfText(line)}) Tj`)
      })

      content.push("ET")
      return content.join("\n")
    }

    pages.forEach((pageLines) => {
      const streamData = buildStream(pageLines)
      const streamLength = encoder.encode(streamData).length
      const contentsId = addObject(
        () => `<< /Length ${streamLength} >>\nstream\n${streamData}\nendstream`
      )

      const pageId = addObject(
        () =>
          `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentsId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`
      )
      pageIds.push(pageId)
    })

    pagesId = addObject(
      () =>
        `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds
          .map((id) => `${id} 0 R`)
          .join(" ")}] >>`
    )

    const catalogId = addObject(() => `<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

    const objectStrings = objects.map(
      ({ id, render }) => `${id} 0 obj\n${render()}\nendobj\n`
    )

    let pdfContent = "%PDF-1.4\n"
    const offsets: number[] = [0]
    let position = encoder.encode(pdfContent).length

    objectStrings.forEach((entry) => {
      offsets.push(position)
      pdfContent += entry
      position += encoder.encode(entry).length
    })

    const xrefStart = position
    let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
    for (let i = 1; i < offsets.length; i++) {
      xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`
    }
    pdfContent += xref
    position += encoder.encode(xref).length

    const trailer = `trailer\n<< /Size ${offsets.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
    pdfContent += trailer

    return encoder.encode(pdfContent)
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
