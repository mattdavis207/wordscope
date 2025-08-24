import { useState, useEffect, useRef, useMemo } from "react"
import ReactDOM from "react-dom";
import { IoClose, IoSearch, IoSettings, IoVolumeMediumSharp, IoSettingsOutline, IoTimeOutline, IoTrashSharp, IoTrashOutline, IoColorPaletteSharp } from "react-icons/io5"
import { HiOutlineClock, HiOutlineEyeDropper, HiOutlineChatBubbleBottomCenterText, HiOutlineDocumentArrowDown, HiOutlineSparkles, HiOutlineArrowDownTray, HiOutlineXMark, 
         HiOutlineTrash, HiOutlineCheck, HiOutlinePlus, HiOutlineExclamationCircle, HiOutlineUserCircle, HiOutlinePencil} from "react-icons/hi2"
import { FaRegPlusSquare, FaChevronLeft, FaChevronRight, FaEthereum, FaBitcoin,
  FaBookOpen, FaStar, FaTwitter, FaRedditAlien, FaHeart, FaRegCopy, FaCheck, FaCrown} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai"
import { IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";
import { GoHeart, GoHeartFill } from "react-icons/go"
import { BiChevronRight, BiChevronLeft } from "~node_modules/react-icons/bi";
import { SiSolana } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx"
import { HexColorPicker } from "react-colorful";
import { injectSavedThemes } from "~hooks/injectThemes";
import wordscopeLogo from "assets/wordscope-logo.png"
import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";


import { useBubbleSize } from "~hooks/useBubbleSize";
import { useHistory } from "~hooks/useHistory"
import { useDictionary } from "~/hooks/useDictionary"
import { useTriggerSettings } from "~hooks/useTriggerSettings";
import { useSourceSettings } from "~hooks/useSourceSettings";
import { MiniDefinitionView } from "~views/tabDefinitionView"
import ContextAIView from "./views/contextAIView"
import { SourcesTab } from "./views/sourcesView"
import { extractContext } from "./context/contextExtractor"
// TutorialModal is now handled by content script
import { Tooltip } from "~components/Tooltip";
import PortalTooltip from "~components/PortalTooltip";
import { useClickOutside } from "~hooks/useClickOutside";
import { ModalContainer } from "~components/ModalContainer";
import { SignInModal } from "~components/SignInModal";

// Source imports
import { definitionSources } from "~sources/definitionSources"
import { clamp } from "~node_modules/framer-motion/dist/types";

declare global {
  interface Window {
    overscroll: any
  }
}

const HISTORY_KEY = "history"
const DEFAULT_EXPORT_SOURCE_KEY = "defaultExportSource"

function IndexPopup() {

  // History hook useStates
  const { saveWord, history, setHistory, deleteWord, clearHistory, isSaved, toggleSave, autoAddToHistory, setAutoAdd, settingsLoading, exportAsTSV, exportAsCSV, exportAsJSON, exportAsPDF} = useHistory()

  const {
    text,
    setText,
    definitions,
    activeSource,
    setActiveSource,
    showExtras,
    setShowExtras,
    handleSynonymAntonyms
  } = useDictionary<typeof definitionSources>(definitionSources)

  // Trigger Settings
  const {
    settings,
    loading,
    setTriggerMethod,
    setModifierCombo,
    setCustomKeyCombo,
    clearCustomKeyCombo,
  } = useTriggerSettings()
  
  const { triggerMethod, modifierCombo, customKeyCombo = [] } = settings


  // Source Settings
  const {
    sourceOrder,
    enabledSources,
    defaultExportSource,
    updateDefaultExportSource
  } = useSourceSettings()

  const [isEditing, setIsEditing] = useState(false)

  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [activeTab, setActiveTab] = useState("definitions")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasAvailableExtras, setHasAvailableExtras] = useState(false);
  const [prevSource, setPrevSource] = useState(activeSource)
  const [hoverTrash, setHoverTrash] = useState(false)
  const [showSettings, setShowSettings] = useState(false);
  const [showContextAI, setShowContextAI] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { bubbleSize, updateBubbleSize } = useBubbleSize();

  // Export flags and state variables
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileType, setExportFileType] = useState<"tsv" | "csv" | "json">("tsv");
  const [exportSource, setExportSource] = useState(defaultExportSource || "");
  const [includeAllWords, setIncludeAllWords] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);


  // Theme states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [appliedTheme, setAppliedTheme] = useState("theme-dark");
  const [activeColor, setActiveColor] = useState<string | null>(null); // For color selection in modal
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [customThemeName, setCustomThemeName] = useState("");
  const [editingTheme, setEditingTheme] = useState<number | null>(null); // Track which theme is being edited
  const [isEditingMode, setIsEditingMode] = useState(false); // Track if we're editing vs creating
  const [customTheme, setCustomTheme] = useState({
    background: "#01122B",
    text: "#BBE1FA",
    mainBody: "#072141",
    dullBox: "#1c2f47",
    hoverIcon: "#FFFFFF",
    hoverSquare: "#1c2f47",
    dataText: "#FFFFFF",
    otherText: "#9CA3AF",
    border: "#374151",
    tabActiveBg: '#2A4E75',
    aiChatBubble: '#2563EB',
    userChatBubble: '#3B82F6',
  });

  const [themes, setThemes] = useState([
    {
      name: "Wordscope Dark",
      className: "theme-dark",
      colors: ["#01122B", "#BBE1FA", "#072141", "#1c2f47", "#FFFFFF"],
    },
    {
      name: "Wordscope Light",
      className: "theme-light",
      colors: [ "#f5f9ff",
              "#1e3a5f",
              "#ffffff",
              "#e3edf7",
              "#2563eb",]
    },
    {
      name: "Solar Breeze",
      className: "theme-solar",
      colors: ["#FFF8F0", // background
              "#3B3B3B", // text
              "#FFEFD6", // main-body
              "#FCD5B5", // dull-box
              "#B45309", // hover-icon
              ]
    },
    {
      name: "Pastel Bloom",
      className: "theme-pastel",
      colors: ["#FDF6F9", // background
              "#4B5563", // text
              "#FFE4E6", // main-body
              "#FBCFE8", // dull-box
              "#9D174D", // hover-icon]
              ]
    },
    {
      name: "Green Meadows",
      className: "theme-meadows",
      colors: ["#F0F9F0", // background
              "#1F4D1F", // text
              "#E8F5E8", // main-body
              "#D1EDC4", // dull-box
              "#16A34A", // hover-icon]
              ]
    },
  ]);

  //Info Box Stuff
  const [infoOpen, setInfoOpen] = useState(false)
  // Tutorial is now handled by content script
  const [showDonate, setShowDonate] = useState(false)
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})

  // Modal Outside Clicks
  const infoRef = useRef<HTMLDivElement>(null)
  useClickOutside(infoRef, () => setInfoOpen(false))

  // Pro flag and sign in states
  const [isPro, setIsPro] = useState(false)
  const [exportCount, setExportCount] = useState<number | null>(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -100 : 100,
      behavior: "smooth"
    })
  }
  
  // Pull export count 
  useEffect(() => {
    chrome.storage.local.get(["exportCount", "isPro"], (result) => {
      setExportCount(result.exportCount ?? 0)
      setIsPro(result.isPro ?? false)
    })
  }, [])

  // Check their pro status and add tokens if not done already
  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    console.log("📦 chrome.storage.local.get from isPro useEffect, userEmail:", email)
    if (!email) return
    
    fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/is-pro?email=${email}`)
      .then((res) => res.json())
      .then((data) => setIsPro(data.isPro))
      .catch((err) => console.error("Error checking Pro:", err))

  }, [])

  // Auto-open tutorial on first install
  useEffect(() => {
    chrome.storage.local.get(["hasSeenTutorial"], async (result) => {
      if (!result.hasSeenTutorial) {
        chrome.storage.local.set({ hasSeenTutorial: true })
        // Trigger content script tutorial instead
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "SHOW_TUTORIAL" })
        }
      }
    })
  }, [])

  //Sign in Logic 
  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    console.log("📦 chrome.storage.local.get from sign in useEffect, userEmail:", email)
    setUserEmail(email)
    
  }, [])

  const handleSignOut = () => {
    setShowSignInModal(false)
    localStorage.removeItem("userEmail")
    chrome.storage.local.remove("userEmail")
    setUserEmail(null)
    window.location.reload()
  }


  const handleUpgrade = async () => {
    const email = localStorage.getItem("userEmail")
    console.log("email", email);
    if (!email){
      setShowSettings(true) // Open Settings screen
        setTimeout(() => {
          const sectionEl = document.getElementById("account-section")
          sectionEl?.scrollIntoView({ behavior: "smooth" })
        }, 100) // Give settings time to render
      return 
    }

    if (isPro) {
      alert("🎉 You already have an active Pro subscription!")
      return
    }
  
    const res = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
  
    const data = await res.json()
    if (data.url) {

      window.open(data.url, "_blank")
    } else {
      alert("Failed to create checkout session.")
    }
  }

  // Navigating to sign in setting
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "OPEN_SETTINGS") {
        setShowSettings(true) // Open Settings screen
        setTimeout(() => {
          const sectionEl = document.getElementById(`${message.section}-section`)
          sectionEl?.scrollIntoView({ behavior: "smooth" })
        }, 100) // Give settings time to render
      }
    })
  }, [])

  //Navigating to history export from bubble
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "open-history-export") {
        setActiveTab("history") // or however you switch to the History tab
        setTimeout(() => {
          document.getElementById("export-history-button")?.click()
        }, 100) // slight delay to ensure tab UI loads
      }
    })
  
    return () => chrome.runtime.onMessage.removeListener(() => {})
  }, [])

  // For tracking animation between tabs and synonyms/antonyms
  useEffect(() => {
    handleSynonymAntonyms()
    const data = definitions?.[activeSource];

    const hasSynonyms = Array.isArray(data?.synonyms) && data.synonyms.length > 0;
    const hasAntonyms = Array.isArray(data?.antonyms) && data.antonyms.length > 0;

    const hasExtras = hasSynonyms || hasAntonyms;
    setHasAvailableExtras(hasExtras); // <- this is a new state variable you can use
    setShowExtras(false)
    if (activeSource !== prevSource) {
      setPrevSource(activeSource)
    }
  }, [activeSource, definitions])

  // Update by pulling themes from storage every mount
  useEffect(() => {
    chrome.storage.local.get(["customThemes", "appliedTheme"], (res) => {
      const savedThemes = res.customThemes || [];
      const savedThemeClass = res.appliedTheme;

      console.log("Applying theme:", savedThemeClass);
      console.log("Injected styles:", savedThemes);

      const keys = [
        "background", "text", "main-body", "dull-box", "hover-icon",
        "hover-square", "data-text", "other-text", "border", "tabActiveBg", "aiChatBubble", "userChatBubble"
      ];

      const allThemes = [...themes, ...savedThemes];

      allThemes.forEach((theme) => {
        const style = document.createElement("style");
        style.innerHTML = `
          .${theme.className} {
            ${theme.colors.map((value, idx) => `--${keys[idx]}: ${value};`).join("\n")}
          }
        `;
        document.head.appendChild(style);
      });
  
      // Set full theme list
      setThemes(allThemes);
  
      // Apply active theme
      if (savedThemeClass) {
        document.documentElement.className = savedThemeClass;
        document.documentElement.classList.remove(...Array.from(document.documentElement.classList).filter(c => c.startsWith("theme-") || c.startsWith("custom-theme-")));
        document.documentElement.classList.add(savedThemeClass);
        setAppliedTheme(savedThemeClass);
      }
    });
  }, []);
  
  
  // Toggle for minidefinition view for saved word
  const toggleExpanded = (word: string) => {
    setExpandedWord((prev) => (prev === word ? null : word))
  }


  // useEffect for saving word to history records
  useEffect(() => {
    if (!text) return;

    const currentWord = text; // Capture the current word
    const allSourcesReady = sourceOrder.every(
      (source) => !enabledSources[source] || definitions[source]
    );

    const timer = setTimeout(() => {
      if (allSourcesReady && autoAddToHistory && !isSaved(currentWord)) {
        console.log("[SAVE DEBUG] Debounced save for word:", currentWord);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTabUrl = tabs[0]?.url;
          const safeUrl = activeTabUrl?.startsWith("http")
            ? activeTabUrl
            : null; // fallback if it's chrome:// or extension://
          saveWord(text, definitions, safeUrl);
        })
      }
    }, 300); // Wait 300ms after last change

    return () => clearTimeout(timer);
  }, [text, definitions, autoAddToHistory])

  useEffect(() => {
      const listener = (changes, areaName) => {
        if (areaName === "local" && changes[HISTORY_KEY]) {
          setHistory(changes[HISTORY_KEY].newValue || []);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }, []);


  useEffect(() => {
    if (triggerMethod !== "keyCombo" || !isEditing) return
  
    const keys = new Set<string>()
  
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      keys.add(formatKey(e))
      setCustomKeyCombo([...keys])
    }
  
    const handleKeyUp = () => {
      keys.clear()
    }
  
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [triggerMethod, isEditing])
  
  
  function formatKey(e: KeyboardEvent): string {
    if (e.key === " ") return "Space"
    if (e.key === "Meta") return "Cmd"
    if (e.key === "Control") return "Ctrl"
    if (e.key === "AltGraph") return "Alt"
    return e.key.charAt(0).toUpperCase() + e.key.slice(1)
  }

  // Fallback if defaultExportSource is not set to firstEnabled source
    useEffect(() => {
      if (!defaultExportSource && sourceOrder.length > 0) {
        const firstEnabled = sourceOrder.find((src) => enabledSources[src]);
        setExportSource(firstEnabled || "");
      }
    }, [defaultExportSource, sourceOrder, enabledSources]);


    // initialize once from storage, else first enabled/exportable
    useEffect(() => {
      chrome.storage.local.get(DEFAULT_EXPORT_SOURCE_KEY, (res) => {
        const saved = res?.[DEFAULT_EXPORT_SOURCE_KEY] as string | undefined;

        const firstEnabled =
          sourceOrder.find((src) => enabledSources[src] && definitionSources[src]?.exportable) || "";

        const initial =
          saved && enabledSources[saved] && definitionSources[saved]?.exportable ? saved : firstEnabled;

        setExportSource(initial);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceOrder, enabledSources, definitionSources]);
  
    const handleExport = () => {
      let data = "";
      if (exportFileType === "tsv") {
        data = exportAsTSV(exportSource, includeAllWords, selectedWords);
      } else if (exportFileType === "csv") {
        data = exportAsCSV(exportSource, includeAllWords, selectedWords);
      } else if (exportFileType === "json") {
        data = exportAsJSON(exportSource, includeAllWords, selectedWords);
      } else if (exportFileType === "pdf") {
        exportAsPDF(exportSource, includeAllWords, selectedWords);
      }
    
      const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dictionary_history.${exportFileType}`;
      link.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    };

    const applyTheme = (themeClass) => {
      document.documentElement.classList.remove(...document.documentElement.classList);
      document.documentElement.classList.add(themeClass);
      setAppliedTheme(themeClass);
      chrome.storage.local.set({ appliedTheme: themeClass });
    };

    const saveCustomTheme = (themeName, colorMap) => {
      const customThemeCount = themes.filter(t => t.className.startsWith("custom-theme-")).length;
      const newTheme = {
        name: themeName || `Custom Theme ${customThemeCount + 1}`,
        className: `custom-theme-${customThemeCount + 1}`,
        colors: Object.values(colorMap) as string[], 
      };
    
      const updatedThemes = [...themes, newTheme];
      setThemes(updatedThemes);
    
      // Save only custom themes to storage
      const customThemes = updatedThemes.filter(t => t.className.startsWith("custom-theme-"));
      chrome.storage.local.set({ customThemes });
    
      // Apply it
      applyTheme(newTheme.className);
    
      return newTheme; // optional, if you want to use the result
    };


    // Delete a theme
    const deleteTheme = (indexToDelete) => {
      const updatedThemes = themes.filter((_, idx) => idx !== indexToDelete);
    
      // Recalculate the new current index (stay in bounds)
      const newIndex = Math.min(currentTheme === indexToDelete ? 0 : currentTheme, updatedThemes.length - 1);
    
      setThemes(updatedThemes);
      setCurrentTheme(newIndex);
    
      // Filter and save only custom themes back to storage
      const customOnly = updatedThemes.filter(t => t.className.startsWith("custom-theme-"));
      chrome.storage.local.set({ customThemes: customOnly });
    
      // If we just deleted the active theme, fallback
      if (appliedTheme === themes[indexToDelete].className) {
        applyTheme("theme-dark");
      }
    };

    // Copy to clipboard helper function for donate modal
    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        console.log("Copied to clipboard:", text)
        // Optionally show a toast or tooltip success message
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }

    const handleCopy = async (address: string) => {
      await copyToClipboard(address)
    
      // Set copied for this address only
      setCopiedMap((prev) => ({ ...prev, [address]: true }))
    
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [address]: false }))
      }, 1500)
    }
    

  return (
    <div className="flex flex-col shadow-lg w-[330px] h-[600px] overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center bg-background p-3 h-70">
        <div className="flex items-center">
              <img
            src={wordscopeLogo}
            alt="Wordscope Logo"
            className="w-7 h-7 object-contain mr-2"
          />
          <span className="text-text text-base font-medium">Wordscope</span>
        </div>
        <div className="flex">
          {/* Upgrade Button and Context AI Button */}
          {!isPro ? (
            <button
              title="Upgrade to Pro"
              className="text-sm transition-colors flex items-center"
              style={{
                color: "var(--text)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--main-body)",
                padding: "6px 10px",
                borderRadius: "9999px", // pill-shaped
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--hover-icon)"
                e.currentTarget.style.backgroundColor = "var(--hover-square)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)"
                e.currentTarget.style.backgroundColor = "var(--main-body)"
              }}
              onClick={handleUpgrade}
              disabled={loading}
            >
              <FaCrown style={{ color: "inherit" }} size={16} /> {/* Small icon */}
              <span className="hidden lg:inline text-sm font-medium">
                {loading ? "Redirecting..." : "Upgrade"}
              </span>
          </button>
           ) : (
            <button
              title="Context AI (Pro)"
              className="text-sm transition-colors mr-1"
              style={{
                color: "var(--text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--hover-icon)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
              onClick={() => {
                const selection = window.getSelection()?.toString().trim();
                if (!selection && !text) {
                  alert("Please select a word first!");
                  return;
                }
                setShowContextAI((prev) => !prev);
                setShowSettings(false);
              }}
            >
              <HiOutlineSparkles style={{ color: "inherit" }} size={20} />
            </button>
          )}

          <div className="relative">
            {/* Info Button */}
            <button
              onClick={(e) => {
                e.stopPropagation() 
                setInfoOpen(!infoOpen)
              }}
              className="p-2 rounded-full transition-colors"
              title="Info"
              style={{
                color: "var(--text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--hover-icon)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
            >
              <AiOutlineInfoCircle size={20} style={{ color: "inherit" }} />
            </button>

            {/* Dropdown Menu */}
            <ModalContainer isOpen={infoOpen} onClose={() => setInfoOpen(false)} type= "dropdown">
              <div ref={infoRef} className="absolute right-0 w-52 bg-mainBody rounded-2xl shadow-2xl shadow-black/50 p-2 space-y-2 z-[99999]">
                {/* Tutorial */}
                <button
                  className="w-full flex items-center space-x-2 text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                  onClick={async () => {
                    try {
                      console.log("🎯 Tutorial button clicked");
                      setInfoOpen(false);
                
                      // send the message and wait for optional response
                      console.log("📤 Sending RELAY_SHOW_TUTORIAL message");
                      const response = await chrome.runtime.sendMessage({ type: "RELAY_SHOW_TUTORIAL" });
                      console.log("📥 Response from background:", response);
                      setTimeout(() => window.close(), 50);

                    } catch (err) {
                      console.error("❌ SHOW_TUTORIAL failed:", err, chrome.runtime.lastError);
                    }
                  }}
                >
                  <FaBookOpen size={16} className="text-blue-400" />
                  <span>Tutorial</span>
                </button>
                {/* Reddit */}
                <a
                  href="https://www.reddit.com/r/wordscope_55/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaRedditAlien size={16} className="text-orange-400" />
                  <span>Reddit</span>
                </a>
                {/* Twitter */}
                <a
                  href="https://x.com/wordscope55"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaTwitter size={16} className="text-sky-400" />
                  <span>Twitter</span>
                </a>
                {/* Donate */}
                <button
                  onClick={() => {
                    setInfoOpen(false)
                    setShowDonate(true)
                    }}
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaHeart size={16} className="text-pink-400" />
                  <span>Support Developer</span>
                </button>
                {/* Review */}
                <a
                  href="https://chrome.google.com/webstore/detail/your-extension-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaStar size={16} className="text-yellow-400" />
                  <span>Leave a Review</span>
                </a>
              </div>
            </ModalContainer>
          </div>


          {/* Settings Button  */}
          <button
            className="text-sm transition-colors ml-1"
            style={{
              color: "var(--text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--hover-icon)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text)";
            }}
            onClick={() => {
              if (showContextAI) setShowContextAI(false);
              setShowSettings((prev) => !prev);
            }}
            title="Settings"
          >
            <IoSettings style={{ color: "inherit" }} size={20} />
          </button>

          {/* Close Button  */}
          <button
            className="text-sm transition-colors ml-2"
            style={{
              color: "var(--text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--hover-icon)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text)";
            }}
            onClick={() => window.close()}
            title="Close"
          >
            <IoClose style={{ color: "inherit" }} size={24} />
          </button>
        </div>
      </div>



      {/* Conditionally show ContextAI  */}
      {showContextAI ? (
        <div className="w-[330px] h-[600px] flex flex-1 flex-col overflow-hidden">
          <ContextAIView
            word={text}
            contextSnippet={extractContext(text)}
            url={window.location.href}
          />
        </div>
      ) : showSettings ? (  // Conditionally show settings
        <div className="space-y-6 p-4 text-dataText bg-mainBody w-full max-w-md mx-auto overflow-y-auto" style = {{scrollbarWidth: 'none'}}>

          {/* General Settings Title  */}
          <section>
            <div className="flex items-center ml-5 space-x-2 text-lg font-semibold text-text">
              <IoSettingsOutline size={20} />
              <h2>General Settings</h2>
            </div>
          </section>

          {/* History */}
          <section className="p-4 bg-background rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
              <HiOutlineClock size={20} />
              <h2>History</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dataText font-medium">Auto add words to history</p>
                <p className="text-sm text-otherText">Automatically save each word you look up.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoAddToHistory} onChange={(e) => setAutoAdd(e.target.checked)}/>
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
              </label>
            </div>
          </section>

          {/* Appearance */}
          <section className="p-4 bg-background rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
              <IoColorPaletteSharp size={20} />
              <h2>Appearance</h2>
            </div>

            {/* Theme colors */}
            <div className="mb-4">
              <div className="flex items-center mb-2 text-lg font-semibold text-text">
                <h2>Themes</h2>

                {/* Check Circle Above */}
                <button
                  onClick={() => applyTheme(themes[currentTheme].className)}
                  className="flex items-center justify-center ml-10 w-6 h-6 rounded-full border-2 transition-colors"
                  style={{
                    borderColor:
                      appliedTheme === themes[currentTheme].className
                        ? "var(--success-border, #10B981)" // fallback to Tailwind green-500
                        : "var(--border, #FFFFFF)",        // fallback white
                    color:
                      appliedTheme === themes[currentTheme].className
                        ? "var(--success-text, #10B981)"  // fallback Tailwind green-500
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (appliedTheme !== themes[currentTheme].className) {
                      e.currentTarget.style.color = "var(--data-text)";
                      e.currentTarget.style.borderColor = "var(--hover-square)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (appliedTheme !== themes[currentTheme].className) {
                      e.currentTarget.style.color = "transparent";
                      e.currentTarget.style.borderColor = "var(--border, #FFFFFF)";
                    }
                  }}
                  title={
                    appliedTheme === themes[currentTheme].className
                      ? "This theme is active"
                      : "Click to apply this theme"
                  }
                >
                  <span className="text-base">✔</span>
              </button>

                {themes[currentTheme].className.startsWith("custom-theme-") && (
                  <>
                    <button
                      onClick={() => {
                        // Set editing mode and populate the modal with existing theme data
                        setIsEditingMode(true);
                        setEditingTheme(currentTheme);
                        setCustomThemeName(themes[currentTheme].name);
                        
                        // Convert colors array back to theme object
                        const themeColors = themes[currentTheme].colors;
                        const themeObject = {
                          background: themeColors[0] || "#000000",
                          text: themeColors[1] || "#000000",
                          mainBody: themeColors[2] || "#000000",
                          dullBox: themeColors[3] || "#000000",
                          hoverIcon: themeColors[4] || "#000000",
                          hoverSquare: themeColors[5] || "#000000",
                          dataText: themeColors[6] || "#000000",
                          otherText: themeColors[7] || "#000000",
                          border: themeColors[8] || "#000000",
                          tabActiveBg: themeColors[9] || "#000000",
                          aiChatBubble: themeColors[10] || "#000000",
                          userChatBubble: themeColors[11] || "#000000",
                        };
                        
                        setCustomTheme(themeObject);
                        setShowCustomModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                      title="Edit custom theme"
                    >
                      <HiOutlinePencil size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteTheme(currentTheme)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete custom theme"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </>
                  )}

              </div>

              <div className="relative flex items-center">
                
                {/* Left Arrow */}
                <button
                  onClick={() =>
                    setCurrentTheme((prev) => (prev === 0 ? themes.length - 1 : prev - 1))
                  }
                  className="p-2 rounded-full transition-colors"
                  style={{
                    color: "var(--text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--hover-icon)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  title="Previous Theme"
                >
                  <FaChevronLeft style={{ color: "inherit" }} size={18} />
                </button>

                {/* Theme Preview */}
                <div className="flex flex-col items-center">
                  <div className="flex space-x-2">
                    {themes[currentTheme].colors.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full border border-border relative`}
                        style={{ backgroundColor: color }}
                      >
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-otherText">{themes[currentTheme].name}</p>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setCurrentTheme((prev) => (prev === themes.length - 1 ? 0 : prev + 1))}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    color: "var(--text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--hover-icon)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  title="Next Theme"
                >
                  <FaChevronRight style={{ color: "inherit" }} size={18} />
                </button>

                {/* Add Custom Button */}
                <button
                  className="px-2 py-1 rounded text-sm transition-colors"
                  style={{
                    color: "var(--text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--hover-icon)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onClick={() => {
                    setIsEditingMode(false);
                    setEditingTheme(null);
                    setCustomThemeName("");
                    setCustomTheme({
                      background: "#01122B",
                      text: "#BBE1FA",
                      mainBody: "#072141",
                      dullBox: "#1c2f47",
                      hoverIcon: "#FFFFFF",
                      hoverSquare: "#1c2f47",
                      dataText: "#FFFFFF",
                      otherText: "#9CA3AF",
                      border: "#374151",
                      tabActiveBg: '#2A4E75',
                      aiChatBubble: '#2563EB',
                      userChatBubble: '#3B82F6',
                    });
                    setShowCustomModal(true);
                  }}
                  title="Create Custom Theme"
                >
                  <FaRegPlusSquare style={{ color: "inherit" }} size={24} />
                </button>

              </div>

            </div>

            {/* Bubble size */}
            <div>
              <p className="font-semibold text-lg text-text mb-2">Bubble size</p>
              <div className="flex space-x-2">
                <div>
                  <label className="block text-xs text-otherText">Width</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-background border border-gray-600 rounded text-dataText outline-none"
                    value={bubbleSize.width}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      updateBubbleSize({
                        ...bubbleSize,
                        width: val
                      })
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value) || 0
                      const clampedWidth = Math.max(315, Math.min(1470, val))
                      updateBubbleSize({
                        ...bubbleSize,
                        width: clampedWidth
                      })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-otherText">Height</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-background border border-gray-600 rounded text-dataText outline-none"
                    value={bubbleSize.height}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      updateBubbleSize({
                        ...bubbleSize,
                        height: val
                      })
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value) || 0
                      const clampedHeight = Math.max(200, Math.min(832, val))
                      updateBubbleSize({
                        ...bubbleSize,
                        height: clampedHeight
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* History setting */}
          <section className="p-4 bg-background rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
              <HiOutlineDocumentArrowDown size={20} />
              <h2>Default Export Source</h2>
            </div>
            <select
              value={defaultExportSource}
              onChange={(e) => updateDefaultExportSource(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-600 rounded text-dataText outline-none"
            >
              {Object.keys(definitionSources)
              .filter((source) => definitionSources[source]?.exportable)
              .map((key) => (
                <option key={key} value={key}>
                  {definitionSources[key].name}
                </option>
              ))}
            </select>
          </section>


          {/* Shortcuts */}
          <section className="p-4 bg-background rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
              <HiOutlineChatBubbleBottomCenterText size={20} />
              <h2>Keyboard Shortcuts</h2>
            </div>

            {/* Trigger Method Dropdown */}
            <label className="block text-dataText mb-1 font-medium">Trigger Method</label>
            <select
              value={triggerMethod}
              onChange={(e) => setTriggerMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-background border border-gray-600 rounded text-dataText outline-none"
            >
              <option value="doubleClick">Double click</option>
              <option value="modifierClick">Command/Alt/Shift + click</option>
              <option value="keyCombo">Custom key combo</option>
            </select>

            {/* Modifier Combo Options */}
            {triggerMethod === "modifierClick" && (
              <div className="flex gap-2 mt-3">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                    modifierCombo === "cmdClick"
                      ? "bg-tabActiveBg text-dataText"
                      : "bg-dullBox text-otherText hover:bg-mainBody hover:text-dataText"
                  }`}
                  onClick={() => setModifierCombo("cmdClick")}
                >
                  Cmd + Click
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                    modifierCombo === "altClick"
                      ? "bg-tabActiveBg text-dataText"
                      : "bg-dullBox text-otherText hover:bg-mainBody hover:text-dataText"
                  }`}
                  onClick={() => setModifierCombo("altClick")}
                >
                  Alt + Click
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                    modifierCombo === "shiftClick"
                      ? "bg-tabActiveBg text-dataText"
                      : "bg-dullBox text-otherText hover:bg-mainBody hover:text-dataText"
                  }`}
                  onClick={() => setModifierCombo("shiftClick")}
                >
                  Shift + Click
                </button>
              </div>
            )}

            {triggerMethod === "keyCombo" && (
              <div className="mt-3">
                <p className="text-sm text-dataText mb-2">
                  {isEditing ? "Press your desired key combo:" : "Current key combo:"}
                </p>

                <div className="flex flex-wrap items-center gap-2 bg-mainBody px-3 py-2 rounded-lg">
                  {customKeyCombo.length === 0 ? (
                    <span className="text-sm text-otherText">None set</span>
                  ) : (
                    customKeyCombo.map((key) => (
                      <span
                        key={key}
                        className="bg-tabActiveBg text-dataText px-2 py-1 rounded-md text-xs font-semibold"
                      >
                        {key}
                      </span>
                    ))
                  )}

                  {/* Clear or Edit Button */}
                  {!isEditing && (
                    <>
                      {customKeyCombo.length > 0 && (
                        <button
                          onClick={clearCustomKeyCombo}
                          className="text-gray-600 hover:text-red-500"
                          title="Clear combo"
                        >
                          <RxCrossCircled size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-500 font-medium text-xs"
                      >
                        Edit
                      </button>
                    </>
                  )}

                  {/* Save button when editing */}
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-green-600 font-medium text-xs"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Account Management Setting */}
          <section id="account-section" className="p-4 bg-background rounded-lg mt-4">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
              <HiOutlineUserCircle size={20} className="text-blue-500" />
              <h2>Account</h2>
            </div>

            {userEmail ? (
              <>
                <p className="text-sm text-otherText mb-3">
                  Signed in as <span className="font-medium">{userEmail}</span>.
                </p>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-otherText mb-3">
                  Sign in to sign up for Pro status and manage your subscription.
                </p>
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </>
            )}

            {showSignInModal && (
              <SignInModal
                onClose={() => setShowSignInModal(false)}
                onSignIn={(email) => {
                  localStorage.setItem("userEmail", email)

                  // Save email to chrome.storage.local if not already
                  chrome.storage.local.get("userEmail", (result) => {
                    if (!result.userEmail) {
                      chrome.storage.local.set({ userEmail: email }, () => {
                        console.log("✅ userEmail saved:", email)
                      })
                    } else {
                      console.log("🔁 userEmail already exists:", result.userEmail)
                    }
                  })

                  setUserEmail(email)
                  window.location.reload()
                  }}
              />
            )}
          </section>

          {/* Cancel Subscription Setting - Only show if user is signed in and has Pro subscription */}
          {userEmail && isPro && (
            <section className="p-4 bg-background rounded-lg mt-4">
              <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-text">
                <HiOutlineExclamationCircle size={20} className="text-red-500" />
                <h2>Manage Subscription</h2>
              </div>
              <p className="text-sm text-otherText mb-3">
                Cancel your Pro subscription at any time. Your Pro features will remain active until the end of your billing cycle.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </section>
          )}

          {showCancelModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-background text-text rounded-lg shadow-lg w-96 p-6">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-red-500">Cancel Subscription</h3>
                  <button
                    className="text-text hover:text-red-400"
                    onClick={() => setShowCancelModal(false)}
                  >
                    <HiOutlineXMark size={20} />
                  </button>
                </div>

                {/* Confirmation Message */}
                <p className="text-sm text-otherText mb-6">
                  Are you sure you want to cancel your Pro subscription? You’ll lose access to premium features at the end of your billing period.
                </p>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1 bg-mainBody rounded hover:bg-dullBox"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Subscription
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async () => {
                      const email = localStorage.getItem("userEmail")
                      const res = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/cancel-subscription`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      })
                      if (res.ok) {
                        alert("Your subscription has been cancelled.")
                        setIsPro(false)
                        setShowCancelModal(false)
                        // Clear token cache when subscription is cancelled
                        chrome.storage.local.remove("tokens_meta")
                        window.open(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_CLIENT_URL}/cancel`)
                      } else {
                        alert("Failed to cancel subscription. Please try again.")
                      }
                    }}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      
      ): (

      // Renders the Search and main tabs 
      <div className="flex-1 flex flex-col overflow-hidden"> 
        {/* Search Bar */}
        <div className="flex py-2 px-3 bg-mainBody">
        <input
          type="text"
          value={searchInput}
          placeholder="Search word... "
          autoFocus= {true}
          className="flex-1 bg-dullBox text-dataText placeholder:text-otherText px-2 py-2 m-2 rounded-md outline-none"
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Reset active tab to first enabled
              const firstEnabled = sourceOrder.find((key) => enabledSources[key])
              if (firstEnabled) {
                setActiveSource(firstEnabled as keyof typeof definitionSources)
              }
              setActiveTab("definitions")
              setText(searchInput.trim())
              setSearchInput("")
            }
          }}
        />
        <button 
          className="hover:bg-dullBox px-3 py-2 my-2 rounded-lg text-text"
          onClick={() => {
              // Reset active tab to first enabled
              const firstEnabled = sourceOrder.find((key) => enabledSources[key])
              if (firstEnabled) {
                setActiveSource(firstEnabled as keyof typeof definitionSources)
              }
              setActiveTab("definitions")
              setText(searchInput.trim())
              setSearchInput("")
            }}
          >
          <IoSearch size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-3 bg-background">
          <button className= {`flex-1 px-3 py-2 rounded-md ${
              activeTab === "definitions"
                ? "bg-tabActiveBg text-text font-semibold"
                : "text-text hover:bg-mainBody"
            }`}
            onClick = {() => setActiveTab("definitions")} 
          >
            Definitions
          </button>

        <button
            onClick={() => setActiveTab("sources")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "sources"
                ? "bg-tabActiveBg text-text font-semibold"
                : "text-text hover:bg-mainBody"
            }`}
          >
            Sources
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "history"
                ? "bg-tabActiveBg text-text font-semibold"
                : "text-text hover:bg-mainBody"
            }`}
          >
            History
          </button>
      </div>

      {/* Main Body */}
      <div className= "flex-1 flex flex-col min-h-0 bg-mainBody overflow-hidden">

        {/* Conditionally render tabs */}
        {activeTab === "definitions" && (
          text === "" ? (
            <div className="text-center text-lg text-otherText mt-10 italic">Search a word to get started...</div>
          ) : ( 
          <div className= "flex flex-col flex-1 overflow-hidden ">
            <div className="relative group">
              {/* Left Arrow */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 opacity-0 rounded-full transition mt-2 group-hover:opacity-100 transition duration-200 transition-colors"
                style={{
                  color: "var(--text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--hover-icon)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                <BiChevronLeft style={{ color: "inherit" }} className="text-2xl" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 opacity-0 rounded-full transition-colors mt-2 group-hover:opacity-100 transition duration-200" 
                style={{
                  color: "var(--text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--hover-icon)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                <BiChevronRight style={{ color: "inherit" }} className="text-2xl" />
              </button>
            {/* Tabs (source switcher) */}
            <div ref={scrollRef} className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto bg-background scrollbar-horizontal"style={{ 
              scrollbarWidth: "none",
              scrollbarColor: "var(--tab-active-bg) var(--main-body)",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              }}>  
            {sourceOrder
              .filter((key) => enabledSources[key]) // Only enabled
              .map((key) => {
                const source = definitionSources[key]
                const isActive = key === activeSource

                return (
                  <div 
                    key={key} 
                    className="transition-opacity transition-transform duration-700 ease-in-out"
                    style={{
                      opacity: 1,
                      transform: "translateX(0)",
                    }}
                  >
                      <div
                        className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${
                          isActive ? "bg-mainBody" : "bg-background"
                        }`}
                      >
                        <PortalTooltip text={source.name}>
                          <button
                            onClick={() => setActiveSource(key as keyof typeof definitionSources)}
                            className={`w-full h-full flex items-center justify-center text-dataText text-md transition rounded-md ${
                              isActive ? "bg-tabActiveBg" : "bg-mainBody hover:bg-dullBox"
                            }`}
                            title={source.name}
                          >
                            {typeof source.icon === "string" ? (
                              <img
                                src={source.icon}
                                alt={`${source.name} icon`}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span className="text-lg">{source.icon}</span>
                            )}
                          </button>
                        </PortalTooltip>
                      </div>
                 
                  </div>
                )
              })}
            </div>
          </div>

            {/* Main Definition Box */}
            <div className="flex-1 rounded-b-lg px-2 pt-2 overflow-y-auto bg-mainBody" style={{scrollbarWidth: 'none'}}>
              {activeSource === "youglish" ? (
                <div className="flex flex-col justify-between h-full p-4 text-dataText">
                  {/* Header */}
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-lg font-semibold mb-2">YouGlish Pronunciation</h2>
                    <p className="text-sm text-otherText mb-4 max-w-sm">
                      Hear real-world examples of how <strong>{text}</strong> is pronounced in English.
                    </p>
                    <a
                      href={`https://youglish.com/pronounce/${encodeURIComponent(text)}/english`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm transition"
                    >
                      🔊 Open in YouGlish
                    </a>
                  </div>

                  {/* License and Attribution */}
                  {definitionSources[activeSource]?.license && (
                    <div className="mt-6 flex justify-end">
                      <div className="text-[10px] text-right text-otherText leading-snug max-w-xs">
                        <p className="mb-0">{definitionSources[activeSource].license.attribution}</p>
                        <a
                          href={definitionSources[activeSource].license.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-dataText"
                        >
                          {definitionSources[activeSource].license.name}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
              <div className="flex-1 flex-col overflow-y-auto space-y-2 rounded-b-lg p-2">
                  {/* Word and Phonetic Text */}
                  <div className="flex items-center justify-between">

                  {/* Left side  */}
                  <div className="flex items-center flex-1">
                    <h2 className="font-semibold text-dataText text-lg mr-2">{text}</h2>
                    {definitions[activeSource]?.phoneticText?.trim() && (
                      <h2 className="text-sm text-otherText mr-2">
                        {definitions[activeSource].phoneticText}
                      </h2>
                    )}

                    <PortalTooltip text="Synthesizer">
                      <button
                        title="Play Pronunciation"
                        className="mr-2 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(text);
                          utterance.lang = "en-US"; // Set language (optional)
                          window.speechSynthesis.speak(utterance);
                        }}
                      >
                        <IoVolumeMediumSharp size={22} />
                      </button>
                    </PortalTooltip>
                    
                    { Boolean(definitions['freedictionaryapi']?.pronunciationAudio) && (
                      <PortalTooltip text="FreeDictionaryAPI Audio">
                        <button
                          title="Free Dictionary API Audio"
                          className="rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                          onClick={() => {
                            const audioUrl = definitions['freedictionaryapi']?.pronunciationAudio

                            const audio = new Audio(audioUrl)
                            audio.play().catch((err) => console.warn("Audio failed to play", err))
                          }}
                          >
                            <IoVolumeMediumSharp size={22} />
                        </button>
                      </PortalTooltip>
                    )}
                    
                  </div>

                  {/* Manual Save Button (Right side)  */}
                  {!autoAddToHistory && (
                    <button onClick={() => toggleSave(text, definitions)} className="mr-3">
                      {isSaved(text) ? (
                        <GoHeartFill size={20} className="text-pink-400" />
                      ) : (
                        <GoHeart size={20} className="text-otherText hover:text-pink-400" />
                      )}
                    </button>
                  )}
              </div>

                <p className="text-xs text-otherText">Definition for:</p>

                 {/* Definitions */}
                 <div className="space-y-3">
                  {definitions[activeSource]?.definition
                      ?.split("\n")
                      .filter(line => line.trim() !== "")
                      .map((line, idx, arr) => (
                        <div
                          key={idx}
                          className={`pb-3 ${
                            idx === arr.length - 1 && (activeSource === "duckduckgo" || !hasAvailableExtras) ? "" : "border-b border-gray-600"
                          }`}
                        >
                          <p className="text-sm text-dataText italic">{line}</p>
                        </div>
                      )) ?? (
                        <p className="text-sm text-dataText italic">Loading...</p>
                      )}
                </div>
                
                
                {activeSource !== "duckduckgo" && hasAvailableExtras && (  
                  <>
                    <button
                      onClick={() => {
                        handleSynonymAntonyms()
                        if (!showExtras) {
                          setTimeout(() => {
                            document.getElementById("extras-bottom-anchor")?.scrollIntoView({ behavior: "smooth" })
                          }, 50)
                        }
                      }}
                      className={`mt-3 px-3 py-1 rounded-lg text-sm font-medium transition
                        ${showExtras
                          ? "bg-dullBox text-red-500 hover:bg-red-600 hover:text-white"
                          : "bg-tabActiveBg text-blue-500 hover:bg-blue-600 hover:text-white"}
                      `}
                    >
                      {showExtras ? "Hide Synonyms & Antonyms" : "Show Synonyms & Antonyms"}
                    </button> 

                    {showExtras && (
                      <div>
                        <div className="flex flex-col mt-4 space-y-4">
                          {definitions[activeSource]?.synonyms?.length > 0 && (
                            <div>
                              <strong className="block text-xs text-dataText mb-2">Synonyms:</strong>
                              <div className="flex flex-wrap gap-2">
                                {definitions[activeSource].synonyms.map((syn, i) => (
                                  <span
                                    key={`syn-${i}`}
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: "#DBEAFE",
                                      color: "#1E40AF"
                                    }}
                                  >
                                    {syn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {definitions[activeSource]?.antonyms?.length > 0 && (
                            <div>
                              <strong className="block text-xs text-dataText mb-2">Antonyms:</strong>
                              <div className="flex flex-wrap gap-2">
                                {definitions[activeSource].antonyms.map((ant, i) => (
                                  <span
                                    key={`ant-${i}`}
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: "#FECACA",
                                      color: "#B91C1C"
                                    }}
                                  >
                                    {ant}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div id="extras-bottom-anchor" className="h-1" />
                      </div>
                    )}
                  </>
                )}

                {/* More Info Button Aligned Bottom Left */}
                {definitionSources[activeSource]?.getMoreInfoUrl && (
                  <div className="flex justify-end self-start">
                    <a
                      href={definitionSources[activeSource].getMoreInfoUrl(text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1 bg-tabActiveBg text-dataText text-lg rounded-2xl hover:bg-dullBox transition"
                    >
                      {typeof definitionSources[activeSource].icon === "string" ? (
                        <img
                          src={definitionSources[activeSource].icon}
                          alt={`${definitionSources[activeSource].name} icon`}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <span className="text-lg">{definitionSources[activeSource].icon}</span>
                      )}
                      More Info
                    </a>
                  </div>
                )}

                {/* License and Attribution */}
                {definitionSources[activeSource]?.license && (
                  <div className="mt-3 flex justify-end">
                    <div className="text-[8px] text-right text-otherText leading-snug max-w-xs">
                      <p className="mb-0">
                        {definitionSources[activeSource].license.attribution}
                      </p>
                      <a
                        href={definitionSources[activeSource].license.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-dataText"
                      >
                        {definitionSources[activeSource].license.name}
                      </a>
                    </div>
                  </div>
                )}

                
              </div>)}


            </div> {/* Main definition box  */}
          </div>
        ))}


        {/* Sources Content  */}
        {activeTab === "sources" && 
          <div className="flex flex-1 flex-col overflow-hidden">
            <SourcesTab/>
          </div>
        
        }


        {/* History content */}
        {activeTab === "history" && 
          <div className="flex-1 mt-2 rounded-lg p-2 overflow-y-auto" style={{
            scrollbarColor: "var(--tab-active-bg) var(--main-body)", // thumb, track (Firefox)
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch" // enables momentum + bounce on iOS
          }}>

            {/* Title  */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <IoTimeOutline className="text-text" /> Recent Dictionary Lookups
              </h2>

              <div className="flex flex-col gap-2 mr-6">
                {/* Upgrade to Premium Button or Export Button  */}
                {!isPro && (!exportCount || exportCount <= 0) ? (
                    <button
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-mainBody rounded text-text hover:bg-dullBox"
                    title="Upgrade to Pro to unlock exports"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    <FaCrown size={16} />
                    <span className="text-sm">{loading ? "Redirecting..." : "Upgrade"}</span>
                    
                    {/* Show Export Count  */}
                    <span
                      className="ml-1 rounded-full px-1 py-1 text-[10px] leading-none"
                      title={isPro ? "Unlimited exports" : `${Math.max(0, exportCount ?? 0)} of 3 remaining`}
                    >
                      {isPro ? "∞" : `${Math.max(0, exportCount ?? 0)}/3`}
                    </span>
                  </button>
                ) : (
                  <button
                  id="export-history-button"
                  disabled={history.length === 0}
                  className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-text ${
                    history.length === 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-mainBody hover:bg-dullBox"
                  }`}
                  title="Export History"
                  onClick={() => {
                    setShowExportModal(true);
                  }}
                >
                  <HiOutlineArrowDownTray size={16} />
                  <span className="text-sm">Export</span>

                  {/* Show Export Count  */}
                  <span
                    className="ml-1 rounded-full px-1 py-1 text-[10px] leading-none"
                    title={isPro ? "Unlimited exports" : `${Math.max(0, exportCount ?? 0)} of 3 remaining`}
                  >
                    {isPro ? "∞" : `${Math.max(0, exportCount ?? 0)}/3`}
                  </span>
                </button>
                )}

                {/* Clear All Button */}
                <button
                  className="flex items-center justify-center gap-1 px-2 py-1 bg-mainBody rounded text-text hover:bg-dullBox"
                  title="Clear All History"
                  onClick={clearHistory}
                >
                  <HiOutlineTrash size={16} />
                  <span className="text-sm">Clear</span>
                </button>
              </div>
            </div>

            {/* Divider between title and words  */}
            <div className="divide-y divide-dullBox">
              {history.map((entry) => {
                const isOpen = expandedWord === entry.word
                const timestamp = new Date(entry.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })

                return(
                <div key={entry.word} className="py-3 mx-2">
                  <div className="flex justify-between items-center cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      {/* Left side: the word */}
                        <span className="text-base text-dataText mr-2">{entry.word}</span>

                      {/* Right side: time, link, etc */}
                      <div className="flex flex-col items-end text-xs text-otherText space-y-2">
                        <span className="text-xs text-otherText">{timestamp}</span>
                        {entry.pageUrl && (
                        <a
                          href={entry.pageUrl}
                          className="text-xs text-blue-400 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {new URL(entry.pageUrl).hostname}
                        </a>
                        )}
                      </div>
                    </div>

                    {/* Dropdown button  */}
                    <button
                      className="text-xl mx-2 transition-colors"
                      style={{
                        color: "var(--text)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--hover-icon)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text)";
                      }}
                      onClick={() => toggleExpanded(entry.word)}
                    >
                      {isOpen ? (
                        <IoMdArrowDropup style={{ color: "inherit" }} size={24} />
                      ) : (
                        <IoMdArrowDropdown style={{ color: "inherit" }} size={24} />
                      )}
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => deleteWord(entry.word)}
                      title="Delete this word"
                      className="text-otherText hover:text-red-600 transition"
                    >
                      {hoverTrash ? <IoTrashSharp size={16}/> : <IoTrashOutline size={16} />}
                    </button>

                  </div>

                  {isOpen && (
                    <div className="bg-mainBody rounded-lg">
                      <MiniDefinitionView word={entry.word}/>
                    </div>
                  )}
                </div>
                )
            })}
            </div>
          </div>
          }
        
        

      </div>
    </div>
      )}

    {showExportModal && (
      <div className="fixed inset-0 z-[100000] bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-background text-text rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm max-h-[80vh] p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Export History</h3>
            <button
              className="text-text hover:text-red-400"
              onClick={() => {
                setShowExportModal(false)
                setIncludeAllWords(false)
              }}
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            {/* File Type */}
            <div className="flex items-center justify-between">
              <span>File Type</span>
              <select
                className="bg-mainBody text-text rounded px-2 py-1"
                value={exportFileType}
                onChange={(e) => setExportFileType(e.target.value as "tsv" | "csv" | "json")}
              >
                <option value="tsv">TSV (.tsv)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="json">JSON (.json)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between">
              <span>Export Source</span>
              <select
                className="bg-mainBody text-text rounded px-2 py-1"
                value={exportSource}
                onChange={(e) => setExportSource(e.target.value)}
              >
                {Object.keys(enabledSources)
                .filter((source) => definitionSources[source]?.exportable)
                .map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            {/* Include All Words or Selected */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allWords"
                checked={includeAllWords}
                onChange={(e) => setIncludeAllWords(e.target.checked)}
              />
              <label htmlFor="allWords">Include All Words</label>
            </div>

            {/* Word Selection (if Include All is false) */}
            {!includeAllWords && (
              <div className="bg-mainBody rounded p-3">
                <p className="font-medium mb-2">Select Words to Export</p>
                <div className="max-h-48 overflow-y-auto space-y-1" style={{
                    scrollbarColor: "var(--tab-active-bg) var(--main-body)",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch"
                  }}>
                  {history.map(({ word }) => (
                    <div key={word} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`word-${word}`}
                        checked={selectedWords.includes(word)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWords((prev) => [...prev, word]);
                          } else {
                            setSelectedWords((prev) => prev.filter((w) => w !== word));
                          }
                        }}
                      />
                      <label htmlFor={`word-${word}`} className="truncate">
                        {word}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Modal Actions */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              className="px-3 py-1 bg-mainBody rounded hover:bg-dullBox"
              onClick={() => {
                setShowExportModal(false)
                setIncludeAllWords(false)
              }}
            >
              Cancel
            </button>
            <button
              className={`px-3 py-1 rounded ${
                (!includeAllWords && selectedWords.length === 0)
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={!includeAllWords && selectedWords.length === 0}
              title={!includeAllWords && selectedWords.length === 0 ? "Select at least one word" : ""}
              onClick={async () => {
                const { exportCount } = await chrome.storage.local.get("exportCount")
                if ((!exportCount || exportCount <= 0) && !isPro) {
                  alert("You've reached your free export limit!")
                  return
                }

                handleExport()
              
                // Decrement and save new value
                await chrome.storage.local.set({ exportCount: exportCount - 1 })
              }}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Show the custom theme modal conditionally */}
    <ModalContainer isOpen={showCustomModal} onClose={() => setShowCustomModal(false)}>
        <div className="bg-mainBody rounded-2xl shadow-2xl shadow-black/50 w-72 max-h-[80vh] overflow-y-auto p-4 relative"
           style={{
             scrollbarColor: "var(--tab-active-bg) var(--main-body)",
             overscrollBehavior: "contain",
             WebkitOverflowScrolling: "touch"
           }}>
        
        <div className= "flex justify-between items-center mb-4">
          {/* Modal Header */}
          <h3 className="text-lg font-semibold text-text">Customize Theme</h3>

          {/* Close Button */}
          <button
            onClick={() => {
              setShowCustomModal(false);
              setIsEditingMode(false);
              setEditingTheme(null);
              setCustomThemeName("");
              setCustomTheme({
                background: "#01122B",
                text: "#BBE1FA",
                mainBody: "#072141",
                dullBox: "#1c2f47",
                hoverIcon: "#FFFFFF",
                hoverSquare: "#1c2f47",
                dataText: "#FFFFFF",
                otherText: "#9CA3AF",
                border: "#374151",
                tabActiveBg: '#2A4E75',
                aiChatBubble: '#2563EB',
                userChatBubble: '#3B82F6',
              });
            }}
            className="text-xl text-text hover:text-red-400"
            title="Close Custom Theme"
          >
            <HiOutlineXMark size={20} />
          </button>

        </div>

        {/* Custom Theme Name */}
        <label htmlFor="themeName" className="block text-sm font-medium mb-1 text-text">
          Theme Name
        </label>
        <input
          id="themeName"
          type="text"
          className="w-full px-3 py-1 mb-4 rounded bg-mainBody text-text border border-border focus:outline-none focus:ring-2 focus:ring-text"
          placeholder="My Custom Theme"
          value={customThemeName}
          onChange={(e) => setCustomThemeName(e.target.value)}
        />

        {/* Color Selection Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-text">Colors</h4>
          <div className="max-h-48 overflow-y-auto" style={{
            scrollbarColor: "var(--tab-active-bg) var(--main-body)",
            overscrollBehavior: "auto"
          }}>
            {/* Compact Color Grid */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(customTheme).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center">
                  <p className="capitalize text-xs mb-1 text-dataText w-full text-center whitespace-nowrap overflow-hidden text-ellipsis" title={key}>{key}</p>
                  <div className="relative">
                    <button
                      className="w-7 h-7 rounded-full border border-border relative hover:scale-110 transition-transform"
                      style={{ backgroundColor: value }}
                      onClick={() => setActiveColor(activeColor === key ? null : key)}
                      onMouseLeave={() => setHoveredColor(null)}
                      onMouseEnter={() => setHoveredColor(key)}
                    />
                    {/* Hex Tooltip */}
                    {hoveredColor === key && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background text-dataText text-xs px-1 py-0.5 rounded whitespace-nowrap z-10">
                        {value.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      

        {/* Compact Color Picker */}
        {activeColor && (
          <div className="mb-4 p-3 bg-dullBox rounded border">
            <p className="text-sm font-medium mb-2 text-text capitalize">Editing: {activeColor}</p>
            <HexColorPicker
              color={customTheme[activeColor]}
              onChange={(color) =>
                setCustomTheme((prev) => ({ ...prev, [activeColor]: color }))
              }
              style={{ width: "100%", height: "120px" }}
            />
            <div className="flex justify-between items-center mt-2">
              <input
                type="text"
                value={customTheme[activeColor]}
                onChange={(e) => {
                  const color = e.target.value;
                  // Allow any input, but only update if it's a valid hex color
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(color) || color === "#") {
                    setCustomTheme((prev) => ({ ...prev, [activeColor]: color }));
                  }
                }}
                onBlur={(e) => {
                  const color = e.target.value;
                  // On blur, validate and fix the hex color if needed
                  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
                    // If invalid, revert to previous valid color
                    const currentColor = customTheme[activeColor];
                    if (!/^#[0-9A-Fa-f]{6}$/.test(currentColor)) {
                      setCustomTheme((prev) => ({ ...prev, [activeColor]: "#000000" }));
                    }
                  }
                }}
                className="px-2 py-1 text-xs bg-mainBody text-text border border-border rounded flex-1 mr-2"
                placeholder="#000000"
                maxLength={7}
              />
              <button
                className="px-2 py-1 text-xs bg-tabActiveBg text-dataText rounded hover:bg-dullBox transition-colors duration-200"
                onClick={() => setActiveColor(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 bg-tabActiveBg text-dataText hover:bg-dullBox transition rounded"
            onClick={() => {
              setShowCustomModal(false);
              setIsEditingMode(false);
              setEditingTheme(null);
              setCustomThemeName("");
              setCustomTheme({
                background: "#01122B",
                text: "#BBE1FA",
                mainBody: "#072141",
                dullBox: "#1c2f47",
                hoverIcon: "#FFFFFF",
                hoverSquare: "#1c2f47",
                dataText: "#FFFFFF",
                otherText: "#9CA3AF",
                border: "#374151",
                tabActiveBg: '#2A4E75',
                aiChatBubble: '#2563EB',
                userChatBubble: '#3B82F6',
              });
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={() => {
              if (isEditingMode && editingTheme !== null) {
                // Update existing theme
                const updatedThemes = [...themes];
                updatedThemes[editingTheme] = {
                  ...updatedThemes[editingTheme],
                  name: customThemeName || updatedThemes[editingTheme].name,
                  colors: Object.values(customTheme),
                };
                setThemes(updatedThemes);
                
                // Save only custom themes to storage
                const customThemes = updatedThemes.filter(t => t.className.startsWith("custom-theme-"));
                chrome.storage.local.set({ customThemes });
                
                // Apply the updated theme if it's currently active
                if (appliedTheme === updatedThemes[editingTheme].className) {
                  // Force re-injection of themes to update CSS
                  setTimeout(() => {
                    injectSavedThemes(setThemes, setAppliedTheme);
                    applyTheme(updatedThemes[editingTheme].className);
                  }, 100);
                }
              } else {
                // Create new theme
                const customThemeCount = themes.filter(t => t.className.startsWith("custom-theme-")).length;
                const newTheme = {
                  name: customThemeName || `Custom Theme ${customThemeCount + 1}`,
                  className: `custom-theme-${customThemeCount + 1}`,
                  colors: Object.values(customTheme),
                };

                // Add to theme slider
                setThemes((prev) => [...prev, newTheme]);
                saveCustomTheme(customThemeName, customTheme);
                // Force re-injection of themes to update CSS
                setTimeout(() => {
                  injectSavedThemes(setThemes, setAppliedTheme);
                }, 100);
              }
              
              // Reset modal state
              setShowCustomModal(false);
              setIsEditingMode(false);
              setEditingTheme(null);
              setCustomThemeName("");
              setCustomTheme({
                background: "#01122B",
                text: "#BBE1FA",
                mainBody: "#072141",
                dullBox: "#1c2f47",
                hoverIcon: "#FFFFFF",
                hoverSquare: "#1c2f47",
                dataText: "#FFFFFF",
                otherText: "#9CA3AF",
                border: "#374151",
                tabActiveBg: '#2A4E75',
                aiChatBubble: '#2563EB',
                userChatBubble: '#3B82F6',
              });
            }}
          >
            {isEditingMode ? "Update Theme" : "Save & Apply"}
          </button>
        </div>
      </div>
    </ModalContainer>
    

    {/* Tutorial is now handled by content script */}
       
    {/* Donate Modal */}
    <ModalContainer isOpen={showDonate} onClose={() => setShowDonate(false)}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100000]">
        <div className="bg-mainBody p-4 rounded-2xl shadow-2xl shadow-black/50">
          {/* Header */}
          <h2 className="text-xl font-bold mb-3 text-text">❤️ Support the Developer</h2>
          <p className="text-sm mb-4 text-otherText">
            Support this extension’s growth! Every crypto donation helps fund new features, bug fixes, and ongoing improvements.
          </p>

          {/* Donation Addresses */}
          <div className="space-y-3">
            {[
              { 
                name: "Bitcoin", 
                symbol: "BTC", 
                icon: <FaBitcoin size={20} className="text-yellow-400" />, 
                address: "1PQEEsLfYr2cyLz1K7TyDedXeqy1xxhCJ6" 
              },
              { 
                name: "Ethereum", 
                symbol: "ETH", 
                icon: <FaEthereum size={20} className="text-purple-400" />, 
                address: "0xd47FC586Bd8843a6c44FB112c844A5ac83909C52" 
              },
              { 
                name: "Solana", 
                symbol: "SOL", 
                icon: <SiSolana size={20} className="text-green-400" />, 
                address: "HqKfNYdtuw3f8PScJpaKQR3CgC4DrWHeGfzEMQacWGaL" 
              }
            ].map((coin) => (
              <div key={coin.symbol} className="flex items-center space-x-3 bg-dullBox rounded-lg p-3">
                {/* Crypto Icon */}
                <Tooltip text={coin.name}>
                  <div className="text-xl cursor-pointer">
                    {coin.icon}
                  </div>
                </Tooltip>

                {/* Address Text Box */}
                <input
                  type="text"
                  readOnly
                  value={coin.address}
                  className="flex-1 px-2 py-1 bg-mainBody rounded text-sm text-text cursor-default"
                />

                {/* Copy Button */}
                <div className="relative">
                  <Tooltip text="Copy">
                    <button
                      onClick={() => handleCopy(coin.address)}
                      className="p-2 rounded-lg bg-tabActiveBg text-white hover:bg-dullBox transition"
                    >
                      {copiedMap?.[coin.address] ? (
                        <FaCheck size={16} className="text-green-400" />
                      ) : (
                        <FaRegCopy size={16} />
                      )}
                    </button>
                  </Tooltip>

                  {/* Tooltip */}
                  {copiedMap[coin.address] && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-mainBody text-text text-xs px-2 py-1 rounded shadow">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowDonate(false)}
            className="mt-5 w-full px-4 py-2 rounded-lg bg-tabActiveBg text-dataText hover:bg-dullBox transition"
          >
            Close
          </button>
        </div>
      </div>
    </ModalContainer>
    


    </div>
  )
}

export default IndexPopup


