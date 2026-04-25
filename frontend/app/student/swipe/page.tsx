"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Sparkles,
  DollarSign,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

type MatchResult = {
  brief: {
    id: string
    title: string
    description: string
    skills_required: string[]
    budget: number
    deadline: string
  }
  score: number
  reason: string
}

export default function MatchPage() {
  const router = useRouter()
  const supabase = createClient()

  const [matches, setMatches] = useState<MatchResult[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  useEffect(() => {
    async function loadMatch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/student-match`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: user.id }),
          }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to load match")
        if (!data.matches?.length) { setDone(true); setLoading(false); return }
        setMatches(data.matches)
      } catch (err: any) {
        setError(err.message ?? "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }
    loadMatch()
  }, [])

  async function handleAccept() {
    if (accepting) return
    setAccepting(true)
    const card = matches[current]
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("matches")
      .update({ status: "accepted" })
      .eq("brief_id", card.brief.id)
      .eq("student_id", user.id)

    // Get the match id to redirect to messaging
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .eq("brief_id", card.brief.id)
      .eq("student_id", user.id)
      .single()

    setMatchId(match?.id ?? null)
    setAccepted(true)
    setAccepting(false)
  }

  async function handleSkip() {
    const card = matches[current]
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("brief_id", card.brief.id)
        .eq("student_id", user.id)
    }
    const next = current + 1
    if (next >= matches.length) setDone(true)
    else setCurrent(next)
  }

  const card = matches[current]
  const isTopMatch = current === 0

  // ── Accepted state ──────────────────────────────────────────
  if (accepted && card) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex flex-col">
        <div className="bg-white border-b border-[#e1e2ed] sticky top-0 z-40">
          <div className="container mx-auto px-4 max-w-lg h-16 flex items-center justify-between">
            <Link href="/student/dashboard" className="flex items-center gap-1.5 text-[#434655] hover:text-[#004ac6]">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 font-bold text-lg text-[#004ac6]">
              <GraduationCap className="h-5 w-5" />
              StartNow
            </div>
            <div className="w-20" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#191b23]">You're matched!</h1>
            <p className="text-[#434655] text-sm mt-2 max-w-xs mx-auto">
              You've been matched with <span className="font-semibold">{card.brief.title}</span>. Now introduce yourself to the employer.
            </p>
          </div>
          <Button
            className="bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl w-full h-12 text-base font-semibold"
            onClick={() => router.push(`/student/message/${matchId}`)}
          >
            Send Intro Message
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Link href="/student/dashboard" className="text-sm text-[#737686] hover:text-[#004ac6] underline">
            Do this later
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#e1e2ed] sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-lg h-16 flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-1.5 text-[#434655] hover:text-[#004ac6]">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2 font-bold text-lg text-[#004ac6]">
            <GraduationCap className="h-5 w-5" />
            StartNow
          </div>
          <div className="w-16 text-right text-xs text-[#737686]">
            {!loading && !done && matches.length > 1 && `${current + 1} / ${matches.length}`}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">

        {/* Loading */}
        {loading && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#dbe1ff] flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-[#004ac6] animate-pulse" />
            </div>
            <p className="font-semibold text-[#191b23]">Finding your best match...</p>
            <p className="text-sm text-[#737686]">
              Claude is reviewing open projects against your skills and background.
            </p>
            <Loader2 className="h-5 w-5 text-[#004ac6] animate-spin mx-auto mt-2" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center space-y-4">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            <Button onClick={() => router.push("/student/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* No matches */}
        {done && !loading && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#f3f3fe] flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-[#004ac6]/40" />
            </div>
            <p className="font-bold text-xl text-[#191b23]">No new matches right now</p>
            <p className="text-sm text-[#737686] max-w-xs mx-auto">
              Check back soon — new project briefs are posted regularly.
            </p>
            <Button className="bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl" onClick={() => router.push("/student/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Match card */}
        {!loading && !done && card && (
          <div className="w-full space-y-4">

            {/* Top match label */}
            {isTopMatch && (
              <div className="flex justify-center">
                <span className="flex items-center gap-1.5 bg-[#004ac6] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Best Match — {Math.round(card.score * 100)}% fit
                </span>
              </div>
            )}

            {/* AI reason */}
            <p className="text-center text-sm text-[#434655] italic">"{card.reason}"</p>

            {/* Card */}
            <div className="bg-white rounded-3xl border border-[#e1e2ed] shadow-sm overflow-hidden">
              <div className="bg-[#004ac6] px-6 pt-6 pb-8">
                <p className="text-[#b4c5ff] text-xs font-semibold uppercase tracking-wide mb-2">
                  Open Project
                </p>
                <h2 className="text-white font-bold text-2xl leading-snug">
                  {card.brief.title}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                <p className="text-[#434655] text-sm leading-relaxed">
                  {card.brief.description}
                </p>

                {card.brief.skills_required?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#737686] uppercase tracking-wide mb-2">
                      Skills needed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {card.brief.skills_required.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-[#dbe1ff]/60 text-[#004ac6] border border-[#b4c5ff]/50 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#191b23]">
                    <DollarSign className="h-4 w-4 text-[#007d55]" />
                    ${card.brief.budget?.toLocaleString()}
                  </div>
                  <div className="h-4 w-px bg-[#e1e2ed]" />
                  <div className="flex items-center gap-1.5 text-sm text-[#737686]">
                    <Clock className="h-4 w-4" />
                    Due {new Date(card.brief.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full h-13 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-2xl text-base font-bold py-4"
            >
              {accepting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>Accept Match <ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            <button
              onClick={handleSkip}
              className="w-full text-sm text-[#737686] hover:text-[#004ac6] flex items-center justify-center gap-1 py-1 transition-colors"
            >
              Show me a different match <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
