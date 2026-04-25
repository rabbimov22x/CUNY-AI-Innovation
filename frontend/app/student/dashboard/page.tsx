import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, DollarSign, Clock, Star, ArrowRight } from "lucide-react"

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: matches } = await supabase
    .from("matches")
    .select("*, briefs(*, profiles(*))")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const pendingMatches = (matches ?? []).filter((m) => m.status === "pending")
  const activeMatches = (matches ?? []).filter((m) => m.status === "accepted")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.full_name?.split(" ")[0] ?? "Student"}
            </h1>
            <p className="text-gray-500">Here are your latest matches and projects</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/student/portfolio">View Portfolio</Link>
          </Button>
        </div>

        {/* Match notifications */}
        {pendingMatches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                {pendingMatches.length} new match{pendingMatches.length > 1 ? "es" : ""}
              </h2>
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                New
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingMatches.map((match) => (
                <Card
                  key={match.id}
                  className="border-2 border-blue-200 hover:border-blue-400 transition-colors"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{match.briefs?.title}</h3>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {Math.round(match.ai_score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {match.briefs?.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />${match.briefs?.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(match.briefs?.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/student/brief/${match.brief_id}`}>
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
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
            <h2 className="font-semibold text-gray-900 mb-3">Active Projects</h2>
            <div className="space-y-3">
              {activeMatches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="pt-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{match.briefs?.title}</h3>
                      <p className="text-sm text-gray-500">
                        ${match.briefs?.budget} · Due{" "}
                        {new Date(match.briefs?.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/student/workspace/${match.id}`}>Open Workspace</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(matches ?? []).length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-gray-500 mb-2">No matches yet.</p>
              <p className="text-sm text-gray-400">
                Complete your profile to improve your match rate.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
