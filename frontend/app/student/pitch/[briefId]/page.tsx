"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Send, RefreshCw, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/AppNav"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function PitchCoachPage() {
  const { briefId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [brief, setBrief] = useState<any>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [draft, setDraft] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const { data: b } = await supabase.from("briefs").select("*").eq("id", briefId).single()
      setBrief(b)
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setStudentProfile(p)
    }
    load()
  }, [briefId])

  useEffect(() => {
    if (!draft || draft.length < 30 || !brief) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchSuggestion() }, 1200)
    return () => clearTimeout(debounceRef.current)
  }, [draft, brief])

  async function fetchSuggestion() {
    if (!draft || !brief) return
    setLoadingSuggestion(true)
    try {
      const res = await fetch(`${API}/api/pitch-coach`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, briefTitle: brief.title, briefDescription: brief.description, skills: studentProfile?.skills ?? [] }),
      })
      const data = await res.json()
      setSuggestion(data.suggestion ?? "")
    } catch {}
    setLoadingSuggestion(false)
  }

  function applysuggestion() { setDraft(suggestion); setSuggestion("") }

  async function handleSend() {
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: match } = await supabase.from("matches").select("id").eq("brief_id", briefId).eq("student_id", user.id).single()
    if (match) {
      await supabase.from("messages").insert({ match_id: match.id, sender_id: user.id, content: draft, is_ai_suggestion: false })
      await supabase.from("briefs").update({ status: "in_progress" }).eq("id", briefId)
    }
    setSent(true); setSending(false)
  }

  if (sent) return (
    <div className="min-h-screen"><AppNav role="student" />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="max-w-md w-full text-center border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-violet-500/15 border border-violet-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pitch sent!</h2>
            <p className="text-white/45 mb-6">Your message is on its way to the employer. Now start working on the project.</p>
            <Button onClick={() => router.push(`/student/workspace/new?briefId=${briefId}`)} className="bg-white text-black hover:bg-violet-100 rounded-full px-6">
              Go to Project Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <AppNav role="student" />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">AI Pitch Coach</h1>
          <p className="text-white/40">Write your intro. Claude will suggest improvements in real time.</p>
        </div>
        {brief && (
          <Card className="mb-4 border-violet-500/20" style={{ background: "rgba(139,92,246,0.05)" }}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm font-medium text-white">{brief.title}</p>
              <p className="text-xs text-violet-400/70 mt-1 line-clamp-2">{brief.description}</p>
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardHeader><CardTitle className="text-base text-white">Your message</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder="Hi, I'm interested in your project. I'm a CUNY student studying..."
                rows={8} className="resize-none bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              <p className="text-xs text-white/25 mt-2">
                {draft.length < 30 ? `Type ${30 - draft.length} more characters to activate AI coaching` : "✦ AI coaching active"}
              </p>
            </CardContent>
          </Card>

          <Card className={`transition-all ${suggestion ? "border-violet-500/40" : "border-dashed border-white/10"}`}
            style={{ background: suggestion ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.02)" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${loadingSuggestion ? "text-violet-400 animate-pulse" : "text-violet-400"}`} />
                <CardTitle className="text-base text-violet-300">
                  {loadingSuggestion ? "Claude is reviewing your pitch..." : "Claude's Suggestion"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {suggestion ? (
                <>
                  <p className="text-sm text-white/60 whitespace-pre-wrap bg-white/5 p-3 rounded-xl mb-3">{suggestion}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={applysuggestion} className="bg-violet-500 hover:bg-violet-600 text-white rounded-full">Use this version</Button>
                    <Button size="sm" variant="outline" onClick={fetchSuggestion}
                      className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 rounded-full">
                      <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/25">
                  {loadingSuggestion ? "Analyzing your draft..." : "Start typing above to get real-time AI coaching."}
                </p>
              )}
            </CardContent>
          </Card>

          <Button className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" size="lg"
            onClick={handleSend} disabled={!draft || sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Pitch to Employer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
