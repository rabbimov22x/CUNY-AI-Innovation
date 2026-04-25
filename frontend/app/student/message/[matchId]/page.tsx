"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

type Message = {
  id: string
  content: string
  sender_id: string
  is_ai_suggestion: boolean
  created_at: string
}

export default function MessagePage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [brief, setBrief] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  // Load match, brief, messages, and generate suggestions
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setUserId(user.id)

      // Load match + brief
      const { data: match } = await supabase
        .from("matches")
        .select("*, briefs(*)")
        .eq("id", matchId)
        .single()

      if (!match) { router.push("/student/dashboard"); return }
      setBrief(match.briefs)

      // Load existing messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })

      setMessages(msgs ?? [])

      // Only generate suggestions if no messages sent yet
      if (!msgs?.length) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("skills, major, cuny_school, bio")
          .eq("id", user.id)
          .single()

        generateSuggestions(match.briefs, profile)
      } else {
        setLoadingSuggestions(false)
      }
    }
    load()
  }, [matchId])

  // Real-time message subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function generateSuggestions(brief: any, profile: any) {
    setLoadingSuggestions(true)
    try {
      const drafts = [
        `Hi, I'm a ${profile?.major ?? "CUNY"} student interested in this project.`,
        `Hello! I saw the ${brief?.title} posting and I'd love to help.`,
        `Hi there, my background in ${profile?.skills?.slice(0, 2).join(" and ") ?? "relevant skills"} makes me a strong fit.`,
      ]

      const results = await Promise.all(
        drafts.map(async (draft) => {
          const res = await fetch(`${API}/api/pitch-coach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              draft,
              briefTitle: brief?.title,
              briefDescription: brief?.description,
              skills: profile?.skills ?? [],
            }),
          })
          const data = await res.json()
          return data.suggestion ?? draft
        })
      )
      setSuggestions(results)
    } catch {
      setSuggestions([
        `Hi! I'm a ${profile?.major ?? "CUNY student"} and I'm excited about this project.`,
        `Hello — I'd love to learn more about the ${brief?.title} project and how I can contribute.`,
        `Hi there! My skills in ${profile?.skills?.slice(0, 2).join(" and ") ?? "this area"} are a great match for what you're looking for.`,
      ])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || !userId || sending) return
    setSending(true)
    setSuggestions([]) // hide suggestions after first message

    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      content: content.trim(),
      is_ai_suggestion: false,
    })

    setText("")
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#e1e2ed] sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="h-16 flex items-center gap-3">
            <Link href="/student/dashboard" className="text-[#434655] hover:text-[#004ac6]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#191b23] text-sm truncate">
                {brief?.title ?? "Loading..."}
              </p>
              <p className="text-xs text-[#737686]">Employer chat</p>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#004ac6]">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-3">

        {/* Brief context pill */}
        {brief && (
          <div className="bg-[#dbe1ff]/40 border border-[#b4c5ff]/50 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs font-semibold text-[#004ac6] mb-0.5">Matched Project</p>
            <p className="text-sm font-bold text-[#191b23]">{brief.title}</p>
            <p className="text-xs text-[#737686] mt-0.5">${brief.budget?.toLocaleString()} · Due {new Date(brief.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        )}

        {messages.length === 0 && !loadingSuggestions && (
          <p className="text-center text-xs text-[#737686] py-4">
            No messages yet. Send your intro below.
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "bg-[#004ac6] text-white rounded-br-sm"
                    : "bg-white border border-[#e1e2ed] text-[#191b23] rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* AI suggestions */}
      {(loadingSuggestions || suggestions.length > 0) && messages.length === 0 && (
        <div className="px-4 pb-2 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#004ac6]" />
            <p className="text-xs font-semibold text-[#004ac6]">Suggested openers</p>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center gap-2 text-xs text-[#737686] py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Claude is writing message suggestions...
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left bg-white border border-[#e1e2ed] hover:border-[#004ac6]/40 hover:bg-[#f3f3fe] rounded-xl px-3 py-2.5 text-sm text-[#191b23] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-[#e1e2ed] px-4 py-3 max-w-lg mx-auto w-full">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(text)
              }
            }}
            placeholder="Write a message..."
            rows={2}
            className="flex-1 resize-none border border-[#e1e2ed] rounded-xl px-3 py-2 text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-transparent bg-[#faf8ff]"
          />
          <Button
            onClick={() => sendMessage(text)}
            disabled={!text.trim() || sending}
            className="bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl h-10 w-10 p-0 shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
