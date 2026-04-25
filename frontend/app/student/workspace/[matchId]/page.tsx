"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

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
        const { data: m } = await supabase
          .from("matches")
          .select("*, briefs(*)")
          .eq("id", matchId)
          .single()
        if (m) setBrief(m.briefs)
      }
    }
    load()
  }, [matchId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from("deliverables")
        .upload(path, file)

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("deliverables")
          .getPublicUrl(data.path)
        fileUrls.push(urlData.publicUrl)
      }

      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }

    await supabase.from("submissions").insert({
      match_id: matchId === "new" ? null : matchId,
      brief_id: brief?.id,
      student_id: user.id,
      file_urls: fileUrls,
      notes,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })

    await supabase.from("briefs").update({ status: "submitted" }).eq("id", brief?.id)

    setSubmitted(true)
    setUploading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your work has been delivered to the employer. You&apos;ll be notified when they
              review it and release payment.
            </p>
            <Button onClick={() => router.push("/student/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Project Workspace</h1>
        {brief && (
          <p className="text-gray-500 mb-8">
            {brief.title} · ${brief.budget} budget
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">
                  {files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                    : "Click to upload files"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDFs, images, ZIP files, mockups — up to 50MB each
                </p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {files.map((f) => (
                    <li key={f.name} className="text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes to Employer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain your approach, what's included, and any instructions for the employer..."
                rows={4}
              />
            </CardContent>
          </Card>

          {uploading && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-blue-700 font-medium">Uploading...</span>
                <span className="text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={files.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Submit Deliverable"}
          </Button>
        </form>
      </div>
    </div>
  )
}
