import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase/client"
import Anthropic from "@anthropic-ai/sdk"
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const router = Router()

router.post("/", async (req: Request, res: Response) => {
  try {
    const { briefId } = req.body

    const { data: brief } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", briefId)
      .single()

    if (!brief) {
      res.status(404).json({ error: "Brief not found" })
      return
    }

    const { data: students } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .limit(50)

    if (!students?.length) {
      res.json({ matches: 0 })
      return
    }

    const matchPromises = students.map(async (student) => {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system: 'You are a matching engine. Return only a JSON object: {"score": 0.0-1.0}',
        messages: [
          {
            role: "user",
            content: `Brief: ${brief.title}. Skills needed: ${brief.skills_required?.join(", ")}.
Student skills: ${student.skills?.join(", ") ?? "general"}.
Score the match from 0 to 1.`,
          },
        ],
      })

      let score = 0.7
      const content = message.content[0]
      if (content.type === "text") {
        try {
          score = JSON.parse(content.text).score ?? 0.7
        } catch {}
      }
      return { student, score }
    })

    const scored = await Promise.all(matchPromises)
    const topMatches = scored
      .filter((m) => m.score >= 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    for (const { student, score } of topMatches) {
      await supabase.from("matches").upsert(
        { brief_id: briefId, student_id: student.id, status: "pending", ai_score: score },
        { onConflict: "brief_id,student_id" }
      )
    }

    res.json({ matches: topMatches.length })
  } catch (error) {
    console.error("Match error:", error)
    res.status(500).json({ error: "Matching failed" })
  }
})

export default router
