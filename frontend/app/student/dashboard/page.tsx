import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Bell,
  DollarSign,
  Clock,
  ArrowRight,
  Star,
  Sparkles,
  Briefcase,
  LayoutDashboard,
  FolderOpen,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Only redirect to onboarding if the user hasn't skipped it
  const skipped = searchParams?.onboarding === "skipped"
  const isNewUser = !profile?.cuny_school || !profile?.major || !profile?.skills?.length
  if (isNewUser && !skipped) redirect("/student/onboarding")

  const { data: matches } = await supabase
    .from("matches")
    .select("*, briefs(*, profiles(*))")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const pendingMatches = (matches ?? []).filter((m) => m.status === "pending")
  const activeMatches = (matches ?? []).filter((m) => m.status === "accepted")
  const completedMatches = (matches ?? []).filter((m) => m.status === "completed")

  const firstName = profile?.full_name?.split(" ")[0] ?? "Student"
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST"

  const totalEarnings = completedMatches.reduce(
    (sum: number, m: any) => sum + (m.briefs?.budget ?? 0),
    0
  )

  return (
    <div className="min-h-screen bg-[#faf8ff] pb-24">

      {/* Top bar */}
      <div className="bg-white border-b border-[#e1e2ed] sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-2 font-bold text-lg text-[#004ac6]">
            <GraduationCap className="h-5 w-5" />
            StartNow
          </div>
          <div className="flex items-center gap-3">
            {pendingMatches.length > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-[#434655]" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#004ac6] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingMatches.length}
                </span>
              </div>
            )}
            <div className="h-9 w-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">

        {/* Greeting + verification badge */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#191b23]">Hello, {firstName}</h1>
            {profile?.verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Student
              </span>
            )}
          </div>
          <p className="text-[#434655] text-sm mt-0.5">
            {profile?.cuny_school} · {profile?.major}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#e1e2ed] p-4">
            <p className="text-xs font-semibold text-[#737686] uppercase tracking-wide mb-1">
              Total Earnings
            </p>
            <p className="text-3xl font-bold text-[#191b23]">
              ${totalEarnings.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {completedMatches.length} project{completedMatches.length !== 1 ? "s" : ""} completed
            </p>
          </div>

          <Link href="/student/portfolio" className="block">
            <div className="bg-[#2563eb] rounded-2xl p-4 h-full flex flex-col justify-between cursor-pointer hover:bg-[#1d4ed8] transition-colors">
              <p className="text-sm font-semibold text-white/90">My Portfolio</p>
              <div className="flex items-center justify-between mt-4">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5 text-sm text-[#434655]">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{profile?.rating ? profile.rating.toFixed(1) : "—"}</span>
            <span className="text-[#737686]">rating</span>
          </div>
          <div className="h-4 w-px bg-[#e1e2ed]" />
          <div className="flex items-center gap-1.5 text-sm text-[#434655]">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">{profile?.strikes ?? 0}</span>
            <span className="text-[#737686]">strikes</span>
          </div>
          <div className="h-4 w-px bg-[#e1e2ed]" />
          <div className="flex items-center gap-1.5 text-sm text-[#434655]">
            <Briefcase className="h-4 w-4 text-[#004ac6]" />
            <span className="font-semibold">{activeMatches.length}</span>
            <span className="text-[#737686]">active</span>
          </div>
        </div>

        {/* Skills chips */}
        {profile?.skills?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#191b23] mb-2">Your Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-xs font-medium bg-[#dbe1ff]/60 text-[#004ac6] border border-[#b4c5ff]/50 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* New matches */}
        {pendingMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#004ac6]" />
              <h2 className="font-semibold text-[#191b23]">AI Match of the Day</h2>
              <span className="bg-[#004ac6] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                {pendingMatches.length} new
              </span>
            </div>
            <div className="space-y-3">
              {pendingMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-[#e1e2ed] overflow-hidden hover:border-[#004ac6]/40 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-3">
                        <p className="text-xs font-semibold text-[#004ac6] uppercase tracking-wide mb-1">
                          {match.briefs?.profiles?.company_name ?? "Local Business"}
                        </p>
                        <h3 className="font-bold text-[#191b23] leading-snug">
                          {match.briefs?.title}
                        </h3>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 bg-[#faf8ff] border border-[#c3c6d7] text-[#191b23] text-xs font-bold rounded-full px-2.5 py-1">
                        <Sparkles className="h-3 w-3 text-[#004ac6]" />
                        {Math.round(match.ai_score * 100)}% Match
                      </span>
                    </div>
                    <p className="text-sm text-[#434655] line-clamp-2 mb-3">
                      {match.briefs?.description}
                    </p>
                    {match.briefs?.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {match.briefs.skills_required.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 text-xs bg-[#dbe1ff]/50 text-[#004ac6] rounded-full border border-[#b4c5ff]/40"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-[#737686]">
                        <span className="flex items-center gap-1 font-semibold text-[#191b23]">
                          <DollarSign className="h-3.5 w-3.5 text-[#007d55]" />
                          ${match.briefs?.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Due {new Date(match.briefs?.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <Button size="sm" className="bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl" asChild>
                        <Link href={`/student/brief/${match.brief_id}`}>
                          View Project <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active contracts */}
        {activeMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#191b23]">Active Contracts</h2>
              <Link href="/student/workspace" className="text-sm text-[#004ac6] font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-[#e1e2ed] divide-y divide-[#f3f3fe]">
              {activeMatches.map((match: any, i: number) => {
                const progress = match.progress_percent ?? Math.floor(Math.random() * 60 + 20)
                return (
                  <Link key={match.id} href={`/student/workspace/${match.id}`} className="block p-4 hover:bg-[#f3f3fe] transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-[#191b23] text-sm">{match.briefs?.title}</h3>
                        <p className="text-xs text-[#737686] mt-0.5">
                          Due {new Date(match.briefs?.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#007d55]">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#e1e2ed] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007d55] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#737686]">${match.briefs?.budget} contract</span>
                      <span className="text-xs text-[#004ac6] font-medium">Open Workspace →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(matches ?? []).length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-[#c3c6d7] py-14 text-center">
            <Sparkles className="h-8 w-8 text-[#004ac6]/40 mx-auto mb-3" />
            <p className="font-semibold text-[#191b23]">No matches yet</p>
            <p className="text-sm text-[#737686] mt-1 max-w-xs mx-auto">
              Hit "Get Matches" below — our AI will find the best-fit projects for your skills.
            </p>
          </div>
        )}

        {/* Get Matches CTA */}
        <div className="bg-[#004ac6] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-base">Ready for your next project?</p>
            <p className="text-[#b4c5ff] text-sm mt-0.5">
              Our AI scans live briefs and surfaces the best fits for your skills.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-[#004ac6] hover:bg-[#eeefff] font-bold rounded-xl shrink-0 w-full sm:w-auto"
            asChild
          >
            <Link href="/student/brief">
              <Sparkles className="mr-2 h-4 w-4" />
              Get Matches
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e1e2ed] z-40">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-around h-16">
            <Link href="/student/dashboard" className="flex flex-col items-center gap-1 text-[#004ac6]">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Dashboard</span>
            </Link>
            <Link href="/student/brief" className="flex flex-col items-center gap-1 text-[#737686] hover:text-[#004ac6] transition-colors">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-[10px] font-medium">Market</span>
            </Link>
            <Link href="/student/workspace" className="flex flex-col items-center gap-1 text-[#737686] hover:text-[#004ac6] transition-colors">
              <Briefcase className="h-5 w-5" />
              <span className="text-[10px] font-medium">Workspace</span>
            </Link>
            <Link href="/student/portfolio" className="flex flex-col items-center gap-1 text-[#737686] hover:text-[#004ac6] transition-colors">
              <FolderOpen className="h-5 w-5" />
              <span className="text-[10px] font-medium">Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
