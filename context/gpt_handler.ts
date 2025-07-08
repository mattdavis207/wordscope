const OPENAI_API_KEY = process.env.PLASMO_PUBLIC_OPENAI_API_KEY
console.log("OPENAI_API_KEY", OPENAI_API_KEY);

export async function fetchContextAIResponse(word: string, contextSnippet: string, url: string, history: { sender: "user" | "ai", text: string }[], isInitial = false) {

  const systemPrompt = `
    You are ContextAI, an assistant helping users understand words in their surrounding webpage context. You will be given:
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

    Respond precisely and focus on the contextual meaning
    `

  // Format chat history for OpenAI API
  const formattedHistory = [
    ...(isInitial ? [{ role: "system", content: systemPrompt }] : []), // only on first call
    ...history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }))
  ]

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: formattedHistory,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || "GPT API error")
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content.trim() || "No response from AI."
  } catch (err) {
    console.log("OPENAI_API_KEY", OPENAI_API_KEY);
    console.error("Context AI Error: ", err)
    return "Error fetching AI response. Please try again."
  }
}
