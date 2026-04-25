import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase/client"

const router = Router()

router.post("/dev-signup", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body ?? {}

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName ?? "",
        role: role ?? "student",
      },
    })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ userId: data.user?.id })
  } catch (error) {
    console.error("Dev signup error:", error)
    res.status(500).json({ error: "Dev signup failed" })
  }
})

router.post("/dev-ensure-profile", async (req: Request, res: Response) => {
  try {
    const { id, email, fullName, role } = req.body ?? {}

    if (!id || !email) {
      res.status(400).json({ error: "id and email are required" })
      return
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id,
        email,
        full_name: fullName ?? "",
        role: role ?? "student",
      },
      { onConflict: "id" }
    )

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ ok: true })
  } catch (error) {
    console.error("Ensure profile error:", error)
    res.status(500).json({ error: "Ensure profile failed" })
  }
})

export default router