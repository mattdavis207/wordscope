import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import React from "react"

interface TooltipCoords {
  x: number
  y: number
  position?: 'above' | 'below'
}

// Global tooltip state for force hiding
let forceHideTooltips = false
let tooltipInstances: Set<() => void> = new Set()

export const hideAllTooltips = () => {
  forceHideTooltips = true
  tooltipInstances.forEach(hideTooltip => hideTooltip())
  // Reset after a brief moment
  setTimeout(() => {
    forceHideTooltips = false
  }, 50)
}

export default function PortalTooltip({
  text,
  children,
}: {
  text: string
  children: React.ReactElement
}) {
  const [hovered, setHovered] = useState(false)
  const [coords, setCoords] = useState<TooltipCoords>({ x: 0, y: 0, position: 'above' })

  const hideThisTooltip = () => setHovered(false)

  useEffect(() => {
    tooltipInstances.add(hideThisTooltip)
    return () => {
      tooltipInstances.delete(hideThisTooltip)
    }
  }, [])

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (forceHideTooltips) return
    const rect = e.currentTarget.getBoundingClientRect()
    
    // Create temporary tooltip to measure actual width
    const tempTooltip = document.createElement('div')
    tempTooltip.className = 'absolute bg-mainBody text-text text-xs px-2 py-1 rounded shadow whitespace-nowrap'
    tempTooltip.style.visibility = 'hidden'
    tempTooltip.style.position = 'absolute'
    tempTooltip.style.top = '-9999px'
    tempTooltip.style.maxWidth = '200px'
    tempTooltip.style.fontSize = '12px'
    tempTooltip.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
    tempTooltip.textContent = text
    document.body.appendChild(tempTooltip)
    
    const tooltipWidth = tempTooltip.offsetWidth
    const tooltipHeight = tempTooltip.offsetHeight
    document.body.removeChild(tempTooltip)
    
    // Detect if we're in a popup (small window width)
    const isInPopup = window.innerWidth <= 400
    const containerWidth = isInPopup ? 330 : window.innerWidth
    
    let x = rect.left + rect.width / 2
    let y = rect.top
    let position: 'above' | 'below' = 'above'
    
    // For popup context, just shift tooltip if it would extend outside bounds
    if (isInPopup) {
      const tooltipLeft = x - tooltipWidth / 2
      const tooltipRight = x + tooltipWidth / 2
      
      if (tooltipLeft < 0) {
        // Shift right by only the amount that's cut off
        const cutoffAmount = -tooltipLeft
        x = x + cutoffAmount
      } else if (tooltipRight > containerWidth) {
        // Shift left by only the amount that's cut off
        const cutoffAmount = tooltipRight - containerWidth
        x = x - cutoffAmount
      }
    } else {
      // Original logic for non-popup contexts
      const margin = 8
      if (x - tooltipWidth / 2 < margin) {
        x = rect.left + margin
      } else if (x + tooltipWidth / 2 > window.innerWidth - margin) {
        x = rect.right - margin
      }
    }
    
    // Check if tooltip would be clipped vertically (top)
    if (y - tooltipHeight - 10 < 0) {
      // Not enough space above, show below the element
      y = rect.bottom + 10
      position = 'below'
    }
    
    setCoords({ x, y, position })
    setHovered(true)
    children.props.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    setHovered(false)
    children.props.onMouseLeave?.(e)
  }

  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })}

      {hovered &&
        createPortal(
          <div
            className="absolute bg-mainBody text-text text-xs px-2 py-1 rounded shadow z-[99999] whitespace-nowrap"
            style={{
              position: "fixed",
              top: coords.position === 'below' ? coords.y : coords.y - 10,
              left: coords.x,
              transform: coords.position === 'below' 
                ? "translateX(-50%)" 
                : "translate(-50%, -100%)",
              pointerEvents: "none",
              maxWidth: "200px",
              fontSize: "12px !important",
              fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important"
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  )
}