import { useState, useEffect, useRef } from "react"
import { IoVolumeMediumSharp, IoTimeOutline, IoSearch, IoPin, IoBook, IoSettings, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { HiMiniChatBubbleBottomCenterText, HiOutlineSparkles, HiOutlineTrash, HiOutlineArrowDownTray, HiOutlineXMark } from "react-icons/hi2";
import { GoHeart, GoHeartFill } from "react-icons/go"
import { FaCrown } from "react-icons/fa"
import { BiChevronRight, BiChevronLeft } from "react-icons/bi";
import React from "react"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"
import { showToast } from "../toast";

//Dependency imports
import { definitionSources } from "~sources/definitionSources"
import { useDictionary } from "~hooks/useDictionary"
import { useHistory } from "~hooks/useHistory"
import { useSourceSettings } from "~hooks/useSourceSettings";
import ContextAIView from "../views/contextAIView"
import { extractContext } from "../context/contextExtractor"
import { MiniDefinitionView } from "~views/tabDefinitionView"
import PortalTooltip from "~components/PortalTooltip";

declare global {
    interface Window {
        overscroll: any
    }
}

const HISTORY_KEY = "history"
const DEFAULT_EXPORT_SOURCE_KEY = "defaultExportSource"

const SidePanel = () => {
    // History hook useStates
    const { saveWord, history, setHistory, deleteWord, clearHistory, isSaved, autoAddToHistory, toggleSave, exportAsTSV, exportAsCSV, exportAsJSON, exportAsPDF, } = useHistory()

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

    // Source Settings
    const {
        sourceOrder,
        enabledSources,
        defaultExportSource,
        updateDefaultExportSource
    } = useSourceSettings()

    const [hasAvailableExtras, setHasAvailableExtras] = useState(false);
    const [prevSource, setPrevSource] = useState(activeSource)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [expandedWord, setExpandedWord] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState("")
    const [showHistory, setShowHistory] = useState(false)
    const [showContextAI, setShowContextAI] = useState(false)
    const [hoverTrash, setHoverTrash] = useState(false)
    
    // Store context data from webpage
    const [contextSnippet, setContextSnippet] = useState("")
    const [pageUrl, setPageUrl] = useState("")

    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    // Export flags and state variables
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFileType, setExportFileType] = useState<"tsv" | "csv" | "json" | "pdf">("tsv");
    const [exportSource, setExportSource] = useState(defaultExportSource || "");
    const [includeAllWords, setIncludeAllWords] = useState(false);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);

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

    useEffect(() => {
        const email = localStorage.getItem("userEmail")
        if (!email) return
       
        fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/is-pro?email=${email}`)
            .then((res) => res.json())
            .then((data) => setIsPro(data.isPro))
            .catch((err) => {})
    }, [])


    const handleUpgrade = async () => {
        const email = localStorage.getItem("userEmail")

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
            const res = await fetch(`${process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL}/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            
            const data = await res.json()
            if (data.url) {
                window.open(data.url, "_blank")
            } else {
                showToast("Failed to create checkout session.", "error")
            }
        }
    }

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
            await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
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


    // useEffect for transferring word from bubble
    useEffect(() => {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === "word_from_bubble") {
                setText(msg.word)
                setSearchInput("") // if you use it
                setShowContextAI(false)
                setShowHistory(false)
                
                // Switch to first enabled source tab when looking up new word
                const firstEnabled = sourceOrder.find((key) => enabledSources[key])
                if (firstEnabled) {
                    setActiveSource(firstEnabled as keyof typeof definitionSources)
                }
                
                // Store context data from webpage
                if (msg.contextSnippet) {
                    setContextSnippet(msg.contextSnippet)
                }
                if (msg.url) {
                    setPageUrl(msg.url)
                }
            }
        })
    }, [sourceOrder, enabledSources])


    // useEffect for detecting sidepanel close
    useEffect(() => {
        const markClosed = () => {
            chrome.storage.local.set({ sidePanelClosed: true })
        }

        window.addEventListener("unload", markClosed)
        return () => window.removeEventListener("unload", markClosed)
    }, [])


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

    const handleExport = async () => {
        try {
            if (exportFileType === "pdf") {
                const pdfBytes = await exportAsPDF(exportSource, includeAllWords, selectedWords);
                if (!pdfBytes) {
                    return;
                }
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "dictionary_history.pdf";
                link.click();
                URL.revokeObjectURL(url);
                setShowExportModal(false);
                return;
            }

            let data = "";
            if (exportFileType === "tsv") {
                data = exportAsTSV(exportSource, includeAllWords, selectedWords);
            } else if (exportFileType === "csv") {
                data = exportAsCSV(exportSource, includeAllWords, selectedWords);
            } else if (exportFileType === "json") {
                data = exportAsJSON(exportSource, includeAllWords, selectedWords);
            }

            const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `dictionary_history.${exportFileType}`;
            link.click();
            URL.revokeObjectURL(url);
            setShowExportModal(false);
        } catch (error) {
            // Ignore download interruption silently
        }
    };

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



    return (
        <div className="h-[100%] flex flex-col overflow-hidden text-sm shadow-lg px-4 pb-4 pt-2 bg-background">
            {/* Search and Utility Buttons Row */}
            <div className="flex items-center justify-between px-2 py-1 mb-2 bg-mainBody rounded-md text-text">
                {/* Left Side */}
                <div className="flex items-center space-x-2">

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
                        className="px-2 py-1 text-sm bg-dullBox text-dataText rounded placeholder:text-otherText outline-none w-[150px]"
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
                <div className="flex items-center space-x-2">

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
                        >
                            <FaCrown style={{ color: "inherit" }} size={16} /> {/* Small icon */}
                            <span className="hidden lg:inline text-sm font-medium">
                                {"Upgrade"}
                            </span>
                        </button>
                    ) : (
                        <button
                            title="Context AI (Pro)"
                            className="text-sm transition-colors rounded"
                            style={{
                                color: "var(--text)",
                                
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--hover-icon)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text)"
                            }}
                            onClick={() => {
                                const selection = window.getSelection()?.toString().trim();
                                if (!selection && !text) {
                                    showToast("Please select a word first!", "warning");
                                    return;
                                }
                                setShowContextAI((prev) => !prev);
                                setShowHistory(false);
                            }}
                        >
                            <HiOutlineSparkles style={{ color: "inherit" }} size={20} />
                        </button>
                    )}

                    {/* History */}
                    <button title="History" className="p-1 rounded text-text hover:bg-dullBox" 
                        onClick={() => {
                        setShowHistory((prev) => !prev)
                        setShowContextAI(false)
                        }}>
                        <IoBook size={16} />
                    </button>

                </div>
            </div>

            {/* Return to Bubble Button  */}
            <button
                className="flex items-center justify-center gap-2 px-2 py-2 mb-2 bg-mainBody rounded text-text hover:bg-dullBox"
                title="Return to Bubble"
                onClick={async () => {
                    await chrome.storage.local.set({ fromSidePanel: { word: text } })
                    // chrome.runtime.sendMessage({ type: "side_panel_closed" })
                    window.close() // closes the panel
                }}>
                <HiMiniChatBubbleBottomCenterText size={20} />
                <span>Return to Bubble</span>

            </button>



            {showContextAI ? (
                <ContextAIView
                    word={text}
                    contextSnippet={contextSnippet}
                    url={pageUrl}
                />
            ) : showHistory ? (
                <div
                    className="flex-1 bg-mainBody border border-gray-700 mt-2 rounded-lg p-2 overflow-y-auto"
                    style={{
                        scrollbarColor: "var(--tab-active-bg) var(--main-body)",
                        overscrollBehavior: "contain",
                        WebkitOverflowScrolling: "touch"
                    }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                            <IoTimeOutline className="text-text" /> Recent Dictionary Lookups
                        </h2>

                        <div className="flex flex-col gap-2">
                            {/* Upgrade to Premium Button or Export Button  */}
                            { !isPro && (!exportCount || exportCount <= 0) ? (
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
                                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-text ${history.length === 0
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

                            return (
                                <div key={entry.word} className="py-3 mr-2">
                                    <div className="flex justify-between items-center cursor-pointer">
                                        <div className="flex items-center justify-between w-full">
                                            {/* Left side: the word */}
                                            <span className="text-base text-dataText mr-2">{entry.word}</span>

                                            {/* Right side: time, link, etc */}
                                            <div className="flex flex-col text-xs text-otherText space-y-2">
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

                                        {/* Dropdown button*/}
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
                                        <div className="bg-mainBody rounded-lg">
                                            <MiniDefinitionView word={entry.word} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-col flex overflow-hidden flex-1 rounded-b-lg h-[100%]">
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
                        {/* Tabs */}
                        <div ref={scrollRef} className="flex pt-2 px-2 rounded-t-lg overflow-x-auto bg-background" style={{ 
                            scrollbarWidth: 'none',
                            scrollbarColor: "var(--tab-active-bg) var(--main-body)",
                            overscrollBehavior: "contain",
                            WebkitOverflowScrolling: "touch" }}>  
                            {sourceOrder
                                .filter((key) => enabledSources[key]) // Only enabled
                                .map((key) => {
                                    const source = definitionSources[key]
                                    const isActive = key === activeSource

                                    return (
                                        <div key={key} >
                                            <div
                                                className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${isActive ? "bg-mainBody" : "bg-background"
                                                    }`}
                                            >
                                                <PortalTooltip text={source.name}>
                                                    <button
                                                        onClick={() => setActiveSource(key as keyof typeof definitionSources)}
                                                        className={`w-full h-full flex items-center justify-center text-dataText text-md transition rounded-md ${isActive
                                                                ? "bg-tabActiveBg"
                                                                : "bg-mainBody hover:bg-dullBox"
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


                    {/* Main Text */}
                    {activeSource === "youglish" ? (
                        <div className="flex flex-col justify-between h-full p-4 text-dataText bg-mainBody">
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
                        <div
                            className="flex-1 flex-col overflow-y-auto space-y-2 mb-2 rounded-b-lg p-2 h-[100%] bg-mainBody"
>
                            {/* Word and Phonetic Text */}
                            <div className="flex items-center">

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
                                        audio.play().catch((err) => {})
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
                                            <GoHeartFill size={20} className="text-pink-400" />
                                        ) : (
                                            <GoHeart size={20} className="text-gray-400 hover:text-pink-400" />
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
                                            className={`pb-3 ${idx === arr.length - 1 && (activeSource === "duckduckgo" || !hasAvailableExtras) ? "" : "border-b border-gray-600"
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

                        </div>// start of word data
                    )}
                </div>


            )}

            {showExportModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center rouded-lg">
                    <div className="bg-background text-text rounded-lg shadow-lg w-88 p-6">
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
                                    onChange={(e) => setExportFileType(e.target.value as "tsv" | "csv" | "json" | "pdf")}
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
                                className={`px-3 py-1 rounded ${(!includeAllWords && selectedWords.length === 0)
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}
                                disabled={!includeAllWords && selectedWords.length === 0}
                                title={!includeAllWords && selectedWords.length === 0 ? "Select at least one word" : ""}
                                onClick={async () => {
                                    const { exportCount } = await chrome.storage.local.get("exportCount")
                                    if (!exportCount || exportCount <= 0) {
                                      showToast("You've reached your free export limit!", "warning")
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

        </div>
    )
}

export default SidePanel
