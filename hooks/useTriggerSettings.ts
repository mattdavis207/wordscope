// useTriggerSettings.ts

import { useEffect, useState } from "react"
import {
  type TriggerSettings,
  DEFAULT_TRIGGER_SETTINGS,
} from "../triggerSettings"

const TRIGGER_SETTINGS_KEY = "triggerSettings"

export function useTriggerSettings() {
  const [settings, setSettings] = useState<TriggerSettings>(
    DEFAULT_TRIGGER_SETTINGS
  )
  const [loading, setLoading] = useState(true)

  // Load on mount
  useEffect(() => {
    chrome.storage.local.get([TRIGGER_SETTINGS_KEY], (res) => {
      const stored = res[TRIGGER_SETTINGS_KEY] as TriggerSettings | undefined
      if (stored) {
        setSettings(stored)
      }
      setLoading(false)
    })
  }, [])

  // Save helper
  const updateSettings = (updates: Partial<TriggerSettings>) => {
    const updated = { ...settings, ...updates }
    setSettings(updated)
    chrome.storage.local.set({ [TRIGGER_SETTINGS_KEY]: updated })
  }

  useEffect(() => {
    if (!loading && settings.triggerMethod === "modifierClick" && !settings.modifierCombo) {
      updateSettings({ modifierCombo: "cmdClick" })
    }
  }, [loading, settings.triggerMethod, settings.modifierCombo])

  const setTriggerMethod = (method: TriggerSettings["triggerMethod"]) => {
    if (method === "modifierClick" && !settings.modifierCombo) {
      updateSettings({ triggerMethod: method, modifierCombo: "cmdClick" })
    } else {
      updateSettings({ triggerMethod: method })
    }
  }

  const setModifierCombo = (combo: TriggerSettings["modifierCombo"]) =>
    updateSettings({ modifierCombo: combo })

  const setCustomKeyCombo = (combo: string[]) =>
    updateSettings({ customKeyCombo: combo })

  const clearCustomKeyCombo = () =>
    updateSettings({ customKeyCombo: [] })

  return {
    settings,
    loading,
    setTriggerMethod,
    setModifierCombo,
    setCustomKeyCombo,
    clearCustomKeyCombo,
  }
}
