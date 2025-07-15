import React, { useEffect, useState, useMemo } from "react"
import { IoVolumeMediumSharp } from "react-icons/io5"
import type { DefinitionRecord } from "~hooks/useHistory"
import { definitionSources } from "../sources/definitionSources"
import { useSourceSettings } from "~hooks/useSourceSettings"
import { useHistory } from "../hooks/useHistory";

import "~/styles/tailwind.css"
import "../styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

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

    const entry = useMemo(
        () => history.find((e) => e.word === word),
        [history, word]
      );
      
    const sources = entry?.sources || {};

    //Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    const firstEnabled = sourceOrder.find((key) => enabledSources[key] && sources[key])
    const [activeSource, setActiveSource] = useState<string | null>(firstEnabled || null)
    const current = activeSource ? sources[activeSource] : null

    const [showExtras, setShowExtras] = useState(false)

    const handleSynonymAntonyms = () => {
        // Already fetched from props.sources
        setShowExtras((prev) => !prev)
      }

    // useEffect for updating the active tab on render 
    useEffect(() => {
        const firstEnabled = sourceOrder.find((key) => enabledSources[key] && sources[key]);
        if (firstEnabled) {
          setActiveSource(firstEnabled);
        } else {
          setActiveSource(null);
        }
    }, [word, sources, enabledSources, sourceOrder]);


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

    if (!entry) {
        return <div className="text-otherText italic">Loading definition for "{word}"...</div>;
      }
        
    return (
    <div className ="flex-col flex overflow-hidden rounded-b-lg h-[100%]">
        {/* Tabs */}
        <div className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto bg-background" style = {{scrollbarWidth: 'none'}}>
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
                    <button
                        onClick={() => setActiveSource(key as keyof typeof definitionSources)}
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


        {/* Main Text */}
        <div 
        className="mb-2 p-2 overflow-y-auto h-[100%] bg-mainBody rounded-b-lg"
        style = {{
            scrollbarColor: "var(--tab-active-bg) var(--main-body)", 
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            borderTop: "none"
          }}>
        {activeSource === "youglish" ? (
        <div className="flex flex-col items-center justify-center h-full text-dataText">
            <h2 className="text-lg font-semibold mb-4">YouGlish Pronunciation</h2>
            
            <p className="text-sm text-otherText mb-2 text-center">
            Click the button below to hear real-world examples of how <strong>{word}</strong> is pronounced in English.
            </p>
            
            <a
            href={`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-dataText font-medium py-2 px-4 rounded transition"
            >
            🔊 Open YouGlish
            </a>
        </div>
        ) : (
            <>
            {/* Word and Phonetic Text */}
            <div className="flex items-center">
                <h2 className="font-semibold text-dataText text-lg mr-2">{word}</h2>
                <h2 className="text-sm text-otherText">{sources['freedictionaryapi']?.phoneticText}</h2>
                <button
                title="Play Pronunciation"
                className="ml-1 mb-3 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                onClick={() => {
                    const rawUrl = sources['freedictionaryapi']?.pronunciationAudio
                    // Use speech synthesis if no audio from freedictionaryapi
                    if (!rawUrl) {
                    // Fallback to Web Speech API
                    const utterance = new SpeechSynthesisUtterance(word)
                    utterance.lang = "en-US"
                    speechSynthesis.speak(utterance)
                    } else {
                    console.log(rawUrl);
                    const audioUrl = rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl
                
                    const audio = new Audio(audioUrl)
                    audio.play().catch((err) => console.warn("Audio failed to play", err))
                    }


                }}
                >
                <IoVolumeMediumSharp size={20} />
                </button>

                <button
                title="Lingua Robot Audio"
                className="ml-3 mb-3 rounded-full hover:bg-gray-300 text-text hover:text-dullBox"
                onClick={() => {
                    const audioUrl = sources['linguarobotapi']?.pronunciationAudio
                
                    const audio = new Audio(audioUrl)
                    audio.play().catch((err) => console.warn("Audio failed to play", err))
                }}
                >
                <IoVolumeMediumSharp size={20} />
                </button>
            </div>

            <p className="text-xs text-otherText">Definition for:</p>

            {/* Data Box */}
            <div className="overflow-y-auto" style={{ flex: 1 }}>
                <p className="whitespace-pre-wrap text-sm text-dataText italic">
                {current?.definition ?? "Loading..."}
                </p>

                <p className="whitespace-pre-wrap text-sm italic text-blue-500" onClick={handleSynonymAntonyms}>
                Show Synonyms and Antonyms
                </p>

                {showExtras && (
                <>
                    {current?.synonyms?.length > 0 && (
                    <div className="mt-2">
                        <strong className="block text-xs text-dataText mb-1">Synonyms:</strong>
                        <div className="flex flex-wrap gap-1">
                        {current.synonyms.map((syn, i) => (
                            <span
                            key={`syn-${i}`}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                            {syn}
                            </span>
                        ))}
                        </div>
                    </div>
                    )}

                    {current?.antonyms?.length > 0 && (
                    <div className="mt-2">
                        <strong className="block text-xs text-dataText mb-1">Antonyms:</strong>
                        <div className="flex flex-wrap gap-1">
                        {current.antonyms.map((ant, i) => (
                            <span
                            key={`ant-${i}`}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                            >
                            {ant}
                            </span>
                        ))}
                        </div>
                    </div>
                    )}
                </>
                )}
            </div>
            </>
        )}
        </div>
    </div>
    
    )
  }
  