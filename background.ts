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