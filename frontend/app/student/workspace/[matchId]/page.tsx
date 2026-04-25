"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AppNav from "@/components/AppNav"

export default function WorkspacePage() {
  const { matchId } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [brief, setBrief] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const briefId = searchParams.get("briefId")
      if (briefId) {
        const { data: b } = await supabase.from("briefs").select("*").eq("id", briefId).single()
        setBrief(b)
      } else if (matchId !== "new") {
        const { data: m } = await supabase.from("matches").select("*, briefs(*)").eq("id", matchId).single()
        if (m) setBrief(m.briefs)
      }
    }
    load()
  }, [matchId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const fileUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from("deliverables").upload(path, file)
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("deliverables").getPublicUrl(data.path)
        fileUrls.push(urlData.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }
    await supabase.from("submissions").insert({
      match_id: matchId === "new" ? null : matchId, brief_id: brief?.id, student_id: user.id,
      file_urls: fileUrls, notes, status: "pending", submitted_at: new Date().toISOString(),
    })
    await supabase.from("briefs").update({ status: "submitted" }).eq("id", brief?.id)
    setSubmitted(true); setUploading(false)
  }

  if (submitted) return (
    <div className="min-h-screen"><AppNav role="student" />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="max-w-md w-full text-center border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Submitted!</h2>
            <p className="text-white/45 mb-6">Your work has been delivered. You&apos;ll be notified when the employer reviews and releases payment.</p>
            <Button onClick={() => router.push("/student/dashboard")} className="bg-white text-black hover:bg-violet-100 rounded-full px-6">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <AppNav role="student" />
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Project Workspace</h1>
        {brief && <p className="text-white/40 mb-8">{brief.title} · ${brief.budget} budget</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-400" /> Upload Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-violet-500/30 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}>
                <Upload className="h-8 w-8 text-violet-400/40 mx-auto mb-2" />
                <p className="text-white/45 font-medium">
                  {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Click to upload files"}
                </p>
                <p className="text-xs text-white/20 mt-1">PDFs, images, ZIP files, mockups — up to 50MB each</p>
                <input id="file-input" type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {files.map((f) => (
                    <li key={f.name} className="text-sm text-white/35 flex items-center gap-2">
                      <FileText className="h-3 w-3 text-violet-400" /> {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardHeader><CardTitle className="text-base text-white">Notes to Employer</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain your approach, what's included, and any instructions..."
                rows={4} className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none focus:border-violet-500/50" />
            </CardContent>
          </Card>

          {uploading && (
            <div className="border border-violet-500/20 p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.07)" }}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-violet-300 font-medium">Uploading...</span>
                <span className="text-violet-400">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-white text-black hover:bg-violet-100 font-medium rounded-full" size="lg"
            disabled={files.length === 0 || uploading}>
            {uploading ? "Uploading..." : "Submit Deliverable"}
          </Button>
        </form>
      </div>
    </div>
  )
}
