

import { useEffect, useState } from "react"
import { definitionSources } from "../sources/definitionSources"

const SOURCE_SETTINGS_KEY = "sourceSettings"
const DEFAULT_EXPORT_SOURCE_KEY = "defaultExportSource"

export function useSourceSettings() {
  const [sourceOrder, setSourceOrder] = useState<string[]>([])
  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const [defaultExportSource, setDefaultExportSource] = useState<string>("google")

  // Load persisted settings on mount
  useEffect(() => {
    chrome.storage.local.get(SOURCE_SETTINGS_KEY, (result) => {
      const settings = result[SOURCE_SETTINGS_KEY] || {}
      // Loading settings from storage
      const allKeys = Object.keys(definitionSources)

      // No saved settings found — initialize on first run
      if (!settings || Object.keys(settings).length === 0) {
        // No settings found - initializing defaults
        const defaultOrder = allKeys
        const defaultEnabled = Object.fromEntries(allKeys.map((key) => [key, true]))

        const defaultSettings = {
          order: defaultOrder,
          enabled: defaultEnabled
        }

        // Save to chrome.storage
        chrome.storage.local.set({ [SOURCE_SETTINGS_KEY]: defaultSettings })

        // Update local state
        setSourceOrder(defaultOrder)
        setEnabledSources(defaultEnabled)
        setLoading(false)
        return
      }

      //If saved settings 
      const persistedOrderRaw = settings.order

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
      
      // Order remapped and persisted
  
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

  // Listen for storage changes to sync between popup and content script
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[SOURCE_SETTINGS_KEY]) {
        const newSettings = changes[SOURCE_SETTINGS_KEY].newValue
        if (newSettings) {
          // Source settings updated
          
          const allKeys = Object.keys(definitionSources)
          const cleanedOrder = newSettings.order?.map((item) => {
            if (typeof item === "string") return item
            return Object.keys(item)
              .filter((k) => /^\d+$/.test(k))
              .sort((a, b) => Number(a) - Number(b))
              .map((k) => item[k])
              .join("")
          }) || allKeys

          const persistedOrder = [
            ...cleanedOrder,
            ...allKeys.filter((key) => !cleanedOrder.includes(key))
          ]

          const fixedEnabled = {
            ...Object.fromEntries(allKeys.map((key) => [key, true])),
            ...newSettings.enabled
          }

          setSourceOrder(persistedOrder)
          setEnabledSources(fixedEnabled)
        }
      }

      if (changes[DEFAULT_EXPORT_SOURCE_KEY]) {
        const newDefaultSource = changes[DEFAULT_EXPORT_SOURCE_KEY].newValue
        if (newDefaultSource) {
          // Default export source updated
          setDefaultExportSource(newDefaultSource)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])
  
  const updateDefaultExportSource = (source: string) => {
    setDefaultExportSource(source)
    chrome.storage.local.set({ [DEFAULT_EXPORT_SOURCE_KEY]: source })
  }
  

  // Toggle enable/disable
  const toggleSource = (key: string) => {
    // Check if we're trying to disable the last enabled source
    const currentlyEnabled = Object.values(enabledSources).filter(Boolean).length
    const isCurrentlyEnabled = enabledSources[key]
    
    // Prevent disabling if this is the last enabled source
    if (isCurrentlyEnabled && currentlyEnabled === 1) {
      alert("At least one source needs to be enabled")
      return
    }
    
    const updated = { ...enabledSources, [key]: !enabledSources[key] }
    setEnabledSources(updated)
    saveSettings(sourceOrder, updated)
  }

  // Persist changes
  const saveSettings = async (order: string[], enabled: Record<string, boolean>) => {
    await chrome.storage.local.set({
      [SOURCE_SETTINGS_KEY]: { order, enabled }
    })
    // Settings saved to storage
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
