import { stripHtml } from "string-strip-html"
import wiktionaryIcon from "../assets/wiktionary-logo.png"
import duckduckgoIcon from "../assets/duckduckgo-logo.png"
import freedictionaryapiIcon from "../assets/freedictionaryapi-logo.png"
import merriamwebsterIcon from "../assets/merriam-webster-logo.png"
import wordnikapiIcon from "../assets/wordnik_logo.png"
import youglishapiIcon from "../assets/youglishapi-logo.png"
import linguarobotapiIcon from "../assets/linguarobotapi-logo.png"
import googledictionaryIcon from "../assets/google-dictionary-api-logo.png"



//Api keys
const MW_API_KEY = process.env.PLASMO_PUBLIC_MERRIAM_WEBSTER_DICT_API_KEY
const LR_API_KEY = process.env.PLASMO_PUBLIC_LINGUA_API_KEY
const WORDNIK_API_KEY = process.env.PLASMO_PUBLIC_WORDNIK_API_KEY

// Rate limiting mechanism
const rateLimiters = new Map<string, { lastRequest: number; minInterval: number }>()

const createRateLimiter = (source: string, minInterval: number = 1000) => {
  rateLimiters.set(source, { lastRequest: 0, minInterval })
}

const waitForRateLimit = async (source: string): Promise<void> => {
  const limiter = rateLimiters.get(source)
  if (!limiter) return

  const now = Date.now()
  const timeSinceLastRequest = now - limiter.lastRequest
  
  if (timeSinceLastRequest < limiter.minInterval) {
    const waitTime = limiter.minInterval - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  limiter.lastRequest = Date.now()
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Initialize rate limiters for all sources
createRateLimiter('google', 500)
createRateLimiter('wiktionary', 1000)
createRateLimiter('merriamwebsterapi', 1000)
createRateLimiter('freedictionaryapi', 500)
createRateLimiter('duckduckgo', 1000)
createRateLimiter('linguarobot', 1000)

// Sources
export const definitionSources = {

  //
  // Google Dictionary
  //
  "google": {
    name: "Google Dictionary",
    description:
      "Offers concise definitions and part-of-speech tagging from Google search dictionary data. Often used for fast and clean single-line definitions.",
    icon: googledictionaryIcon, 
    fetchDefinition: async (word: string) => {
      try {
        await waitForRateLimit('google')
        
        const res = await fetchWithTimeout(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const json = await res.json()
    
        if (!Array.isArray(json) || !json.length) {
          return {
            definition: "No definition found.",
            synonyms: [],
            antonyms: [],
            phoneticText: "",
            pronunciationAudio: "",
            extrasFetched: true
          }
        }
    
        const entry = json[0]
        const definitionLines: string[] = []
        const synonymsSet = new Set<string>()

        entry.meanings.forEach((meaning: any) => {
          meaning.definitions.forEach((def: any) => {
            if (def.definition?.trim()) {
              // Add the definition line
              definitionLines.push(`(${meaning.partOfSpeech}) ${def.definition.trim()}`)

              // Add the example line directly after (if it exists)
              if (def.example?.trim()) {
                definitionLines.push(`Example: ${def.example.trim()}`)
              }
            }
            def.synonyms?.forEach((syn: string) => synonymsSet.add(syn))
          })
        })

        return {
          definition: definitionLines.join("\n"), // single \n between each line
          synonyms: Array.from(synonymsSet),
          antonyms: [],
          phoneticText: entry.phonetic || entry.phonetics?.[0]?.text || "",
          pronunciationAudio: entry.phonetics?.find((p: any) => p.audio)?.audio || "",
          extrasFetched: true
        }
      } catch (error) {
        return {
          definition: "",
          synonyms: [],
          antonyms: [],
          phoneticText: "",
          pronunciationAudio: "",
          extrasFetched: false
        }
      }
    },
    fetchExtras: async (word: string) => {
      return undefined
    },
    getMoreInfoUrl: (word: string) => 
    `https://www.google.com/search?q=define+${encodeURIComponent(word)}`,
    exportable: true,
    license: {
      name: "GNU GPL v3",
      url: "https://www.gnu.org/licenses/gpl-3.0.html",
      attribution: "Content sourced from the Google Dictionary API"
    },
  },

  //
  // Wiktionary API
  //
  'wiktionary': {
  name: "Wiktionary",
  description:
      "An open-content dictionary offering definitions, example usage, etymology, and word structures. Serves as a comprehensive lexical source.",
  icon: wiktionaryIcon,
  fetchDefinition: async (word: string) => {
    try {
      await waitForRateLimit('wiktionary')
      
      const res = await fetchWithTimeout(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${word}`,
        {
          headers: {
            'User-Agent': 'YourExtensionName/1.0 (your.email@example.com)' // Optional but good etiquette
          }
        }
      )
      if (!res.ok) {
        return {
          definition: "",
          synonyms: [],
          antonyms: [],
          phoneticText: "",
          pronunciationAudio: "",
          extrasFetched: false
        }
      }

      const json = await res.json()

      // Only get English entries
      const englishEntries = json.en || []

      if (!englishEntries.length) {
        return {
          definition: "No definition found.",
          synonyms: [],
          antonyms: [],
          phoneticText: "",
          pronunciationAudio: "",
          extrasFetched: true
        }
      }

      // Flatten definitions
      const definitions = englishEntries.flatMap((entry: any) =>
        entry.definitions.map((def: any) => ({
          partOfSpeech: entry.partOfSpeech,
          definition: stripHtml(def.definition).result, // ⬅️ clean HTML
          example: def.example ? stripHtml(def.example).result : ""
        }))
      )

      const definition =
        definitions
          .map((def) => `(${def.partOfSpeech}) ${def.definition}`)
          .join("\n") || "No definition found."

      // Pronunciations (IPA)
      const phoneticText = englishEntries[0]?.pronunciations?.[0]?.ipa || ""
      const pronunciationAudio = englishEntries[0]?.pronunciations?.[0]?.audio?.url
        ? `https:${englishEntries[0].pronunciations[0].audio.url}`
        : ""

      // Wiktionary REST API doesn’t expose synonyms/antonyms directly
      const synonyms: string[] = []
      const antonyms: string[] = []

      return {
        definition,
        synonyms,
        antonyms,
        phoneticText,
        pronunciationAudio,
        extrasFetched: true
      }
    } catch (error) {
      return {
        definition: "",
        synonyms: [],
        antonyms: [],
        phoneticText: "",
        pronunciationAudio: "",
        extrasFetched: false
      }
    }
  },
  fetchExtras: async (word: string) => {
    return undefined
  },
  getMoreInfoUrl: (word: string) =>
    `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
  exportable: true,
    license: {
      name: "CC BY-SA 4.0 & GNU Free Documentation License",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
      attribution: "Content sourced from Wiktionary"
    }
  },


  // 
  //MERRIAMWEBSTERAPI
  //
  'merriamwebsterapi': {
    name: "Merriam-Webster API",
    description:
      "Delivers definitions and example sentences from Merriam-Webster’s dictionary database. Primarily used for accurate and formal reference entries.",
    icon: merriamwebsterIcon,
    fetchDefinition: async (word: string) => {
      try {
        await waitForRateLimit('merriamwebsterapi')
        
        const res = await fetchWithTimeout(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${MW_API_KEY}`
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const json = await res.json()
    
        if (!Array.isArray(json) || !json[0]) {
          return { definition: "No definition found." }
        }
    
        const shortDefs = json[0]?.shortdef ?? []
        const definition = shortDefs.map((def: string, i: number) => `${i + 1}. ${def}`).join("\n") || "No definition found." 
    
        return { definition }
      } catch (error) {
        return { definition: "Error fetching definition." }
      }
    },
    fetchExtras: async (word:string) => {
      try {
        await waitForRateLimit('merriamwebsterapi')
        
        const [synRes, antRes] = await Promise.all([
            fetchWithTimeout(`https://api.datamuse.com/words?rel_syn=${word}`),
            fetchWithTimeout(`https://api.datamuse.com/words?rel_ant=${word}`)
          ])
      
          if (!synRes.ok || !antRes.ok) {
            throw new Error(`HTTP Error: ${synRes.status} or ${antRes.status}`)
          }
      
          const synJson = await synRes.json()
          const antJson = await antRes.json()
      
          const synonyms = synJson.map((item: any) => item.word)
          const antonyms = antJson.map((item: any) => item.word)
      
          return {
            synonyms,
            antonyms,
            extrasFetched: true
          }
      } catch (error) {
        return {
          synonyms: [],
          antonyms: [],
          extrasFetched: false
        }
      }
    },
    getMoreInfoUrl: (word: string) =>
    `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`,
    exportable: false,
    license: {
      name: "Proprietary (Non-commercial API Use)",
      url: "https://dictionaryapi.com/register/index",
      attribution: "Definitions provided by Merriam-Webster; non-commercial, in-app display only, export not permitted"
    }
  },



  // 
  //FREEDICTIONARYAPI
  //
  'freedictionaryapi': {
    name: "FreeDictionaryAPI",
    description:
      "Sourced from Wiktionary, this provides both definitions and pronunciation audio.",
    icon: freedictionaryapiIcon,
    fetchDefinition: async (word: string) => {
      try {
        await waitForRateLimit('freedictionaryapi')
        
        const res = await fetchWithTimeout(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const json = await res.json()

      const data = json[0];

      // Pronunciation
      const phoneticText = data.phonetic || data.phonetics?.[0]?.text || ""
      const pronunciationAudio = data.phonetics?.find(p => p.audio)?.audio || ""

      // Definitions (flattened)
      const definitions = data.meanings.flatMap(meaning =>
        meaning.definitions.map(def => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example,
          synonyms: def.synonyms,
          antonyms: def.antonyms
        }))
      )

      const definition =
        data.meanings
          ?.flatMap((meaning) =>
            meaning.definitions.map(
              (def) => `(${meaning.partOfSpeech}) ${def.definition}`
            )
          )
        .join("\n") || "No definition found."

      // Synonyms & Antonyms (combined from all meanings)
      const synonyms = Array.from(
        new Set(definitions.flatMap((def) => def.synonyms || []))
      )
      
      const antonyms = Array.from(
        new Set(definitions.flatMap((def) => def.antonyms || []))
      )

      // Origin / Etymology
      const origin = data.origin || ""

      return {
        definition,
        synonyms,
        antonyms,
        phoneticText,
        pronunciationAudio,
        extrasFetched: true  // because it's all already fetched
      }
      } catch (error) {
        return {
          definition: "",
          synonyms: [],
          antonyms: [],
          phoneticText: "",
          pronunciationAudio: "",
          extrasFetched: false
        }
      }
    },
    fetchExtras: async (word:string) => {
      return undefined;
    },
    getMoreInfoUrl: (word: string) => 
    `https://dictionaryapi.dev/`,
    exportable: true,
    license: {
      name: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
      attribution: "Content from FreeDictionaryAPI via Wiktionary"
    }
  },




  // 
  //DUCKDUCKGO
  //
  'duckduckgo': {
    name: "DuckDuckGo",
    description:
      "Returns concise facts, definitions, or contextual answers via DuckDuckGo's Instant Answer system. Used for quick factual context or external definitions.",
    icon: duckduckgoIcon,
    fetchDefinition: async (word: string) => {
      try {
        await waitForRateLimit('duckduckgo')
        
        const res = await fetchWithTimeout(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(word)}&format=json&no_html=1&no_redirect=1&skip_disambig=1`
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        const json = await res.json()

        const definition =
          json.AbstractText ||
          json.Definition ||
          json.Answer ||
          "No definition found."

        return { definition }
      } catch (error) {
        return { definition: "Error fetching definition." }
      }
    },
    fetchExtras: async (_word: string) => {
      return undefined // DuckDuckGo doesn't support extras like synonyms, etc.
    },
    getMoreInfoUrl: (word: string) =>
    `https://duckduckgo.com/?q=define+${encodeURIComponent(word)}`,
    exportable: false,
    license: {
      name: "Third-party Derived (via Instant Answers)",
      url: "https://duckduckgo.com/terms",
      attribution: "Data from DuckDuckGo Instant Answers; third-party content"
    }
  },


  // 
  //YOUGLISH
  //
  'youglish': {
    name: "YouGlish",
    description:
      "Provides real-world pronunciation examples from YouTube clips using the queried word. Used to supplement pronunciation with live context.",
    icon: youglishapiIcon,
    fetchDefinition: async (_word: string) => {
      return { definition: "YouGlish is a pronunciation viewer only." }
    },
    fetchExtras: async (word: string) => {
      const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(word)}/english`
      return {
        youglishUrl, // return this as part of extras
        extrasFetched: true
      }
    },
    exportable: false,
    license: {
      name: "YouGlish Terms of Service",
      url: "https://youglish.com/terms",
      attribution: "Audio pronunciation provided by YouGlish"
    }
  },


  // 
  // Lingua Robot
  //
  'linguarobot': {
    name: "Lingua Robot",
    description:
      "Provides definitions, parts of speech, and related word data sourced from Wiktionary. Used for core word lookup and lexical relationships.",
    icon: linguarobotapiIcon,
    fetchDefinition: async (word: string) => {
      try {
        await waitForRateLimit('linguarobot')
        
        const headers = {
          "x-rapidapi-key": LR_API_KEY,
          "x-rapidapi-host": "lingua-robot.p.rapidapi.com",
        }
    
        const res = await fetchWithTimeout(
          `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${word}`,
          { method: "GET", headers }
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
  
      const json = await res.json()
      const entry = json?.entries?.[0] ?? null

      // Safely derive definitions
      const lexemes: any[] = Array.isArray(entry?.lexemes) ? entry.lexemes : []
      let definition = "No definition found."

      if (lexemes.length > 0) {
        const lex = lexemes[0] || {}
        const pos = lex?.partOfSpeech || ""
        const senses: any[] = Array.isArray(lex?.senses) ? lex.senses : []

        const formattedDefinitions = senses
          .filter((s: any) => !!s?.definition)
          .map((sense: any) => `(${pos}) ${sense.definition}`)

        if (formattedDefinitions.length > 0) {
          definition = formattedDefinitions.join("\n")
        } else if (pos) {
          // Provide at least part of speech if available
          definition = pos
        }
      }

      // Safely derive pronunciation
      const pronunciationData: any[] = Array.isArray(entry?.pronunciations) ? entry.pronunciations : []

      const usPron = pronunciationData.find(
        (p: any) => p?.context?.regions?.includes("United States") && p?.audio?.url
      )
      const fallbackPron = pronunciationData.find((p: any) => p?.audio?.url)

      const audioUrl = usPron?.audio?.url || fallbackPron?.audio?.url || ""
      const transcription =
        usPron?.transcriptions?.find((t: any) => t?.notation === "IPA")?.transcription ??
        fallbackPron?.transcriptions?.find((t: any) => t?.notation === "IPA")?.transcription ??
        ""

      return {
        definition,
        phoneticText: transcription,
        pronunciationAudio: audioUrl,
        extrasFetched: true
      }
      } catch (error) {
        return {
          definition: "Error fetching definition.",
          synonyms: [],
          antonyms: [],
          phoneticText: "",
          pronunciationAudio: "",
          extrasFetched: false
        }
      }
    },
    fetchExtras: async (_word: string) => undefined,
    getMoreInfoUrl: (word: string) =>
    `https://www.linguarobot.io/`,
    exportable: true,
    license: {
      name: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0/",
      attribution: "Content from Wiktionary via Lingua Robot"
    }
  }
  

}
