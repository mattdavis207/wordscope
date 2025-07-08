import { useState, useEffect } from "react"
import type { DefinitionData } from "~types"
import { useSourceSettings } from "./useSourceSettings"



export const useDictionary = <T extends Record<string, any>>(definitionSources: T) => {

    // Source Settings
    const {
      sourceOrder,
      enabledSources,
    } = useSourceSettings()

    const [text, setText] = useState("")
    const [definitions, setDefinitions] = useState<Record<keyof T, DefinitionData>>({} as any)
    const firstEnabled = sourceOrder.find((key) => enabledSources[key])
    const [activeSource, setActiveSource] = useState<keyof T>(firstEnabled || null)
    const [showExtras, setShowExtras] = useState(false)


    useEffect(() => {
      const firstEnabled = sourceOrder.find((key) => enabledSources[key])
      if (!activeSource || !enabledSources[activeSource as string]) {
        setActiveSource(firstEnabled || null)
      }
    }, [sourceOrder, enabledSources, activeSource])
    
    useEffect(() => {
      if (!text) return
  
      Object.entries(definitionSources).forEach(async ([key, source]) => {
        try {
          const result = await source.fetchDefinition(text)
          setDefinitions((prev) => ({
            ...prev,
            [key as keyof T]: result
          }))
        } catch {
          setDefinitions((prev) => ({
            ...prev,
            [key as keyof T]: { definition: "Error fetching definition" }
          }))
        }
      })
    }, [text])
  
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
      handleSynonymAntonyms
    }
  }
