


//Api keys
const WORDS_API_KEY = process.env.PLASMO_PUBLIC_WORDS_API_KEY
const MW_API_KEY = process.env.PLASMO_PUBLIC_MERRIAM_WEBSTER_DICT_API_KEY
const LR_API_KEY = process.env.PLASMO_PUBLIC_LINGUA_API_KEY

// Sources
export const definitionSources = {
  // 
  //WORDSAPI
  //
  'wordsapi': {
    name: "WordsAPI",
    icon: "📘", // or use a proper icon URL
    fetchDefinition: async (word: string) => {
      const headers = {
        "x-rapidapi-key": WORDS_API_KEY,
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      }

      const res = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`, {
        method: "GET",
        headers,
      })
      const json = await res.json()

      const definition = json.definitions
        ?.map((d: any) => `(${d.partOfSpeech}) ${d.definition}`)
        .join("\n") || "No definition."

      return { definition }
    },
    fetchExtras: async (word: string) => {
      const headers = {
        "x-rapidapi-key": WORDS_API_KEY,
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      }

      const [synRes, antRes] = await Promise.all([
        fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`, { method: "GET", headers }),
        fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/antonyms`, { method: "GET", headers }),
      ])

      const synJson = await synRes.json()
      const antJson = await antRes.json()

      return {
        synonyms: synJson?.synonyms ?? [],
        antonyms: antJson?.antonyms ?? [],
        extrasFetched: true
      }
    }
  },




  // 
  //MERRIAMWEBSTERAPI
  //
  'merriamwebsterapi': {
    name: "MerriamWebsterAPI",
    icon: "📚",
    fetchDefinition: async (word: string) => {
      const res = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${MW_API_KEY}`
      )
      const json = await res.json()

      console.log("json for MW:", json);
  
      if (!Array.isArray(json) || !json[0]) {
        return { definition: "No definition found." }
      }
  
      const shortDefs = json[0]?.shortdef ?? []
      const definition = shortDefs.map((def: string, i: number) => `${i + 1}. ${def}`).join("\n")
  
      return { definition }
    },
    fetchExtras: async (word:string) => {
        const [synRes, antRes] = await Promise.all([
            fetch(`https://api.datamuse.com/words?rel_syn=${word}`),
            fetch(`https://api.datamuse.com/words?rel_ant=${word}`)
          ])
      
          const synJson = await synRes.json()
          const antJson = await antRes.json()
      
          const synonyms = synJson.map((item: any) => item.word)
          const antonyms = antJson.map((item: any) => item.word)
      
          return {
            synonyms,
            antonyms,
            extrasFetched: true
          }
    }
  },



  // 
  //FREEDICTIONARYAPI
  //
  'freedictionaryapi': {
    name: "FreeDictionaryAPI",
    icon: "📙",
    fetchDefinition: async (word: string) => {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      )
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
        .join("\n") || "No definition."

      // Synonyms & Antonyms (combined from all meanings)
      const synonyms = Array.from(
        new Set(definitions.flatMap((def) => def.synonyms || []))
      )
      
      const antonyms = Array.from(
        new Set(definitions.flatMap((def) => def.antonyms || []))
      )

      console.log(synonyms);
      console.log(antonyms);

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
    },
    fetchExtras: async (word:string) => {
      return undefined;
    }
  },




  // 
  //DUCKDUCKGO
  //
  'duckduckgo': {
    name: "DuckDuckGo",
    icon: "🦆",
    fetchDefinition: async (word: string) => {
      try {
        const res = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(word)}&format=json&no_html=1&no_redirect=1&skip_disambig=1`
        )
        const json = await res.json()
        console.log("duckduckgo reponse: ", json);

        const definition =
          json.AbstractText ||
          json.Definition ||
          json.Answer ||
          "No definition found."

        return { definition }
      } catch (error) {
        console.error("DuckDuckGo fetch failed:", error)
        return { definition: "Error fetching definition." }
      }
    },
    fetchExtras: async (_word: string) => {
      return undefined // DuckDuckGo doesn't support extras like synonyms, etc.
    }
  },




  // 
  //YOUGLISH
  //
  'youglish': {
    name: "YouGlish",
    icon: "🎙️",
    fetchDefinition: async (_word: string) => {
      return { definition: "YouGlish is a pronunciation viewer only." }
    },
    fetchExtras: async (word: string) => {
      const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(word)}/english`
      return {
        youglishUrl, // return this as part of extras
        extrasFetched: true
      }
    }
  },


  // 
  // Lingua Robot
  //
  'linguarobot': {
    name: "Lingua Robot",
    icon: "🗣️",
    fetchDefinition: async (word: string) => {
      const headers = {
        "x-rapidapi-key": LR_API_KEY,
        "x-rapidapi-host": "lingua-robot.p.rapidapi.com",
      }
  
      const res = await fetch(
        `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${word}`,
        { method: "GET", headers }
      )
  
      const json = await res.json()
      const entry = json.entries?.[0]
      const lexemes = entry?.lexemes
  
      const lex = lexemes[0]
      const pos = lex.partOfSpeech || ""
      const senses = lex.senses ?? []

    const formattedDefinitions = senses.map(
        (sense: any) => `(${pos}) ${sense.definition}`
    )

    const definition =
        formattedDefinitions.length > 0
        ? formattedDefinitions.join("\n")
        : pos
  
      const pronunciationData = entry?.pronunciations || []
  
      // 🎯 Try to find US pronunciation first
      const usPron = pronunciationData.find((p: any) =>
        p.context?.regions?.includes("United States") && p.audio?.url
      )
  
      const fallbackPron = pronunciationData.find((p: any) => p.audio?.url)
  
      const audioUrl = usPron?.audio?.url || fallbackPron?.audio?.url || ""
  
      // 🔠 Find IPA transcription (preferring US)
      const transcription =
        usPron?.transcriptions?.find((t: any) => t.notation === "IPA")?.transcription ??
        fallbackPron?.transcriptions?.find((t: any) => t.notation === "IPA")?.transcription ??
        ""
  
      return {
        definition,
        phoneticText: transcription,
        pronunciationAudio: audioUrl,
        extrasFetched: true
      }
    },
    fetchExtras: async (_word: string) => undefined
  }
  

}