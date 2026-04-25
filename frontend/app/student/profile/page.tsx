"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import AppNav from "@/components/AppNav"

const SUGGESTED_SKILLS = ["Frontend","Backend","UI/UX","React","Next.js","Node.js","TypeScript","Python","SQL","Data Analysis"]

function StudentProfileForm() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const onboarding = searchParams.get("onboarding") === "1"

  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [cunySchool, setCunySchool] = useState("")
  const [major, setMajor] = useState("")
  const [bio, setBio] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [strengthStatement, setStrengthStatement] = useState("")
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [aiSummary, setAiSummary] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setUserId(user.id)
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("full_name, role, cuny_school, major, bio, skills, resume_url").eq("id", user.id).maybeSingle()
      if (profileError) { setError(profileError.message); setLoading(false); return }
      if (!profile) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          const ensureRes = await fetch(`${apiUrl}/api/auth/dev-ensure-profile`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, email: user.email, fullName: user.user_metadata?.full_name ?? "", role: user.user_metadata?.role ?? "student" }),
          })
          if (ensureRes.ok) {
            const { data: ep, error: epe } = await supabase.from("profiles")
              .select("full_name, role, cuny_school, major, bio, skills, resume_url").eq("id", user.id).maybeSingle()
            if (epe) { setError(epe.message); setLoading(false); return }
            if (!ep) { setError("Profile is missing and could not be created yet."); setLoading(false); return }
            setFullName(ep.full_name ?? ""); setCunySchool(ep.cuny_school ?? ""); setMajor(ep.major ?? "")
            setBio(ep.bio ?? ""); setResumeUrl(ep.resume_url ?? "")
            setSkills(Array.isArray(ep.skills) ? ep.skills : []); setLoading(false); return
          }
        }
        setError("Profile not found. Make sure backend is running."); setLoading(false); return
      }
      if (profile?.role !== "student") { router.push("/employer/dashboard"); return }
      setFullName(profile.full_name ?? ""); setCunySchool(profile.cuny_school ?? ""); setMajor(profile.major ?? "")
      setBio(profile.bio ?? ""); setResumeUrl(profile.resume_url ?? "")
      setSkills(Array.isArray(profile.skills) ? profile.skills : []); setLoading(false)
    }
    void loadProfile()
  }, [router, supabase])

  const normalizeSkill = (v: string) => v.trim().replace(/\s+/g, " ")
  const addSkill = (v: string) => {
    const n = normalizeSkill(v); if (!n) return
    if (skills.some((s) => s.toLowerCase() === n.toLowerCase())) return
    setSkills((p) => [...p, n])
  }
  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s))
  const mergeSkills = (values: string[]) => setSkills((prev) => {
    const merged = [...prev]; const seen = new Set(prev.map((s) => s.toLowerCase()))
    for (const v of values) { const n = normalizeSkill(v); if (!n || seen.has(n.toLowerCase())) continue; seen.add(n.toLowerCase()); merged.push(n) }
    return merged
  })

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); setSkillInput("") }
  }

  async function handleAiSuggest() {
    setError(""); setSuccess("")
    if (!strengthStatement.trim()) { setError("Add a short statement first."); return }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) { setError("API URL missing."); return }
    setAiLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/skill-assist/suggest`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statement: strengthStatement }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data?.error ?? "Could not generate AI suggestions"); setAiLoading(false); return }
      mergeSkills(Array.isArray(data.skills) ? data.skills : [])
      setJobTitles(Array.isArray(data.jobTitles) ? data.jobTitles : [])
      setAiSummary(typeof data.summary === "string" ? data.summary : "")
      setSuccess("AI suggestions added.")
    } catch { setError("Could not reach AI suggestion service.") } finally { setAiLoading(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess("")
    if (!userId) { setError("Not signed in"); return }
    if (skills.length === 0) { setError("Add at least one skill"); return }
    setSaving(true)
    const payload = { full_name: fullName, cuny_school: cunySchool, major, bio, skills, resume_url: resumeUrl || null }
    const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", userId)
    if (updateError && updateError.message.toLowerCase().includes("resume_url")) {
      const { error: fe } = await supabase.from("profiles").update({ full_name: fullName, cuny_school: cunySchool, major, bio, skills }).eq("id", userId)
      if (fe) { setError(fe.message); setSaving(false); return }
      setSuccess("Profile saved."); setSaving(false); router.push("/student/portfolio"); return
    }
    if (updateError) { setError(updateError.message); setSaving(false); return }
    setSuccess("Profile saved"); setSaving(false); router.push("/student/portfolio")
  }

  if (loading) return (
    <div className="min-h-screen"><AppNav role="student" />
      <div className="max-w-2xl mx-auto pt-10 text-white/35 px-6">Loading profile...</div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <AppNav role="student" />
      <div className="max-w-2xl mx-auto pt-8 pb-12 px-6">

        <Card className="border-white/10 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardHeader>
            <CardTitle className="text-white">{onboarding ? "Complete Your Profile" : "Edit Profile"}</CardTitle>
            <CardDescription className="text-white/40">Add your strengths so AI can find your best matches.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1 text-white/60">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1 text-white/60">School</label>
                  <Input value={cunySchool} onChange={(e) => setCunySchool(e.target.value)} placeholder="BMCC / City College / etc"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1 text-white/60">Major</label>
                  <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Computer Science"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-white/60">AI skill helper</label>
                <Textarea value={strengthStatement} onChange={(e) => setStrengthStatement(e.target.value)}
                  placeholder="I'm good at frontend work and building quick demos before coding production features."
                  rows={3} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none focus:border-violet-500/50" />
                <Button type="button" variant="outline" onClick={handleAiSuggest} disabled={aiLoading}
                  className="mt-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 rounded-full">
                  {aiLoading ? "Analyzing..." : "✦ Suggest Skills with AI"}
                </Button>
                {aiSummary && <p className="text-xs text-white/35 mt-2">{aiSummary}</p>}
                {jobTitles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-white/45 mb-1">Suggested job titles</p>
                    <div className="flex flex-wrap gap-2">
                      {jobTitles.map((t) => <Badge key={t} className="bg-violet-500/10 text-violet-400 border-violet-500/20 border">{t}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-white/60">Skills</label>
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter (e.g. Frontend, React, UI/UX)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <button key={skill} type="button" onClick={() => removeSkill(skill)}>
                      <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/25 border hover:bg-violet-500/25 cursor-pointer">{skill} ×</Badge>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUGGESTED_SKILLS.filter((s) => !skills.some((x) => x.toLowerCase() === s.toLowerCase())).map((skill) => (
                    <button key={skill} type="button" onClick={() => addSkill(skill)}>
                      <Badge className="bg-white/5 text-white/40 border-white/10 border hover:border-violet-500/30 hover:text-violet-400 cursor-pointer">+ {skill}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-white/60">Short bio</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="What do you enjoy building? What kind of projects are you looking for?"
                  rows={5} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-white/60">Resume URL (optional)</label>
                <Input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="bg-white text-black hover:bg-violet-100 rounded-full px-5">
                  {saving ? "Saving..." : onboarding ? "Save & Continue" : "Save Profile"}
                </Button>
                {!onboarding && (
                  <Button type="button" variant="outline" onClick={() => router.push("/student/portfolio")}
                    className="border-white/10 text-white/60 hover:bg-white/8 hover:text-white rounded-full">
                    Back to Portfolio
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  return (
    <Suspense>
      <StudentProfileForm />
    </Suspense>
  )
}
