"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Send, RefreshCw, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          briefTitle: brief.title,
          briefDescription: brief.description,
          skills: studentProfile?.skills ?? [],
        }),
      })
      const data = await res.json()
      setSuggestion(data.suggestion ?? "")
    } catch {}
    setLoadingSuggestion(false)
  }

  function applysuggestion() {
    setDraft(suggestion)
    setSuggestion("")
  }

  async function handleSend() {
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .eq("brief_id", briefId)
      .eq("student_id", user.id)
      .single()

    if (match) {
      await supabase.from("messages").insert({
        match_id: match.id,
        sender_id: user.id,
        content: draft,
        is_ai_suggestion: false,
      })
      await supabase.from("briefs").update({ status: "in_progress" }).eq("id", briefId)
    }

    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pitch sent!</h2>
            <p className="text-gray-600 mb-6">
              Your message is on its way to the employer. Now start working on the project.
            </p>
            <Button onClick={() => router.push(`/student/workspace/new?briefId=${briefId}`)}>
              Go to Project Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Pitch Coach</h1>
          <p className="text-gray-500">
            Write your intro to the employer. Claude will suggest improvements in real time.
          </p>
        </div>

        {brief && (
          <Card className="mb-4 bg-blue-50 border-blue-100">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm font-medium text-blue-900">{brief.title}</p>
              <p className="text-xs text-blue-700 mt-1 line-clamp-2">{brief.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your message</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Hi, I'm interested in your project. I'm a CUNY student studying..."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                {draft.length < 30
                  ? `Type at least ${30 - draft.length} more characters to activate AI coaching`
                  : "AI coaching active — suggestions appear below as you type"}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 transition-all ${
              suggestion ? "border-blue-300 shadow-md" : "border-dashed border-gray-200"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles
                  className={`h-5 w-5 ${
                    loadingSuggestion ? "text-blue-400 animate-pulse" : "text-blue-600"
                  }`}
                />
                <CardTitle className="text-base text-blue-700">
                  {loadingSuggestion
                    ? "Claude is reviewing your pitch..."
                    : "Claude's Suggestion"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {suggestion ? (
                <>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 p-3 rounded-md mb-3">
                    {suggestion}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={applysuggestion}>
                      Use this version
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchSuggestion}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  {loadingSuggestion
                    ? "Analyzing your draft..."
                    : "Start typing your pitch above to get real-time AI coaching."}
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={!draft || sending}
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Pitch to Employer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
