"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        setError(
          loginError.message === "Email not confirmed"
            ? "Please confirm your email before logging in, or ask your admin to disable email confirmation."
            : loginError.message
        )
        return
      }

      const user = data.user
      let role = user?.user_metadata?.role as "student" | "employer" | undefined

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        role = (profile?.role as "student" | "employer" | undefined) ?? role

        if (!profile) {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email ?? email,
              full_name: user.user_metadata?.full_name ?? null,
              role: role ?? "student",
            },
            { onConflict: "id" }
          )
        }
      }

      router.push(role === "employer" ? "/employer/dashboard" : "/student/dashboard")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to your StartNow account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
                {error}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              {error && (
                <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm p-3 rounded-xl">{error}</div>
              )}
              <Button type="submit" className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>
            <p className="text-center text-sm text-white/35 mt-4">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
