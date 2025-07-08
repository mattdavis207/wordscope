const ChatBubble = ({ sender, text }: { sender: "user" | "ai", text: string }) => (
  <div className={`flex w-full ${sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
    <div
      className={`inline-block px-4 py-2 rounded-lg text-sm relative break-words
        ${sender === "user"
          ? "bg-blue-600 text-white rounded-br-none ml-auto"
          : "bg-gray-700 text-white rounded-bl-none"
        }`}
      style={{
        maxWidth: "75%",    // Limits bubble size
        wordWrap: "break-word",
      }}
    >
      {sender === "ai" && (
        <div className="text-xs text-gray-400 mb-1 font-semibold">Context AI</div>
      )}
      {text}
    </div>
</div>


  )
  
  export default ChatBubble
  