import {useState, useEffect } from "react"

import { IoMdLock, IoMdUnlock, IoMdMagnet } from "react-icons/io"
import { IoSearch, IoBook } from "react-icons/io5"
import { FaCog, FaHandsHelping, FaGlobe, FaHeart, FaStar, FaHandHoldingUsd, FaBolt, FaBrain, FaPalette, FaChartLine, FaWindowMaximize, FaHistory, FaDownload, FaTools, FaHandPointer } from "react-icons/fa"
import { HiOutlineSparkles } from "react-icons/hi"
import { HiOutlineArrowTopRightOnSquare, HiOutlineXMark, HiChevronLeft, HiChevronRight } from "react-icons/hi2" 
import { BiSolidDockRight } from "react-icons/bi"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

// Import demo assets - GIFs work with require, videos use URL paths
const sidepanel_demo = chrome.runtime.getURL("assets/sidepanel/Sidepanel Demo.gif")
const history_demo = chrome.runtime.getURL("assets/history/History Demo.gif")
const export_demo = chrome.runtime.getURL("assets/history/Export Demo.gif")

// Context AI demo images - all using chrome.runtime.getURL for consistency
const context_ai_demo = chrome.runtime.getURL("assets/contextai/Context AI Demo.gif")
const contextai1 = chrome.runtime.getURL("assets/contextai/ContextAI 1.png")
const contextai2 = chrome.runtime.getURL("assets/contextai/ContextAI 2.png")
const contextai3 = chrome.runtime.getURL("assets/contextai/ContextAI 3.png")

// Sidepanel demo images
const sidepanel1 = chrome.runtime.getURL("assets/sidepanel/Sidepanel 1.png")
const sidepanel2 = chrome.runtime.getURL("assets/sidepanel/Sidepanel 2.png")
const sidepanel3 = chrome.runtime.getURL("assets/sidepanel/Sidepanel 3.png")
const return_to_bubble = chrome.runtime.getURL("assets/sidepanel/Return to Bubble.gif")

// Definition demo images - use chrome.runtime.getURL for web accessible resources
const def1 = chrome.runtime.getURL("assets/definitions/Definitions 1.png")
const def2 = chrome.runtime.getURL("assets/definitions/Definitions 2.png")
const def3 = chrome.runtime.getURL("assets/definitions/Definitions 3.png")
const def4 = chrome.runtime.getURL("assets/definitions/Definitions 4.png")
const def5 = chrome.runtime.getURL("assets/definitions/Definitions 5.png")
const def6 = chrome.runtime.getURL("assets/definitions/Definitions 6.png")
const def7 = chrome.runtime.getURL("assets/definitions/Definitions 7.png")
const def8 = chrome.runtime.getURL("assets/definitions/Definitions 8.png")
const def9 = chrome.runtime.getURL("assets/definitions/Definitions 9.png")

// Video files use Chrome extension URLs since require doesn't work with .mp4
const wordscope_demo_video = chrome.runtime.getURL("assets/Wordscope-Demo-Video.mp4")
const settings_demo = chrome.runtime.getURL("assets/SettingsDemo.mp4")

// Utility button demo videos
const search_button_demo = chrome.runtime.getURL("assets/util-buttons/Search Button Demo.gif")
const history_button_demo = chrome.runtime.getURL("assets/util-buttons/History Button Demo.gif")
const sidepanel_button_demo = chrome.runtime.getURL("assets/util-buttons/Sidepanel Button Demo.gif")
const dock_button_demo = chrome.runtime.getURL("assets/util-buttons/Dock Button Demo.gif")
const lock_button_demo = chrome.runtime.getURL("assets/util-buttons/Lock Button Demo.gif")
const context_ai_button_demo = chrome.runtime.getURL("assets/util-buttons/Context AI Button Demo.gif")

import wordscopeLogo from "assets/icon.png"

// Helper function to create title with icon
const TitleWithIcon = ({ icon: Icon, title, color = "var(--text)" }: { 
  icon: React.ComponentType<any>; 
  title: string; 
  color?: string; 
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
    <Icon size={24} style={{ color }} />
    <span>{title}</span>
  </div>
);

// Component for utility buttons with hover dropdowns
const UtilityButton = ({ icon: Icon, name, desc, gif, hoveredButton, setHoveredButton }: {
  icon: React.ComponentType<any>;
  name: string;
  desc: string;
  gif: string;
  hoveredButton: string | null;
  setHoveredButton: (name: string | null) => void;
}) => (
  <div 
    className="group relative"
    onMouseEnter={() => setHoveredButton(name)}
    onMouseLeave={() => setHoveredButton(null)}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      backgroundColor: hoveredButton === name ? 'var(--tab-active-bg)' : 'var(--dull-box)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: `2px solid ${hoveredButton === name ? 'var(--tab-active-bg)' : 'var(--border)'}`,
      boxShadow: hoveredButton === name ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
      transform: hoveredButton === name ? 'translateY(-2px)' : 'translateY(0)'
    }}>
      <Icon 
        size={28} 
        style={{ 
          color: hoveredButton === name ? 'white' : 'var(--text)',
          transition: 'all 0.3s ease'
        }} 
      />
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '18px',
          color: hoveredButton === name ? 'white' : 'var(--text)',
          fontWeight: '600',
          marginBottom: '2px',
          transition: 'all 0.3s ease'
        }}>
          {name}
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: hoveredButton === name ? 'rgba(255,255,255,0.9)' : 'var(--data-text)',
          fontWeight: '400',
          transition: 'all 0.3s ease'
        }}>
          {desc}
        </div>
      </div>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: hoveredButton === name ? 'rgba(255,255,255,0.5)' : 'var(--border)',
        transition: 'all 0.3s ease'
      }} />
    </div>
    
    {/* Enhanced hover dropdown with GIF - proper expanding container like page.tsx */}
    <div 
      style={{
        maxHeight: hoveredButton === name ? '500px' : '0px',
        opacity: hoveredButton === name ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.5s ease-in-out',
        backgroundColor: 'var(--dull-box)',
        borderRadius: '12px',
        marginTop: hoveredButton === name ? '12px' : '0px',
        padding: hoveredButton === name ? '20px' : '0px',
        border: hoveredButton === name ? '1px solid var(--border)' : 'none'
      }}
    >
      <img
        src={gif}
        alt={`${name} Demo`}
        style={{
          width: '100%',
          height: '300px',
          objectFit: 'contain',
          borderRadius: '8px',
          backgroundColor: 'var(--main-body)',
          border: '1px solid var(--border)'
        }}
      />
    </div>
  </div>
);

export const TutorialModal = ({ onClose, onShowDonate }: { onClose: () => void, onShowDonate: () => void }) => {

    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");
    
    // Modal navigation states
    const [step, setStep] = useState(0)
    const [slideIndex, setSlideIndex] = useState(0)
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    const steps = [
        {
          title: "Welcome to Wordscope!",
          description: "The ultimate dictionary companion that transforms how you understand language while browsing the web.",
          custom: (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '300px',
              justifyContent: 'space-between',
              padding: '10px 0'
            }}>
              {/* Feature highlights grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                width: '100%',
                maxWidth: '420px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaBolt size={32} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>Quick Lookup</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaBrain size={32} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>Context AI</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <BiSolidDockRight size={32} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>Sidepanel</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaHistory size={32} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>History & Export</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaTools size={32} style={{ color: '#f97316' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>Utility Buttons</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaCog size={32} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '12px', color: 'var(--data-text)', textAlign: 'center' }}>Smart Settings</span>
                </div>
              </div>

              {/* Simplified description */}
              <p style={{
                fontSize: '15px',
                color: 'var(--data-text)',
                lineHeight: '1.4',
                textAlign: 'center',
                maxWidth: '480px',
                margin: 0
              }}>
                Transform your browsing with instant definitions, AI context, and comprehensive learning tools.
              </p>
              
              {/* Demo button */}
              <button
                onClick={() => window.open(wordscope_demo_video, '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  backgroundColor: 'var(--tab-active-bg)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <HiOutlineArrowTopRightOnSquare size={20} />
                <span>Watch Demo</span>
              </button>
            </div>
          )
        },
        {
          title: <TitleWithIcon icon={FaBolt} title="Quick Lookup Features" color="#f59e0b" />, 
          description: "Discover the comprehensive suite of tools available with every word lookup. Navigate through different features using the carousel below to see how Wordscope enhances your reading experience.",
          type: "slider",
          slides: [def1, def2, def3, def4, def5, def6, def7, def8, def9],
          slideDescriptions: [
            "Double-click any word to instantly access comprehensive definitions from multiple authoritative sources",
            "View detailed definitions, pronunciations, and synonyms/antonyms consolidated in an intuitive interface",
            "Navigate between different dictionary sources using the integrated tab system for comprehensive coverage",
            "Resize the definition bubble and access your lookup history through the dedicated history tab",
            "Review recently searched words and instantly access their complete definitions and usage examples",
            "Utilize the drag handle to reposition the bubble anywhere on the page for optimal reading experience",
            "Dock the definition bubble to the selected word for persistent reference while reading",
            "Undock the bubble from the selected word with a single click for flexible positioning",
            "Toggle synonyms and antonyms visibility for each dictionary source to customize your learning experience"
          ]
        },
        {
          title: <TitleWithIcon icon={FaBrain} title="Smart Context AI" color="#8b5cf6" />,
          description: "Experience AI-powered context analysis that explains exactly how words are used in their specific sentences. Go beyond basic definitions to understand nuanced meanings, idioms, and contextual usage patterns.",
          type: "slider",
          slides: [context_ai_demo, contextai1, contextai2, contextai3],
          slideDescriptions: [
            "AI-powered context analysis provides nuanced explanations of word usage within specific sentences and contextual patterns",
            "Highlight any word on the page to analyze with Context AI",
            "Get detailed in context descriptions of the selected word from an AI powered chatbot", 
            "Chat with Context AI to ask anything about the word and its context"
          ],
          isPro: true
        },
        {
          title: <TitleWithIcon icon={BiSolidDockRight} title="Sidepanel Mode" color="#06b6d4" />,
          description: "Transform your research workflow with a dedicated sidepanel that stays open while you browse. Perfect for academic reading, language learning, or exploring new topics without losing your place.",
          type: "slider",
          slides: [sidepanel_demo, sidepanel1, sidepanel2, sidepanel3, return_to_bubble], 
          slideDescriptions: [
            "Open Wordscope as a persistent sidebar that stays available while you browse any website, providing seamless access to definitions and research tools",
            "Click the open sidepanel button in the top right to use Wordscope sidepanel mode",
            "Navigate through definitions and multiple sources in the sidepanel alongside any webpage for continuous research",
            "Access the history tab right from the sidepanel and look through recently seen words",
            "Seamlessly transition back to bubble mode when you want to close the sidepanel and return to the floating definition bubble interface"
          ]
        },
        {
          title: <TitleWithIcon icon={FaHistory} title="History & Export" color="#10b981" />,
          description: "Never lose a word again with automatic lookup history. Search through your discoveries, track your learning progress, and export personalized vocabulary lists in multiple formats for study sessions.",
          type: "slider",
          slides: [history_demo, export_demo],
          slideDescriptions: [
            "Browse recently looked up words in the bubble or extension popup and access definitions and data of saved words",
            "Export saved history in 4 file formats across 4 different dictionary sources for making quick flashcards and studying"
          ]
        },
        {
          title: <TitleWithIcon icon={FaTools} title="Bubble Utility Buttons" color="#f97316" />,
          description: "Master the powerful toolbar that appears with every lookup. Each button unlocks different capabilities to streamline your vocabulary exploration and learning process.",
          custom: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              padding: '20px 0'
            }}>
              <UtilityButton 
                icon={IoSearch} 
                name="Search" 
                desc="Enter a word manually for instant lookup" 
                gif={search_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
              <UtilityButton 
                icon={IoBook} 
                name="History" 
                desc="View and revisit recently looked-up words" 
                gif={history_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
              <UtilityButton 
                icon={BiSolidDockRight} 
                name="Side Panel" 
                desc="Open the extension as a persistent sidebar" 
                gif={sidepanel_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
              <UtilityButton 
                icon={IoMdMagnet} 
                name="Anchor" 
                desc="Dock or undock bubble to webpage position" 
                gif={dock_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
              <UtilityButton 
                icon={IoMdLock} 
                name="Lock" 
                desc="Prevent accidental closing or moving" 
                gif={lock_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
              <UtilityButton 
                icon={HiOutlineSparkles} 
                name="Context AI (Pro)" 
                desc="AI-powered contextual word analysis" 
                gif={context_ai_button_demo}
                hoveredButton={hoveredButton}
                setHoveredButton={setHoveredButton}
              />
            </div>
          )
        },
        {
          title: <TitleWithIcon icon={FaCog} title="Smart Settings" color="#6b7280" />,
          description: "Tailor Wordscope to your exact preferences. Fine-tune trigger methods, select from multiple dictionary sources, customize the visual appearance, and configure advanced features to match your reading style.",
          custom: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Settings Demo Video */}
              <video 
                className="w-full rounded-lg shadow-md"
                controls
                autoPlay
                muted
                loop
                style={{ maxHeight: '320px' }}
              >
                <source src={settings_demo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Settings Flow with Gradient Lines - Two Rows */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'var(--dull-box)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                {/* First Row - Main Settings */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaHistory size={18} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Auto Save</span>
                  </div>
                  <div style={{ width: '20px', height: '2px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPalette size={18} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Themes</span>
                  </div>
                  <div style={{ width: '20px', height: '2px', background: 'linear-gradient(to right, #8b5cf6, #10b981)' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaWindowMaximize size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Bubble Size</span>
                  </div>
                  <div style={{ width: '20px', height: '2px', background: 'linear-gradient(to right, #10b981, #f59e0b)' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaDownload size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Export Source</span>
                  </div>
                </div>

                {/* Second Row - Keyboard Shortcuts */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaHandPointer size={18} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Double Click</span>
                  </div>
                  <div style={{ width: '20px', height: '2px', background: 'linear-gradient(to right, #ef4444, #ec4899)' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaCog size={18} style={{ color: '#ec4899' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Modifier Key</span>
                  </div>
                  <div style={{ width: '20px', height: '2px', background: 'linear-gradient(to right, #ec4899, #8b5cf6)' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaTools size={18} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Custom Hotkeys</span>
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Support the Developer",
          description: "Like this extension? Leave a review or donate crypto to keep development alive",
          custom: (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '300px',
              justifyContent: 'flex-start',
              paddingTop: '10px'
            }}>
              {/* Top section with heart and message */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                marginBottom: 'auto'
              }}>
                <FaHeart size={300} style={{ color: '#f472b6' }} />
                <p style={{
                  textAlign: 'center',
                  fontSize: '15px',
                  color: 'var(--data-text)',
                  lineHeight: '1.4',
                  maxWidth: '460px',
                  marginBottom: '20px'
                }}>
                  Help us keep Wordscope free and continuously improving. Your support enables new features, bug fixes, and ongoing development that benefits everyone.
                </p>
              </div>
              
              {/* Bottom section with buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
                paddingBottom: '15px'
              }}>
                {/* Donate Button */}
                <button
                  onClick={() => {
                      onShowDonate() // Show donate modal
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 28px',
                    backgroundColor: 'var(--tab-active-bg)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                  }}
                >
                  <FaHandHoldingUsd size={18} style={{ color: '#4ade80' }}/>
                  <span>Donate</span>
                </button>
              
                {/* Review Button */}
                <a
                    href="https://chrome.google.com/webstore/detail/your-extension-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 28px',
                      backgroundColor: 'var(--tab-active-bg)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                    }}
                >
                <FaStar size={18} style={{ color: '#fbbf24' }} />
                <span>Leave a Review</span>
                </a>
              </div>
            </div>
          )
          
        }
    ]

    // Reset slide index when step changes
    useEffect(() => {
        setSlideIndex(0)
    }, [step])

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
    }, []);
  
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100000,
        padding: '40px'
      }}>
        <div style={{
          backgroundColor: 'var(--main-body)',
          padding: '0',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '700px',
          height: '750px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  color: 'var(--other-text)',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease'
                }}
                title="Close Tutorial"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171'
                  e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--other-text)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
            >
                <HiOutlineXMark size={24}/>
            </button>
    
            {/* Scrollable Content Area */}
            <div style={{
              flex: '1',
              overflowY: 'auto',
              padding: '32px 40px 20px 40px',
              scrollbarColor: 'var(--tab-active-bg) var(--main-body)',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}>
            {/* Step Content */}
            {step === 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center'
                }}>
                    <img
                        src={wordscopeLogo}
                        alt="Wordscope Logo"
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'contain'
                        }}
                    />
                </div>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '16px', 
              marginBottom: '16px' 
            }}>
                <h2 style={{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: 'var(--text)',
                  textAlign: 'center',
                  margin: 0
                }}>{steps[step].title}</h2>
                {steps[step].isPro && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      background: 'linear-gradient(to right, #eab308, #ca8a04)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      borderRadius: '9999px'
                    }}>
                        ⭐ PRO
                    </span>
                )}
            </div>
            <p style={{
              fontSize: '18px',
              color: 'var(--data-text)',
              marginBottom: '24px',
              lineHeight: '1.5',
              margin: '0 0 24px 0',
              textAlign: 'center',
              maxWidth: '600px',
              alignSelf: 'center'
            }}>{steps[step].description}</p>

            {/* Image/GIF/Slider or Custom Content */}
            {steps[step].type === "slider" && steps[step].slides ? (
                <div className="mb-3">
                    <div className="relative rounded-lg overflow-hidden bg-background mb-2" style={{ height: '320px' }}>
                        <div className="w-full h-full relative">
                            {steps[step].slides.map((slide, idx) => (
                                <img
                                    key={idx}
                                    src={slide}
                                    alt={`Demo ${idx + 1}`}
                                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                                        idx === slideIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{ imageRendering: 'crisp-edges', imageResolution: 'from-image' }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Enhanced navigation arrows */}
                    <div className="flex justify-center items-center gap-12 mb-3">
                        <button
                            onClick={() => setSlideIndex(slideIndex > 0 ? slideIndex - 1 : steps[step].slides.length - 1)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--dull-box)',
                              color: 'var(--data-text)',
                              border: '2px solid var(--border)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              marginRight: '8px'
                            }}
                            title="Previous image"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                              e.currentTarget.style.color = 'white'
                              e.currentTarget.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                              e.currentTarget.style.color = 'var(--data-text)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            <HiChevronLeft size={24} />
                        </button>
                        
                        {/* Slide indicators */}
                        <div className="flex gap-2 mx-4">
                          {steps[step].slides && steps[step].slides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSlideIndex(idx)}
                              style={{
                                width: idx === slideIndex ? '32px' : '12px',
                                height: '12px',
                                borderRadius: '6px',
                                backgroundColor: idx === slideIndex ? 'var(--tab-active-bg)' : 'var(--border)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              title={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                        
                        <button
                            onClick={() => setSlideIndex(slideIndex < steps[step].slides.length - 1 ? slideIndex + 1 : 0)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--dull-box)',
                              color: 'var(--data-text)',
                              border: '2px solid var(--border)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              marginLeft: '8px'
                            }}
                            title="Next image"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                              e.currentTarget.style.color = 'white'
                              e.currentTarget.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                              e.currentTarget.style.color = 'var(--data-text)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            <HiChevronRight size={24} />
                        </button>
                    </div>
                    {steps[step].slideDescriptions && steps[step].slideDescriptions[slideIndex] && (
                        <div className="text-center p-3 bg-dullBox rounded-lg">
                            <p className="text-sm text-dataText leading-normal">
                                {steps[step].slideDescriptions[slideIndex]}
                            </p>
                        </div>
                    )}
                </div>
            ) : 'image' in steps[step] && steps[step].image ? (
                <div className="mb-4">
                    {(() => {
                        const image = (steps[step] as any).image;
                        return typeof image === 'string' && image.includes('.mp4') ? (
                            <video 
                                className="w-full rounded-lg shadow-md"
                                controls
                                autoPlay
                                muted
                                loop
                                style={{ maxHeight: '500px' }}
                            >
                                <source src={image} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img
                                src={typeof image === 'string' ? image : image?.src || image}
                                alt="Tutorial Demo"
                                className="w-full rounded-lg shadow-md"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                        );
                    })()}
                </div>
            ) : null}
            {steps[step].custom && <div className="mb-4">{steps[step].custom}</div>}
            </div>
  
            {/* Fixed Navigation Area */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 40px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--main-body)',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px'
            }}>
                {/* Back Button */}
                <button
                  onClick={() => step > 0 && setStep((s) => s - 1)}
                  disabled={step === 0}
                  style={{
                    padding: '16px 28px',
                    fontSize: '18px',
                    fontWeight: '600',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: step === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: step === 0 ? '#6b7280' : 'var(--tab-active-bg)',
                    color: step === 0 ? '#9ca3af' : 'var(--data-text)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (step !== 0) {
                      e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (step !== 0) {
                      e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                    }
                  }}
                >
                  Back
                </button>

                <span style={{
                  fontSize: '18px',
                  color: 'var(--other-text)',
                  fontWeight: '500'
                }}>
                {step + 1} / {steps.length}
                </span>
                
                <button
                onClick={() =>
                    step === steps.length - 1 ? onClose() : setStep((s) => s + 1)
                }
                style={{
                  padding: '16px 28px',
                  fontSize: '18px',
                  fontWeight: '600',
                  backgroundColor: 'var(--tab-active-bg)',
                  color: 'var(--data-text)',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dull-box)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--tab-active-bg)'
                }}
                >
                {step === steps.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
        </div>
      </div>
    )
  }
  