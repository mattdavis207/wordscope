import { useEffect } from "react"

export function useClickOutside(
    ref: React.RefObject<HTMLElement>,
    onClickOutside: () => void,
    isActive: boolean // 👈 add flag
  ) {
    useEffect(() => {
      if (!isActive) return // Don't attach listener if inactive
  
      function handleClick(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          onClickOutside()
        }
      }
  
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }, [ref, onClickOutside, isActive])
  }