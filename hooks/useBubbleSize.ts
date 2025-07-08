import { useEffect, useState } from "react"

const BUBBLE_SIZE_KEY = "bubbleSize"

export interface BubbleSize {
  width: number
  height: number
}

export function useBubbleSize() {
  const [bubbleSize, setBubbleSize] = useState<BubbleSize>({
    width: 500,
    height: 335
  })
  const [loading, setLoading] = useState(true)

  // Load on mount
  useEffect(() => {
    chrome.storage.local.get([BUBBLE_SIZE_KEY], (result) => {
      if (result[BUBBLE_SIZE_KEY]) {
        setBubbleSize(result[BUBBLE_SIZE_KEY])
      }
      setLoading(false)
    })
  }, [])

  // Save new size
  const updateBubbleSize = (newSize: BubbleSize) => {
    setBubbleSize(newSize)
    chrome.storage.local.set({ [BUBBLE_SIZE_KEY]: newSize })
  }

  return {
    bubbleSize,
    loading,
    updateBubbleSize
  }
}
