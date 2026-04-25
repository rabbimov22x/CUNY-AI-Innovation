"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, Briefcase, LayoutDashboard, User, FolderOpen } from "lucide-react"

export default function AppNav({ role }: { role?: "student" | "employer" }) {
  const pathname = usePathname()

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/portfolio", label: "Portfolio", icon: FolderOpen },
    { href: "/student/profile", label: "Profile", icon: User },
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
          CUNY Launchpad
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
        </div>
      </div>
    </nav>
  )
}
