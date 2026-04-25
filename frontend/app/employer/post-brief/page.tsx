"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/AppNav"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function PostBriefPage() {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [qualityCheck, setQualityCheck] = useState<{ score: number; feedback: string } | null>(null)
  const [error, setError] = useState("")
  const [matched, setMatched] = useState(false)

  async function checkQuality() {
    if (!title || !description || !budget || !deadline) return
    setChecking(true)
    const res = await fetch(`${API}/api/brief-quality`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, budget: Number(budget), deadline }),
    })
    setQualityCheck(await res.json()); setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth/login"); return }
    const { data: brief, error: insertError } = await supabase.from("briefs").insert({
      employer_id: user.id, title, description,
      skills_required: skills.split(",").map((s) => s.trim()).filter(Boolean),
      budget: Number(budget), deadline, status: "open",
    }).select().single()
    if (insertError) { setError(insertError.message); setLoading(false); return }
    await fetch(`${API}/api/match`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ briefId: brief.id }) })
    setMatched(true); setLoading(false)
  }

  if (matched) return (
    <div className="min-h-screen">
      <AppNav role="employer" />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="max-w-md w-full text-center border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Brief posted!</h2>
            <p className="text-white/45 mb-2">Your brief is live. AI is scanning student profiles to find your best matches.</p>
            <p className="text-sm text-white/25 mb-6">You&apos;ll be notified when students are matched.</p>
            <Button onClick={() => router.push("/employer/dashboard")} className="bg-white text-black hover:bg-violet-100 rounded-full px-6">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <AppNav role="employer" />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Post a Project Brief</h1>
        <p className="text-white/40 mb-8">Be specific — the more detail you add, the better your student matches.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardHeader><CardTitle className="text-lg text-white">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Project title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Restaurant website redesign" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need, the deliverables, and any context..." rows={5} required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Skills needed <span className="text-white/25 font-normal">(comma separated)</span></label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, UI/UX, Figma"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/60">Budget (USD)</label>
                  <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500" min={50} required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/60">Deadline</label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Quality Check */}
          <Card className="border-violet-500/20" style={{ background: "rgba(139,92,246,0.05)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <span className="font-medium text-white">AI Brief Quality Check</span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={checkQuality}
                  disabled={checking || !title || !description}
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 rounded-full">
                  {checking ? "Analyzing..." : "Check quality"}
                </Button>
              </div>
              {qualityCheck && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {qualityCheck.score >= 70
                      ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                      : <AlertCircle className="h-4 w-4 text-yellow-400" />}
                    <span className="font-medium text-white">Quality score: {qualityCheck.score}/100</span>
                  </div>
                  <p className="text-sm text-white/50">{qualityCheck.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {error && <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
          <Button type="submit" className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" size="lg" disabled={loading}>
            {loading ? "Posting..." : "Post Brief & Find Matches"}
          </Button>
        </form>
      </div>
    </div>
  )
}
