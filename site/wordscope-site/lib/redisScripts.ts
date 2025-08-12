// lib/redisScripts.ts
export const DEC_IF_ENOUGH = `
  local key = KEYS[1]
  local used = tonumber(ARGV[1])
  local remaining = tonumber(redis.call("HGET", key, "tokensRemaining") or "0")
  if remaining < used then return {err="insufficient"} end
  local newv = remaining - used
  redis.call("HSET", key, "tokensRemaining", newv)
  return newv
`;