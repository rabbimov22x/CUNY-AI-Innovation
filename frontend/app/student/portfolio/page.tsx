import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, DollarSign, Award } from "lucide-react"

export default async function PortfolioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, briefs(*)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const totalEarned = (reviews ?? []).reduce(
    (acc, r) => acc + (r.briefs?.budget ?? 0),
    0
  )
  const avgRating =
    (reviews ?? []).length > 0
      ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / reviews!.length).toFixed(1)
      : "—"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile header */}
        <div className="mb-8">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
              {profile?.full_name?.charAt(0) ?? "S"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.full_name ?? "Student"}
              </h1>
              <p className="text-gray-500">{profile?.email}</p>
              {profile?.cuny_school && (
                <p className="text-sm text-gray-500 mt-1">{profile.cuny_school}</p>
              )}
              {profile?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Avg Rating",
              value: avgRating,
              icon: Star,
              color: "text-yellow-500",
              sub: "out of 5",
            },
            {
              label: "Completed",
              value: (reviews ?? []).length,
              icon: Award,
              color: "text-blue-600",
              sub: "projects",
            },
            {
              label: "Earned",
              value: `$${totalEarned}`,
              icon: DollarSign,
              color: "text-green-600",
              sub: "total",
            },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <Card key={label}>
              <CardContent className="pt-6 text-center">
                <Icon className={`h-6 w-6 ${color} mx-auto mb-1`} />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completed projects */}
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Completed Projects
        </h2>

        {(reviews ?? []).length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-1">No completed projects yet.</p>
              <p className="text-sm text-gray-400">
                Accept your first match to start building your portfolio.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(reviews ?? []).map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {review.briefs?.title ?? "Project"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ${review.briefs?.budget ?? 0} ·{" "}
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.briefs?.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {review.briefs.skills_required.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
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
