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

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Avoid triggering signup email limits for accounts that already exist.
    const { data: existingLoginData, error: existingLoginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!existingLoginError && existingLoginData.user) {
      const existingRole = existingLoginData.user.user_metadata?.role
      router.push(existingRole === "employer" ? "/employer/dashboard" : "/student/dashboard")
      return
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (signupError) {
      const message = signupError.message.toLowerCase()
      if (message.includes("email rate limit") || message.includes("rate limit exceeded")) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!loginError && loginData.user) {
          const existingRole = loginData.user.user_metadata?.role
          router.push(existingRole === "employer" ? "/employer/dashboard" : "/student/dashboard")
          return
        }

        // Final fallback for local dev: create a confirmed user via backend admin route.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          const createRes = await fetch(`${apiUrl}/api/auth/dev-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName, role }),
          })

          if (createRes.ok) {
            const { data: postCreateLoginData, error: postCreateLoginError } =
              await supabase.auth.signInWithPassword({ email, password })

            if (!postCreateLoginError && postCreateLoginData.user) {
              const createdRole = postCreateLoginData.user.user_metadata?.role
              router.push(
                createdRole === "employer" ? "/employer/dashboard" : "/student/profile?onboarding=1"
              )
              return
            }
          }
        }

        setError(
          "Too many signup email attempts. Use Log in if the account exists, or make sure backend is running to use dev-signup fallback."
        )
      } else {
        setError(signupError.message)
      }
      setLoading(false)
      return
    }

    router.push(role === "student" ? "/student/profile?onboarding=1" : "/employer/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join CUNY Launchpad and get started</CardDescription>
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
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
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
