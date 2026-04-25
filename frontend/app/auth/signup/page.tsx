"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
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
    const { error: signupError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } })
    if (signupError) {
      const message = signupError.message.toLowerCase()
      if (message.includes("email rate limit") || message.includes("rate limit exceeded")) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (!loginError && loginData.user) {
          router.push(loginData.user.user_metadata?.role === "employer" ? "/employer/dashboard" : "/student/dashboard")
          return
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          const createRes = await fetch(`${apiUrl}/api/auth/dev-signup`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName, role }),
          })
          if (createRes.ok) {
            const { data: d, error: le } = await supabase.auth.signInWithPassword({ email, password })
            if (!le && d.user) {
              router.push(d.user.user_metadata?.role === "employer" ? "/employer/dashboard" : "/student/profile?onboarding=1")
              return
            }
          }
        }
        setError("Too many signup attempts. Use Log in if the account exists.")
      } else { setError(signupError.message) }
      setLoading(false)
      return
    }

    const nextRole = role === "employer" ? "/employer/dashboard" : "/student/dashboard"
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      setSuccess("Check your email to confirm your account, then log in once verification is complete.")
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (user) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" }
      )
    }

    router.push(nextRole)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join StartNow and get started</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role toggle */}
          <div className="flex rounded-lg border p-1 mb-6">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "student"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </button>
            <button
              onClick={() => setRole("employer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "employer"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
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
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
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
