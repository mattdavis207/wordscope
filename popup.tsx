import { useState, useEffect } from "react"
import { IoClose, IoEllipsisHorizontal, IoSearch, IoSettings, IoVolumeMediumSharp, IoSettingsOutline } from "react-icons/io5"

import { IoTimeOutline, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import {  } from "react-icons/io5"
import { HiOutlineClock, HiOutlineEyeDropper, HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2"
import { IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";
import "~/styles/tailwind.css"
import { useHistory } from "~hooks/useHistory"
import { useDictionary } from "~/hooks/useDictionary"
import { MiniDefinitionView } from "~tabDefinitionView"

// Source imports
import { definitionSources } from "~/sources/definitionSources"


function IndexPopup() {

  // History hook useStates
  const { saveWord, history, deleteWord, clearHistory } = useHistory()

  const {
    text,
    setText,
    definitions,
    activeSource,
    setActiveSource,
    showExtras,
    handleSynonymAntonyms
  } = useDictionary<typeof definitionSources>(definitionSources)


  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [activeTab, setActiveTab] = useState("definitions")
  const [hoverTrash, setHoverTrash] = useState(false)
  const [showSettings, setShowSettings] = useState(false);



  // Toggle for minidefinition view for saved word
  const toggleExpanded = (word: string) => {
    setExpandedWord((prev) => (prev === word ? null : word))
  }


  // useEffect for saving word to history records
  useEffect(() => {
    if (text && Object.keys(definitions).length > 0) {
      saveWord(text, definitions)
    }
  }, [text, definitions])


  // On delete button press 
  const handleDelete = ( (word: string) => {
    deleteWord(word);
  })





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
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick = {() => setShowSettings((prev) => !prev)}><IoSettings size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white"><IoEllipsisHorizontal size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick={() => window.close()}><IoClose size={20}/></button>
        </div>
      </div>



      {/* Conditionally show settings  */}
      {showSettings ? (
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
                <input type="checkbox" className="sr-only peer" />
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
                    defaultValue={250}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Height</label>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 bg-[#01122B] border border-gray-600 rounded text-white outline-none"
                    defaultValue={150}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Behavior */}
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <IoSettingsOutline size={20} />
              <h2>Behavior</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable keyboard-only mode</p>
                <p className="text-sm text-gray-400">Activate with keyboard shortcuts only.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
              </label>
            </div>
          </section>

          {/* Shortcuts */}
          <section className="p-4 bg-[#01122B] rounded-lg">
            <div className="flex items-center mb-2 space-x-2 text-lg font-semibold text-white">
              <HiOutlineChatBubbleBottomCenterText size={20} />
              <h2>Keyboard Shortcuts</h2>
            </div>
            <div>
              <label className="block text-white mb-1 font-medium">Trigger method</label>
              <select className="w-full px-3 py-2 bg-[#01122B] border border-gray-600 rounded text-white outline-none">
                <option>Double click</option>
                <option>Triple click</option>
                <option>Key combo</option>
              </select>
            </div>
          </section>
        </div>
      
      ): (

      // Renders the Search and main tabs 
      <div className="flex-1 flex flex-col"> 
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
              setActiveSource("wordsapi")
              setActiveTab("definitions")
              setText(searchInput.trim())
              setSearchInput("")
            }
          }}
        />
        <button 
          className="hover:bg-[#1c2f47] px-3 py-2 my-2 rounded-lg text-[#97cbe0]"
          onClick={() => {
              setActiveSource("wordsapi")
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
              {Object.entries(definitionSources).map(([key, source]) => {
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
            <div className="flex-1 mb-2 rounded-b-lg p-2 overflow-y-auto" style={{ backgroundColor: "#072141", scrollbarWidth: 'none'}}>
              <div className="flex items-center">
                <h2 className="font-semibold text-white text-lg mr-2">{text}</h2>
                <h2 className="text-sm text-gray-50">{definitions[activeSource]?.phoneticText}</h2>
                <button
                  title="Play Pronunciation"
                  className="ml-1 mb-3 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
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
              </div>
              <p className="text-xs text-gray-300">Definition for:</p>

              <p className="whitespace-pre-wrap text-sm text-white italic">
                {definitions[activeSource]?.definition ?? "Loading..."}
              </p>

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
            </div>
          </div>
        ))}
        {activeTab === "sources" && <div>Sources content here</div>}

        {/* History content */}
        {activeTab === "history" && 
          <div className="flex-1 mt-2 rounded-lg p-2 overflow-y-auto">

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

                    <button className="text-[#BBE1FA] text-xl mx-2">
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


