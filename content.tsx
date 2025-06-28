
import React, { useEffect, useState, useRef } from "react"
import { IoVolumeMediumSharp, IoTimeOutline, IoSearch, IoPin, IoBook, IoMenu, IoSettings, IoTrashSharp, IoTrashOutline } from "react-icons/io5"
import { BiDockLeft, BiDockRight } from "react-icons/bi"
import { LuDock } from "react-icons/lu"
import { IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";

import { createRoot } from "react-dom/client"
import "~/styles/tailwind.css"

//Dependency imports
import { definitionSources } from "~sources/definitionSources"
import { useDictionary } from "~hooks/useDictionary"
import { useHistory } from "~hooks/useHistory"
import { MiniDefinitionView } from "tabDefinitionView"

// Constant track right click for consistent bubble rendering
let lastRightClickPos = { x: 0, y: 0 }

document.addEventListener("contextmenu", (e) => {
  lastRightClickPos = {
    x: e.clientX,
    y: e.clientY
  }
  console.log(" updated lastRightClickPos:", lastRightClickPos)
})


const Bubble = () => {

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


  // Flags and other state hooks
  const [show, setShow] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const rangeRef = useRef<Range | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const [isDetached, setIsDetached] = useState(false)
  const [hovered, setHovered] = useState(false)

  const [searchInput, setSearchInput] = useState("")

  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  

  //Selection coords
  const [rectLeft, setRectLeft] = useState(0);
  const [rectRight, setRectRight] = useState(0);
  const [rectTop, setRectTop] = useState(0);
  const [rectBottom, setRectBottom] = useState(0);
  const [rectWidth, setRectWidth] = useState(0);
  const [rectHeight, setRectHeight] = useState(0);

  // Bubble coords
  const [arrowDirection, setArrowDirection] = useState<"top" | "bottom" | "left" | "right">("bottom")
  const [popupHeight, setPopupHeight] = useState(335)
  const [popupWidth, setPopupWidth] = useState(500);

  // Docking state
  const [dockPosition, setDockPosition] = useState<"none" | "left" | "right" | "top" | "bottom">("none")


 


  useEffect(() => {
    const checkAndShowBubble = (e?: MouseEvent | Event, forcedText?: string, forcedMousePos?: { x: number; y: number }) => {
      // Optional modifier check if triggered by mouse event
      if (e instanceof MouseEvent && !e.ctrlKey && !e.metaKey && !forcedText) return;


      const selection = forcedText || window.getSelection()?.toString().trim();
      if (!selection) return

      let rect

      // If a forced selection was passed from contextMenu, we approximate position
      if (forcedText) {
        rect = { 
          left: forcedMousePos.x,
          top: forcedMousePos.y,
          right: forcedMousePos.x,
          bottom: forcedMousePos.y,
          width: 0,
          height: 0 }
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
          y: rect.top + scrollY + rect.height/2 - popupHeight/2,
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
          y: rect.top + scrollY + rect.height/2 - popupHeight/2,
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

      setPosition({ x: clampedX, y: clampedY })

      setRectLeft(rect.left)
      setRectRight(rect.right)
      setRectTop(rect.top)
      setRectBottom(rect.bottom)
      setRectWidth(rect.width)
      setRectHeight(rect.height)

      setArrowDirection(bestFit.direction as "top" | "bottom" | "left" | "right")
      
      setText(selectedText)

      // Trigger reflow for animation
      requestAnimationFrame(() => {
        setShow(true)
      })
  
    }
  
    const observer = new MutationObserver(() => {
      console.log("DOM changed - SPA activity detected")
      checkAndShowBubble()
    });

    document.addEventListener("click", checkAndShowBubble);

    // 🚀 Listen for messages from background script (context menu trigger)
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "LOOKUP_WORDSCOPE" && msg.text) {
        checkAndShowBubble(undefined, msg.text, lastRightClickPos)
      }
    })

   
    // document.addEventListener("mouseup", checkAndShowBubble)
    // document.addEventListener("selectionchange", checkAndShowBubble)
    // observer.observe(document.body, { childList: true, subtree: true })
  
    return () => {
      document.removeEventListener("click", checkAndShowBubble)
      // document.removeEventListener("mouseup", checkAndShowBubble)
      // document.removeEventListener("selectionchange", checkAndShowBubble)
      // observer.disconnect()
    }
  }, [])
  



  // Handle Bubble Resize
  const repositionBubble = () => {
    
    if (!bubbleRef.current) return
  
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

    setRectLeft(rect.left)
    setRectRight(rect.right)
    setRectTop(rect.top)
    setRectBottom(rect.bottom)
    setRectWidth(rect.width)
    setRectHeight(rect.height)
  
    const candidates = [
      {
        direction: "bottom",
        fits: vh - rectBottom >= height + offset,
        x: rectLeft + scrollX + rectWidth / 2 - width / 2,
        y: rectBottom + scrollY + offset
      },
      {
        direction: "right",
        fits: vw - rectRight >= width + offset,
        x: rectRight + scrollX + offset,
        y: rectTop + scrollY + rectHeight / 2 - height / 2
      },
      {
        direction: "left",
        fits: rectLeft >= width + offset,
        x: rectLeft + scrollX - width - offset,
        y: rectTop + scrollY + rectHeight / 2 - height / 2
      },
      {
        direction: "top",
        fits: rectTop >= height + offset,
        x: rectLeft + scrollX + rectWidth / 2 - width / 2,
        y: rectTop + scrollY - height - offset
      }
    ]
  
    const bestFit = candidates.find((c) => c.fits) || candidates[0]
  
    const clampedX = Math.max(scrollX, Math.min(bestFit.x, scrollX + vw - width))
    const clampedY = Math.max(scrollY, Math.min(bestFit.y, scrollY + vh - height))
  
    setPosition({ x: clampedX, y: clampedY })
    setArrowDirection(bestFit.direction as "top" | "bottom" | "left" | "right")
  }



  // Resize Observer for calling repositionBubble()
  useEffect(() => {
    const el = bubbleRef.current
    if (!el) return;
  
    const resizeObserver = new ResizeObserver(() => {
      if (isDetached || isDragging.current) return // Only reposition based on resizing if not detached
      // Update bubble size
      repositionBubble()
    })
  
    resizeObserver.observe(bubbleRef.current)
  
    return () => {
      resizeObserver.disconnect()
    }
  }, [repositionBubble])
  



  // Handle event click anywhere else on screen
  useEffect( () => {
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

      if (!isInside){
        setShow(false);
        setIsDetached(false);
      }
    };

    // Delay adding the listener to avoid triggering it on the same event
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
    
  }, []);

  // Drag handler functions
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true
    setIsDetached(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  
    document.addEventListener("mousemove", handleDragging)
    document.addEventListener("mouseup", handleDragEnd)
  }
  
  const handleDragging = (e: MouseEvent) => {
    if (!isDragging.current) return
  
    setPosition({
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
    if (text && Object.keys(definitions).length > 0) {
      saveWord(text, definitions)
    }
  }, [text, definitions])


  // On delete button press 
  const handleDelete = ( (word: string) => {
    deleteWord(word);
  })



  // Trigger side panel
  const openPanel = async () => {
    
      console.log("Trying panel");
      
      chrome.runtime.sendMessage({ type: "open_side_panel" });
  }


  

  
  if (!show) return null

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  return (
    <div>
      
      {/* Carrot Arrow Rendering */}
      {!isDetached && arrowDirection === "top" && (
        <div
          className="absolute z-[99999]"
          style={{
            left: `${rectLeft + rectWidth / 2 - 6}px`, // 6 = half carrot width
            top: `${rectTop - 12}px`,
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: "9px solid #01122B" // triangle points down into the bubble
          }}
        />
      )}

      {!isDetached && arrowDirection === "bottom" && (
        <div
          className="absolute z-[99999]"
          style={{
            left: `${rectLeft + rectWidth / 2 - 6}px`,
            top: `${rectBottom + 3}px`,
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "9px solid #01122B" // triangle points down into the bubble
          }}
        />
      )}

      {!isDetached && arrowDirection === "left" && (
        <div
          className="absolute z-[99999]"
          style={{
            top: `${rectTop + rectHeight / 2 - 6}px`,
            left: `${rectLeft - 12}px`,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderLeft: "9px solid #01122B" // triangle points down into the bubble

          }}
        />
      )}

      {!isDetached && arrowDirection === "right" && (
        <div
          className="absolute z-[99999]"
          style={{
            top: `${rectTop + rectHeight / 2 - 6}px`,
            left: `${rectRight + 3}px`,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderRight: "9px solid #01122B" // triangle points down into the bubble
          }}
        />
      )}

    
    
    {/* Bubble box */}
    <div
      ref = {bubbleRef}
      className= "z-[99999] shadow-lg rounded-3xl px-4 pb-4 pt-2 text-sm text-gray-800 overflow-hidden flex flex-col resize"
      style={{ 
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.2)" ,
        height: `${popupHeight}px`,
        width: `${popupWidth}px`,
        backgroundColor: '#01122B',

         // Resize limits
        minWidth: "200px",
        maxWidth: viewportWidth,
        minHeight: "100px",
        maxHeight: viewportHeight
      }}
    >


        {/* Drag Handle */}
        <div
            className= "mx-auto top-0 cursor-move px-3 py-1 rounded-md select-none w-3/4 mb-3"
            onMouseDown={handleDragStart}
            style = {{backgroundColor: '#112844' }}
          >

        </div>


        {/* Utility Buttons Row */}
        <div className="flex items-center justify-between px-2 py-1 mb-1 bg-[#072141] rounded-md text-[#9DAFC8]">
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
                setText(searchInput.trim())
                setSearchInput("")
              }}
            >
              <IoSearch size={16} />
            </button>
            
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">

            {/* Pin */}
            <button title="Pin" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoPin size={16} />
            </button>

            {/* History */}
            <button title="History" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]" onClick = {() => setShowHistory((prev) => !prev)}>
              <IoBook size={16} />
            </button>

            {/* Settings */}
            <button title="Settings" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoSettings size={16} />
            </button>

            {/* Sidebar */}
            {/* <button title="Toggle Sidebar" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoMenu size={16} />
            </button> */}
            {/* <div className="relative group"> */}
            <button onClick= { openPanel} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"> {/*onClick={() => openPanel("left")}*/}
              <LuDock />
            </button>
              {/* <div className="absolute inset-0 group-hover:flex hidden justify-between items-center">
                <button onClick={() => openPanel("left")}><BiDockLeft /></button>
                <button onClick={() => openPanel("right")}><BiDockRight /></button>
              </div> */}
            {/* </div> */}


          </div>
        </div>


        

        

        {showHistory ? (
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
                      <div className="flex items-center gap-2 text-xs text-gray-400">
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

                    <button className="text-[#BBE1FA] text-xl ml-2">
                      {isOpen ? <IoMdArrowDropup/> : <IoMdArrowDropdown/>}
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => deleteWord(entry.word)}
                      title="Delete this word"
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      {hovered ? <IoTrashSharp size={16} /> : <IoTrashOutline size={16} />}
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
              <div className="flex pt-2 px-2 mt-2 rounded-t-lg overflow-x-auto" style = {{backgroundColor: '#000a1b', scrollbarWidth: 'thin'}}>
              {Object.entries(definitionSources).map(([key, source]) => {
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
            <div className="flex flex-col items-center justify-center h-full text-white">
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
                  <h2 className="font-semibold text-white text-lg mr-2">{text}</h2>
                  <h2 className="text-sm text-gray-50">{definitions['freedictionaryapi']?.phoneticText}</h2>
                  <button
                    title="Play Pronunciation"
                    className="ml-1 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
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
                    className="ml-3 mb-3 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
                    onClick={() => {
                      const audioUrl = definitions['linguarobotapi']?.pronunciationAudio
                  
                      const audio = new Audio(audioUrl)
                      audio.play().catch((err) => console.warn("Audio failed to play", err))
                    }}
                  >
                    <IoVolumeMediumSharp size={20} />
                  </button>

                </div>

                <p className="text-xs text-gray-300">Definition for:</p>

                {/* Definitions */}
                <div className="space-y-3">
                  {definitions[activeSource]?.definition
                    ?.split("\n")
                    .map((line, idx) => (
                      <div key={idx} className="border-b border-gray-600 pb-3">
                        <p className="text-sm text-white italic">{line}</p>
                      </div>
                    )) ?? (
                      <p className="text-sm text-white italic">Loading...</p>
                    )}
                </div>

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
                

              </div>// start of word data
            )}
          </div>  {/* main text div */}
          
        </div> //Main box (aside from history rendering)
        )}








      </div>
    </div>
  )
}



// Inject the component into the page
const mount = document.createElement("div")
document.body.appendChild(mount)
createRoot(mount).render(<Bubble />)
