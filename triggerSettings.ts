
export type TriggerMethod = "doubleClick" | "modifierClick" | "keyCombo"
export type ModifierCombo = "altClick" | "cmdClick" | "shiftClick"

export interface TriggerSettings {
  triggerMethod: TriggerMethod
  modifierCombo?: ModifierCombo
  customKeyCombo?: string[]
}

export const DEFAULT_TRIGGER_SETTINGS: TriggerSettings = {
  triggerMethod: "doubleClick",
}
