import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, CheckCircle, Users, DollarSign } from "lucide-react"
import type { Brief } from "@/types"

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  matched: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  submitted: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
}

export default async function EmployerDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: briefs } = await supabase
    .from("briefs")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false })

  const typedBriefs = (briefs ?? []) as Brief[]
  const openCount = typedBriefs.filter((b) => b.status === "open").length
  const activeCount = typedBriefs.filter((b) =>
    ["matched", "in_progress"].includes(b.status)
  ).length
  const completedCount = typedBriefs.filter((b) => b.status === "completed").length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-500">Manage your project briefs</p>
          </div>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/employer/post-brief">
              <Plus className="h-4 w-4 mr-2" />
              Post a Brief
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Open Briefs", value: openCount, icon: Clock, color: "text-green-600" },
            { label: "Active Projects", value: activeCount, icon: Users, color: "text-blue-600" },
            { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-gray-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <Icon className={`h-8 w-8 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Briefs list */}
        <Card>
          <CardHeader>
            <CardTitle>Your Briefs</CardTitle>
          </CardHeader>
          <CardContent>
            {typedBriefs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No briefs yet. Post your first project!</p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/employer/post-brief">Post a Brief</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {typedBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{brief.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusColors[brief.status]
                          }`}
                        >
                          {brief.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />${brief.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(brief.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {brief.status === "submitted" && (
                      <Button size="sm" asChild>
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
