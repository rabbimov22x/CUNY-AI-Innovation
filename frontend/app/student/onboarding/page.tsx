"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, CheckCircle2, ChevronRight, X } from "lucide-react"

const CUNY_SCHOOLS = [
  "Baruch College",
  "Brooklyn College",
  "City College of New York (CCNY)",
  "College of Staten Island",
  "Hunter College",
  "John Jay College",
  "Lehman College",
  "Medgar Evers College",
  "New York City College of Technology (City Tech)",
  "Queens College",
  "Queensborough Community College",
  "York College",
  "Borough of Manhattan Community College (BMCC)",
  "Bronx Community College",
  "Guttman Community College",
  "Hostos Community College",
  "Kingsborough Community College",
  "LaGuardia Community College",
  "CUNY Graduate Center",
  "CUNY School of Law",
  "CUNY School of Public Health",
]

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "React", "Node.js", "SQL", "Figma",
  "UI/UX Design", "Graphic Design", "Video Editing", "Copywriting",
  "Social Media", "Data Analysis", "Excel", "Canva", "WordPress",
  "Branding", "Photography", "Web Design", "Marketing", "Research",
]

const STEPS = ["Your Info", "Your Skills", "About You"]

export default function StudentOnboarding() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [fullName, setFullName] = useState("")
  const [school, setSchool] = useState("")
  const [major, setMajor] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState("")
  const [bio, setBio] = useState("")

  // Auto-fill name from auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return }
      const name = data.user.user_metadata?.full_name ?? ""
      setFullName(name)
    })
  }, [])

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function addCustomSkill() {
    const trimmed = customSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
    }
    setCustomSkill("")
  }

  async function saveAndNavigate(destination: string) {
    setLoading(true)
    setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth/login"); return }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || undefined,
        cuny_school: school || undefined,
        major: major || undefined,
        skills: skills.length > 0 ? skills : undefined,
        bio: bio || undefined,
      })
      .eq("id", user.id)

    if (updateError) {
      setError(`Error: ${updateError.message} (code: ${updateError.code})`)
      setLoading(false)
      return
    }

    router.push(destination)
  }

  async function handleFinish() {
    await saveAndNavigate("/student/dashboard?onboarding=done")
  }

  async function handleSkip() {
    // Save whatever has been filled in so far, then go to dashboard
    await saveAndNavigate("/student/dashboard?onboarding=skipped")
  }

  const canProceed = Boolean([
    fullName.trim() && school && major.trim(),
    skills.length > 0,
    bio.trim().length > 10,
  ][step])

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg text-[#004ac6]">
          <GraduationCap className="h-5 w-5" />
          StartNow
        </div>
        <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-[#004ac6] transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-lg mx-auto w-full">

        {/* Step labels */}
        <div className="flex items-center gap-2 mb-8 self-start">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm font-medium ${i === step ? "text-[#004ac6]" : i < step ? "text-green-600" : "text-gray-400"}`}>
                {i < step
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs border ${i === step ? "border-[#004ac6] text-[#004ac6]" : "border-gray-300 text-gray-400"}`}>{i + 1}</span>
                }
                {label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 0: Your Info */}
        {step === 0 && (
          <div className="w-full space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-[#191b23]">Set up your profile</h1>
              <p className="text-gray-500 text-sm mt-1">
                This helps employers understand who you are and find you faster.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191b23] mb-1.5">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191b23] mb-1.5">CUNY Campus</label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-lg px-3 text-sm bg-white text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-transparent"
              >
                <option value="">Select your campus</option>
                {CUNY_SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191b23] mb-1.5">Major</label>
              <Input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science, Graphic Design"
                className="h-12"
              />
            </div>
          </div>
        )}

        {/* Step 1: Skills */}
        {step === 1 && (
          <div className="w-full space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-[#191b23]">What are your skills?</h1>
              <p className="text-gray-500 text-sm mt-1">
                Select everything that applies. This is how our AI matches you to the right projects.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    skills.includes(skill)
                      ? "bg-[#004ac6] text-white border-[#004ac6]"
                      : "bg-white text-[#434655] border-gray-300 hover:border-[#004ac6] hover:text-[#004ac6]"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div>
              <label className="block text-sm font-semibold text-[#191b23] mb-1.5">Add a custom skill</label>
              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                  placeholder="e.g. Tableau, Spanish, 3D Modeling"
                  className="h-12"
                />
                <Button variant="outline" onClick={addCustomSkill} className="h-12 px-4 shrink-0">
                  Add
                </Button>
              </div>
            </div>

            {/* Selected skills */}
            {skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Selected ({skills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#004ac6] text-sm rounded-full border border-blue-200"
                    >
                      {skill}
                      <button onClick={() => toggleSkill(skill)} className="ml-0.5 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: About You */}
        {step === 2 && (
          <div className="w-full space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-[#191b23]">Tell employers about yourself</h1>
              <p className="text-gray-500 text-sm mt-1">
                A short intro goes a long way. Keep it direct and confident.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191b23] mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. I'm a junior at CCNY studying Computer Science. I've built several web apps and love working on real problems with small businesses."
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-[#191b23] resize-none focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">{bio.length} characters</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 w-full flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12"
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="flex-1 h-12 bg-[#004ac6] hover:bg-[#003ea8]"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceed || loading}
              className="flex-1 h-12 bg-[#004ac6] hover:bg-[#003ea8]"
            >
              {loading ? "Saving..." : "Finish & Go to Dashboard"}
            </Button>
          )}
        </div>

        <button
          onClick={handleSkip}
          disabled={loading}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
