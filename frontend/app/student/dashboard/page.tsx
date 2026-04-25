import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, DollarSign, Clock, ArrowRight, Sparkles } from "lucide-react"
import AppNav from "@/components/AppNav"

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: matches } = await supabase
    .from("matches").select("*, briefs(*, profiles(*))").eq("student_id", user.id).order("created_at", { ascending: false })
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const missingSkills = !Array.isArray(profile?.skills) || profile.skills.length === 0
  const missingBio = !profile?.bio || profile.bio.trim().length === 0
  if (missingSkills || missingBio) redirect("/student/profile?onboarding=1")

  const pendingMatches = (matches ?? []).filter((m) => m.status === "pending")
  const activeMatches = (matches ?? []).filter((m) => m.status === "accepted")

  return (
    <div className="min-h-screen">
      <AppNav role="student" />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-white/8 pb-8">
          <div>
            <p className="text-violet-400 text-xs uppercase tracking-widest mb-1">Student Dashboard</p>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {profile?.full_name?.split(" ")[0] ?? "Student"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-white/10 text-white/60 hover:bg-white/8 hover:text-white rounded-full">
              <Link href="/student/profile">Edit Profile</Link>
            </Button>
            <Button variant="outline" asChild className="border-white/10 text-white/60 hover:bg-white/8 hover:text-white rounded-full">
              <Link href="/student/portfolio">Portfolio</Link>
            </Button>
          </div>
        </div>

        {/* New matches */}
        {pendingMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-violet-400" />
              <h2 className="font-semibold text-white">
                {pendingMatches.length} new match{pendingMatches.length > 1 ? "es" : ""}
              </h2>
              <span className="bg-violet-500 text-white text-xs rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> AI Matched
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingMatches.map((match) => (
                <Card key={match.id} className="border-white/10 hover:border-violet-500/30 transition-all hover:bg-violet-500/5"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{match.briefs?.title}</h3>
                      <Badge className="ml-2 shrink-0 bg-violet-500/20 text-violet-300 border-0">
                        {Math.round(match.ai_score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-white/45 line-clamp-2 mb-4">{match.briefs?.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/35">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${match.briefs?.budget}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due {new Date(match.briefs?.deadline).toLocaleDateString()}</span>
                      </div>
                      <Button size="sm" asChild className="bg-violet-500 hover:bg-violet-600 text-white rounded-full px-4">
                        <Link href={`/student/brief/${match.brief_id}`}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active projects */}
        {activeMatches.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-4">Active Projects</h2>
            <div className="space-y-3">
              {activeMatches.map((match) => (
                <Card key={match.id} className="border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <CardContent className="pt-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{match.briefs?.title}</h3>
                      <p className="text-sm text-white/35">${match.briefs?.budget} · Due {new Date(match.briefs?.deadline).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild className="border-white/10 text-white/60 hover:bg-white/8 hover:text-white rounded-full">
                      <Link href={`/student/workspace/${match.id}`}>Open Workspace</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(matches ?? []).length === 0 && (
          <Card className="border-white/8 text-center py-16" style={{ background: "rgba(255,255,255,0.03)" }}>
            <CardContent>
              <Sparkles className="h-10 w-10 text-violet-500/40 mx-auto mb-3" />
              <p className="text-white/40 mb-1">No matches yet.</p>
              <p className="text-sm text-white/25">Complete your profile to improve your match rate.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
