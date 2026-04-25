import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, DollarSign, Award, FileText } from "lucide-react"
import AppNav from "@/components/AppNav"

export default async function PortfolioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: reviews } = await supabase.from("reviews").select("*, briefs(*)")
    .eq("student_id", user.id).order("created_at", { ascending: false })

  const totalEarned = (reviews ?? []).reduce((acc, r) => acc + (r.briefs?.budget ?? 0), 0)
  const avgRating = (reviews ?? []).length > 0
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / reviews!.length).toFixed(1) : "—"

  return (
    <div className="min-h-screen">
      <AppNav role="student" />
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Profile header */}
        <div className="mb-10 border-b border-white/8 pb-8">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center text-violet-300 text-2xl font-bold">
              {profile?.full_name?.charAt(0) ?? "S"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-white">{profile?.full_name ?? "Student"}</h1>
                <Button variant="outline" asChild className="border-white/10 text-white/60 hover:bg-white/8 hover:text-white rounded-full">
                  <Link href="/student/profile">Edit Profile</Link>
                </Button>
              </div>
              <p className="text-white/35">{profile?.email}</p>
              {profile?.cuny_school && <p className="text-sm text-white/35 mt-1">{profile.cuny_school}</p>}
              {profile?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-violet-500/15 text-violet-300 border-violet-500/25 border">{skill}</Badge>
                  ))}
                </div>
              )}
              {profile?.resume_url ? (
                <div className="mt-3">
                  <Button size="sm" variant="outline" asChild className="border-white/10 text-white/55 hover:bg-white/8 hover:text-white rounded-full">
                    <a href={profile.resume_url} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4 mr-2" /> View Resume
                    </a>
                  </Button>
                </div>
              ) : <p className="text-xs text-white/25 mt-2">No resume linked yet.</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Avg Rating", value: avgRating, icon: Star, sub: "out of 5" },
            { label: "Completed", value: (reviews ?? []).length, icon: Award, sub: "projects" },
            { label: "Earned", value: `$${totalEarned}`, icon: DollarSign, sub: "total" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <Card key={label} className="border-white/8 hover:border-violet-500/20 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="pt-6 text-center">
                <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-4 w-4 text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-xs text-white/25">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-violet-400" /> Completed Projects
        </h2>

        {(reviews ?? []).length === 0 ? (
          <Card className="border-white/8 text-center py-12" style={{ background: "rgba(255,255,255,0.03)" }}>
            <CardContent>
              <p className="text-white/35 mb-1">No completed projects yet.</p>
              <p className="text-sm text-white/25">Accept your first match to start building your portfolio.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(reviews ?? []).map((review) => (
              <Card key={review.id} className="border-white/8 hover:border-violet-500/20 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{review.briefs?.title ?? "Project"}</h3>
                      <p className="text-sm text-white/35 mt-1">
                        ${review.briefs?.budget ?? 0} · {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                      {review.comment && <p className="text-sm text-white/45 mt-2 italic">&ldquo;{review.comment}&rdquo;</p>}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 ml-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10"}`} />
                      ))}
                    </div>
                  </div>
                  {review.briefs?.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {review.briefs.skills_required.map((skill: string) => (
                        <Badge key={skill} className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/20 border">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
