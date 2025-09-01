const API_BASE = process.env.PLASMO_PUBLIC_NEXT_PUBLIC_API_URL;

export async function fetchContextAIResponse(word: string, contextSnippet: string, url: string, history: { sender: "user" | "ai", text: string }[], isInitial = false) {

  const systemPrompt = `
    You are Context AI, a specialized helper that gives information about words in the context of whatever the user is reading. You help users understand words based on their surrounding context from webpages, articles, and documents.

    When asked about your identity (like "who are you?" or "what are you?"), respond that you are a Context AI helper that gives information on words in context of wherever they're reading, and they can ask you anything about that.

    You will be given:
    - a selected word
    - a snippet of text surrounding that word
    - the page URL

    Your task:
    1. If there is good surrounding context, give a **clear, concise explanation** of the word *as used in that snippet*.
    2. If no context was provided (empty or too generic), fallback to explaining the word **generally**, but also ask the user for more information.
    3. Always provide **one short example sentence** using the word in a way consistent with the context (or generic if no context).

    Output format:
    - Brief explanation
    - Example sentence (short, natural)
    - Optional: Ask the user for more details if context is missing

    Selected Word: "${word}"
    Page URL: ${url}
    Context Snippet: """${contextSnippet}"""

    Respond precisely and focus on the contextual meaning. You can also answer follow-up questions about the word, its usage, or related topics.
    `

  // Format chat history for OpenAI API
  const formattedHistory = [
    { role: "system", content: systemPrompt }, // always include system prompt
    ...history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }))
  ]

  // Get email from local storage
  let email = localStorage.getItem("userEmail") || undefined;

  if (!email && typeof chrome !== "undefined" && chrome.storage?.local) {
    const { userEmail } = await chrome.storage.local.get("userEmail");
    email = typeof userEmail === "string" && userEmail.trim() ? userEmail.trim() : undefined;
  }

  

  try {
    const res = await fetch(`${API_BASE}/context-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Pass exactly what your server needs: messages + generation params + identity
      body: JSON.stringify({
        email,                     // or pass customerId if you store it
        messages: formattedHistory,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || "GPT API error")
    }

    const data = await res.json()

    
    // Persist remaining + lastUsed for the UI badge
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        const meta: any = { remainingTokens: data.remainingTokens };
        if (typeof data.used === "number") meta.lastUsed = data.used;
        chrome.storage.local.set({ tokens_meta: meta });
      }
    } catch {}

    return data.text?.trim?.() || "No response from AI.";
  } catch (err) {
    return "Error fetching AI response. Please try again."
  }
}
