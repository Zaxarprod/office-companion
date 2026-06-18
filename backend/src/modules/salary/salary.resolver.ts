import { GRADE_ALIASES, ROLES, type Grade } from './salary.roles'

const normalizeStr = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')

// Build alias → roleKey lookup map at module load time
const ROLE_ALIAS_MAP = new Map<string, string>()
for (const role of ROLES) {
  ROLE_ALIAS_MAP.set(normalizeStr(role.key), role.key)
  ROLE_ALIAS_MAP.set(normalizeStr(role.label), role.key)
  for (const alias of role.aliases) {
    ROLE_ALIAS_MAP.set(normalizeStr(alias), role.key)
  }
}

const llmCache = new Map<string, string | null>()

/** Resolve free-text profession to canonical role key. Returns null if unrecognised. */
export const resolveRole = async (input: string): Promise<string | null> => {
  if (!input?.trim()) return null
  const norm = normalizeStr(input)

  // 1. Exact alias/label/key match
  const exact = ROLE_ALIAS_MAP.get(norm)
  if (exact) return exact

  // 2. Substring: normalised input contained in an alias, or alias contained in input
  for (const [alias, roleKey] of ROLE_ALIAS_MAP.entries()) {
    if (norm.includes(alias) || alias.includes(norm)) return roleKey
  }

  // 3. Word overlap: any significant word (≥4 chars) shared between input and alias
  const inputWords = norm.split(/\s+/).filter((w) => w.length >= 4)
  if (inputWords.length > 0) {
    for (const [alias, roleKey] of ROLE_ALIAS_MAP.entries()) {
      const aliasWords = alias.split(/\s+/)
      if (inputWords.some((iw) => aliasWords.some((aw) => aw.includes(iw) || iw.includes(aw)))) {
        return roleKey
      }
    }
  }

  // 4. LLM fallback — only when DEEPSEEK_API_KEY is set; result cached per normalised string
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (apiKey) {
    if (llmCache.has(norm)) return llmCache.get(norm) ?? null
    const result = await llmClassifyRole(input, apiKey)
    llmCache.set(norm, result)
    return result
  }

  return null
}

const llmClassifyRole = async (input: string, apiKey: string): Promise<string | null> => {
  try {
    const roleKeys = ROLES.map((r) => r.key).join(', ')
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `Classify job title to one key from: ${roleKeys}. Job: "${input}". Reply ONLY the key or "null".`,
          },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const key = data.choices?.[0]?.message?.content?.trim().toLowerCase()
    return key && key !== 'null' && ROLES.some((r) => r.key === key) ? key : null
  } catch {
    return null
  }
}

/** Resolve free-text grade to canonical Grade. Returns null if unrecognised. */
export const resolveGrade = (input: string): Grade | null => {
  if (!input?.trim()) return null
  const norm = normalizeStr(input)

  const exact = GRADE_ALIASES[norm]
  if (exact) return exact

  // Substring fallback
  for (const [alias, grade] of Object.entries(GRADE_ALIASES)) {
    if (norm.includes(alias) || alias.includes(norm)) return grade
  }

  return null
}

export { normalizeStr }
