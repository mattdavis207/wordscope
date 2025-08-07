/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./popup.tsx",
      "./content.tsx",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./public/styles/globals.css",
      "./views/**/*.{js,ts,jsx,tsx}", 
      "./assets/styles/tailwind-content.css"
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
        lineClamp: {
          2: '2',
          3: '3',
        }
      },
    },
    plugins: [require('tailwind-scrollbar'), require('@tailwindcss/line-clamp')],
    safelist: [
      'bg-gradient-to-r',
      'from-blue-500',
      'via-purple-500',
      'to-pink-500',
      'hover:from-blue-600',
      'hover:to-pink-600'
    ],
    
  }
  