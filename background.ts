// background.ts

export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

// Add export count
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("exportCount", (result) => {
    if (result.exportCount === undefined) {
      chrome.storage.local.set({ exportCount: 3 })
    }
  })
})



// Add listener for fetch requests from content.tsx
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const API_BASE = "https://wordscope-extension.vercel.app/api"

  // Handle isPro check
  if (message.type === "CHECK_IS_PRO" && message.email) {
    fetch(`${API_BASE}/is-pro?email=${encodeURIComponent(message.email)}`)
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ success: true, isPro: data.isPro })
      })
      .catch((err) => {
        console.error("Error checking isPro:", err)
        sendResponse({ success: false })
      })

    return true // allow async sendResponse
  }

  // Handle checkout session
  if (message.type === "CREATE_CHECKOUT_SESSION" && message.email) {
    fetch(`${API_BASE}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: message.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ success: true, url: data.url })
      })
      .catch((err) => {
        console.error("❌ Error creating checkout session:", err)
        sendResponse({ success: false })
      })

    return true // allow async sendResponse
  }
})



// Create chrome contextMenu 
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background installed")
    chrome.contextMenus.create({
      id: "lookup-wordscope",
      title: "Look up with Wordscope",
      contexts: ["selection"]
    }, ()=> {
      if (chrome.runtime.lastError) {
        console.error("Context menu failed:", chrome.runtime.lastError)
      } else {
        console.log("Context menu created successfully")
      }
    })
  })


  
// Define the listener is clicked and send message to content.tsx to trigger bubble popup
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "lookup-wordscope" && tab?.id && info.selectionText) {
    chrome.tabs.sendMessage(tab.id!, {
      type: "LOOKUP_WORDSCOPE",
      text: info.selectionText
    })
  }
})




// Add listener for opening sidepanel
chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (message.type === 'open_side_panel') {
      // This will open a tab-specific side panel only on the current tab.
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel/index.tsx',
        enabled: true
      });

      // Send word to sidepanel after slight delay to ensure it's mounted
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "word_from_bubble",
          word: message.word
        })
      }, 500) // delay may be necessary

    }
  })();
});



// Listener for opening popup on 
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_POPUP") {
    console.log("trying open")
    chrome.action.openPopup()
  }
})





