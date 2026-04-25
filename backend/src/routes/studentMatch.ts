import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase/client"
import { anthropic } from "../lib/claude"

const router = Router()

// Student clicks "Get Matches" — scores open briefs against their profile
router.post("/", async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body

    if (!studentId) {
      res.status(400).json({ error: "studentId is required" })
      return
    }

    const { data: student } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single()

    if (!student) {
      res.status(404).json({ error: "Student not found" })
      return
    }

    // Fetch open briefs this student hasn't been matched with yet
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("brief_id")
      .eq("student_id", studentId)

    const excludedBriefIds = (existingMatches ?? []).map((m) => m.brief_id)

    let briefQuery = supabase
      .from("briefs")
      .select("*")
      .eq("status", "open")
      .limit(20)

    if (excludedBriefIds.length > 0) {
      briefQuery = briefQuery.not("id", "in", `(${excludedBriefIds.join(",")})`)
    }

    const { data: briefs } = await briefQuery

    if (!briefs?.length) {
      res.json({ matches: [] })
      return
    }

    // Score each brief against the student using Claude
    const results = await Promise.allSettled(
      briefs.map(async (brief) => {
        const message = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          system: `You are a matching engine for a student freelance platform.
Given a student profile and a project brief, return a JSON object with:
- score: a number from 0.0 to 1.0 representing fit
- reason: one short sentence (max 12 words) explaining the match

Return only valid JSON: {"score": 0.85, "reason": "Your React skills align well with this frontend project."}`,
          messages: [
            {
              role: "user",
              content: `Student:
- Major: ${student.major ?? "Not specified"}
- School: ${student.cuny_school ?? "CUNY"}
- Skills: ${student.skills?.join(", ") ?? "general"}
- Bio: ${student.bio ?? "No bio provided"}

Brief:
- Title: ${brief.title}
- Description: ${brief.description}
- Skills required: ${brief.skills_required?.join(", ") ?? "none listed"}
- Budget: $${brief.budget}

Score this match.`,
            },
          ],
        })

        let score = 0.65
        let reason = "Your background looks relevant to this project."

        const content = message.content[0]
        if (content.type === "text") {
          try {
            const parsed = JSON.parse(content.text)
            score = parsed.score ?? score
            reason = parsed.reason ?? reason
          } catch {}
        }

        return { brief, score, reason }
      })
    )

    // Filter out failed calls, keep successful scores
    const scored = results
      .filter((r): r is PromiseFulfilledResult<{ brief: any; score: number; reason: string }> => r.status === "fulfilled")
      .map((r) => r.value)

    if (scored.length === 0) {
      const errors = results.map((r) => r.status === "rejected" ? r.reason?.message ?? r.reason : "ok")
      console.error("All Claude scoring calls failed. First error:", errors[0])
      res.status(500).json({ error: `Claude error: ${errors[0]}` })
      return
    }

    // Keep matches above 0.5, sorted best first
    const topMatches = scored
      .filter((m) => m.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Save matches to DB
    for (const { brief, score } of topMatches) {
      await supabase.from("matches").upsert(
        {
          brief_id: brief.id,
          student_id: studentId,
          status: "pending",
          ai_score: score,
        },
        { onConflict: "brief_id,student_id" }
      )
    }

    // Return the scored briefs with reasons for the swipe UI
    res.json({
      matches: topMatches.map(({ brief, score, reason }) => ({
        brief,
        score,
        reason,
      })),
    })
  } catch (error: any) {
    console.error("Student match error:", error?.message ?? error)
    res.status(500).json({ error: error?.message ?? "Matching failed" })
  }
})

export default router
