"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="border-b border-white/8 bg-[#080810]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight text-white">
          StartNow
        </Link>

        {/* Pill nav */}
        <div className="hidden md:flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full px-1.5 py-1.5">
          {[
            { label: "For Students", href: "#for-students" },
            { label: "For Employers", href: "#for-employers" },
            { label: "How it Works", href: "#how-it-works" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-white/50 hover:text-white px-4 py-1.5 rounded-full hover:bg-white/8 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild
            className="text-white/50 hover:text-white hover:bg-white/8 rounded-full">
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild
            className="bg-white text-black hover:bg-violet-100 font-medium rounded-full px-5">
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
