
import React, { useEffect, useState, useRef } from "react"
import { IoVolumeMediumSharp, IoTimeOutline, IoSearch, IoBook, IoSettings, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import { BiSolidDockRight } from "react-icons/bi"
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdMagnet, IoMdLock, IoMdUnlock} from "react-icons/io";
import { HiOutlineSparkles, HiOutlineTrash, HiOutlineArrowDownTray, HiOutlineXMark} from "react-icons/hi2" 
import { FaCrown } from "~node_modules/react-icons/fa";
import { BsPinAngleFill } from "react-icons/bs";
import { GoHeart, GoHeartFill } from "react-icons/go"
import { BiChevronRight, BiChevronLeft } from "~node_modules/react-icons/bi";

import { createRoot } from "react-dom/client"

import "./assets/styles/tailwind-content.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "./hooks/injectThemes";
import type { Theme } from "./hooks/injectThemes"

//Dependency imports
import { definitionSources } from "./sources/definitionSources"
import { useDictionary } from "./hooks/useDictionary"
import { useHistory } from "./hooks/useHistory"
import { useBubbleSize } from "./hooks/useBubbleSize";
import { useSourceSettings } from "./hooks/useSourceSettings"
import { MiniDefinitionView } from "./views/tabDefinitionView"
import ContextAIView from "./views/contextAIView"
import { extractContext } from "./context/contextExtractor"
import PortalTooltip, { hideAllTooltips } from "~components/PortalTooltip";

declare global {
  interface Window {
    overscroll: any
  }
}

const HISTORY_KEY = "history"

// Constant track right click for consistent bubble rendering
let lastRightClickPos = { x: 0, y: 0 }

document.addEventListener("contextmenu", (e) => {
  lastRightClickPos = {
    x: e.clientX,
    y: e.clientY
  }
  console.log(" updated lastRightClickPos:", lastRightClickPos)
})

chrome.storage.local.get("userEmail", (result) => console.log("Got from storage", result))

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const Bubble = () => {

  // History hook useStates
  const { saveWord, history, setHistory, deleteWord, clearHistory, isSaved, toggleSave, autoAddToHistory, exportAsTSV, exportAsCSV, exportAsJSON, exportAsPDF } = useHistory()

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

  // Settings hooks and states
  const { bubbleSize } = useBubbleSize();
  const [triggerSettings, setTriggerSettings] = useState<{
    triggerMethod: "doubleClick" | "modifierClick" | "keyCombo"
    modifierCombo?: "altClick" | "cmdClick" | "shiftClick"
    customKeyCombo?: string[]
  } | null>(null)
  
  //Track pressed keys for keycombo trigger
  const pressedKeysRef = useRef<Set<string>>(new Set())
  
  // Theme useStates
  const [themes, setThemes] = useState<Theme[]>([]);
  const [appliedTheme, setAppliedTheme] = useState<string>("");
  

  // Source Settings
  const {
    sourceOrder,
    enabledSources,
    defaultExportSource,
    updateDefaultExportSource
  } = useSourceSettings()


  // References
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const DataContainerRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<Range | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const lastSelectedWord = useRef<string>("")

  // Flags and other state hooks
  const [show, setShow] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showContextAI, setShowContextAI] = useState(false)

  const [hasAvailableExtras, setHasAvailableExtras] = useState(false);
  const [prevSource, setPrevSource] = useState(activeSource)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState("")
  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [hoverTrash, setHoverTrash] = useState(false)

  //Selection coords
  const [rectLeft, setRectLeft] = useState(0);
  const [rectRight, setRectRight] = useState(0);
  const [rectTop, setRectTop] = useState(0);
  const [rectBottom, setRectBottom] = useState(0);
  const [rectWidth, setRectWidth] = useState(0);
  const [rectHeight, setRectHeight] = useState(0);
  
  const targetRect = useRef({ // For animation
    left: 0, top: 0, right: 0, bottom: 0,
    width: 0, height: 0
  })

  // Bubble states
  const [arrowDirection, setArrowDirection] = useState<"top" | "bottom" | "left" | "right">("bottom")
  const [popupWidth, setPopupWidth] = useState<number | null>(null)
  const [popupHeight, setPopupHeight] = useState<number | null>(null)
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 }) // for animation
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 }) // word location
  const [isLocked, setIsLocked] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false)
  const [isCompactHistoryView, setIsCompactHistoryView] = useState(false)
  const isSidePanel = useRef(false);

  // Docking state
  const [isDetached, setIsDetached] = useState(false)

  // Pro flag
  const [isPro, setIsPro] = useState(false)
  const [exportCount, setExportCount] = useState<number | null>(null)

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

  const getUserEmail = (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get("userEmail", (result) => {
        resolve(result.userEmail || null)
      })
    })
  }
  // Get email from chrome.storage.local to update isPro
  useEffect( () => {
    const checkIsPro = async () => {
      const email = await getUserEmail()
      console.log("✅ email from chrome.storage.local:", email)
      if (!email) return
    
      // Send message to background.ts for fetching from isPro endpoint
      chrome.runtime.sendMessage(
        { type: "CHECK_IS_PRO", email },
        (response) => {
          if (response?.success) {
            console.log("✅ isPro status:", response.isPro)
            setIsPro(response.isPro)
          } else {
            console.error("❌ Failed to fetch isPro status")
          }
        }
      )
    }
    checkIsPro()
    
  }, [])
  

  // Get email on sign in to update isPro state
  useEffect(() => {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local") {
        if (changes.isPro) {
          console.log("changing isPro to", changes.isPro.newValue)
          setIsPro(changes.isPro.newValue)
        }
        if (changes.exportCount) {
          setExportCount(changes.exportCount.newValue)
        }
      }
    }
  
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])
  
  

  const handleUpgrade = async () => {
    const email = await getUserEmail()
    console.log("✅ email from chrome.storage.local:", email)
    
    // Direct user to sign in if no email
    if (!email){
      chrome.runtime.sendMessage({ type: "OPEN_POPUP" })
      setTimeout( () => {
        chrome.runtime.sendMessage({
          type: "OPEN_SETTINGS",
          section: "account" // Or "subscription" for Manage Subscription
        })
      }, 2000)
    }
    // Start checkout session if email is in storage
    else{
      // Fetch url from background.ts 
      chrome.runtime.sendMessage(
        { type: "CREATE_CHECKOUT_SESSION", email },
        (response) => {
          if (response?.success && response.url) {
            window.open(response.url, "_blank")
          } else {
            alert("❌ Failed to create checkout session")
          }
        }
      )
    }
  }


  //useEffect for getting saved themes and injecting applied theme
  useEffect(() => {
    const loadThemes = async () => {
      await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
  }, []);
  

  // useEffect for syncing with settings
  useEffect(() => {
    if (bubbleSize.width && bubbleSize.height) {
      setPopupWidth(bubbleSize.width)
      setPopupHeight(bubbleSize.height)
    }
  }, [bubbleSize])


  useEffect(() => {
    chrome.storage.local.get("triggerSettings", (res) => {
      const settings = res.triggerSettings
      console.log("Loaded triggerSettings from storage:", settings)
      setTriggerSettings(
        settings ?? {
          triggerMethod: "doubleClick", // fallback default
        }
      )
    })
  }, [])

  // Update trigger Settings local chrome storage on change in settings (no reload required)
  useEffect(() => {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area === "local" && changes.triggerSettings) {
        setTriggerSettings(changes.triggerSettings.newValue)
      }
    }
  
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])


  // UseEffect for listening for key combos
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      pressedKeysRef.current.add(e.key)
      if (e.metaKey) pressedKeysRef.current.add("Meta")
      if (e.altKey) pressedKeysRef.current.add("Alt")
      if (e.ctrlKey) pressedKeysRef.current.add("Control")
      if (e.shiftKey) pressedKeysRef.current.add("Shift")

      // Check if we have a key combo trigger and the combo matches
      if (triggerSettings?.triggerMethod === "keyCombo" && triggerSettings.customKeyCombo) {
        const allMatch = triggerSettings.customKeyCombo.every((key) => 
          pressedKeysRef.current.has(key) || pressedKeysRef.current.has(key.toLowerCase()) || pressedKeysRef.current.has(key.toUpperCase())
        )
        console.log("All keys match:", allMatch);
        
        if (allMatch) {
          console.log("Key combo matched! Triggering bubble check");
          // Prevent default behavior if combo matches
          e.preventDefault()
          // Trigger bubble check without a mouse event
          checkAndShowBubble(undefined, undefined, undefined, true)
        }
      } else {
        // Key combo check failed - triggerMethod or customKeyCombo missing
      }
  }
  
    const upHandler = (e: KeyboardEvent) => {
      // Only delete the key that was lifted
      pressedKeysRef.current.delete(e.key)
      console.log("keys pressed after up", pressedKeysRef.current);
  
      // Also clean up modifier keys *only* if that specific key was released
      if (["Meta", "Alt", "Control", "Shift"].includes(e.key)) {
        pressedKeysRef.current.delete(e.key)
      }
    }
  
    document.addEventListener("keydown", downHandler)
    document.addEventListener("keyup", upHandler)
  
    return () => {
      document.removeEventListener("keydown", downHandler)
      document.removeEventListener("keyup", upHandler)
    }
  }, [triggerSettings])


  // Check for selection inside bubble
  function getBubbleEl(): Element | null {
    // Try light DOM first
    const el = document.getElementById("wordscope-host");
    if (el) return el;
    // If you mount in a shadow root:
    const host = document.getElementById("wordscope-host");
    return host?.shadowRoot?.getElementById("wordscope-bubble") ?? null;
  }
  
  function isContextMenuInsideBubble(): boolean {
    const bubble = getBubbleEl();
    if (!bubble) {
      return false;
    }
    // Get the element at the last right-click position
    const elementAtPos = document.elementFromPoint(lastRightClickPos.x, lastRightClickPos.y);
    if (!elementAtPos) {
      return false;
    }
    // Check if the clicked element is inside the bubble
    const isInside = bubble.contains(elementAtPos);
    
    return isInside;
  }

  function isTextVisible(): boolean {
    const range = rangeRef.current;
    if (!range) return false;

    const rect = range.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Check if the text is within the viewport bounds
    const isInViewport = (
      rect.bottom > 0 &&  // Not scrolled past top
      rect.top < vh &&    // Not scrolled past bottom
      rect.right > 0 &&   // Not scrolled past left
      rect.left < vw      // Not scrolled past right
    );

    return isInViewport;
  }

  function shouldShowArrow(): boolean {
    const range = rangeRef.current;
    const bubble = bubbleRef.current;
    if (!range || !bubble) return false;

    const textRect = range.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    // Hide arrow if bubble edge is aligned with or past the selection edge
    switch (arrowDirection) {
      case "left":
        return bubbleRect.bottom-25 >= textRect.bottom;
      case "right":
        return bubbleRect.bottom-25 >= textRect.bottom;
      default:
        return true;
    }
  }
  
  // Function for calculating bubble coords and rendering
  const checkAndShowBubble = React.useCallback((e?: MouseEvent | Event, forcedText?: string, forcedMousePos?: { x: number; y: number }, isKeyComboTrigger?: boolean) => {

    // If side panel open, send word there (only if there's actually a word)
    console.log("isSidePanel", isSidePanel)
    if (isSidePanel.current){
      const selectedText = window.getSelection()?.toString().trim();
      // Only send message if there's actually a word selected
      if (selectedText) {
        chrome.runtime.sendMessage({
          type: "word_from_bubble",
          word: selectedText,
          contextSnippet: extractContext(selectedText),
          url: window.location.href
        });
      }
      return
    }

    // If click happened inside bubble ignore, or isLocked
    if (e instanceof MouseEvent && document.getElementById("wordscope-host")?.contains(e.target as Node) || (isLocked)) {
      return
    }

    // If triggered selection inside the bubble from Contextmenu
    if ((forcedText && isContextMenuInsideBubble()) || (forcedText && isLocked)) {
      return
    }

    // 2. Apply logic based on selected trigger
    if (e instanceof MouseEvent) {
      if (!triggerSettings) return
      console.log("inside if");
    
      const { triggerMethod, modifierCombo } = triggerSettings
    
      if (triggerMethod === "doubleClick") {
        if (e.detail !== 2) return
      } else if (triggerMethod === "modifierClick") {
        const matched =
          (modifierCombo === "cmdClick" && e.metaKey) ||
          (modifierCombo === "altClick" && e.altKey) ||
          (modifierCombo === "shiftClick" && e.shiftKey)
        if (!matched) return
      } else if (triggerMethod === "keyCombo") {
        // For keyCombo, we should only get here if it's NOT a key combo trigger
        // (i.e., someone clicked while keyCombo mode is active)
        return
      } else {
        return
      }
    } else if (isKeyComboTrigger) {
      // This was called from a key combo, allow to proceed
    }

    const selection = forcedText || window.getSelection()?.toString().trim();
    if (!selection) return

    let rect

    // If a forced selection was passed from contextMenu, get selection
    if (forcedText) {
      const range = window.getSelection()
      if (range?.rangeCount) {
        rangeRef.current = range.getRangeAt(0).cloneRange()
      }
      const rects = range?.getRangeAt(0)?.getClientRects()
      rect = rects?.length ? rects[0] : range?.getRangeAt(0)?.getBoundingClientRect()
    } else {
      const range = window.getSelection()
      if (range?.rangeCount) {
        rangeRef.current = range.getRangeAt(0).cloneRange()
      }
      const rects = range?.getRangeAt(0)?.getClientRects()
      rect = rects?.length ? rects[0] : range?.getRangeAt(0)?.getBoundingClientRect()
    }

    if (!rect) return

    const selectedText = selection?.toString().trim()
    if (!selectedText) return

    // Smart position setting based on clientRects and bounding boxes
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const vw = window.innerWidth
    const vh = window.innerHeight

    console.log("Rect dimensions", rect.width, rect.height);

    console.log("Rect top and bottom", rect.top, rect.bottom);


    console.log("popupWidth", popupWidth);
    console.log("popupHeight", popupHeight);

    const offset = 12

    // Define all possible directions with their coordinates
    const candidates = [
      {
        direction: "right",
        fits: vw - rect.right >= popupWidth + offset,
        x: rect.right + scrollX + offset,
        y: rect.top + scrollY + rect.height / 2 - popupHeight / 2,
      },
      {
        direction: "bottom",
        fits: vh - rect.bottom >= popupHeight + offset,
        x: rect.left + scrollX + rect.width / 2 - popupWidth / 2,
        y: rect.bottom + scrollY + offset,
      },
      {
        direction: "left",
        fits: rect.left >= popupWidth + offset,
        x: rect.left + scrollX - popupWidth - offset,
        y: rect.top + scrollY + rect.height / 2 - popupHeight / 2,
      },
      {
        direction: "top",
        fits: rect.top >= popupHeight + offset,
        x: rect.left + scrollX + rect.width / 2 - popupWidth / 2,
        y: rect.top + scrollY - popupHeight - offset,
      },

    ]

    const bestFit = candidates.find((c) => c.fits) || candidates[0] // default to bottom
    console.log("bestfit", bestFit.direction)

    const clampedX = Math.max(scrollX, Math.min(bestFit.x, scrollX + vw - popupWidth))
    const clampedY = Math.max(scrollY, Math.min(bestFit.y, scrollY + vh - popupHeight))

    setBubblePosition({ x: clampedX, y: clampedY })
    setAnchorPosition({ x: clampedX, y: clampedY })
    

    setRectLeft(rect.left)
    setRectRight(rect.right)
    setRectTop(rect.top)
    setRectBottom(rect.bottom)
    setRectWidth(rect.width)
    setRectHeight(rect.height)

    setArrowDirection(bestFit.direction as "top" | "bottom" | "left" | "right")

    setText(selectedText)
    lastSelectedWord.current = selectedText


    // Trigger reflow for animation
    requestAnimationFrame(() => {
      setShow(true)
    })

  }, [triggerSettings, isLocked, popupWidth, popupHeight])

  // useEffect for attaching event listeners
  useEffect(() => {
    document.addEventListener("click", checkAndShowBubble);

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "PDF_SELECTION" && msg.text) {
        // Show bubble at fixed top-left (or wherever)
        checkAndShowBubble(undefined, msg.text, { x: 24, y: 24 })
      }
    })

    // 🚀 Listen for messages from background script (context menu trigger)
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "LOOKUP_WORDSCOPE" && msg.text) {
        checkAndShowBubble(undefined, msg.text, lastRightClickPos)
      }
    })

    return () => {
      document.removeEventListener("click", checkAndShowBubble)
      document.removeEventListener("selectionchange", checkAndShowBubble)
    }
  }, [checkAndShowBubble])


  // Handle Bubble Resize
  const repositionBubble = () => {
    if (!bubbleRef.current) return

    // Check if the original text is still visible
    if (!isTextVisible()) {
      // Hide the bubble by positioning it off-screen
      setTargetPosition({ x: -9999, y: -9999 })
      if (!isDetached) {
        setAnchorPosition({ x: -9999, y: -9999 })
      }
      return
    }

    const width = bubbleRef.current.offsetWidth
    const height = bubbleRef.current.offsetHeight

    setPopupWidth(width)
    setPopupHeight(height)

    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const vw = window.innerWidth
    const vh = window.innerHeight
    const offset = 12

    let rect
    const range = rangeRef.current
    if (!range) return

    const rects = range.getClientRects()
    rect = rects?.length ? rects[0] : range.getBoundingClientRect()

    // Update target rect for animation
    targetRect.current = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    }

    // Use current rect values for positioning calculations to avoid lag
    const candidates = [
      {
        direction: "bottom",
        fits: vh - rect.bottom >= height + offset,
        x: rect.left + scrollX + rect.width / 2 - width / 2,
        y: rect.bottom + scrollY + offset
      },
      {
        direction: "right",
        fits: vw - rect.right >= width + offset,
        x: rect.right + scrollX + offset,
        y: rect.top + scrollY + rect.height / 2 - height / 2
      },
      {
        direction: "left",
        fits: rect.left >= width + offset,
        x: rect.left + scrollX - width - offset,
        y: rect.top + scrollY + rect.height / 2 - height / 2
      },
      {
        direction: "top",
        fits: rect.top >= height + offset,
        x: rect.left + scrollX + rect.width / 2 - width / 2,
        y: rect.top + scrollY - height - offset
      }
    ]

    const bestFit = candidates.find((c) => c.fits) || candidates[0]

    const clampedX = Math.max(scrollX, Math.min(bestFit.x, scrollX + vw - width))
    const clampedY = Math.max(scrollY, Math.min(bestFit.y, scrollY + vh - height))

    setTargetPosition({ x: clampedX, y: clampedY })

    // Only update anchor position if docked 
    if (!isDetached){
      setAnchorPosition({ x: clampedX, y: clampedY })
    }
    setArrowDirection(bestFit.direction as "top" | "bottom" | "left" | "right")
  }



  // Resize Observer for calling repositionBubble()
  useEffect(() => {
    const el = bubbleRef.current
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      setIsCompactView(popupWidth < 572)
      setIsCompactHistoryView(popupWidth < 492)
      if (isDetached || isDragging.current) return // Only reposition based on resizing if not detached
      // Update bubble size
      repositionBubble()
    })

    resizeObserver.observe(bubbleRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [repositionBubble])


  
  // Track scroll and reposition arrow and bubble with throttling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null
    
    const handleScroll = () => {
      if (isDetached || isDragging.current) return
      
      // Throttle scroll events to reduce jitter
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      scrollTimeout = setTimeout(() => {
        repositionBubble()
      }, 8) // Small delay to batch scroll events
    }

    window.addEventListener("scroll", handleScroll, true) // true = capture scroll from nested containers too
    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [isDetached])



  // Animation for smooth repositioning on scroll and resize
  useEffect(() => {
    let animationFrame: number
  
    const animate = () => {
      if (!isDragging.current) {
        setBubblePosition((prev) => {
          const nextX = lerp(prev.x, targetPosition.x, 0.2)
          const nextY = lerp(prev.y, targetPosition.y, 0.2)
          return { x: nextX, y: nextY }
        })

        // Use the same lerp factor for rect coordinates to keep them in sync
        setRectLeft((prev) => prev + (targetRect.current.left - prev) * 0.2)
        setRectTop((prev) => prev + (targetRect.current.top - prev) * 0.2)
        setRectRight((prev) => prev + (targetRect.current.right - prev) * 0.2)
        setRectBottom((prev) => prev + (targetRect.current.bottom - prev) * 0.2)
        setRectWidth((prev) => prev + (targetRect.current.width - prev) * 0.2)
        setRectHeight((prev) => prev + (targetRect.current.height - prev) * 0.2)
    
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [targetPosition, targetRect])


  // Handle event click anywhere else on screen
  useEffect(() => {
    if (isLocked) return;

    const handleClickOutside = (e: MouseEvent) => {
      const box = bubbleRef.current?.getBoundingClientRect()
      console.log(box);
      if (!box) return;

      const isInside =
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom

      console.log("Inside?", isInside);

      if (!isInside) {
        setShow(false);
        setIsDetached(false);
      }
    };
    // Delay adding the listener to avoid triggering it on the same event
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isLocked]);

  
  // Drag handler functions
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true
    setIsDetached(true)
    dragStart.current = {
      x: e.clientX - bubblePosition.x,
      y: e.clientY - bubblePosition.y
    }
    document.addEventListener("mousemove", handleDragging)
    document.addEventListener("mouseup", handleDragEnd)
  }


  const handleDragging = (e: MouseEvent) => {
    if (!isDragging.current) return
    setBubblePosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    })
  }


  const handleDragEnd = () => {
    isDragging.current = false
    document.removeEventListener("mousemove", handleDragging)
    document.removeEventListener("mouseup", handleDragEnd)
  }

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
        console.log("[SAVE DEBUG] Debounced save for word:", currentWord, definitions);
        saveWord(text, definitions, window.location.href);
      }
    }, 300); // Wait 300ms after last change
    
    return () => clearTimeout(timer);
  }, [text, definitions, autoAddToHistory])



  // For updating history to sync
  useEffect(() => {
    const listener = (changes, areaName) => {
      if (areaName === "local" && changes[HISTORY_KEY]) {
        setHistory(changes[HISTORY_KEY].newValue || []);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);
  

  // Trigger side panel
  const openPanel = async () => {

    setShow(false);

    // Set sidePanel flag
    isSidePanel.current = true;

    chrome.runtime.sendMessage({ 
      type: "open_side_panel", 
      word: text,
      contextSnippet: extractContext(text),
      url: window.location.href
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "sidepanel_closed") {
      console.log("Side panel was closed");
      isSidePanel.current = false;
    }
  });  


  // On detach
  const centerBubbleInViewport = () => {
    const centerX = window.scrollX + window.innerWidth / 2
    const centerY = window.scrollY + window.innerHeight / 2
  
    setBubblePosition({
      x: centerX - popupWidth / 2,
      y: centerY - popupHeight / 2
    })
  }


  // Handle storage change from panel to bubble
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes.fromSidePanel?.newValue) {
        const word = changes.fromSidePanel.newValue.word
  
        setTimeout(() => {
          setText(word)
          console.log("show bubble again after close");
          setShow(true);
          setIsDetached(true);
          isSidePanel.current = false

          // Reopen bubble centered with last word
          centerBubbleInViewport();
        }, 500);
        
  
        // Cleanup to prevent double-trigger
        chrome.storage.local.remove("fromSidePanel")
      }
    }
  
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])



  const handleExport = () => {
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" })
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "open-history-export" })
    }, 1500)
  };


  // For tracking animation between tabs and synonyms/antonyms
  useEffect(() => {
    handleSynonymAntonyms()
    const data = definitions?.[activeSource];

    const hasSynonyms = Array.isArray(data?.synonyms) && data.synonyms.length > 0;
    const hasAntonyms = Array.isArray(data?.antonyms) && data.antonyms.length > 0;

    const hasExtras = hasSynonyms || hasAntonyms;
    setHasAvailableExtras(hasExtras); // <- this is a new state variable you can use
    
    if (activeSource !== prevSource) {
      setPrevSource(activeSource)
    }

    setShowExtras(false)
  }, [activeSource, definitions])

  const scrollToBottomOfExtras = () => {
    if (DataContainerRef.current) {
      DataContainerRef.current.scrollTo({
        top: DataContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  



  if (!show) return null
  if (popupWidth === null || popupHeight === null) return null

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  return (
    <div>

      {/* Carrot Arrow Rendering */}
      {!isDetached && arrowDirection === "top" && rangeRef.current && isTextVisible() && (
        <div
          className="absolute z-[99999]"
          style={{
            left: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.left + window.scrollX + rect.width / 2 - 6
            })()}px`,
            top: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.top + window.scrollY - 12
            })()}px`,
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: "9px solid var(--background)" // triangle points down into the bubble
          }}
        />
      )}

      {!isDetached && arrowDirection === "bottom" && rangeRef.current && isTextVisible() && (
        <div
          className="absolute z-[99999]"
          style={{
            left: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.left + window.scrollX + rect.width / 2 - 6
            })()}px`,
            top: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.bottom + window.scrollY + 3
            })()}px`,
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "9px solid var(--background)" // triangle points down into the bubble
          }}
        />
      )}

      {!isDetached && arrowDirection === "left" && rangeRef.current && shouldShowArrow() && (
        <div
          className="absolute z-[99999]"
          style={{
            top: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.top + window.scrollY + rect.height / 2 - 6
            })()}px`,
            left: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.left + window.scrollX - 12
            })()}px`,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderLeft: "9px solid var(--background)" // triangle points down into the bubble

          }}
        />
      )}

      {!isDetached && arrowDirection === "right" && rangeRef.current && shouldShowArrow() && (
        <div
          className="absolute z-[99999]"
          style={{
            top: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.top + window.scrollY + rect.height / 2 - 6
            })()}px`,
            left: `${(() => {
              const rect = rangeRef.current.getBoundingClientRect()
              return rect.right + window.scrollX + 3
            })()}px`,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderRight: "9px solid var(--background)" // triangle points down into the bubble
          }}
        />
      )}



      {/* Bubble box */}
      <div
        ref={bubbleRef}
        className="z-[99999] shadow-lg rounded-3xl px-4 pb-4 pt-2 text-sm text-gray-800 overflow-hidden flex flex-col resize"
        style={{
          position: "absolute",
          top: `${bubblePosition.y}px`,
          left: `${bubblePosition.x}px`,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
          height: `${popupHeight}px`,
          width: `${popupWidth}px`,
          backgroundColor: 'var(--background)',

          // Resize limits
          minWidth: "315px",
          maxWidth: viewportWidth,
          minHeight: "200px",
          maxHeight: viewportHeight,

          // Force font properties to prevent website overrides
          fontSize: "14px !important",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important",
          lineHeight: "1.5 !important"
        }}
      >


        {/* Drag Handle */}
        <div
          className="mx-auto top-0 cursor-move px-3 py-1 rounded-md select-none w-3/4 mb-3 bg-dullBox"
          onMouseDown={handleDragStart}
        >

        </div>


        {/* Utility Buttons Row */}
        <div className="flex items-center justify-between px-2 py-1 mb-1 bg-mainBody rounded-md text-[#9DAFC8]">
          {/* Left Side */}
          <div className="flex items-center space-x-2 w-[50%] mr-2">

            {/* Conditional Search Rendering based on searchMode */}
            <input
              type="text"
              placeholder="Search word... "
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Reset active tab to first enabled
                  const firstEnabled = sourceOrder.find((key) => enabledSources[key])
                  if (firstEnabled) {
                    setActiveSource(firstEnabled as keyof typeof definitionSources)
                  }
                  setShowContextAI(false)
                  setShowHistory(false)
                  setText(searchInput.trim())
                  setSearchInput("")
                }
              }}
              className="px-2 py-1 text-sm bg-dullBox text-dataText rounded placeholder:text-otherText outline-none w-[100%]"
            />

            <button
              title="Search"
              className="p-1 rounded text-text hover:bg-dullBox"
              onClick={(e) => {
                // Reset active tab to first enabled
                const firstEnabled = sourceOrder.find((key) => enabledSources[key])
                if (firstEnabled) {
                  setActiveSource(firstEnabled as keyof typeof definitionSources)
                }
                setShowContextAI(false)
                setShowHistory(false)
                setText(searchInput.trim())
                setSearchInput("")
              }}
            >
              <IoSearch size={16} />
            </button>

          </div>

          {/* Right Side */}
          <div className="flex items-center">

            {/* Upgrade Button (if not Pro) */}
            {!isPro ? (
              <button
                title="Upgrade to Pro"
                className="flex items-center gap-1 px-2 py-1 rounded-full text-text border border-border bg-mainBody hover:bg-dullBox transition-colors duration-200"
                onClick={handleUpgrade}
                style={{
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--main-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--hover-icon)"
                  e.currentTarget.style.backgroundColor = "var(--hover-square)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text)"
                  e.currentTarget.style.backgroundColor = "var(--main-body)"
                }}
              >
                <FaCrown size={16} style={{ color: "inherit" }} />
                {!isCompactView && (
                  <span className="text-sm font-medium">Upgrade to Pro</span>
                )}
              </button>
            ) : (
              // Context AI Button (if Pro)
              <button
                title="Context AI (Pro)"
                className="flex items-center gap-1 p-1 rounded text-text bg-mainBody hover:bg-dullBox transition-colors duration-200"
                onClick={() => {
                  const selection = window.getSelection()?.toString().trim()
                  if ((!selection && !showContextAI) && !text) {
                    alert("Please select a word first!")
                    return
                  }
                  setShowContextAI((prev) => !prev)
                  setShowHistory(false)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--hover-icon)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                <HiOutlineSparkles size={18} style={{ color: "inherit" }} />
                {!isCompactView && (
                  <span className="text-sm font-medium">Context AI</span>
                )}
              </button>
            )}

            {/* Pin */}
            <PortalTooltip text={!isDetached ? "Undock bubble" : "Dock to word"}>
              <button 
                title={!isDetached ? "Undock bubble" : "Dock to word"}
                className="p-1 rounded text-text hover:bg-dullBox ml-2"
                onClick={() => {
                  if (!isDetached) {
                    // Detach and center
                    hideAllTooltips()
                    setIsDetached(true)
                    centerBubbleInViewport()
                  } else {
                    // Re-dock to word
                    hideAllTooltips()
                    setText(lastSelectedWord.current);
                    setIsDetached(false)
                    setBubblePosition(anchorPosition)
                  }
                }}
              >
                {isDetached ? <IoMdMagnet size= {16} /> : <BsPinAngleFill size= {16}/>}
              </button>
            </PortalTooltip>

            {/* Lock */}
            <PortalTooltip text={isLocked ? "Unlock bubble" : "Lock bubble"}>
              <button
                title={isLocked ? "Unlock bubble" : "Lock bubble"}
                className="p-1 rounded text-text hover:bg-dullBox ml-2"
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? <IoMdLock size={16} /> : <IoMdUnlock size={16} />}
              </button>
            </PortalTooltip>

            {/* History */}
            <PortalTooltip text={"History"}>
              <button title="History" className="p-1 rounded text-text hover:bg-dullBox ml-2" onClick={() => {
                setShowContextAI(false)
                setShowHistory((prev) => !prev)
              }}>
                <IoBook size={16} />
              </button>
            </PortalTooltip>
            
            
            {/* SidePanel */}
            <PortalTooltip text={"Open SidePanel"}>
              <button onClick={openPanel} className="p-1 rounded text-text hover:bg-dullBox ml-2">
                <BiSolidDockRight size = {16} />
              </button>
            </PortalTooltip>
          </div>
        </div>



        {showContextAI ? (
            <ContextAIView
              word={text}
              contextSnippet={extractContext(text)}
              url={window.location.href}
            />
        ): showHistory ? (
          <div 
            className="flex flex-1 flex-col h-[100%] bg-mainBody border border-gray-700 mt-2 rounded-lg p-2 overflow-y-auto"
            style = {{
              scrollbarColor: "var(--tab-active-bg) var(--main-body)", 
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch" 
            }}>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <IoTimeOutline className="text-text" /> Recent Dictionary Lookups
              </h2>

              <div className={`flex gap-2 ${isCompactHistoryView ? "flex-col" : ""}`}>
                {/* Upgrade to Premium Button or Export Button  */}
                {!isPro && (!exportCount || exportCount <= 0) ? (
                  <button
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-mainBody rounded text-text hover:bg-dullBox"
                    title="Upgrade to Pro to unlock exports"
                    onClick={handleUpgrade}
                  >
                    <FaCrown size={16} />
                    <span className="text-sm">{"Upgrade"}</span>

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
                    disabled={history.length === 0}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-text ${
                      history.length === 0
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-mainBody hover:bg-dullBox"
                    }`}
                    title="Export History"
                    onClick={handleExport}
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
            <div className="flex flex-1 flex-col divide-y divide-dullBox">
              {history.map((entry) => {
                const isOpen = expandedWord === entry.word
                const timestamp = new Date(entry.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })

                return (
                  <div key={entry.word} className="py-3 mr-2">
                    <div className="flex justify-between items-center cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        {/* Left side: the word */}
                        <span className="text-base text-dataText mr-2">{entry.word}</span>

                        {/* Right side: time, link, etc */}
                        <div className={`flex items-center gap-2 text-xs text-otherText ${isCompactHistoryView ? "flex-col" : ""}`}>
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
                        {hoverTrash ? <IoTrashSharp size={16} /> : <IoTrashOutline size={16} />}
                      </button>

                    </div>

                    {isOpen && (
                      <div className="flex flex-1 overflow-hidden flex-col bg-mainBody rounded-lg">
                        <MiniDefinitionView word={entry.word}/>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (


          <div className="flex-col flex overflow-hidden rounded-b-lg h-[100%]">
            <div 
              className="group"
              style={{
                position: "relative",
                minHeight: "60px !important",
                width: "100% !important"
              }}
            >
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
              {/* Tabs */}
              <div ref={scrollRef} className="flex pt-2 px-2 rounded-t-lg overflow-x-auto bg-background" style={{ 
                scrollbarWidth: 'none',
                scrollbarColor: "var(--tab-active-bg) var(--main-body)",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                display: "flex !important",
                paddingTop: "8px !important",
                paddingLeft: "8px !important", 
                paddingRight: "8px !important",
                minHeight: "60px !important",
                width: "100% !important"
              }}>  
              {sourceOrder
                .filter((key) => enabledSources[key]) // Only enabled
                .map((key) => {
                  const source = definitionSources[key]
                  if (!source) {
                    console.warn(`Missing source for key: ${key}`)
                    return null
                  }
                  const isActive = key === activeSource

                  return (
                    <div key={key} >
                      <div
                        className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${isActive ? "bg-mainBody" : "bg-background"
                          }`}
                        style={{ 
                          width: "56px !important", 
                          height: "48px !important",
                          minWidth: "56px !important",
                          minHeight: "48px !important"
                        }}
                      >
                        <PortalTooltip text={source.name}>
                          <button
                            onClick={() => setActiveSource(key as keyof typeof definitionSources)}
                            className={`w-full h-full flex items-center justify-center text-dataText text-md transition rounded-md ${isActive
                                ? "bg-tabActiveBg"
                                : "bg-mainBody hover:bg-dullBox"
                              }`}
                            title={source.name}
                            style={{ 
                              width: "100% !important", 
                              height: "100% !important",
                              display: "flex !important",
                              alignItems: "center !important",
                              justifyContent: "center !important"
                            }}
                          >
                            {typeof source.icon === "string" ? (
                              <img
                                src={source.icon}
                                alt={`${source.name} icon`}
                                className="w-6 h-6 object-contain"
                                style={{ width: "24px !important", height: "24px !important" }}
                              />
                            ) : (
                              <span className="text-lg" style={{ fontSize: "18px !important" }}>{source.icon}</span>
                            )}
                          </button>
                        </PortalTooltip>
                      </div>
                    </div>
                  )

                })}

              </div>
            </div>

            {/* Main Text */}
            {activeSource === "youglish" ? (
              <div 
                className="flex-1 flex-col overflow-y-auto bg-mainBody text-dataText"
                style = {{
                  scrollbarColor: "var(--tab-active-bg) var(--main-body)", 
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch" 
                }}
                >
                    <div className= "flex flex-col items-center justify-between"> 
                      <h2 className="text-lg font-semibold my-4">YouGlish Pronunciation</h2>

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
                  
                  
                    {/* License and Attribution  */}
                    {definitionSources[activeSource]?.license && (
                      <div className="mt-6 pr-4 pb-2 flex justify-end">
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
              <div 
                id="data-scroll-container"
                ref={DataContainerRef}
                className="flex-1 flex-col overflow-y-auto space-y-2 mb-2 rounded-b-lg p-2 pr-4 bg-mainBody" 
                style = {{
                  scrollbarColor: "var(--tab-active-bg) var(--main-body)", 
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch" 
                }}>
                {/* Word and Phonetic Text */}
                <div className="flex items-center justify-between">

                  {/* Left side  */}
                  <div className="flex items-center flex-1">
                    <h2 className="font-semibold text-dataText text-lg mr-2" style={{ fontSize: "18px !important" }}>{text}</h2>
                    {definitions[activeSource]?.phoneticText?.trim() && (
                      <h2 className="text-sm text-otherText mr-2" style={{ fontSize: "14px !important" }}>
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

                  {/* Manual Save Button (Right side) */}
                  {!autoAddToHistory && (
                    <button onClick={() => toggleSave(text, definitions)} className="mr-3">
                      {isSaved(text) ? (
                        <GoHeartFill size = {20} className="text-pink-400" />
                      ) : (
                        <GoHeart size = {20} className="text-otherText hover:text-pink-400" />
                      )}
                    </button>
                  )}

                </div>

                <p className="text-xs text-otherText" style={{ fontSize: "12px !important" }}>Definition for:</p>

                {/* Definitions */}
                <div className="space-y-3">
                  {definitions[activeSource]?.definition
                      ?.split("\n")
                      .map((line, idx, arr) => (
                        <div
                          key={idx}
                          className={`pb-3 ${
                            idx === arr.length - 1 && (activeSource === "duckduckgo" || !hasAvailableExtras) ? "" : "border-b border-border"
                          }`}
                        >
                          <p className="text-sm text-dataText italic" style={{ fontSize: "14px !important" }}>{line}</p>
                        </div>
                      )) ?? (
                        <p className="text-sm text-dataText italic" style={{ fontSize: "14px !important" }}>Loading...</p>
                      )}
                </div>
                

                {activeSource !== "duckduckgo" && hasAvailableExtras && (  
                  <>
                    <button
                      onClick={() => {
                        handleSynonymAntonyms()
                        setTimeout(() => {
                          scrollToBottomOfExtras(); // now call the function
                        }, 50);
                      }}
                      className={`mt-3 px-3 py-1 rounded-lg text-sm font-medium transition
                        ${showExtras
                          ? "bg-dullBox text-red-500 hover:bg-red-600 hover:text-white"
                          : "bg-tabActiveBg text-blue-500 hover:bg-blue-600 hover:text-white"}
                      `}
                      style={{ fontSize: "14px !important" }}
                    >
                      {showExtras ? "Hide Synonyms & Antonyms" : "Show Synonyms & Antonyms"}
                    </button> 

                    {showExtras && (
                      <div>
                        <div className="mt-4 space-y-4">
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
                          style={{ width: "24px !important", height: "24px !important" }}
                        />
                      ) : (
                        <span className="text-lg" style={{ fontSize: "18px !important" }}>{definitionSources[activeSource].icon}</span>
                      )}
                      More Info
                    </a>
                  </div>
                )}

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

              </div>// start of word data
            )}
            
          </div> //Main box (aside from history rendering)
        )}

      </div>
    </div>
  )
}

// Inject the component into the page
const shadowHost = document.createElement("div")
shadowHost.id = "wordscope-host"
document.body.appendChild(shadowHost)
const shadow = shadowHost.attachShadow({ mode: "open" })

// Inject CSS first
const style = document.createElement("link")
style.rel = "stylesheet"
style.href = chrome.runtime.getURL("assets/styles/tailwind-content.css")
shadow.appendChild(style)

// Add additional CSS to prevent font size overrides
const additionalStyle = document.createElement("style")
additionalStyle.textContent = `
  /* Force font isolation for WordScope bubble */
  * {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important;
  }
  
  #wordscope-bubble * {
    box-sizing: border-box !important;
  }
  
  /* Ensure specific font sizes are never overridden */
  .text-xs { font-size: 12px !important; line-height: 16px !important; }
  .text-sm { font-size: 14px !important; line-height: 20px !important; }
  .text-base { font-size: 16px !important; line-height: 24px !important; }
  .text-lg { font-size: 18px !important; line-height: 28px !important; }
  .text-xl { font-size: 20px !important; line-height: 28px !important; }
  .text-2xl { font-size: 24px !important; line-height: 32px !important; }
  
  /* Additional overrides for common interfering selectors */
  h1, h2, h3, h4, h5, h6, p, span, div, a, button, input {
    font-size: inherit !important;
    line-height: inherit !important;
    font-family: inherit !important;
  }
  
  /* Reset and force all Tailwind utility classes to work properly */
  #wordscope-bubble * {
    box-sizing: border-box !important;
  }
  
  /* Force container and layout classes */
  #wordscope-bubble .relative {
    position: relative !important;
  }
  
  #wordscope-bubble .group {
    /* group styles are handled by hover states */
  }
  
  #wordscope-bubble .flex {
    display: flex !important;
  }
  
  #wordscope-bubble .flex-col {
    flex-direction: column !important;
  }
  
  #wordscope-bubble .items-center {
    align-items: center !important;
  }
  
  #wordscope-bubble .justify-center {
    justify-content: center !important;
  }
  
  #wordscope-bubble .overflow-hidden {
    overflow: hidden !important;
  }
  
  #wordscope-bubble .overflow-x-auto {
    overflow-x: auto !important;
  }
  
  #wordscope-bubble .rounded-t-lg {
    border-top-left-radius: 0.5rem !important;
    border-top-right-radius: 0.5rem !important;
  }
  
  #wordscope-bubble .rounded-t-xl {
    border-top-left-radius: 0.75rem !important;
    border-top-right-radius: 0.75rem !important;
  }
  
  #wordscope-bubble .rounded-b-lg {
    border-bottom-left-radius: 0.5rem !important;
    border-bottom-right-radius: 0.5rem !important;
  }
  
  #wordscope-bubble .rounded-md {
    border-radius: 0.375rem !important;
  }
  
  /* Force specific sizing classes with explicit pixel values */
  #wordscope-bubble .w-6 {
    width: 24px !important;
    min-width: 24px !important;
    max-width: 24px !important;
  }
  
  #wordscope-bubble .h-6 {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }
  
  #wordscope-bubble .w-14 {
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
  }
  
  #wordscope-bubble .h-12 {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
  }
  
  #wordscope-bubble .w-full {
    width: 100% !important;
  }
  
  #wordscope-bubble .h-full {
    height: 100% !important;
  }
  
  #wordscope-bubble .h-\\[100\\%\\] {
    height: 100% !important;
  }
  
  /* Force padding classes */
  #wordscope-bubble .pt-2 {
    padding-top: 0.5rem !important;
  }
  
  #wordscope-bubble .px-2 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  
  #wordscope-bubble .py-1 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  
  /* Force image sizing */
  #wordscope-bubble img.w-6.h-6 {
    width: 1.5rem !important; /* 24px */
    height: 1.5rem !important; /* 24px */
    object-fit: contain !important;
  }
  
  #wordscope-bubble .object-contain {
    object-fit: contain !important;
  }
`
shadow.appendChild(additionalStyle)

// Add global CSS for tooltips (which render to document.body, not shadow DOM)
const globalStyle = document.createElement("style")
globalStyle.id = "wordscope-global-tooltip-styles"
globalStyle.textContent = `
  /* Force consistent tooltip font sizes */
  [style*="z-index: 99999"].absolute.bg-mainBody.text-text.text-xs,
  div[style*="position: fixed"][style*="pointer-events: none"] {
    font-size: 12px !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important;
    line-height: 16px !important;
  }
`
document.head.appendChild(globalStyle)

// Load into shadow root 
style.onload = () => {
  const bubbleRoot = document.createElement("div")
  bubbleRoot.id = "wordscope-bubble"
  shadow.appendChild(bubbleRoot)
  createRoot(bubbleRoot).render(<Bubble/>)
}
