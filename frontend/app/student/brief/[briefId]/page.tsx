"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, Briefcase, CheckCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function BriefDetailPage() {
  const { briefId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [brief, setBrief] = useState<any>(null)
  const [match, setMatch] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: b } = await supabase
        .from("briefs")
        .select("*, profiles(*)")
        .eq("id", briefId)
        .single()
      setBrief(b)

      const { data: m } = await supabase
        .from("matches")
        .select("*")
        .eq("brief_id", briefId)
        .eq("student_id", user.id)
        .single()
      setMatch(m)
      if (m?.status === "accepted") setAccepted(true)
    }
    load()
  }, [briefId])

  async function handleAccept() {
    setAccepting(true)
    await supabase
      .from("matches")
      .update({ status: "accepted" })
      .eq("id", match.id)
    await supabase
      .from("briefs")
      .update({ status: "matched" })
      .eq("id", briefId)
    setAccepted(true)
    setAccepting(false)
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/student/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold">{brief.title}</h1>
              {match && (
                <Badge className="shrink-0">
                  {Math.round((match.ai_score ?? 0.85) * 100)}% match
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />${brief.budget} budget
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Due {new Date(brief.deadline).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {brief.profiles?.company_name ?? "Local business"}
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 mb-6">
              <p>{brief.description}</p>
            </div>

            {brief.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {brief.skills_required.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {!accepted ? (
              <div className="flex gap-3">
                <Button onClick={handleAccept} disabled={accepting} className="flex-1">
                  {accepting ? "Accepting..." : "Accept & Send Pitch"}
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Pass
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You accepted this project!</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/student/pitch/${briefId}`}>
                    Write your pitch with AI Coach <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
