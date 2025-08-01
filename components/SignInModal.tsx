import {useState, useEffect } from "react"

import "~/public/styles/tailwind.css"
import "~/public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"

type SignInModalProps = {
    onClose: () => void
    onSignIn: (email: string) => void
  }

export const SignInModal: React.FC<SignInModalProps> = ({ onClose, onSignIn }) => {
    
    const [tempEmail, setTempEmail] = useState("")

    const handleSignIn = () => {
        if (!tempEmail.includes("@")) {
        alert("Please enter a valid email address.")
        return
        }

        localStorage.setItem("userEmail", tempEmail)
        onSignIn(tempEmail)
        onClose()
    }
    
    // Theme useStates
    const [themes, setThemes] = useState<Theme[]>([]);
    const [appliedTheme, setAppliedTheme] = useState<string>("");

    //useEffect for getting saved themes and injecting applied theme
    useEffect(() => {
        const loadThemes = async () => {
        await injectSavedThemes(setThemes, setAppliedTheme);
        };
        loadThemes();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-mainBody p-6 rounded-xl shadow-lg w-80 relative">
                {/* Header with title and close button */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-text">Sign In</h2>
                    <button
                        onClick={onClose}
                        className="text-xl text-otherText hover:text-red-500 transition-colors"
                        title="Close"
                    >
                        ×
                    </button>
                </div>
                
                <p className="text-sm text-dataText mb-4">
                    Enter your email to sign up for Pro status and sync access across devices.
                </p>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4 bg-dullBox"
                />
                <button
                    className="w-full px-3 py-2 bg-tabActiveBg text-dataText rounded hover:bg-dullBox"
                    onClick={handleSignIn}
                >
                    Sign In
                </button>
            </div>
        </div>

    )
}