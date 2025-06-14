export {}

import React, { useEffect, useState, useRef } from "react"
import { createRoot } from "react-dom/client"
import "~/styles/tailwind.css"

const Bubble = () => {
  const [text, setText] = useState("")
  const [definition, setDefinition] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const bubbleRef = useRef<HTMLDivElement | null>(null)

  const API_KEY = process.env.PLASMO_PUBLIC_API_KEY;

  console.log("API_KEY: ", API_KEY);

  useEffect(() => {
    const handleCtrlClick = (e: MouseEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      // Extract highlighted text
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()

      // Set text and set position and show flag for banner box
      if (selectedText) {
        setText(selectedText)
        setPosition({ x: e.pageX, y: e.pageY })
        setShow(true)

      }
    }

    document.addEventListener("click", handleCtrlClick)
    return () => document.removeEventListener("click", handleCtrlClick)
  }, [])

  useEffect(() => {
    const fetchDefinition = async () => {
      const url = `https://wordsapiv1.p.rapidapi.com/words/${text}/definitions`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();


        console.log("Full result:", result)
        // Safely access definitions
        if (result?.definitions?.length > 0) {
          const formatted = result.definitions.map(
            (def: { definition: string; partOfSpeech: string }, idx: number) =>
              `${idx + 1}. (${def.partOfSpeech}) ${def.definition}`
          ).join('\n')

          console.log("metadata", result);
          setDefinition(formatted || "No definition found.")

        } else {
          setDefinition("No definition found.")
        }

        console.log(result);
      } catch (error) {
        console.error(error);
        setDefinition("Error fetching definition.")
      }

    }
    fetchDefinition()
  }, [text] )


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
      }
    };

    // Delay adding the listener to avoid triggering it on the same event
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
    
  }, []);



  if (!show) return null

  return (
    <div
      ref = {bubbleRef}
      className="absolute z-[9999] bg-white border border-gray-300 shadow-lg rounded-md p-3 text-sm text-gray-800 w-[250px]"
      style={{ top: position.y + 10, left: position.x + 10 }}
    >
      <p className="text-xs text-gray-500">Definition for:</p>
      <h2 className="font-semibold">{text}</h2>
      <p className="mt-2 italic">
        {definition ?? "Looking up..."}
      </p>
    </div>
  )
}

// Inject the component into the page
const mount = document.createElement("div")
document.body.appendChild(mount)
createRoot(mount).render(<Bubble />)
