import React, { useEffect, useState, useMemo, useRef } from "react"
import { IoVolumeMediumSharp } from "react-icons/io5"
import { BiChevronRight, BiChevronLeft } from "~node_modules/react-icons/bi";
import { definitionSources } from "../sources/definitionSources"
import { useSourceSettings } from "~hooks/useSourceSettings"
import { useHistory } from "../hooks/useHistory";

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"
import PortalTooltip from "~components/PortalTooltip"

declare global {
    interface Window {
      overscroll: any
    }
  }

const HISTORY_KEY= "history"

export const MiniDefinitionView = ({
    word,
  }: {
    word: string
  }) => {
    const {
        enabledSources,
        sourceOrder,
    } = useSourceSettings();

    const { history, setHistory } = useHistory();

    // Inject CSS enforcement for consistent styling
    useEffect(() => {
      const existingStyle = document.getElementById("wordscope-tab-definition-styles")
      if (existingStyle) return

      const additionalStyle = document.createElement("style")
      additionalStyle.id = "wordscope-tab-definition-styles"
      additionalStyle.textContent = `
        /* Force all Tailwind utility classes to work properly */
        .w-6 {
          width: 1.5rem !important; /* 24px */
        }
        
        .h-6 {
          height: 1.5rem !important; /* 24px */
        }
        
        .w-14 {
          width: 3.5rem !important; /* 56px */
        }
        
        .h-12 {
          height: 3rem !important; /* 48px */
        }
        
        .flex {
          display: flex !important;
        }
        
        .items-center {
          align-items: center !important;
        }
        
        .justify-center {
          justify-content: center !important;
        }
        
        .rounded-t-xl {
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
        }
        
        .rounded-md {
          border-radius: 0.375rem !important;
        }
        
        .pt-2 {
          padding-top: 0.5rem !important;
        }
        
        .px-2 {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .py-1 {
          padding-top: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        
        img.w-6.h-6 {
          width: 1.5rem !important; /* 24px */
          height: 1.5rem !important; /* 24px */
          object-fit: contain !important;
        }
        
        .object-contain {
          object-fit: contain !important;
        }
      `
      document.head.appendChild(additionalStyle)
    }, [])

    const entry = useMemo(
        () => history.find((e) => e.word === word),
        [history, word]
      );
    console.log(`[MiniDefinitionView] word: ${word}, entry:`, entry);
  
    const sources = entry?.sources || {};
    console.log("entry.sources:", entry?.sources);

    //Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    const firstEnabled = sourceOrder.find((key) => enabledSources[key] && sources[key])
    const [activeSource, setActiveSource] = useState<string | null>(firstEnabled || null)
    const [userSelectedSource, setUserSelectedSource] = useState<boolean>(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const current = activeSource ? sources[activeSource] : null

    const [showExtras, setShowExtras] = useState(false)
    const [hasAvailableExtras, setHasAvailableExtras] = useState(false);
    const [prevSource, setPrevSource] = useState(activeSource)

    const scroll = (dir: "left" | "right") => {
      scrollRef.current?.scrollBy({
        left: dir === "left" ? -100 : 100,
        behavior: "smooth"
      })
    }

    // useEffect for updating the active tab on render 
    useEffect(() => {
        // Reset user selection flag when word changes
        if (word !== entry?.word) {
          setUserSelectedSource(false);
        }
        
        // Only auto-select if user hasn't manually selected a source
        if (!userSelectedSource) {
          const firstEnabled = sourceOrder.find((key) => enabledSources[key] && sources[key]);
          if (firstEnabled) {
            setActiveSource(firstEnabled);
          } else {
            setActiveSource(null);
          }
        }
    }, [word, sources, enabledSources, sourceOrder, userSelectedSource, entry?.word]);


    useEffect(() => {
        const listener = (changes, area) => {
          if (area === "local" && changes[HISTORY_KEY]) {
            console.log("[useHistory] Storage changed:", changes[HISTORY_KEY].newValue);
            setHistory(changes[HISTORY_KEY].newValue || []);
          }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
      }, []);
      


    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
    const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
    };
    loadThemes();
    }, []);

    // // For tracking animation between tabs and synonyms/antonyms
    useEffect(() => {
      handleSynonymAntonyms()
      const currentData = entry?.sources?.[activeSource];
      const hasSyns = Array.isArray(currentData?.synonyms) && currentData.synonyms.length > 0;
      const hasAnts = Array.isArray(currentData?.antonyms) && currentData.antonyms.length > 0;
    
      setHasAvailableExtras(hasSyns || hasAnts);
      setShowExtras(false);
    
      if (activeSource !== prevSource) {
        setPrevSource(activeSource);
      }
    }, [activeSource, entry]);

    const handleSynonymAntonyms = async () => {
      if (!activeSource || !entry) return;
    
      const source = definitionSources[activeSource];
      const currentData = entry.sources[activeSource];
    
      if (!currentData) return;
    
      // If already fetched, just toggle
      if (currentData.extrasFetched || !source.fetchExtras) {
        setShowExtras((prev) => !prev);
        return;
      }
    
      // Fetch extras from source
      const extras = await source.fetchExtras?.(word);
      if (extras) {
        // Mutate the entry's source with extras (ideally you'd do this immutably)
        const updatedEntry = {
          ...entry,
          sources: {
            ...entry.sources,
            [activeSource]: {
              ...currentData,
              ...extras,
              extrasFetched: true,
            },
          },
        };
    
        // Replace the matching entry in history
        const updatedHistory = history.map((e) =>
          e.word === word ? updatedEntry : e
        );
    
        setHistory(updatedHistory);
        setShowExtras(true);
      }
    };
    
    


    if (!entry) {
        return <div className="text-otherText italic">Loading definition for "{word}"...</div>;
      }
        
    return (
    <div className ="flex-col flex overflow-hidden rounded-b-lg h-[100%]">
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
          <div ref={scrollRef} className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto bg-background" style={{ 
            scrollbarWidth: 'none',
            scrollbarColor: "var(--tab-active-bg) var(--main-body)",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch" }}>  
          {sourceOrder
              .filter((key) => enabledSources[key]) // Only enabled
              .map((key) => {
                  const source = definitionSources[key]
                  const isActive = key === activeSource
              
                  return(
                  <div key={key} >
                      <div
                      className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${
                          isActive ? "bg-mainBody" : "bg-background"
                      }`}
                      >
                      <PortalTooltip text={source.name}>
                        <button
                            onClick={() => {
                              setActiveSource(key as keyof typeof definitionSources);
                              setUserSelectedSource(true);
                            }}
                            className={`w-full h-full flex items-center justify-center text-dataText text-md transition rounded-md ${
                            isActive
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
        <div 
        className="p-2 overflow-y-auto h-[100%] bg-mainBody rounded-b-lg"
        style = {{
            scrollbarColor: "var(--tab-active-bg) var(--main-body)", 
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            borderTop: "none"
          }}>
        {activeSource === "youglish" ? (
          <div className="flex flex-col justify-between h-full px-2 pt-4 pb-2 text-dataText bg-mainBody">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
                <h2 className="text-lg font-semibold mb-2">YouGlish Pronunciation</h2>
                <p className="text-sm text-otherText mb-4 max-w-sm">
                Hear real-world examples of how <strong>{word}</strong> is pronounced in English.
                </p>
                <a
                href={`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`}
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
                <div className="text-[8px] text-right text-otherText leading-snug max-w-xs">
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
            <>
            {/* Word and Phonetic Text */}
            <div className="flex items-center">
                
                <div className="flex items-center flex-1">
                  <h2 className="font-semibold text-dataText text-lg mr-2" style={{ fontSize: "18px !important" }}>{word}</h2>
                  {current?.phoneticText?.trim() && (
                    <h2 className="text-sm text-otherText mr-2" style={{ fontSize: "14px !important" }}>
                      {current.phoneticText}
                    </h2>
                  )}
                  <PortalTooltip text="Synthesizer">
                    <button
                      title="Play Pronunciation"
                      className="mr-2 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(word);
                        utterance.lang = "en-US"; // Set language (optional)
                        window.speechSynthesis.speak(utterance);
                      }}
                    >
                      <IoVolumeMediumSharp size={22} />
                    </button>
                  </PortalTooltip>
                  
                  { Boolean(sources['freedictionaryapi']?.pronunciationAudio) && (
                    <PortalTooltip text="FreeDictionaryAPI Audio">
                      <button
                        title="Free Dictionary API Audio"
                        className="rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                        onClick={() => {
                          const audioUrl = sources['freedictionaryapi']?.pronunciationAudio

                          const audio = new Audio(audioUrl)
                          audio.play().catch((err) => console.warn("Audio failed to play", err))
                        }}
                        >
                          <IoVolumeMediumSharp size={22} />
                      </button>
                    </PortalTooltip>
                  )}
                  
                </div>
            </div>

            <p className="text-xs text-otherText" style={{ fontSize: "12px !important" }}>Definition for:</p>

            {/* Data Box */}
            <div className="overflow-y-auto" style={{ flex: 1 }}>
                 {/* Definitions */}
                 <div className="space-y-3">
                  {current?.definition
                      ?.split("\n")
                      .map((line, idx, arr) => (
                        <div
                          key={idx}
                          className={`pb-3 ${
                            idx === arr.length - 1 ? "" : "border-b border-gray-600"
                          }`}
                        >
                          <p className="text-sm text-dataText italic" style={{ fontSize: "14px !important" }}>{line}</p>
                        </div>
                      )) ?? (
                        <p className="text-sm text-dataText italic" style={{ fontSize: "14px !important" }}>Loading...</p>
                      )}
                </div>

                {/* More Info Button Aligned Bottom Left */}
                {definitionSources[activeSource]?.getMoreInfoUrl && (
                  <div className="flex justify-end self-start">
                    <a
                      href={definitionSources[activeSource].getMoreInfoUrl(word)}
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
                

                {/* {activeSource !== "duckduckgo" && hasAvailableExtras && (  
                  <>
                    <button
                      onClick={() => {
                        handleSynonymAntonyms()
                        // setTimeout(() => {
                        //   scrollToBottomOfExtras(); // now call the function
                        // }, 50);
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
                          {current?.synonyms?.length > 0 && (
                            <div>
                              <strong className="block text-xs text-dataText mb-2">Synonyms:</strong>
                              <div className="flex flex-wrap gap-2">
                                {current.synonyms.map((syn, i) => (
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

                          {current?.antonyms?.length > 0 && (
                            <div>
                              <strong className="block text-xs text-dataText mb-2">Antonyms:</strong>
                              <div className="flex flex-wrap gap-2">
                                {current.antonyms.map((ant, i) => (
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
                )} */}
            </div>
            </>
        )}
        </div>
    </div>
    
    )
  }
  