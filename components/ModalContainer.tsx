import type { ReactNode } from "react"

interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  type?: "modal" | "dropdown"
  children: ReactNode
}

export const ModalContainer = ({ isOpen, onClose, type = "modal", children }: ModalContainerProps) => {
  if (!isOpen) return null

//   const baseClasses = type === "modal"
//     ? "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
//     : null

//   const transitionClasses = "transition-opacity duration-300 ease-out"

  const baseClasses =
    type === "modal"
      ? "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-out"
      : "relative z-[100000]"

  const overlayClasses = isOpen
    ? "opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none"

  return (
    <div
      onClick={onClose}
      className={`${baseClasses} ${overlayClasses} ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`transform transition-transform duration-300 ease-out ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
