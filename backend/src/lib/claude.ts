import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getPitchSuggestion(
  studentDraft: string,
  briefTitle: string,
  briefDescription: string,
  studentSkills: string[]
): Promise<string> {
  const message = await anthropic.messages.create({
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
  const message = await anthropic.messages.create({
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
