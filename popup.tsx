import { useState } from "react"
import { IoClose, IoEllipsisHorizontal, IoSearch, IoSettings, IoVolumeMediumSharp } from "react-icons/io5"
import "~/styles/tailwind.css"

// Source imports
import { useDictionary } from "~/hooks/useDictionary"
import { definitionSources } from "~/sources/definitionSources"


function IndexPopup() {
  const [data, setData] = useState("")

  const {
    text,
    setText,
    definitions,
    activeSource,
    setActiveSource,
    showExtras,
    handleSynonymAntonyms
  } = useDictionary<typeof definitionSources>(definitionSources)


  const [searchInput, setSearchInput] = useState("")
  const [activeTab, setActiveTab] = useState("definitions")

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
          <button className="text-[#BBE1FA] text-sm hover:text-white"><IoSettings size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white"><IoEllipsisHorizontal size={20}/></button>
          <button className="text-[#BBE1FA] text-sm hover:text-white" onClick={() => window.close()}><IoClose size={20}/></button>
        </div>
      </div>


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
              setText(searchInput.trim())
              setSearchInput("")
            }
          }}
        />
        <button 
          className="hover:bg-[#1c2f47] px-3 py-2 my-2 rounded-lg text-[#97cbe0]"
          onClick={() => {
              setText(searchInput.trim())
              setSearchInput("")
            }}
          >
          <IoSearch size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-3 bg-[#000a1b]">
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
            <div className="text-center text-gray-400 mt-10 italic">Search a word to get started...</div>
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
        {activeTab === "sources" && <div>Source content here</div>}
        {activeTab === "history" && <div>History content here</div>}
        

      </div>

    </div>
  )
}

export default IndexPopup


