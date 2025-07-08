import { useState, useEffect } from "react"
import { IoClose, IoEllipsisHorizontal, IoSearch, IoSettings, IoVolumeMediumSharp, IoSettingsOutline, IoTimeOutline, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import { RiKeyboardBoxLine } from "react-icons/ri";
import { HiOutlineClock, HiOutlineEyeDropper, HiOutlineChatBubbleBottomCenterText, HiOutlineDocumentArrowDown, HiOutlineSparkles } from "react-icons/hi2"
import { IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";
import { GoHeart, GoHeartFill } from "react-icons/go"

import { RxCrossCircled } from "react-icons/rx"
import "~/styles/tailwind.css"


import { useBubbleSize } from "~hooks/useBubbleSize";
import { useHistory } from "~hooks/useHistory"
import { useDictionary } from "~/hooks/useDictionary"
import { useTriggerSettings } from "~hooks/useTriggerSettings";
import { useSourceSettings } from "~hooks/useSourceSettings";
import { MiniDefinitionView } from "~views/tabDefinitionView"
import ContextAIView from "./views/contextAIView"
import { SourcesTab } from "./views/sourcesView"
import { extractContext } from "./context/contextExtractor"

// Source imports
import { definitionSources } from "~sources/definitionSources"


declare global {
  interface Window {
    overscroll: any
  }
}

function IndexPopup() {

  // History hook useStates
  const { saveWord, history, deleteWord, clearHistory, isSaved, toggleSave, autoAddToHistory, setAutoAdd, settingsLoading } = useHistory()

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


  return (
    <div className="flex flex-col shadow-lg w-[330px] h-[600px] overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center bg-[#01122B] p-3 h-70">
        <div className="flex items-center">
          <div className="bg-[#3282B8] text-[#000a1b] font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2">
            W
          </div>
          <span className="text-[#BBE1FA] text-base font-medium lowercase">wordscope</span>
        </div>
        <div className="flex space-x-2">
          {/* Context AI Button */}
          <button
            title="Context AI (Pro)"
            className="text-[#BBE1FA] text-sm hover:text-white"
            onClick={() => {
              const selection = window.getSelection()?.toString().trim()
              if (!selection && !text) {
                alert("Please select a word first!")
                return
              }

              setShowContextAI((prev) => !prev)
              setShowSettings(false)
            }}
          >
            <HiOutlineSparkles size={20} /> {/* swap icon if you prefer */}
            <span className="hidden lg:inline text-sm font-medium">Context AI</span>
          </button>
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick = {() => setShowSettings((prev) => !prev)}><IoSettings size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick={() => window.close()}><IoClose size={24}/></button>
        </div>
      </div>



      {/* Conditionally show ContextAI  */}
      {showContextAI ? (
          <ContextAIView
            word={text}
            contextSnippet={extractContext(text)}
            url={window.location.href}
          />
      ) : showSettings ? (  // Conditionally show settings
        <div className="space-y-6 p-4 text-white bg-[#072141] w-full max-w-md mx-auto overflow-y-auto" style = {{scrollbarWidth: 'none'}}>

          {/* General Settings Title  */}
          <section>
            <div className="flex items-center ml-5 space-x-2 text-lg font-semibold text-white">
              <IoSettingsOutline size={20} />
              <h2>General Settings</h2>
            </div>
          </section>


          {/* History */}
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <HiOutlineClock size={20} />
              <h2>History</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto add words to history</p>
                <p className="text-sm text-gray-400">Automatically save each word you look up.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoAddToHistory} onChange={(e) => setAutoAdd(e.target.checked)}/>
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
              </label>
            </div>
          </section>

          {/* Appearance */}
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <HiOutlineEyeDropper size={20} />
              <h2>Appearance</h2>
            </div>

            {/* Theme colors */}
            <div className="mb-4">
              <p className="font-medium text-white mb-1">Theme color</p>
              <div className="flex items-center space-x-2">
                <button className="w-6 h-6 rounded-full bg-blue-500" />
                <button className="w-6 h-6 rounded-full bg-yellow-400" />
                <button className="w-6 h-6 rounded-full bg-purple-600" />
                <button className="px-2 py-1 border border-gray-500 rounded text-sm">+</button>
                <button className="ml-auto px-3 py-1 bg-[#1c2f47] rounded text-sm">Custom</button>
              </div>
            </div>

            {/* Bubble size */}
            <div>
              <p className="font-medium text-white mb-1">Bubble size</p>
              <div className="flex space-x-2">
                <div>
                  <label className="block text-xs text-gray-400">Width</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-[#01122B] border border-gray-600 rounded text-white outline-none"
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
                  <label className="block text-xs text-gray-400">Height</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-[#01122B] border border-gray-600 rounded text-white outline-none"
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
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <HiOutlineDocumentArrowDown size={20} />
              <h2>Default Export Source</h2>
            </div>
            <select
              value={defaultExportSource}
              onChange={(e) => updateDefaultExportSource(e.target.value)}
              className="w-full px-3 py-2 bg-[#01122B] border border-gray-600 rounded text-white outline-none"
            >
              {Object.keys(definitionSources).map((key) => (
                <option key={key} value={key}>
                  {definitionSources[key].name}
                </option>
              ))}
            </select>
          </section>


          {/* Shortcuts */}
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <HiOutlineChatBubbleBottomCenterText size={20} />
              <h2>Keyboard Shortcuts</h2>
            </div>

            {/* Trigger Method Dropdown */}
            <label className="block text-white mb-1 font-medium">Trigger Method</label>
            <select
              value={triggerMethod}
              onChange={(e) => setTriggerMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#01122B] border border-gray-600 rounded text-white outline-none"
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
                      ? "bg-[#2A4E75] text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setModifierCombo("altClick")}
                >
                  Alt + Click
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    modifierCombo === "cmdClick"
                      ? "bg-[#2A4E75] text-white"
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
                <p className="text-sm text-white mb-2">
                  {isEditing ? "Press your desired key combo:" : "Current key combo:"}
                </p>

                <div className="flex flex-wrap items-center gap-2 bg-[#072141] px-3 py-2 rounded-lg">
                  {customKeyCombo.length === 0 ? (
                    <span className="text-sm text-gray-400">None set</span>
                  ) : (
                    customKeyCombo.map((key) => (
                      <span
                        key={key}
                        className="bg-[#2A4E75] text-white px-2 py-1 rounded-md text-xs font-semibold"
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
        <div className="flex py-2 px-3 bg-[#072141]">
        <input
          type="text"
          value={searchInput}
          placeholder="Search word... "
          className="flex-1 bg-[#112844] text-white placeholder:text-gray-400 px-2 py-2 m-2 rounded-md outline-none"
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
          className="hover:bg-[#1c2f47] px-3 py-2 my-2 rounded-lg text-[#97cbe0]"
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
      <div className="flex space-x-2 p-3 bg-[#01122B]">
          <button className= {`flex-1 px-3 py-2 rounded-md ${
              activeTab === "definitions"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
            onClick = {() => setActiveTab("definitions")} 
          >
            Definitions
          </button>

        <button
            onClick={() => setActiveTab("sources")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "sources"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
          >
            Sources
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-3 py-2 rounded-md ${
              activeTab === "history"
                ? "bg-[#2A4E75] text-[#BBE1FA] font-semibold"
                : "text-[#BBE1FA] hover:bg-[#072141]"
            }`}
          >
            History
          </button>
      </div>

      {/* Main Body */}
      <div className= "flex-1 flex flex-col min-h-0 bg-[#072141] overflow-hidden">

        {/* Conditionally render tabs */}
        
        {activeTab === "definitions" && (
          text === "" ? (
            <div className="text-center text-lg text-gray-400 mt-10 italic">Search a word to get started...</div>
          ) : ( 
          <div className= "flex flex-col flex-1 overflow-hidden ">

            {/* Tabs (source switcher) */}
            <div className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto" style={{ backgroundColor: "#000a1b", scrollbarWidth: 'none'}}>
            {sourceOrder
              .filter((key) => enabledSources[key]) // Only enabled
              .map((key) => {
                const source = definitionSources[key]
                const isActive = key === activeSource

                return (
                  <div key={key}>
                    <div
                      className={`rounded-t-xl py-1 px-2 w-14 h-12 flex items-center justify-center ${
                        isActive ? "bg-[#072141]" : "bg-[#000a1b]"
                      }`}
                    >
                      <button
                        onClick={() => setActiveSource(key as keyof typeof definitionSources)}
                        className={`w-full h-full flex items-center justify-center text-white text-md transition rounded-md ${
                          isActive ? "bg-[#2A4E75]" : "bg-[#072141] hover:bg-[#12233b]"
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

            {/* Main Definition Box */}
            <div className="flex-1 rounded-b-lg p-2 overflow-y-auto" style={{ backgroundColor: "#072141", scrollbarWidth: 'none'}}>
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
              ): (
              <div className="flex-1 flex-col overflow-y-auto space-y-2 rounded-b-lg p-2">
                {/* Word and Phonetic Text */}
                <div className="flex items-center justify-between">

                  {/* Left side  */}
                  <div className="flex items-center flex-1">
                    <h2 className="font-semibold text-white text-lg">{text}</h2>
                    <h2 className="text-sm text-gray-50">{definitions[activeSource]?.phoneticText}</h2>
                    <button
                      title="Play Pronunciation"
                      className="ml-2 mb-1 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
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
                      className="ml-1 mb-1 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
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

                    {showExtras && (
                      <>
                        {definitions[activeSource]?.synonyms?.length > 0 && (
                          <div className="mt-2">
                            <strong className="block text-xs text-white mb-1">Synonyms:</strong>
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
                            <strong className="block text-xs text-white mb-1">Antonyms:</strong>
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
            scrollbarColor: "#2A4E75 #072141", // thumb, track (Firefox)
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch" // enables momentum + bounce on iOS
            
          }}>

            {/* Title  */}
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
                <div key={entry.word} className="py-3 mx-2">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpanded(entry.word)}>
                    <div className="flex items-center justify-between w-full">
                      {/* Left side: the word */}
                        <span className="text-base text-white">{entry.word}</span>

                      {/* Right side: time, link, etc */}
                      <div className="flex flex-col items-end text-xs text-gray-400 space-y-2">
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

                    <button className="text-[#BBE1FA] hover:text-white text-xl mx-2">
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
          }
        
        

      </div>
    </div>
      )}

      

    </div>
  )
}

export default IndexPopup


