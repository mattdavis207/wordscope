/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./popup.tsx",
      "./content.tsx",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./styles/globals.css",
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          text: "var(--text)",
          mainBody: "var(--main-body)",
          dullBox: "var(--dull-box)",
          hoverIcon: "var(--hover-icon)",
          hoverSquare: "var(--hover-square)",
          dataText: "var(--data-text)",
          otherText: "var(--other-text)",
          border: "var(--border)",
          tabActiveBg: "var(--tab-active-bg)",
          aiChatBubble: "var(--ai-chat-bubble)",
          userChatBubble: "var(--user-chat-bubble)",
        },
      },
    },
    plugins: [require('tailwind-scrollbar')],
  }
  