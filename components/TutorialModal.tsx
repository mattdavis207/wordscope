import {useState, useEffect } from "react"

import { IoMdLock, IoMdUnlock, IoMdMagnet } from "react-icons/io"
import { IoSearch, IoBook } from "react-icons/io5"
import { FaCog, FaHandsHelping, FaGlobe, FaHeart, FaStar, FaHandHoldingUsd } from "react-icons/fa"
import { HiOutlineSparkles } from "react-icons/hi" 
import { BiSolidDockRight } from "react-icons/bi"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"


export const TutorialModal = ({ onClose, setShowDonate, showDonate}: { onClose: () => void, showDonate: boolean, setShowDonate: React.Dispatch<React.SetStateAction<boolean>> }) => {

    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    const steps = [
        {
          title: "📖 Welcome to Your Extension",
          description: "This extension helps you look up words, synonyms, and more directly on any webpage. Fast, clean, and powerful.",
          image: "/images/tutorial/welcome.png" // placeholder image
        },
        {
          title: "🔍 Popup Overview",
          description: "Use the popup to search words, view definitions from multiple sources, and configure settings like themes and hotkeys.",
          image: "/images/tutorial/popup-overview.png"
        },
        {
          title: "📚 Tabs & Sources",
          description: "Each tab represents a dictionary source. Tap a tab to switch between Free Dictionary, Wordnik, Wiktionary, and more.",
          image: "/images/tutorial/tabs.png"
        },
        {
          title: "🛠️ Bubble Utility Buttons",
          description: "Learn what each button in the bubble does to maximize your workflow.",
          custom: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IoSearch size={20} className="text-text" />
                <span className="text-sm text-dataText">Search – Enter a word manually</span>
              </div>
              <div className="flex items-center gap-2">
                <IoBook size={20} className="text-text" />
                <span className="text-sm text-dataText">History – View recently looked-up words</span>
              </div>
              <div className="flex items-center gap-2">
                <BiSolidDockRight size={20} className="text-text" />
                <span className="text-sm text-dataText">Side Panel – Open the extension as a sidebar</span>
              </div>
              <div className="flex items-center gap-2">
                <IoMdMagnet size={20} className="text-text" />
                <span className="text-sm text-dataText">Anchor – Dock/Undock bubble position</span>
              </div>
              <div className="flex items-center gap-2">
                <IoMdLock size={20} className="text-text" />
                <span className="text-sm text-dataText">Lock – Prevent accidental closing/moving</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineSparkles size={20} className="text-text" />
                <span className="text-sm text-dataText">Context AI (Pro) – Analyze word usage contextually</span>
              </div>
            </div>
          )
        },
        {
          title: "⚙️ Settings Menu",
          description: "Customize your experience with theme colors, bubble size, auto-save, and trigger keys. Enable or disable dictionary sources anytime.",
          image: "/images/tutorial/settings.png"
        },
        {
          title: "Support the Developer",
          description: "Like this extension? Leave a review or donate crypto to keep development alive ❤️",
          custom: (
            <div className="flex flex-col items-center gap-3">
              <FaHeart size={40} className="text-pink-400" />
              <p className="text-center text-sm text-otherText my-2">
                Every contribution helps bring new features and keep this free for everyone.
              </p>
          
              {/* Donate Button */}
              <button
                onClick={() => {
                    onClose() // Close tutorial before opening donate modal
                    setShowDonate(true)
                }}
                className="flex items-center gap-2 px-3 py-1 my-1 bg-tabActiveBg text-white rounded-lg hover:bg-dullBox transition"
              >
                <FaHandHoldingUsd size={16} className="text-green-400"/>
                <span>Donate</span>
              </button>
            
              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                {/* Review Button */}
                <a
                    href="https://chrome.google.com/webstore/detail/your-extension-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-tabActiveBg text-white rounded-lg hover:bg-dullBox transition"
                >
                <FaStar size={16} className="text-yellow-400" />
                <span>Leave a Review</span>
                </a>
              </div>
            </div>
          )
          
        }
    ]
  
    const [step, setStep] = useState(0)

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
    }, []);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 pt-30">
        <div className="bg-mainBody p-6 rounded-xl shadow-lg w-96 relative">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-xl text-otherText hover:text-dataText"
                title="Close Tutorial"
            >
                ×
            </button>
    
            {/* Step Content */}
            <h2 className="text-xl font-semibold text-text mb-2 ">{steps[step].title}</h2>
            <p className="text-sm text-dataText mb-4">{steps[step].description}</p>

            {/* Image or Custom Content */}
            {steps[step].image && (
            <img
                src={steps[step].image}
                alt="Tutorial Step"
                className="w-full rounded-lg shadow-md mb-4"
            />
            )}
            {steps[step].custom && <div className="mb-4">{steps[step].custom}</div>}
  
            {/* Progress */}
            <div className="flex justify-between items-center mt-4">
                {/* Back Button */}
                <button
                  onClick={() => step > 0 && setStep((s) => s - 1)}
                  disabled={step === 0}
                  className={`px-3 py-1 rounded transition-colors
                    ${step === 0
                      ? "bg-gray-500 text-gray-400 cursor-not-allowed"
                      : "bg-tabActiveBg text-dataText hover:bg-dullBox"}
                  `}
                >
                  Back
                </button>

                <span className="text-xs text-otherText">
                {step + 1} / {steps.length}
                </span>
                <button
                onClick={() =>
                    step === steps.length - 1 ? onClose() : setStep((s) => s + 1)
                }
                className="px-3 py-1 bg-tabActiveBg text-dataText rounded hover:bg-dullBox"
                >
                {step === steps.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
        </div>
      </div>
    )
  }
  