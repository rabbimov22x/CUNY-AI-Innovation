"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle, Download, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
      const { data: sub } = await supabase
        .from("submissions")
        .select("*, briefs(*), profiles(*)")
        .eq("brief_id", projectId)
        .single()

      if (sub) {
        setSubmission(sub)
        setBrief(sub.briefs)
        setStudent(sub.profiles)
      }
    }
    load()
  }, [projectId])

  async function handleRelease() {
    if (!rating) return
    setLoading(true)

    await supabase.from("reviews").insert({
      submission_id: submission.id,
      employer_id: submission.briefs.employer_id,
      student_id: submission.student_id,
      rating,
      comment,
    })

    await supabase.from("briefs").update({ status: "completed" }).eq("id", projectId)
    await supabase
      .from("submissions")
      .update({ status: "approved" })
      .eq("id", submission.id)

    // In production: trigger Stripe payment release here
    await fetch("/api/payments/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId: projectId, submissionId: submission.id }),
    })

    setReleased(true)
    setLoading(false)
  }

  if (released) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment released!</h2>
            <p className="text-gray-600 mb-6">
              Your review has been submitted and payment sent to{" "}
              {student?.full_name ?? "the student"}. Their portfolio has been updated.
            </p>
            <Button onClick={() => router.push("/employer/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Review Submission</h1>
        <p className="text-gray-500 mb-8">
          Review the work, leave a rating, and release payment.
        </p>

        {/* Brief summary */}
        {brief && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-1">{brief.title}</h2>
              <p className="text-gray-600 text-sm">{brief.description}</p>
              <div className="mt-3 text-sm text-gray-500">
                Budget: <strong>${brief.budget}</strong> · Student:{" "}
                <strong>{student?.full_name ?? "Unknown"}</strong>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission files */}
        {submission && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Submitted Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submission.notes && (
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  <strong>Student note:</strong> {submission.notes}
                </div>
              )}
              {(submission.file_urls ?? []).map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50 text-sm text-blue-600"
                >
                  <Download className="h-4 w-4" />
                  Deliverable {i + 1}
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              ))}
              {submission.video_asset_id && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <p className="text-white text-center pt-20 text-sm">
                    Video playback — install @mux/mux-player-react
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Rate the Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500 self-center ml-2">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave a comment{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did the student do well? What could they improve?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleRelease}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          disabled={!rating || loading}
        >
          {loading ? "Releasing..." : "Submit Review & Release Payment"}
        </Button>
      </div>
    </div>
  )
}
