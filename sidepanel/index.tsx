import { useState, useEffect } from "react"
import { IoVolumeMediumSharp, IoTimeOutline, IoSearch, IoPin, IoBook, IoSettings, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { HiMiniChatBubbleBottomCenterText, HiOutlineSparkles } from "react-icons/hi2";
import { GoHeart, GoHeartFill } from "react-icons/go"
import React from "react"
import "~/styles/tailwind.css"



//Dependency imports
import { definitionSources } from "~sources/definitionSources"
import { useDictionary } from "~hooks/useDictionary"
import { useHistory } from "~hooks/useHistory"
import { useSourceSettings } from "~hooks/useSourceSettings";
import ContextAIView from "../views/contextAIView"
import { extractContext } from "../context/contextExtractor"
import { MiniDefinitionView } from "~views/tabDefinitionView"


const SidePanel = () => {
    // History hook useStates
    const { saveWord, history, deleteWord, clearHistory, isSaved, autoAddToHistory, toggleSave} = useHistory()

    const {
    text,
    setText,
    definitions,
    activeSource,
    setActiveSource,
    showExtras,
    handleSynonymAntonyms
    } = useDictionary<typeof definitionSources>(definitionSources)

    // Source Settings
    const {
    sourceOrder,
    enabledSources,
    } = useSourceSettings()

    const [expandedWord, setExpandedWord] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState("")
    const [showHistory, setShowHistory] = useState(false)
    const [showContextAI, setShowContextAI] = useState(false)
    const [hoverTrash, setHoverTrash] = useState(false)
    

    // Toggle for minidefinition view for saved word
    const toggleExpanded = (word: string) => {
    setExpandedWord((prev) => (prev === word ? null : word))
    }

    // useEffect for saving word to history records
    useEffect(() => {
    if (text && Object.keys(definitions).length > 0 && autoAddToHistory && !isSaved(text)){
        saveWord(text, definitions)
    }
    }, [text, definitions, autoAddToHistory])


    // useEffect for transferring word from bubble
    useEffect(() => {
        chrome.runtime.onMessage.addListener((msg) => {
          if (msg.type === "word_from_bubble") {
            setText(msg.word)
            setSearchInput("") // if you use it
          }
        })
    }, [])


    // useEffect for detecting sidepanel close
    useEffect(() => {
        const markClosed = () => {
            chrome.storage.local.set({ sidePanelClosed: true })
          }
        
        window.addEventListener("unload", markClosed)
        return () => window.removeEventListener("unload", markClosed)
    }, [])


  return (
    <div 
        className= "h-[100%] flex flex-col overflow-y-auto text-sm text-gray-800 shadow-lg px-4 pb-4 pt-2" 
        style={{ color: "#fff", background: "#01122B" }
    }>
        
        {/* Search and Utility Buttons Row */}
        <div className="flex items-center justify-between px-2 py-1 mb-2 bg-[#072141] rounded-md text-[#9DAFC8]">
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
                        setShowHistory(false)
                        setText(searchInput.trim())
                        setSearchInput("")
                    }
                }}
                className="px-2 py-1 text-sm bg-[#112844] text-white rounded placeholder:text-gray-400 outline-none w-[150px]"
                />
                
                <button
                title="Search"
                className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]"
                onClick={(e) => {
                    // Reset active tab to first enabled
                    const firstEnabled = sourceOrder.find((key) => enabledSources[key])
                    if (firstEnabled) {
                        setActiveSource(firstEnabled as keyof typeof definitionSources)
                    }
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

                {/* Context AI Button */}
                <button
                    title="Context AI (Pro)"
                    className="p-1 flex items-center gap-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47] transition-colors duration-200"
                    onClick={() => {
                    const selection = window.getSelection()?.toString().trim()
                    if (!selection && !text) {
                        alert("Please select a word first!")
                        return
                    }
    
                    setShowContextAI((prev) => !prev)
                    setShowHistory(false)
                    }}
                >
                    <HiOutlineSparkles size={18} /> {/* swap icon if you prefer */}
                    <span className="hidden lg:inline text-sm font-medium">Context AI</span>
                </button>

                {/* History */}
                <button title="History" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]" onClick = {() => setShowHistory((prev) => !prev)}>
                <IoBook size={16} />
                </button>

            </div>
        </div>

        {/* Return to Bubble Button  */}
        <button 
            className="flex items-center justify-center gap-2 px-2 py-2 mb-2 bg-[#072141] rounded text-[#BBE1FA] hover:bg-[#1c2f47]"
            title = "Reeturn to Bubble"
            onClick={async () => {
                await chrome.storage.local.set({ fromSidePanel: { word: text } })
                // chrome.runtime.sendMessage({ type: "side_panel_closed" })
                window.close() // closes the panel
            }}>
            <HiMiniChatBubbleBottomCenterText size = {20} />
            <span>Return to Bubble</span>
            
        </button>

        

        {showContextAI ? (
          <ContextAIView
            word={text}
            contextSnippet={extractContext(text)}
            url={window.location.href}
          />
        ): showHistory ? (
            <div className="flex-1 bg-[#072141] border border-gray-700 mt-2 rounded-lg p-2 overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#BBE1FA] mb-4 flex items-center gap-2">
                <IoTimeOutline className="text-[#BBE1FA]" /> Recent Dictionary Lookups
            </h2>

            {/* Divider between title and words  */}
            <div className="divide-y divide-[#1c2f47]">
                {history.map((entry) => {
                const isOpen = expandedWord === entry.word
                const timestamp = new Date(entry.timestamp).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                })

                return(
                <div key={entry.word} className="py-3 mr-2">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpanded(entry.word)}>
                    <div className="flex items-center justify-between w-full">
                        {/* Left side: the word */}
                        <span className="text-base text-white">{entry.word}</span>

                        {/* Right side: time, link, etc */}
                        <div className="flex flex-col text-xs text-gray-400 space-y-2">
                            <span className="text-xs text-gray-400">{timestamp}</span>
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

                    <button className="text-[#BBE1FA] hover:text-white text-xl ml-2">
                        {isOpen ? <IoMdArrowDropup/> : <IoMdArrowDropdown/>}
                    </button>

                    {/* Delete Icon */}
                    <button
                        onClick={() => deleteWord(entry.word)}
                        title="Delete this word"
                        className="text-gray-400 hover:text-red-600 transition"
                    >
                        {hoverTrash ? <IoTrashSharp size={16} /> : <IoTrashOutline size={16} />}
                    </button>

                    </div>

                    {isOpen && (
                    <div className="bg-[#072141] rounded-lg">
                        <MiniDefinitionView word={entry.word} sources={entry.sources} />
                    </div>
                    )}
                </div>
                )
            })}
            </div>
            </div>
        ) : (
            
            
            <div className = "overflow-hidden rounded-b-lg h-[100%]">
            {/* Tabs */}
                <div className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto" style = {{backgroundColor: '#000a1b', scrollbarWidth: 'none'}}>
                {sourceOrder
                .filter((key) => enabledSources[key]) // Only enabled
                .map((key) => {
                    const source = definitionSources[key]
                    const isActive = key === activeSource
                
                return(
                <div key={key} >
                    <div
                    className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${
                        isActive ? "bg-[#072141]" : "bg-[#000a1b]"
                    }`}
                    >
                    <button
                        onClick={() => setActiveSource(key as keyof typeof definitionSources)}
                        className={`w-full h-full flex items-center justify-center text-white text-md transition rounded-md ${
                        isActive
                            ? "bg-[#2A4E75]"
                            : "bg-[#072141] hover:bg-[#12233b]"
                        }`}
                        title={source.name}
                    >
                        {source.icon}
                    </button>
                    </div>
                </div>
                )  
            
                })}

            </div>


            {/* Main Text */}
            <div className="flex-1 mb-2 rounded-b-lg p-2 h-[100%]" style={{ backgroundColor: '#072141' }}>
                {activeSource === "youglish" ? (
                <div className="flex flex-col items-center h-full text-white">
                    <h2 className="text-lg font-semibold mb-4">YouGlish Pronunciation</h2>
                    
                    <p className="text-sm text-gray-300 mb-2 text-center">
                    Click the button below to hear real-world examples of how <strong>{text}</strong> is pronounced in English.
                    </p>
                    
                    <a
                    href={`https://youglish.com/pronounce/${encodeURIComponent(text)}/english`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                    >
                    🔊 Open YouGlish
                    </a>
                </div>
            ) : (
                <div className = "flex flex-col overflow-y-auto h-full space-y-2">
                {/* Word and Phonetic Text */}
                <div className="flex items-center">

                    {/* Left side  */}
                    <div className="flex items-center flex-1">
                        <h2 className="font-semibold text-white text-lg mr-2">{text}</h2>
                        <h2 className="text-sm text-gray-50">{definitions['freedictionaryapi']?.phoneticText}</h2>
                        <button
                        title="Play Pronunciation"
                        className="ml-2 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
                        onClick={() => {
                            const rawUrl = definitions['freedictionaryapi']?.pronunciationAudio
                            // Use speech synthesis if no audio from freedictionaryapi
                            if (!rawUrl) {
                            // Fallback to Web Speech API
                            const utterance = new SpeechSynthesisUtterance(text)
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
                    className="ml-1 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
                    onClick={() => {
                        const audioUrl = definitions['linguarobotapi']?.pronunciationAudio
                    
                        const audio = new Audio(audioUrl)
                        audio.play().catch((err) => console.warn("Audio failed to play", err))
                    }}
                    >
                    <IoVolumeMediumSharp size={20} />
                    </button>
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

                <p className="text-xs text-gray-300">Definition for:</p>

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
                          <p className="text-sm text-white italic">{line}</p>
                        </div>
                      )) ?? (
                        <p className="text-sm text-white italic">Loading...</p>
                    )}
                </div>

                {activeSource !== "duckduckgo" && (
                    <>
                        <p className="whitespace-pre-wrap text-sm italic text-blue-500" onClick={handleSynonymAntonyms}>
                            Show Synonyms and Antonyms
                        </p>
                        
                        {/* Synonyms and Antyonyms */}
                        {showExtras && (
                            <>
                            {definitions[activeSource]?.synonyms?.length > 0 && (
                                <div className="mt-2">
                                <strong className="block text-xs text-white mb-1">Synonyms:</strong>
                                <div className="flex flex-wrap gap-1">
                                    {definitions[activeSource].synonyms.map((syn, i) => (
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

                            {definitions[activeSource]?.antonyms?.length > 0 && (
                                <div className="mt-2">
                                <strong className="block text-xs text-white mb-1">Antonyms:</strong>
                                <div className="flex flex-wrap gap-1">
                                    {definitions[activeSource].antonyms.map((ant, i) => (
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
                    </>
                )}
                

                </div>// start of word data
            )}
            </div>  {/* main text div */}
            
        </div> //Main box (aside from history rendering)
        )}

    </div>
  )
}

export default SidePanel
