import { Readability } from "@mozilla/readability"

export function extractContext(word: string, charLimit = 800): string {
  // Clone the document for Readability
  const docClone = document.cloneNode(true) as Document
  const reader = new Readability(docClone)
  const article = reader.parse()

  let content = ""

  if (article?.textContent) {
    console.log("Readability found article")
    content = article.textContent
  } else {
    console.log("⚠️ Readability failed, falling back to body text")
    content = document.body.innerText || ""
  }

  // Find the first occurrence of the word
  const index = content.toLowerCase().indexOf(word.toLowerCase())
  if (index === -1) {
    console.warn("Word not found in page content")
    return content.slice(0, charLimit)
  }

  // Slice context around the word
  const start = Math.max(0, index - charLimit / 2)
  const end = Math.min(content.length, index + word.length + charLimit / 2)
  const snippet = content.slice(start, end).trim()

  return snippet
}
