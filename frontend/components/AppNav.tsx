"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { GraduationCap, Briefcase, LayoutDashboard, FolderOpen, LogOut, User, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AppNav({ role }: { role?: "student" | "employer" }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [initials, setInitials] = useState("?")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? "")
      const name = user.user_metadata?.full_name as string | undefined
      if (name) {
        setFullName(name)
        const parts = name.trim().split(" ")
        setInitials(parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase())
      }
    }
    void loadUser()
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/portfolio", label: "Portfolio", icon: FolderOpen },
  ]

  const employerLinks = [
    { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/post-brief", label: "Post a Brief", icon: Briefcase },
  ]

  const links = role === "employer" ? employerLinks : studentLinks

  return (
    <nav className="border-b border-white/8 bg-[#080810]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-2">
          {role === "employer" ? <Briefcase className="h-4 w-4 text-violet-400" /> : <GraduationCap className="h-4 w-4 text-violet-400" />}
          StartNow
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all ${
                  active
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                    : "text-white/45 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}

          {/* Avatar dropdown */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-semibold hover:bg-violet-500/30 transition-colors"
            >
              {initials}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0f0f1a] shadow-xl overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-sm font-medium text-white truncate">{fullName || "Your account"}</p>
                  <p className="text-xs text-white/40 truncate">{email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={role === "employer" ? "/employer/dashboard" : "/student/profile"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                  >
                    <User className="h-4 w-4 text-violet-400" />
                    Edit Profile
                  </Link>
                  {role === "student" && (
                    <Link
                      href="/student/portfolio"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                    >
                      <FolderOpen className="h-4 w-4 text-violet-400" />
                      Portfolio
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/8 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/6 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
