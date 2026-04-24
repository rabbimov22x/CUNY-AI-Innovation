import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase/client"

const router = Router()

router.post("/release", async (req: Request, res: Response) => {
  try {
    const { briefId, submissionId } = req.body

    const { data: brief } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", briefId)
      .single()

    if (!brief) {
      res.status(404).json({ error: "Brief not found" })
      return
    }

    // In production: await capturePayment(brief.payment_intent_id)
    await supabase.from("submissions").update({ status: "approved" }).eq("id", submissionId)
    await supabase.from("briefs").update({ status: "completed" }).eq("id", briefId)

    res.json({ success: true, amount: brief.budget })
  } catch (error) {
    console.error("Payment release error:", error)
    res.status(500).json({ error: "Payment release failed" })
  }
})

export default router
