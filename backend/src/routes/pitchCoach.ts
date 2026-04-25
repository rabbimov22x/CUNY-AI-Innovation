import { Router, Request, Response } from "express"
import { getPitchSuggestion } from "../lib/claude"

const router = Router()

router.post("/", async (req: Request, res: Response) => {
  try {
    const { draft, briefTitle, briefDescription, skills } = req.body

    if (!draft || !briefTitle) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    const suggestion = await getPitchSuggestion(
      draft,
      briefTitle,
      briefDescription ?? "",
      skills ?? []
    )
    res.json({ suggestion })
  } catch (error) {
    console.error("Pitch coach error:", error)
    res.status(500).json({ error: "Failed to generate suggestion" })
  }
})

export default router
