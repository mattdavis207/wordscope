const RAW_TESTER_EMAILS = process.env.TESTER_BYPASS_EMAILS || "chrome-review@wordscope.app"

const testerEmails = new Set(
  RAW_TESTER_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

export const isTesterEmail = (email?: string | null): boolean => {
  if (!email) return false
  return testerEmails.has(email.trim().toLowerCase())
}

export const getTesterCustomerId = (email: string): string => {
  return `tester:${email.trim().toLowerCase()}`
}
