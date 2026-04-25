import "dotenv/config"
import express from "express"
import cors from "cors"
import pitchCoachRouter from "./routes/pitchCoach"
import briefQualityRouter from "./routes/briefQuality"
import matchRouter from "./routes/match"
import paymentsRouter from "./routes/payments"
import authRouter from "./routes/auth"
import skillAssistRouter from "./routes/skillAssist"

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())

app.use("/api/pitch-coach", pitchCoachRouter)
app.use("/api/brief-quality", briefQualityRouter)
app.use("/api/match", matchRouter)
app.use("/api/payments", paymentsRouter)
app.use("/api/auth", authRouter)
app.use("/api/skill-assist", skillAssistRouter)

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
