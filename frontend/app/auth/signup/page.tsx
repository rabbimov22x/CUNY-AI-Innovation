"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") as "student" | "employer" | null

  const [role, setRole] = useState<"student" | "employer">(defaultRole ?? "student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (role === "student" && !/\.cuny\.edu$/i.test(email)) {
      setError("Students must use a CUNY email address (e.g. yourname@citymail.cuny.edu)")
      setLoading(false)
      return
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      setSuccess("Check your email to confirm your account, then log in.")
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (user) {
      await supabase.from("profiles").upsert(
        { id: user.id, email: user.email ?? email, full_name: fullName, role },
        { onConflict: "id" }
      )
    }

    router.push(role === "employer" ? "/employer/dashboard" : "/student/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join StartNow and get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex rounded-lg border p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "student" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "employer" ? "bg-orange-500 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Employer
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {role === "student" ? "CUNY email" : "Business email"}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "student" ? "yourname@citymail.cuny.edu" : "you@company.com"}
                required
              />
              {role === "student" && (
                <p className="text-xs text-gray-500 mt-1">Must be a .cuny.edu address</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-md">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
