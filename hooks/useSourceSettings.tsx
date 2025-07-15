

import { useEffect, useState } from "react"
import { definitionSources } from "../sources/definitionSources"

const SOURCE_SETTINGS_KEY = "sourceSettings"
const DEFAULT_EXPORT_SOURCE_KEY = "defaultExportSource"

export function useSourceSettings() {
  const [sourceOrder, setSourceOrder] = useState<string[]>([])
  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const [defaultExportSource, setDefaultExportSource] = useState<string>("wordnik")

  // Load persisted settings on mount
  useEffect(() => {
    chrome.storage.local.get(SOURCE_SETTINGS_KEY, (result) => {
      const settings = result[SOURCE_SETTINGS_KEY] || {}
      const allKeys = Object.keys(definitionSources)
      const persistedOrderRaw = Object.keys(definitionSources);
      console.log("pulling settings from local storage", settings);
      console.log("allKeys", allKeys);
      console.log("persistedOrderRaw", persistedOrderRaw);

      const cleanedOrder = persistedOrderRaw.map((item) => {
        if (typeof item === "string") return item
      
        return Object.keys(item)
          .filter((k) => /^\d+$/.test(k)) // only numeric keys
          .sort((a, b) => Number(a) - Number(b)) // sort keys numerically
          .map((k) => item[k])
          .join("")
      })

      const persistedOrder = [
        ...cleanedOrder,
        ...allKeys.filter((key) => !cleanedOrder.includes(key))
      ]
      
      console.log("persisted order after remapping", persistedOrder)
  
      const fixedEnabled = {
        ...Object.fromEntries(allKeys.map((key) => [key, true])), // default all to true
        ...settings.enabled // override with saved user settings if present
      }
  
      setSourceOrder(persistedOrder)
      setEnabledSources(fixedEnabled)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    chrome.storage.local.get(DEFAULT_EXPORT_SOURCE_KEY, (result) => {
      if (result[DEFAULT_EXPORT_SOURCE_KEY]) {
        setDefaultExportSource(result[DEFAULT_EXPORT_SOURCE_KEY])
      }
    })
  }, [])
  
  const updateDefaultExportSource = (source: string) => {
    setDefaultExportSource(source)
    chrome.storage.local.set({ [DEFAULT_EXPORT_SOURCE_KEY]: source })
  }
  

  // Toggle enable/disable
  const toggleSource = (key: string) => {
    const updated = { ...enabledSources, [key]: !enabledSources[key] }
    setEnabledSources(updated)
    saveSettings(sourceOrder, updated)
  }

  // Persist changes
  const saveSettings = async (order: string[], enabled: Record<string, boolean>) => {
    await chrome.storage.local.set({
      [SOURCE_SETTINGS_KEY]: { order, enabled }
    })
    console.log("Saved settings:", { order, enabled })
  }



  return {
    sourceOrder,
    enabledSources,
    loading,
    saveSettings,
    setSourceOrder,
    toggleSource,
    setEnabledSources,
    defaultExportSource,
    updateDefaultExportSource
  }
}
