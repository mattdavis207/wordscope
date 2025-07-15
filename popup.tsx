import { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom";
import { IoClose, IoSearch, IoSettings, IoVolumeMediumSharp, IoSettingsOutline, IoTimeOutline, IoTrashSharp, IoTrashOutline, IoColorPaletteSharp } from "react-icons/io5"
import { HiOutlineClock, HiOutlineEyeDropper, HiOutlineChatBubbleBottomCenterText, HiOutlineDocumentArrowDown, HiOutlineSparkles, HiOutlineArrowDownTray, HiOutlineXMark, 
         HiOutlineTrash, HiOutlineCheck, HiOutlinePlus} from "react-icons/hi2"
import { FaRegPlusSquare, FaChevronLeft, FaChevronRight, FaEthereum, FaBitcoin,
  FaBookOpen, FaStar, FaTwitter, FaRedditAlien, FaHeart, FaRegCopy, FaCheck} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai"
import { IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";
import { GoHeart, GoHeartFill } from "react-icons/go"
import { SiSolana } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx"
import { HexColorPicker } from "react-colorful";
import "~/styles/tailwind.css"
import "./styles/globals.css";


import { useBubbleSize } from "~hooks/useBubbleSize";
import { useHistory } from "~hooks/useHistory"
import { useDictionary } from "~/hooks/useDictionary"
import { useTriggerSettings } from "~hooks/useTriggerSettings";
import { useSourceSettings } from "~hooks/useSourceSettings";
import { MiniDefinitionView } from "~views/tabDefinitionView"
import ContextAIView from "./views/contextAIView"
import { SourcesTab } from "./views/sourcesView"
import { extractContext } from "./context/contextExtractor"
import { TutorialModal } from "./components/TutorialModal"
import { Tooltip } from "~components/Tooltip";
import { useClickOutside } from "~hooks/useClickOutside";

// Source imports
import { definitionSources } from "~sources/definitionSources"

declare global {
  interface Window {
    overscroll: any
  }
}

const HISTORY_KEY = "history"

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
  const [hoverTrash, setHoverTrash] = useState(false)
  const [showSettings, setShowSettings] = useState(false);
  const [showContextAI, setShowContextAI] = useState(false)

  const { bubbleSize, updateBubbleSize } = useBubbleSize();

  // Export flags and state variables
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileType, setExportFileType] = useState<"tsv" | "csv" | "json">("tsv");
  const [exportSource, setExportSource] = useState(defaultExportSource || "");
  const [includeAllWords, setIncludeAllWords] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);


  // Theme states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [appliedTheme, setAppliedTheme] = useState("theme-dark");
  const [activeColor, setActiveColor] = useState<string | null>(null); // For color selection in modal
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [customThemeName, setCustomThemeName] = useState("");
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
    userChatBubble: '#374151',
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
      colors: ["#FFFFFF", "#1F2937", "#F3F4F6", "#E5E7EB", "#1F2937"],
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
  ]);


  //Info Box Stuff
  const [infoOpen, setInfoOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showDonate, setShowDonate] = useState(false)
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})

  // Modal Outside Clicks
  const infoRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const customRef = useRef<HTMLDivElement>(null)
  const tutorialRef = useRef<HTMLDivElement>(null)
  const donateRef = useRef<HTMLDivElement>(null)

  useClickOutside(infoRef, () => setInfoOpen(false), infoOpen)
  useClickOutside(exportRef, () => setShowExportModal(false), showExportModal)
  useClickOutside(customRef, () => setShowCustomModal(false), showCustomModal)
  useClickOutside(tutorialRef, () => setShowTutorial(false), showTutorial)
  useClickOutside(donateRef, () => setShowDonate(false), showDonate)
  

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
      const newTheme = {
        name: themeName || `Custom Theme ${Date.now()}`,
        className: `custom-theme-${Date.now()}`,
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
          <div className="bg-[#3282B8] text-[#000a1b] font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2">
            W
          </div>
          <span className="text-text text-base font-medium lowercase">wordscope</span>
        </div>
        <div className="flex space-x-2">
          {/* Context AI Button */}
          <button
            title="Context AI (Pro)"
            className="text-sm transition-colors"
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
            <span className="hidden lg:inline text-sm font-medium ml-1">Context AI</span>
          </button>

          <div className="relative">
            {/* Info Button */}
            <button
              onClick={() => setInfoOpen(!infoOpen)}
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
            {infoOpen && (
              <div ref={infoRef} className="absolute right-0 mt-2 w-52 bg-mainBody rounded-2xl shadow-2xl shadow-black/50 p-2 space-y-2">
                {/* Tutorial */}
                <button
                  className="w-full flex items-center space-x-2 text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                  onClick={() => setShowTutorial(true)}
                >
                  <FaBookOpen size={16} className="text-blue-400" />
                  <span>Tutorial</span>
                </button>
                {/* Reddit */}
                <a
                  href="https://reddit.com/r/yourSubreddit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaRedditAlien size={16} className="text-orange-400" />
                  <span>Reddit</span>
                </a>
                {/* Twitter */}
                <a
                  href="https://twitter.com/yourhandle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full text-left hover:bg-dullBox p-2 rounded-lg text-dataText"
                >
                  <FaTwitter size={16} className="text-sky-400" />
                  <span>Twitter</span>
                </a>
                {/* Donate */}
                <button
                  onClick={() => setShowDonate(true)}
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
            )}
          </div>


          {/* Settings Button  */}
          <button
            className="text-sm transition-colors"
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
            className="text-sm transition-colors"
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
                    <button
                      onClick={() => deleteTheme(currentTheme)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete custom theme"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
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
                  onClick={() => setShowCustomModal(true)}
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
                    onChange={(e) =>
                      updateBubbleSize({
                        ...bubbleSize,
                        width: parseInt(e.target.value)
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-otherText">Height</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-background border border-gray-600 rounded text-dataText outline-none"
                    value={bubbleSize.height}
                    onChange={(e) =>
                      updateBubbleSize({
                        ...bubbleSize,
                        width: parseInt(e.target.value)
                      })
                    }
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
              {Object.keys(definitionSources).map((key) => (
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
              <option value="modifierClick">Command/Alt + click</option>
              <option value="keyCombo">Custom key combo</option>
            </select>

            {/* Modifier Combo Options */}
            {triggerMethod === "modifierClick" && (
              <div className="flex gap-2 mt-3">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    modifierCombo === "altClick"
                      ? "bg-[#2A4E75] text-dataText"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setModifierCombo("altClick")}
                >
                  Alt + Click
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    modifierCombo === "cmdClick"
                      ? "bg-[#2A4E75] text-dataText"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setModifierCombo("cmdClick")}
                >
                  Cmd + Click
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
                        className="bg-[#2A4E75] text-dataText px-2 py-1 rounded-md text-xs font-semibold"
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

            {/* Tabs (source switcher) */}
            <div className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto bg-background" style={{scrollbarWidth: 'none'}}>
            {sourceOrder
              .filter((key) => enabledSources[key]) // Only enabled
              .map((key) => {
                const source = definitionSources[key]
                const isActive = key === activeSource

                return (
                  <div key={key}>
                    <div
                      className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${
                        isActive ? "bg-mainBody" : "bg-background"
                      }`}
                    >
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
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Main Definition Box */}
            <div className="flex-1 rounded-b-lg p-2 overflow-y-auto bg-mainBody" style={{scrollbarWidth: 'none'}}>
              {activeSource === "youglish" ? (
                  <div className="flex flex-col items-center h-full text-dataText">
                      <h2 className="text-lg font-semibold mb-4">YouGlish Pronunciation</h2>
                      
                      <p className="text-sm text-otherText mb-2 text-center">
                      Click the button below to hear real-world examples of how <strong>{text}</strong> is pronounced in English.
                      </p>
                      
                      <a
                      href={`https://youglish.com/pronounce/${encodeURIComponent(text)}/english`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-dataText font-medium py-2 px-4 rounded transition"
                      >
                      🔊 Open YouGlish
                      </a>
                  </div>
              ): (
              <div className="flex-1 flex-col overflow-y-auto space-y-2 rounded-b-lg p-2">
                {/* Word and Phonetic Text */}
                <div className="flex items-center justify-between">

                  {/* Left side  */}
                  <div className="flex items-center flex-1">
                    <h2 className="font-semibold text-dataText text-lg">{text}</h2>
                    <h2 className="text-sm text-otherText">{definitions[activeSource]?.phoneticText}</h2>
                    <button
                      title="Play Pronunciation"
                      className="ml-2 mb-1 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                      onClick={() => {
                        const rawUrl = definitions[activeSource]?.pronunciationAudio
                        const audioUrl = rawUrl?.startsWith("//") ? "https:" + rawUrl : rawUrl
                        if (audioUrl) {
                          const audio = new Audio(audioUrl)
                          audio.play().catch((err) => console.warn("Audio failed to play", err))
                        }
                      }}
                    >
                      <IoVolumeMediumSharp size={20} />
                    </button>

                    <button
                      title="Lingua Robot Audio"
                      className="ml-1 mb-1 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                      onClick={() => {
                        const audioUrl = definitions['linguarobotapi']?.pronunciationAudio

                        const audio = new Audio(audioUrl)
                        audio.play().catch((err) => console.warn("Audio failed to play", err))
                      }}
                    >
                      <IoVolumeMediumSharp size={20} />
                    </button>
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
                      .map((line, idx, arr) => (
                        <div
                          key={idx}
                          className={`pb-3 ${
                            idx === arr.length - 1 && activeSource === "duckduckgo" ? "" : "border-b border-gray-600"
                          }`}
                        >
                          <p className="text-sm text-dataText italic">{line}</p>
                        </div>
                      )) ?? (
                        <p className="text-sm text-dataText italic">Loading...</p>
                      )}
                </div>

                {activeSource !== "duckduckgo" && (
                  <>
                    <p className="whitespace-pre-wrap text-sm italic text-blue-500" onClick={handleSynonymAntonyms}>
                    Show Synonyms and Antonyms
                    </p>

                    {showExtras && (
                      <>
                        {definitions[activeSource]?.synonyms?.length > 0 && (
                          <div className="mt-2">
                            <strong className="block text-xs text-dataText mb-1">Synonyms:</strong>
                            <div className="flex flex-wrap gap-1">
                              {definitions[activeSource].synonyms.map((syn, i) => (
                                <span key={`syn-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {syn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {definitions[activeSource]?.antonyms?.length > 0 && (
                          <div className="mt-2">
                            <strong className="block text-xs text-dataText mb-1">Antonyms:</strong>
                            <div className="flex flex-wrap gap-1">
                              {definitions[activeSource].antonyms.map((ant, i) => (
                                <span key={`ant-${i}`} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  {ant}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
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
                {/* Export Button */}
                <button
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
                </button>

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
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpanded(entry.word)}>
                    <div className="flex items-center justify-between w-full">
                      {/* Left side: the word */}
                        <span className="text-base text-dataText">{entry.word}</span>

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
      <div ref={exportRef} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-background text-text rounded-lg shadow-lg w-96 p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Export History</h3>
            <button
              className="text-text hover:text-red-400"
              onClick={() => {
                setShowExportModal(false)
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
                {Object.keys(enabledSources).map((source) => (
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
                <div className="max-h-48 overflow-y-auto space-y-1">
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
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Show the custom theme modal conditionally */}
    {showCustomModal &&
      ReactDOM.createPortal(
        <div 
          ref={customRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto" 
          style={{
          scrollbarColor: "var(--tab-active-bg) var(--main-body)", // thumb, track (Firefox)
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch" // enables momentum + bounce on iOS
        }}>
          <div className="bg-background text-text rounded-lg shadow-lg w-[500px] p-6 relative">

            {/* Modal Header */}
            <div className="flex justify-between items-center my-4">
              <h3 className="text-lg font-semibold">Customize Theme</h3>
              <button
                className="text-text hover:text-red-400"
                onClick={() => setShowCustomModal(false)}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Custom Theme Name  */}
            <label htmlFor="themeName" className="block text-sm font-medium mb-1">
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

            {/* Palette Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
              {Object.entries(customTheme).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col items-center relative"
                >
                  <p className="capitalize text-sm mb-1">{key}</p>

                  {/* Color Circle with Hex Tooltip */}
                  <div className="relative">
                    <button
                      className="w-9 h-9 rounded-full border border-border relative"
                      style={{ backgroundColor: value }}
                      onClick={() => setActiveColor(activeColor === key ? null : key)}
                      onMouseLeave={() => setHoveredColor(null)}
                      onMouseEnter={() => setHoveredColor(key)}
                    />
                    
                    {/* Hex Tooltip */}
                    {hoveredColor === key && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-mainBody text-text text-xs px-2 py-1 rounded shadow">
                        {value.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Color Picker */}
            {activeColor && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-mainBody p-3 rounded shadow-lg z-50">
                <HexColorPicker
                  color={customTheme[activeColor]}
                  onChange={(color) =>
                    setCustomTheme((prev) => ({ ...prev, [activeColor]: color }))
                  }
                  style={{ width: "250px", height: "180px" }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="px-2 py-1 text-sm bg-dullBox rounded hover:bg-hoverSquare"
                    onClick={() => setActiveColor(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-3 py-1 bg-mainBody rounded hover:bg-dullBox"
                onClick={() => setShowCustomModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                onClick={() => {
                  const newTheme = {
                    name: customThemeName || `Custom Theme ${themes.length + 1}`,
                    className: `custom-theme-${Date.now()}`,
                    colors: Object.values(customTheme),
                  };

                  // Add to theme slider
                  setThemes((prev) => [...prev, newTheme]);
                  saveCustomTheme(customThemeName, customTheme);
                  setShowCustomModal(false);
                }}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    }

    {/* Tutorial Modal  */}
    <div ref={tutorialRef}>
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} showDonate={showDonate}
        setShowDonate={setShowDonate}/>}
    </div>
    
      
    {/* Donate Modal */}
    {showDonate && (
      <div ref={donateRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-mainBody p-4 rounded-2xl shadow-2xl shadow-black/50 w-96">
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
            className="mt-5 w-full px-4 py-2 text-dataText rounded-lg bg-tabActiveBg text-dataText hover:bg-dullBox transition"
          >
            Close
          </button>
        </div>
      </div>
    )}


      
    </div>
  )
}

export default IndexPopup


