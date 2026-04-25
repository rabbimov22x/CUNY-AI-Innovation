import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Bell,
  DollarSign,
  Clock,
  ArrowRight,
  Star,
  Sparkles,
  Briefcase,
  FolderOpen,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
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

  const bypassOnboarding =
    searchParams?.onboarding === "skipped" || searchParams?.onboarding === "done"
  const isNewUser =
    !profile?.cuny_school || !profile?.major || !profile?.skills?.length
  if (isNewUser && !bypassOnboarding) redirect("/student/onboarding")

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

  const navLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, comingSoon: false },
    { href: "/student/brief", label: "Market", icon: ShoppingBag, comingSoon: true },
    { href: "/student/workspace", label: "Workspace", icon: Briefcase, comingSoon: true },
    { href: "/student/portfolio", label: "Portfolio", icon: FolderOpen, comingSoon: true },
  ]

  return (
    <div className="min-h-screen bg-[#080810] text-white">

      {/* Top navigation */}
      <header className="bg-[#0b0c18]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 font-bold text-lg text-violet-300 shrink-0"
            >
              <GraduationCap className="h-5 w-5" />
              StartNow
            </Link>

            {/* Nav links — hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon, comingSoon }) => {
                if (comingSoon) {
                  return (
                    <span
                      key={href}
                      aria-disabled="true"
                      title="Coming soon"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/35 border border-white/10 cursor-not-allowed select-none"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-400/25 text-violet-200/80 leading-none">
                        soon
                      </span>
                    </span>
                  )
                }

                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side — bell + avatar */}
            <div className="flex items-center gap-3">
              <Link href="/student/brief" className="relative">
                <Bell className="h-5 w-5 text-white/70" />
                {pendingMatches.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#004ac6] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingMatches.length}
                  </span>
                )}
              </Link>
              <Link
                href="/student/profile"
                title="Edit profile"
                className="h-9 w-9 rounded-full bg-violet-600/70 flex items-center justify-center text-white text-sm font-bold shrink-0 hover:bg-violet-500 transition-colors"
              >
                {initials}
              </Link>
            </div>
          </div>

          {/* Mobile nav — scrollable row below the header */}
          <div className="sm:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {navLinks.map(({ href, label, icon: Icon, comingSoon }) => {
              if (comingSoon) {
                return (
                  <span
                    key={href}
                    aria-disabled="true"
                    title="Coming soon"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/35 border border-white/10 cursor-not-allowed select-none whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    <span className="text-[8px] px-1 py-0.5 rounded-md bg-violet-500/15 border border-violet-400/25 text-violet-200/80 leading-none">
                      soon
                    </span>
                  </span>
                )
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-5">

        {/* Greeting + verification */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Hello, {firstName}</h1>
              {profile?.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Student
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm mt-0.5">
              {profile?.cuny_school} · {profile?.major}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">
              Total Earnings
            </p>
            <p className="text-3xl font-bold text-white">
              ${totalEarnings.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {completedMatches.length} project{completedMatches.length !== 1 ? "s" : ""} completed
            </p>
          </div>

          <Link href="/student/portfolio" className="block">
            <div className="bg-[#2563eb] rounded-2xl p-4 h-full flex flex-col justify-between cursor-pointer hover:bg-[#1d4ed8] transition-colors min-h-[100px]">
              <p className="text-sm font-semibold text-white/90">My Portfolio</p>
              <div className="flex items-center justify-between mt-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>

          {/* Trust strip as third card on wider screens */}
          <div className="hidden sm:flex bg-white/5 rounded-2xl border border-white/10 p-4 flex-col justify-between">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
              Reputation
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-white/65">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  Rating
                </span>
                <span className="font-bold text-white">
                  {profile?.rating ? Number(profile.rating).toFixed(1) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-white/65">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  Strikes
                </span>
                <span className="font-bold text-white">{profile?.strikes ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-white/65">
                  <Briefcase className="h-4 w-4 text-[#004ac6]" />
                  Active
                </span>
                <span className="font-bold text-white">{activeMatches.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip — mobile only */}
        <div className="flex sm:hidden items-center gap-4 px-1">
          <div className="flex items-center gap-1.5 text-sm text-white/65">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{profile?.rating ? Number(profile.rating).toFixed(1) : "—"}</span>
            <span className="text-white/45">rating</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5 text-sm text-white/65">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">{profile?.strikes ?? 0}</span>
            <span className="text-white/45">strikes</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5 text-sm text-white/65">
            <Briefcase className="h-4 w-4 text-[#004ac6]" />
            <span className="font-semibold">{activeMatches.length}</span>
            <span className="text-white/45">active</span>
          </div>
        </div>

        {/* Skills chips */}
        {profile?.skills?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-white mb-2">Your Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-xs font-medium bg-violet-500/20 text-violet-200 border border-violet-400/30 rounded-full"
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
              <h2 className="font-semibold text-white">AI Match of the Day</h2>
              <span className="bg-[#004ac6] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                {pendingMatches.length} new
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {pendingMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-violet-400/40 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-3">
                        <p className="text-xs font-semibold text-[#004ac6] uppercase tracking-wide mb-1">
                          {match.briefs?.profiles?.company_name ?? "Local Business"}
                        </p>
                        <h3 className="font-bold text-white leading-snug">
                          {match.briefs?.title}
                        </h3>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 bg-white/10 border border-white/15 text-white text-xs font-bold rounded-full px-2.5 py-1">
                        <Sparkles className="h-3 w-3 text-[#004ac6]" />
                        {Math.round(match.ai_score * 100)}% Match
                      </span>
                    </div>
                    <p className="text-sm text-white/65 line-clamp-2 mb-3">
                      {match.briefs?.description}
                    </p>
                    {match.briefs?.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {match.briefs.skills_required.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 text-xs bg-violet-500/20 text-violet-200 rounded-full border border-violet-400/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/50">
                        <span className="flex items-center gap-1 font-semibold text-white">
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
                          View <ArrowRight className="ml-1 h-3 w-3" />
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
              <h2 className="font-semibold text-white">Active Contracts</h2>
              <Link href="/student/workspace" className="text-sm text-[#004ac6] font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 divide-y divide-white/10">
              {activeMatches.map((match: any) => {
                const progress = match.progress_percent ?? 0
                return (
                  <Link
                    key={match.id}
                    href={`/student/workspace/${match.id}`}
                    className="block p-4 hover:bg-white/10 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-white text-sm">{match.briefs?.title}</h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          Due {new Date(match.briefs?.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#007d55]">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007d55] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/50">${match.briefs?.budget} contract</span>
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
          <div className="bg-white/5 rounded-2xl border border-dashed border-white/20 py-14 text-center">
            <Sparkles className="h-8 w-8 text-[#004ac6]/40 mx-auto mb-3" />
            <p className="font-semibold text-white">No matches yet</p>
            <p className="text-sm text-white/50 mt-1 max-w-xs mx-auto">
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
            <Link href="/student/swipe">
              <Sparkles className="mr-2 h-4 w-4" />
              Get Matches
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}
