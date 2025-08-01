import { useEffect, useState } from "react"
import "~/public/styles/tailwind.css"
import "../public/styles/globals.css";
import { injectSavedThemes } from "../hooks/injectThemes";
import type { Theme } from "../hooks/injectThemes"
import { marked } from "marked";



const ChatBubble = ({ sender, text }: { sender: "user" | "ai", text: string }) => {

  const [themes, setThemes] = useState<Theme[]>([]);
  
  const [appliedTheme, setAppliedTheme] = useState<string>("");

  const [html, setHtml] = useState("");

  useEffect(() => {
    if (sender === "ai") {
      const renderMarkdown = async () => {
        const result = await marked.parse(text); // use parse for sync/async safety
        setHtml(result);
      };
      renderMarkdown();
    }
  }, [text, sender]);


  return (
    <div className={`flex w-full ${sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className="inline-block px-4 py-2 rounded-lg text-sm relative break-words rounded-br-none ml-auto"
        style={{
          maxWidth: "75%",    // Limits bubble size
          wordWrap: "break-word",
          backgroundColor: sender === "user" ? "var(--user-chat-bubble)" : "var(--ai-chat-bubble)",
        }}
      >
        {sender === "ai" && text !== "Thinking..." && (
          <>
            <div className="text-xs text-gray-400 mb-1 font-semibold">Context AI</div>
            <div className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html}}>
            </div>
            
          </>
        )}

        {text === "Thinking..." && (
          <span className="text-gray-400 italic">Thinking...</span>
        )}

        {/* User Bubble */}
        {sender === "user" && text && (
          <div className="prose prose-invert max-w-none">
            {text}
          </div>
        )}
      </div>
    </div>
    )};
  
  export default ChatBubble
