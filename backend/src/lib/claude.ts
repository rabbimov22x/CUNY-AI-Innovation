import Anthropic from "@anthropic-ai/sdk"

let anthropicClient: Anthropic | null = null

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  return anthropicClient
}

function uniqueNormalized(values: string[]) {
  const seen = new Set<string>()
  const output: string[] = []

  for (const raw of values) {
    const value = raw.trim().replace(/\s+/g, " ")
    if (!value) continue
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    output.push(value)
  }

  return output
}

function localHeuristicSuggestions(statement: string): { skills: string[]; jobTitles: string[]; summary: string } {
  const text = statement.toLowerCase()
  const skills: string[] = []
  const jobTitles: string[] = []

  if (text.includes("front") || text.includes("ui") || text.includes("react")) {
    skills.push("Frontend", "React", "UI/UX")
    jobTitles.push("Frontend Developer", "UI Engineer")
  }
  if (text.includes("back") || text.includes("api") || text.includes("server") || text.includes("node")) {
    skills.push("Backend", "Node.js", "API Design")
    jobTitles.push("Backend Developer", "Full-Stack Developer")
  }
  if (text.includes("demo") || text.includes("prototype") || text.includes("figma")) {
    skills.push("Prototyping", "Rapid MVP", "Product Thinking")
    jobTitles.push("Product Engineer", "Prototype Developer")
  }
  if (text.includes("data") || text.includes("sql") || text.includes("analysis")) {
    skills.push("SQL", "Data Analysis")
    jobTitles.push("Data Analyst", "Analytics Engineer")
  }

  if (skills.length === 0) {
    skills.push("Problem Solving", "Communication")
    jobTitles.push("Junior Software Developer")
  }

  return {
    skills: uniqueNormalized(skills),
    jobTitles: uniqueNormalized(jobTitles),
    summary: "Generated with local heuristic fallback.",
  }
}

function parseSuggestionJson(text: string): { skills?: string[]; jobTitles?: string[]; summary?: string } {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
  return JSON.parse(cleaned) as { skills?: string[]; jobTitles?: string[]; summary?: string }
}

async function getOpenAISkillRoleSuggestions(
  statement: string
): Promise<{ skills: string[]; jobTitles: string[]; summary: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You map candidate statements to concrete software skills and likely job titles.
Return ONLY valid JSON with this shape:
{"skills": string[], "jobTitles": string[], "summary": string}
Constraints:
- skills should be short tags, 4-12 items.
- jobTitles should be realistic junior-to-mid software roles, 2-6 items.
- summary should be one sentence.
Do not include markdown or extra text.`,
        },
        {
          role: "user",
          content: `Candidate statement: "${statement}"`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI request failed (${response.status}): ${text}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content ?? ""
  const parsed = parseSuggestionJson(content)

  return {
    skills: uniqueNormalized(parsed.skills ?? []),
    jobTitles: uniqueNormalized(parsed.jobTitles ?? []),
    summary: (parsed.summary ?? "").trim(),
  }
}

export async function getPitchSuggestion(
  studentDraft: string,
  briefTitle: string,
  briefDescription: string,
  studentSkills: string[]
): Promise<string> {
  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a pitch coach helping CUNY students land freelance projects.
Your job is to improve their intro message to employers.
Be encouraging, concise, and professional.
Return only the improved message — no preamble or explanation.`,
    messages: [
      {
        role: "user",
        content: `Brief title: ${briefTitle}
Brief description: ${briefDescription}
Student skills: ${studentSkills.join(", ")}

Student's draft message:
"${studentDraft}"

Improve this message to be more compelling while keeping the student's voice. Make it specific to the brief.`,
      },
    ],
  })

  const content = message.content[0]
  return content.type === "text" ? content.text : ""
}

export async function getBriefQualityCheck(
  title: string,
  description: string,
  budget: number,
  deadline: string
): Promise<{ score: number; feedback: string }> {
  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: `You are a brief quality checker for a freelance platform.
Analyze employer briefs and return JSON with a quality score (0-100) and short feedback.
Return only valid JSON: {"score": number, "feedback": "string"}`,
    messages: [
      {
        role: "user",
        content: `Title: ${title}
Description: ${description}
Budget: $${budget}
Deadline: ${deadline}

Rate this brief's clarity and attractiveness to student freelancers.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === "text") {
    try {
      return JSON.parse(content.text)
    } catch {
      return { score: 70, feedback: "Brief looks reasonable." }
    }
  }
  return { score: 70, feedback: "Brief looks reasonable." }
}

export async function getSkillRoleSuggestions(
  statement: string
): Promise<{ skills: string[]; jobTitles: string[]; summary: string }> {
  if (!statement.trim()) {
    return { skills: [], jobTitles: [], summary: "No statement provided." }
  }

  const provider = (
    process.env.AI_PROVIDER ?? (process.env.OPENAI_API_KEY ? "openai" : "anthropic")
  ).toLowerCase()

  if (provider === "openai") {
    try {
      return await getOpenAISkillRoleSuggestions(statement)
    } catch {
      if (!process.env.ANTHROPIC_API_KEY) {
        return localHeuristicSuggestions(statement)
      }
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return localHeuristicSuggestions(statement)
  }

  try {
    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: `You map candidate statements to concrete software skills and likely job titles.
Return ONLY valid JSON with this shape:
{"skills": string[], "jobTitles": string[], "summary": string}
Constraints:
- skills should be short tags, 4-12 items.
- jobTitles should be realistic junior-to-mid software roles, 2-6 items.
- summary should be one sentence.
Do not include markdown or extra text.`,
      messages: [
        {
          role: "user",
          content: `Candidate statement: "${statement}"`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      return localHeuristicSuggestions(statement)
    }

    const parsed = parseSuggestionJson(content.text)
    return {
      skills: uniqueNormalized(parsed.skills ?? []),
      jobTitles: uniqueNormalized(parsed.jobTitles ?? []),
      summary: (parsed.summary ?? "").trim(),
    }
  } catch {
    return localHeuristicSuggestions(statement)
  }
}
