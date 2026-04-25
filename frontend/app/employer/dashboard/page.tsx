import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, CheckCircle, Users, DollarSign } from "lucide-react"
import AppNav from "@/components/AppNav"
import type { Brief } from "@/types"

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  matched: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  submitted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  completed: "bg-white/8 text-white/40 border-white/10",
}

export default async function EmployerDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: briefs } = await supabase
    .from("briefs").select("*").eq("employer_id", user.id).order("created_at", { ascending: false })

  const typedBriefs = (briefs ?? []) as Brief[]
  const openCount = typedBriefs.filter((b) => b.status === "open").length
  const activeCount = typedBriefs.filter((b) => ["matched", "in_progress"].includes(b.status)).length
  const completedCount = typedBriefs.filter((b) => b.status === "completed").length

  return (
    <div className="min-h-screen">
      <AppNav role="employer" />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-10 border-b border-white/8 pb-8">
          <div>
            <p className="text-violet-400 text-xs uppercase tracking-widest mb-1">Employer Dashboard</p>
            <h1 className="text-2xl font-bold text-white">Manage your projects</h1>
          </div>
          <Button asChild className="bg-white text-black hover:bg-violet-100 font-medium rounded-full px-5">
            <Link href="/employer/post-brief"><Plus className="h-4 w-4 mr-2" />Post a Brief</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Open Briefs", value: openCount, icon: Clock },
            { label: "Active Projects", value: activeCount, icon: Users },
            { label: "Completed", value: completedCount, icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-white/8 hover:border-violet-500/20 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-white/35">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Briefs list */}
        <Card className="border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardHeader>
            <CardTitle className="text-white">Your Briefs</CardTitle>
          </CardHeader>
          <CardContent>
            {typedBriefs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/35 mb-4">No briefs yet. Post your first project!</p>
                <Button asChild className="bg-white text-black hover:bg-violet-100 rounded-full px-5">
                  <Link href="/employer/post-brief">Post a Brief</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {typedBriefs.map((brief) => (
                  <div key={brief.id}
                    className="flex items-center justify-between p-4 border border-white/8 rounded-xl hover:bg-violet-500/5 hover:border-violet-500/20 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-white">{brief.title}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColors[brief.status]}`}>
                          {brief.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/35">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${brief.budget}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due {new Date(brief.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {brief.status === "submitted" && (
                      <Button size="sm" asChild className="bg-violet-500 hover:bg-violet-600 text-white rounded-full px-4">
                        <Link href={`/employer/review/${brief.id}`}>Review Submission</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
