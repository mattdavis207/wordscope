import { useState, useEffect, useCallback, useRef } from "react"
import type { DefinitionData, DefinitionStatus } from "~types"
import type { SetStateAction } from "react"
import { useSourceSettings } from "./useSourceSettings"



export const useDictionary = <T extends Record<string, any>>(definitionSources: T) => {

    // Source Settings
    const {
      sourceOrder,
      enabledSources,
    } = useSourceSettings()

    const [text, setText] = useState("")
    const [definitions, setDefinitions] = useState<Record<keyof T, DefinitionData>>({} as any)
    const sourceKeysRef = useRef<Array<keyof T>>(
      Object.keys(definitionSources) as Array<keyof T>
    )
    const sourceKeys = sourceKeysRef.current
    const firstEnabled = sourceOrder.find((key) => enabledSources[key])
    const initialSource = (firstEnabled ?? sourceKeys[0]) as keyof T
    const [activeSource, setActiveSourceState] = useState<keyof T>(initialSource)
    const [showExtras, setShowExtras] = useState(false)
    const userSelectedSourceRef = useRef(false)
    const latestWordRef = useRef("")

    const evaluateStatus = (result?: DefinitionData | null): DefinitionStatus => {
      if (!result) return "error"

      if (result.status) return result.status

      const trimmed = result.definition?.trim() ?? ""
      if (!trimmed) return "empty"

      if (/error fetching definition/i.test(trimmed)) return "error"
      if (/no definition found/i.test(trimmed)) return "empty"

      return "ok"
    }

    const normalizeDefinition = (result?: DefinitionData | null): DefinitionData => {
      const status = evaluateStatus(result)

      return {
        definition: result?.definition ?? "",
        synonyms: result?.synonyms,
        antonyms: result?.antonyms,
        phoneticText: result?.phoneticText,
        pronunciationAudio: result?.pronunciationAudio,
        extrasFetched: result?.extrasFetched,
        status
      }
    }

    const hasUsableDefinition = (data?: DefinitionData) => {
      if (!data) return false
      const status = data.status ?? evaluateStatus(data)
      if (status !== "ok") return false
      const trimmed = data.definition?.trim()
      return Boolean(trimmed)
    }

    const setActiveSource = useCallback((value: SetStateAction<keyof T>) => {
      userSelectedSourceRef.current = true
      setActiveSourceState((prev) =>
        typeof value === "function" ? (value as (arg: keyof T) => keyof T)(prev) : value
      )
    }, [setActiveSourceState])


    useEffect(() => {
      const firstEnabled = sourceOrder.find((key) => enabledSources[key])
      const fallback = (firstEnabled ?? sourceKeys[0]) as keyof T | undefined
      if (!activeSource || !enabledSources[activeSource as string]) {
        if (fallback) {
          setActiveSourceState(fallback)
        }
      }
    }, [sourceOrder, enabledSources, activeSource, sourceKeys])

    useEffect(() => {
      latestWordRef.current = text
      userSelectedSourceRef.current = false
    }, [text])
    
    useEffect(() => {
      if (!text) return

      setDefinitions({} as any)
      setShowExtras(false)
  
      Object.entries(definitionSources).forEach(async ([key, source]) => {
        try {
          const result = await source.fetchDefinition(text)
          if (latestWordRef.current !== text) return
          const normalized = normalizeDefinition(result)
          setDefinitions((prev) => ({
            ...prev,
            [key as keyof T]: normalized
          }))
        } catch {
          if (latestWordRef.current !== text) return
          const normalized = normalizeDefinition(null)
          setDefinitions((prev) => ({
            ...prev,
            [key as keyof T]: normalized
          }))
        }
      })
    }, [text])

    useEffect(() => {
      if (!text) return
      if (userSelectedSourceRef.current) return

      const firstWithDefinition = sourceOrder
        .filter((key) => enabledSources[key])
        .find((key) => hasUsableDefinition(definitions[key as keyof T]))

      if (firstWithDefinition && firstWithDefinition !== activeSource) {
        setActiveSourceState(firstWithDefinition as keyof T)
      }
    }, [definitions, sourceOrder, enabledSources, activeSource, text])
  
    const handleSynonymAntonyms = async () => {
      const current = definitions[activeSource]
      const source = definitionSources[activeSource]
  
      if (!current || current.extrasFetched || !source.fetchExtras) {
        setShowExtras((prev) => !prev)
        return
      }
  
      const extras = await source.fetchExtras?.(text)
      if (extras) {
        setDefinitions((prev) => ({
          ...prev,
          [activeSource]: {
            ...prev[activeSource],
            ...extras
          }
        }))
        setShowExtras(true)
      }
    }
  
    return {
      text,
      setText,
      definitions,
      activeSource,
      setActiveSource,
      showExtras,
      setShowExtras,
      handleSynonymAntonyms
    }
  }
