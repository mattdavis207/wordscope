// background.ts

export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

// Enable extension icon globally and set to active state
chrome.action.enable();

// Explicitly set the icon to active state
chrome.action.setIcon({
  path: {
    16: "./gen-assets/icon16.plasmo.png",
    32: "./gen-assets/icon32.plasmo.png", 
    48: "./gen-assets/icon48.plasmo.png",
    64: "./gen-assets/icon64.plasmo.png",
    128: "./gen-assets/icon128.plasmo.png"
  }
});

// Add export count and enable icon globally
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("exportCount", (result) => {
    if (result.exportCount === undefined) {
      chrome.storage.local.set({ exportCount: 3 })
    }
  })
  
  // Ensure icon is enabled globally and set to active
  chrome.action.enable();
  chrome.action.setIcon({
    path: {
      16: "./gen-assets/icon16.plasmo.png",
      32: "./gen-assets/icon32.plasmo.png", 
      48: "./gen-assets/icon48.plasmo.png",
      64: "./gen-assets/icon64.plasmo.png",
      128: "./gen-assets/icon128.plasmo.png"
    }
  });
  console.log("Extension installed and icon enabled");
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

// Scripting for getting selection from chrome's pdf viewer
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (typeof tabId !== "number" || tabId < 0) return;
  if (changeInfo.status !== "complete") return;
  if (!tab || !tab.url) return;

  if (tab.url?.startsWith("chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai")) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        document.addEventListener("selectionchange", () => {
          const selectedText = window.getSelection()?.toString().trim()
          if (selectedText) {
            chrome.runtime.sendMessage({
              type: "PDF_SELECTION",
              text: selectedText
            })
          }
        });
      }
    }).catch((err) => console.warn("Script injection failed:", err));
  }
});




  
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
          word: message.word,
          contextSnippet: message.contextSnippet,
          url: message.url
        })
      }, 750) // delay may be necessary

    }
  })();
});

// Add Listener for sidepanel close
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel") {
    console.log("📥 Side panel connected")

    port.onDisconnect.addListener(() => {
      console.log("❌ Side panel closed (disconnected)")
      // Send a message to content.tsx when side panel is closed
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id
        if (typeof tabId === "number") {
          chrome.tabs.sendMessage(tabId, {
            type: "sidepanel_closed"
          })
        }
      })
    })
  }
})


// Listener for opening popup on 
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_POPUP") {
    console.log("trying open")
    chrome.action.openPopup()
  }
})

// Relay listener to send message from popup to content.tsx
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "RELAY_SHOW_TUTORIAL") {
    console.log("📥 Background received RELAY_SHOW_TUTORIAL message");
    
    chrome.tabs.query({ active: true, lastFocusedWindow: true })
      .then(([tab]) => {
        if (!tab?.id) throw new Error("No active tab to message.");
        console.log("📤 Sending SHOW_TUTORIAL to tab:", tab.id);
        return chrome.tabs.sendMessage(tab.id, { type: "SHOW_TUTORIAL" });
      })
      .then(() => {
        console.log("✅ Tutorial message sent successfully");
        sendResponse({ ok: true });
      })
      .catch((err) => {
        console.error("❌ Relay failed:", err, chrome.runtime.lastError);
        sendResponse({ ok: false, error: String(err) });
      });

    return true; // keep the channel open for async sendResponse
  }
});




