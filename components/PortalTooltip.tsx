import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import React from "react"

export default function PortalTooltip({
  text,
  children,
}: {
  text: string
  children: React.ReactElement
}) {
  const [hovered, setHovered] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({ x: rect.left + rect.width / 2, y: rect.top })
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
            className="absolute bg-mainBody text-text text-xs px-2 py-1 rounded shadow z-50"
            style={{
              position: "fixed",
              top: coords.y - 10,
              left: coords.x,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  )
}