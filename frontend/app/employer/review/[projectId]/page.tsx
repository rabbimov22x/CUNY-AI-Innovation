"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle, Download, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/AppNav"

export default function ReviewSubmissionPage() {
  const { projectId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [submission, setSubmission] = useState<any>(null)
  const [brief, setBrief] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading, setLoading] = useState(false)
  const [released, setReleased] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sub } = await supabase.from("submissions").select("*, briefs(*), profiles(*)")
        .eq("brief_id", projectId).single()
      if (sub) { setSubmission(sub); setBrief(sub.briefs); setStudent(sub.profiles) }
    }
    load()
  }, [projectId])

  async function handleRelease() {
    if (!rating) return
    setLoading(true)
    await supabase.from("reviews").insert({ submission_id: submission.id, employer_id: submission.briefs.employer_id, student_id: submission.student_id, rating, comment })
    await supabase.from("briefs").update({ status: "completed" }).eq("id", projectId)
    await supabase.from("submissions").update({ status: "approved" }).eq("id", submission.id)
    await fetch("/api/payments/release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ briefId: projectId, submissionId: submission.id }) })
    setReleased(true); setLoading(false)
  }

  if (released) return (
    <div className="min-h-screen"><AppNav role="employer" />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="max-w-md w-full text-center border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment released!</h2>
            <p className="text-white/45 mb-6">Review submitted and payment sent to {student?.full_name ?? "the student"}.</p>
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
        <h1 className="text-2xl font-bold text-white mb-2">Review Submission</h1>
        <p className="text-white/40 mb-8">Review the work, leave a rating, and release payment.</p>

        {brief && (
          <Card className="mb-6 border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg text-white mb-1">{brief.title}</h2>
              <p className="text-white/45 text-sm">{brief.description}</p>
              <div className="mt-3 text-sm text-white/35">
                Budget: <span className="text-white/65">${brief.budget}</span> · Student:{" "}
                <span className="text-white/65">{student?.full_name ?? "Unknown"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {submission && (
          <Card className="mb-6 border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardHeader><CardTitle className="text-base text-white">Submitted Files</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {submission.notes && (
                <div className="bg-white/5 p-3 rounded-xl text-sm text-white/45">
                  <span className="text-white/65 font-medium">Student note:</span> {submission.notes}
                </div>
              )}
              {(submission.file_urls ?? []).map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-white/8 rounded-xl hover:border-violet-500/30 hover:bg-violet-500/5 text-sm text-violet-400 transition-all">
                  <Download className="h-4 w-4" /> Deliverable {i + 1} <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardHeader><CardTitle className="text-base text-white">Rate the Work</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 ${star <= (hoveredStar || rating) ? "fill-yellow-400 text-yellow-400" : "text-white/10"}`} />
                </button>
              ))}
              {rating > 0 && <span className="text-sm text-white/35 ml-2">{["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white/60">
                Leave a comment <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="What did the student do well? What could they improve?"
                rows={3} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none focus:border-violet-500/50" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleRelease} className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" size="lg" disabled={!rating || loading}>
          {loading ? "Releasing..." : "Submit Review & Release Payment"}
        </Button>
      </div>
    </div>
  )
}
