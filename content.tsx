
import React, { useEffect, useState, useRef } from "react"
import { IoVolumeMediumSharp, IoSearch, IoPin, IoBook, IoMenu, IoSettings } from "react-icons/io5"

import { createRoot } from "react-dom/client"
import "~/styles/tailwind.css"

// Constant track right click for consistent bubble rendering
let lastRightClickPos = { x: 0, y: 0 }

document.addEventListener("contextmenu", (e) => {
  lastRightClickPos = {
    x: e.clientX,
    y: e.clientY
  }
  console.log("✅ updated lastRightClickPos:", lastRightClickPos)
})


// Sources
const definitionSources = {
  wordsapi: {
    name: "WordsAPI",
    icon: "📘", // or use a proper icon URL
    fetchDefinition: async (word: string) => {
      const headers = {
        "x-rapidapi-key": WORDS_API_KEY,
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      }

      const res = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`, {
        method: "GET",
        headers,
      })
      const json = await res.json()

      const definition = json.definitions
        ?.map((d: any) => `(${d.partOfSpeech}) ${d.definition}`)
        .join("\n") || "No definition."

      return { definition }
    },
    fetchExtras: async (word: string) => {
      const headers = {
        "x-rapidapi-key": WORDS_API_KEY,
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      }

      const [synRes, antRes] = await Promise.all([
        fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`, { method: "GET", headers }),
        fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/antonyms`, { method: "GET", headers }),
      ])

      const synJson = await synRes.json()
      const antJson = await antRes.json()

      return {
        synonyms: synJson?.synonyms ?? [],
        antonyms: antJson?.antonyms ?? [],
        extrasFetched: true
      }
    }
  },
  merriamwebsterapi: {
    name: "MerriamWebsterAPI",
    icon: "📚",
    fetchDefinition: async (word: string) => {
      const res = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${MW_API_KEY}`
      )
      const json = await res.json()

      console.log("json for MW:", json);
  
      if (!Array.isArray(json) || !json[0]) {
        return { definition: "No definition found." }
      }
  
      const shortDefs = json[0]?.shortdef ?? []
      const definition = shortDefs.map((def: string, i: number) => `${i + 1}. ${def}`).join("\n")
  
      // Synonyms and antonyms from the same first call
      const synonyms = json[0]?.meta?.syns?.flat() ?? []
      const antonyms = json[0]?.meta?.ants?.flat() ?? []
  
      return {
        definition,
        synonyms,
        antonyms,
        extrasFetched: true  // because it's all already fetched
      }
    },
    fetchExtras: async (word:string) => {
      return undefined;
    }
  },
  freedicitionaryapi: {
    name: "FreeDictionaryAPI",
    icon: "📙",
    fetchDefinition: async (word: string) => {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      )
      const json = await res.json()

      const data = json[0];

      // Pronunciation
      const phoneticText = data.phonetic || data.phonetics?.[0]?.text || ""
      const pronunciationAudio = data.phonetics?.find(p => p.audio)?.audio || ""

      // Definitions (flattened)
      const definitions = data.meanings.flatMap(meaning =>
        meaning.definitions.map(def => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example,
          synonyms: def.synonyms,
          antonyms: def.antonyms
        }))
      )

      const definition =
        data.meanings
          ?.flatMap((meaning) =>
            meaning.definitions.map(
              (def) => `(${meaning.partOfSpeech}) ${def.definition}`
            )
          )
        .join("\n") || "No definition."

      // Synonyms & Antonyms (combined from all meanings)
      const synonyms = Array.from(
        new Set(definitions.flatMap((def) => def.synonyms || []))
      )
      
      const antonyms = Array.from(
        new Set(definitions.flatMap((def) => def.antonyms || []))
      )

      console.log(synonyms);
      console.log(antonyms);

      // Origin / Etymology
      const origin = data.origin || ""

      return {
        definition,
        synonyms,
        antonyms,
        phoneticText,
        pronunciationAudio,
        extrasFetched: true  // because it's all already fetched
      }
    },
    fetchExtras: async (word:string) => {
      return undefined;
    }
  }
}
  


//Api keys
const WORDS_API_KEY = process.env.PLASMO_PUBLIC_WORDS_API_KEY
const MW_API_KEY = process.env.PLASMO_PUBLIC_MERRIAM_WEBSTER_DICT_API_KEY

console.log("API KEYS: ", WORDS_API_KEY, "|", MW_API_KEY);


const Bubble = () => {

  // Data state variables
  const [text, setText] = useState("")
  const [definitions, setDefinitions] = useState<{
    [key: string]: {
      definition: string
      synonyms?: string[]
      antonyms?: string[]
      phoneticText?: string
      pronunciationAudio?: string
      extrasFetched?: boolean  // only used for sources that fetch extras separately
    }
  }>({})
  const [activeSource, setActiveSource] = useState<keyof typeof definitionSources>("wordsapi")

  // Flags and other state hooks
  const [show, setShow] = useState(false)
  const [showExtras, setShowExtras] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const [isDetached, setIsDetached] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  

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

 

 

  console.log("API_KEY: ", WORDS_API_KEY);

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
        const range = window.getSelection()?.getRangeAt(0)
        const rects = range?.getClientRects()
        rect = rects?.length ? rects[0] : range?.getBoundingClientRect()
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
      
      // setPosition({
      //   x: bestFit.x,
      //   y: bestFit.y
      // })

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
  


  // Handle calling apis for text
  useEffect( () => {
    if (!text) return

    Object.entries(definitionSources).forEach(async ([key, source]) => {
      try {
        const result = await source.fetchDefinition(text)
        console.log("result for", key, result)
        setDefinitions((prev) => ({ ...prev, [key]: result }))
      } catch (err) {
        console.error("Definition fetch error for", key, err)
        setDefinitions((prev) => ({ ...prev, [key]: { definition: "Error fetching definition" } }))
      }
    })
  }, [text]);



  // Handle Bubble Resize
  const repositionBubble = () => {
    console.log("Inside repositionbubble")
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
      console.log("Resized to:", el.offsetWidth, el.offsetHeight)
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
    console.log(popupHeight, popupWidth)
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






  // Handle requests for synonyms/antonyms
  const handleSynonymAntonyms = async () => {
    const current = definitions[activeSource]

    // MerriamWebster already has extras
    if (!current || current.extrasFetched || !definitionSources[activeSource].fetchExtras) {
      setShowExtras((prev) => !prev)
      return
    }

    // Fetch synonyms/antonyms only for APIs that support it
    const extras = await definitionSources[activeSource].fetchExtras?.(text)
    if (extras) {
      setDefinitions((prev) => ({
        ...prev,
        [activeSource]: {
          ...prev[activeSource],
          ...extras
        }
      }))
    }

    setShowExtras(true)
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

    
    
    <div
      ref = {bubbleRef}
      className= "z-[99999] shadow-lg rounded-3xl px-4 pb-2 pt-2 text-sm text-gray-800 overflow-hidden flex flex-col resize"
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
            <button title="History" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoBook size={16} />
            </button>

            {/* Settings */}
            <button title="Settings" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoSettings size={16} />
            </button>

            {/* Sidebar */}
            <button title="Toggle Sidebar" className="p-1 rounded text-[#BBE1FA] hover:bg-[#1c2f47]">
              <IoMenu size={16} />
            </button>

          </div>
        </div>


        {/* Tabs */}
        <div className="flex pt-2 px-2 mt-2 rounded-t-lg" style = {{backgroundColor: '#000a1b'}}>
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
        <div className= "mb-2 rounded-b-lg p-2 overflow-y-auto h-[100%]" style = {{backgroundColor: '#072141'}}> 

          {/* Word and Phonetic Text */}
          <div className="flex items-center">
            <h2 className="font-semibold text-white text-lg mr-2">{text}</h2>
            <h2 className= "text-sm text-gray-50">{definitions[activeSource]?.phoneticText}</h2>
            <button 
              title ="Play Pronunciation" 
              className = "ml-1 mb-3 text-[#9DAFC8] rounded-full hover:bg-gray-300 text-gray-800 hover:text-black transition" 
              onClick={() => {
                const rawUrl = definitions[activeSource]?.pronunciationAudio
                const audioUrl = rawUrl?.startsWith("//") ? "https:" + rawUrl : rawUrl

                if (audioUrl) {
                  const audio = new Audio(audioUrl)
                  audio.play().catch((err) => console.warn("Audio failed to play", err))
                }
                }}> 
              <IoVolumeMediumSharp size = {20}/>
            </button>
          </div>
          <p className="text-xs text-gray-300">Definition for:</p>


          {/* Data Box */}
          <div className="overflow-y-auto" style={{ flex: 1 }}>
            {/* Active definition  */}
            <p className="whitespace-pre-wrap text-sm text-white italic">
              {definitions[activeSource]?.definition ?? "Loading..."}
            </p>

            {/* Conditionally show Synonyms/Antonyms */}
            <p className="whitespace-pre-wrap text-sm italic text-blue-500" onClick = {handleSynonymAntonyms}>
              Show Synonyms and Antonyms
            </p> 

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
          </div>
        
        </div>

      </div>
    </div>
  )
}



// Inject the component into the page
const mount = document.createElement("div")
document.body.appendChild(mount)
createRoot(mount).render(<Bubble />)
