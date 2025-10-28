/**
 * Returns the Chrome Web Store review URL for the extension.
 * Prefers an explicit environment variable and falls back to the runtime ID.
 */
export const getChromeStoreReviewUrl = (): string | null => {
  const envUrl =
    process.env.PLASMO_PUBLIC_CHROME_STORE_REVIEW_URL ??
    process.env.CHROME_EXTENSION_URL // legacy support if present

  if (envUrl) {
    return envUrl
  }

  if (typeof chrome !== "undefined" && chrome?.runtime?.id) {
    return `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`
  }

  return null
}

