import { Router, Request, Response } from "express"
import { getBriefQualityCheck } from "../lib/claude"

const router = Router()

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, budget, deadline } = req.body
    const result = await getBriefQualityCheck(title, description, budget, deadline)
    res.json(result)
  } catch (error) {
    console.error("Brief quality check error:", error)
    res.json({ score: 70, feedback: "Unable to check at this time." })
  }
})

export default router
