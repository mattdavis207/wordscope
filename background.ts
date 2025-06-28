// background.ts

export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

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
    }
  })();
});
