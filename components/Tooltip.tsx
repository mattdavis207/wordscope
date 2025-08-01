import { useState, useEffect } from "react"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"


export const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {

    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    const [hovered, setHovered] = useState(false)

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
    }, []);

    return (
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
        {hovered && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-mainBody text-text text-xs px-2 py-1 rounded shadow">
            {text}
          </div>
        )}
      </div>
    )
  }
  