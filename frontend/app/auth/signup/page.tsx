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
    const { data: existingLoginData, error: existingLoginError } = await supabase.auth.signInWithPassword({ email, password })
    if (!existingLoginError && existingLoginData.user) {
      const existingRole = existingLoginData.user.user_metadata?.role
      router.push(existingRole === "employer" ? "/employer/dashboard" : "/student/dashboard")
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
    router.push(role === "student" ? "/student/profile?onboarding=1" : "/employer/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-semibold text-lg">CUNY Launchpad</Link>
        </div>
        <Card className="border-white/10 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Create your account</CardTitle>
            <CardDescription className="text-white/40">Join CUNY Launchpad and get started</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role toggle */}
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 mb-6">
              <button onClick={() => setRole("student")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
                  role === "student" ? "bg-violet-500 text-white shadow" : "text-white/45 hover:text-white"}`}>
                <GraduationCap className="h-4 w-4" /> Student
              </button>
              <button onClick={() => setRole("employer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
                  role === "employer" ? "bg-violet-500 text-white shadow" : "text-white/45 hover:text-white"}`}>
                <Briefcase className="h-4 w-4" /> Employer
              </button>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" minLength={8} required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              {error && <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
              <Button type="submit" className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-center text-sm text-white/35 mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
