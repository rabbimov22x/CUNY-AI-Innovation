"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const SUGGESTED_SKILLS = [
  "Frontend",
  "Backend",
  "UI/UX",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Python",
  "SQL",
  "Data Analysis",
]

export default function StudentProfilePage() {
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role, cuny_school, major, bio, skills, resume_url")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (!profile) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          const ensureRes = await fetch(`${apiUrl}/api/auth/dev-ensure-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name ?? "",
              role: user.user_metadata?.role ?? "student",
            }),
          })

          if (ensureRes.ok) {
            const { data: ensuredProfile, error: ensuredProfileError } = await supabase
              .from("profiles")
              .select("full_name, role, cuny_school, major, bio, skills, resume_url")
              .eq("id", user.id)
              .maybeSingle()

            if (ensuredProfileError) {
              setError(ensuredProfileError.message)
              setLoading(false)
              return
            }

            if (!ensuredProfile) {
              setError("Profile is missing and could not be created yet. Please try again.")
              setLoading(false)
              return
            }

            setFullName(ensuredProfile.full_name ?? "")
            setCunySchool(ensuredProfile.cuny_school ?? "")
            setMajor(ensuredProfile.major ?? "")
            setBio(ensuredProfile.bio ?? "")
            setResumeUrl(ensuredProfile.resume_url ?? "")
            setSkills(Array.isArray(ensuredProfile.skills) ? ensuredProfile.skills : [])
            setLoading(false)
            return
          }
        }

        setError("Profile not found yet. Make sure backend is running and try again.")
        setLoading(false)
        return
      }

      if (profile?.role !== "student") {
        router.push("/employer/dashboard")
        return
      }

      setFullName(profile.full_name ?? "")
      setCunySchool(profile.cuny_school ?? "")
      setMajor(profile.major ?? "")
      setBio(profile.bio ?? "")
      setResumeUrl(profile.resume_url ?? "")
      setSkills(Array.isArray(profile.skills) ? profile.skills : [])
      setLoading(false)
    }

    void loadProfile()
  }, [router, supabase])

  function normalizeSkill(value: string) {
    return value.trim().replace(/\s+/g, " ")
  }

  function addSkill(value: string) {
    const normalized = normalizeSkill(value)
    if (!normalized) return
    if (skills.some((s) => s.toLowerCase() === normalized.toLowerCase())) return
    setSkills((prev) => [...prev, normalized])
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  function mergeSkills(values: string[]) {
    setSkills((prev) => {
      const merged = [...prev]
      const seen = new Set(prev.map((s) => s.toLowerCase()))
      for (const value of values) {
        const normalized = normalizeSkill(value)
        if (!normalized) continue
        const key = normalized.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(normalized)
      }
      return merged
    })
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(skillInput)
      setSkillInput("")
    }
  }

  async function handleAiSuggest() {
    setError("")
    setSuccess("")

    if (!strengthStatement.trim()) {
      setError("Add a short statement first so AI can suggest skills.")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      setError("API URL is missing. Set NEXT_PUBLIC_API_URL in frontend env.")
      return
    }

    setAiLoading(true)

    try {
      const res = await fetch(`${apiUrl}/api/skill-assist/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: strengthStatement }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Could not generate AI suggestions")
        setAiLoading(false)
        return
      }

      const suggestedSkills = Array.isArray(data.skills) ? data.skills : []
      const suggestedJobs = Array.isArray(data.jobTitles) ? data.jobTitles : []

      mergeSkills(suggestedSkills)
      setJobTitles(suggestedJobs)
      setAiSummary(typeof data.summary === "string" ? data.summary : "")
      setSuccess("AI suggestions added. You can still edit skills manually.")
    } catch {
      setError("Could not reach AI suggestion service.")
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!userId) {
      setError("Not signed in")
      return
    }

    if (skills.length === 0) {
      setError("Add at least one skill")
      return
    }

    setSaving(true)

    const payload = {
      full_name: fullName,
      cuny_school: cunySchool,
      major,
      bio,
      skills,
      resume_url: resumeUrl || null,
    }

    const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", userId)

    if (updateError && updateError.message.toLowerCase().includes("resume_url")) {
      const { error: fallbackError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          cuny_school: cunySchool,
          major,
          bio,
          skills,
        })
        .eq("id", userId)

      if (fallbackError) {
        setError(fallbackError.message)
        setSaving(false)
        return
      }

      setSuccess("Profile saved. Resume URL support needs the latest schema migration.")
      setSaving(false)
      router.push("/student/portfolio")
      return
    }

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess("Profile saved")
    setSaving(false)
    router.push("/student/portfolio")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto pt-10 text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>{onboarding ? "Complete Your Profile" : "Edit Profile"}</CardTitle>
            <CardDescription>
              Add your strengths so matching and AI guidance can personalize your next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">School</label>
                  <Input
                    value={cunySchool}
                    onChange={(e) => setCunySchool(e.target.value)}
                    placeholder="BMCC / City College / etc"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Major</label>
                  <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Computer Science" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">AI skill helper</label>
                <Textarea
                  value={strengthStatement}
                  onChange={(e) => setStrengthStatement(e.target.value)}
                  placeholder="Example: I'm good at frontend work and building quick demos before coding production features."
                  rows={3}
                />
                <div className="mt-2 flex gap-2 items-center">
                  <Button type="button" variant="outline" onClick={handleAiSuggest} disabled={aiLoading}>
                    {aiLoading ? "Analyzing..." : "Suggest Skills with AI"}
                  </Button>
                </div>
                {aiSummary && <p className="text-xs text-gray-500 mt-2">{aiSummary}</p>}
                {jobTitles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Suggested job titles</p>
                    <div className="flex flex-wrap gap-2">
                      {jobTitles.map((title) => (
                        <Badge key={title} variant="outline">{title}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">What jobs are you good at?</label>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter (e.g. Frontend, Backend, UI/UX)"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-left"
                      title="Remove skill"
                    >
                      <Badge variant="secondary">{skill} ×</Badge>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUGGESTED_SKILLS.filter(
                    (skill) => !skills.some((s) => s.toLowerCase() === skill.toLowerCase())
                  ).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="text-left"
                      onClick={() => addSkill(skill)}
                    >
                      <Badge variant="outline">+ {skill}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Short bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What do you enjoy building? What kind of projects are you looking for?"
                  rows={5}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Resume URL (optional)</label>
                <Input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://yourdomain.com/resume.pdf"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-700">{success}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : onboarding ? "Save & Continue" : "Save Profile"}
                </Button>
                {!onboarding && (
                  <Button type="button" variant="outline" onClick={() => router.push("/student/portfolio")}>
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
