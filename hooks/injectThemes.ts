export type Theme = {
    name: string;
    className: string;
    colors: string[];
  };
  
  export function injectSavedThemes(
    setThemes?: (t: Theme[]) => void,
    setAppliedTheme?: (t: string) => void
  ): Promise<{ allThemes: Theme[]; applied?: string }> {
    const keys = [
      "background", "text", "main-body", "dull-box", "hover-icon",
      "hover-square", "data-text", "other-text", "border", "tabActiveBg", "aiChatBubble", "userChatBubble"
    ];
  
    return new Promise((resolve) => {
      chrome.storage.local.get(["customThemes", "appliedTheme"], (res) => {
        const savedThemes = res.customThemes || [];
        const applied = res.appliedTheme;
  
        const allThemes: Theme[] = [
          {
            name: "Wordscope Dark",
            className: "theme-dark",
            colors: ["#01122B", "#BBE1FA", "#072141", "#1c2f47", "#FFFFFF", "#1c2f47", "#FFFFFF", "#9CA3AF", "#374151", "#2A4E75", '#2563EB', '#3B82F6'],
          },
          {
            name: "Wordscope Light",
            className: "theme-light",
            colors: [
              "#f5f9ff",
              "#1e3a5f",
              "#ffffff",
              "#e3edf7",
              "#2563eb",
              "#d0e2ff",
              "#111827",
              "#6B7280",
              "#cbd5e1",
              "#c3ddfd",
              "#60a5fa",
              "#f3f4f6"
            ],            
          },
          {
            name: "Solar Breeze",
            className: "theme-solar",
            colors: [
              "#FFF8F0", // background
              "#3B3B3B", // text
              "#FFEFD6", // main-body
              "#FCD5B5", // dull-box
              "#B45309", // hover-icon
              "#FCD5B5", // hover-square
              "#3B3B3B", // data-text
              "#7C6F64", // other-text
              "#E5B299", // border
              "#E5B299", // tab-active-bg
              "#D97706", // ai-chat-bubble
              "#C2410C"  // user-chat-bubble
            ]
            ,
          },
          {
            name: "Pastel Bloom",
            className: "theme-pastel",
            colors: [
              "#FDF6F9", // background
              "#4B5563", // text
              "#FFE4E6", // main-body
              "#FBCFE8", // dull-box
              "#9D174D", // hover-icon
              "#FBCFE8", // hover-square
              "#4B5563", // data-text
              "#6B7280", // other-text
              "#F9A8D4", // border
              "#F9A8D4", // tab-active-bg
              "#EC4899", // ai-chat-bubble
              "#E879F9"  // user-chat-bubble
            ],
          },
          {
            name: "Green Meadows",
            className: "theme-meadows",
            colors: [
              "#F0F9F0", // background
              "#1F4D1F", // text
              "#E8F5E8", // main-body
              "#D1EDC4", // dull-box
              "#16A34A", // hover-icon
              "#D1EDC4", // hover-square
              "#1F4D1F", // data-text
              "#4B5B4B", // other-text
              "#A7D4A0", // border
              "#A7D4A0", // tab-active-bg
              "#22C55E", // ai-chat-bubble
              "#15803D"  // user-chat-bubble
            ],
          },
          ...savedThemes,
        ];
  
        // Remove existing theme styles to prevent conflicts
        const existingStyles = document.querySelectorAll('style[data-theme-style]');
        existingStyles.forEach(style => style.remove());

        allThemes.forEach((theme) => {
          const style = document.createElement("style");
          style.setAttribute('data-theme-style', theme.className);
          style.innerHTML = `
            .${theme.className} {
              ${theme.colors.map((value, idx) => `--${keys[idx]}: ${value};`).join("\n")}
            }
          `;
          document.head.appendChild(style);
        });
  
        if (applied) {
          const root = document.documentElement;
          const oldThemes = Array.from(root.classList).filter(c =>
            c.startsWith("theme-") || c.startsWith("custom-theme-")
          );
          root.classList.remove(...oldThemes);
          root.classList.add(applied);
          setAppliedTheme?.(applied);
        }
  
        setThemes?.(allThemes);
        resolve({ allThemes, applied });
      });
    });
  }