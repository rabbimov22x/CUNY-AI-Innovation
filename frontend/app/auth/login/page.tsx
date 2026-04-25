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
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }
    const role = data.user?.user_metadata?.role
    router.push(role === "employer" ? "/employer/dashboard" : "/student/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Page-level violet glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-semibold text-lg">CUNY Launchpad</Link>
        </div>
        <Card className="bg-white/4 border-white/10 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-white/40">Log in to your CUNY Launchpad account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/60">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20" />
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
