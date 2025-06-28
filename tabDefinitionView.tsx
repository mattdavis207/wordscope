import React, { useEffect, useState, useRef } from "react"
import { IoVolumeMediumSharp } from "react-icons/io5"
import type { DefinitionRecord } from "~hooks/useHistory"
import { definitionSources } from "~sources/definitionSources"
import { useDictionary } from "~hooks/useDictionary"



export const MiniDefinitionView = ({
    word,
    sources
  }: {
    word: string
    sources: DefinitionRecord["sources"]
  }) => {
    const [activeSource, setActiveSource] = useState<keyof typeof sources>(
      Object.keys(sources)[0] as any
    )
    const current = sources[activeSource]

    const {
        showExtras,
        handleSynonymAntonyms
      } = useDictionary<typeof definitionSources>(definitionSources)
  
    return (
    <div>
        {/* Tabs */}
            <div className="flex pt-2 px-2 mt-2 rounded-t-lg over-x-auto" style = {{backgroundColor: '#000a1b', scrollbarWidth: 'thin'}}>
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
        <div className="mb-2 rounded-b-lg p-2 overflow-y-auto h-[100%]" style={{ backgroundColor: '#072141' }}>
        {activeSource === "youglish" ? (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <h2 className="text-lg font-semibold mb-4">YouGlish Pronunciation</h2>
            
            <p className="text-sm text-gray-300 mb-2 text-center">
            Click the button below to hear real-world examples of how <strong>{word}</strong> is pronounced in English.
            </p>
            
            <a
            href={`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
            🔊 Open YouGlish
            </a>
        </div>
        ) : (
            <>
            {/* Word and Phonetic Text */}
            <div className="flex items-center">
                <h2 className="font-semibold text-white text-lg mr-2">{word}</h2>
                <h2 className="text-sm text-gray-50">{sources['freedictionaryapi']?.phoneticText}</h2>
                <button
                title="Play Pronunciation"
                className="ml-1 mb-3 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
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
                className="ml-3 mb-3 rounded-full hover:bg-gray-300 text-[#BBE1FA] hover:text-[#1c2f47]"
                onClick={() => {
                    const audioUrl = sources['linguarobotapi']?.pronunciationAudio
                
                    const audio = new Audio(audioUrl)
                    audio.play().catch((err) => console.warn("Audio failed to play", err))
                }}
                >
                <IoVolumeMediumSharp size={20} />
                </button>

            </div>

            <p className="text-xs text-gray-300">Definition for:</p>

            {/* Data Box */}
            <div className="overflow-y-auto" style={{ flex: 1 }}>
                <p className="whitespace-pre-wrap text-sm text-white italic">
                {current?.definition ?? "Loading..."}
                </p>

                <p className="whitespace-pre-wrap text-sm italic text-blue-500" onClick={handleSynonymAntonyms}>
                Show Synonyms and Antonyms
                </p>

                {showExtras && (
                <>
                    {current?.synonyms?.length > 0 && (
                    <div className="mt-2">
                        <strong className="block text-xs text-white mb-1">Synonyms:</strong>
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
                        <strong className="block text-xs text-white mb-1">Antonyms:</strong>
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
  