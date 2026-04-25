import { Router, Request, Response } from "express"
import { getSkillRoleSuggestions } from "../lib/claude"

const router = Router()

router.post("/suggest", async (req: Request, res: Response) => {
  try {
    const statement = String(req.body?.statement ?? "").trim()

    if (!statement) {
      res.status(400).json({ error: "statement is required" })
      return
    }

    const result = await getSkillRoleSuggestions(statement)
    res.json(result)
  } catch (error) {
    console.error("Skill assist error:", error)
    res.status(500).json({ error: "Failed to generate skill suggestions" })
  }
})

export default router
