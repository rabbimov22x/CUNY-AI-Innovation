import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { ArrowRight, GraduationCap, Briefcase, Sparkles, Zap, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">

      {/* Announcement bar */}
      <div className="bg-white/5 border-b border-white/10 text-center py-2 text-xs text-white/40 tracking-wide">
        🎓 Now matching CUNY students with NYC businesses — free to join, no experience required.
      </div>

      <Navbar />

      {/* Hero — Evervault-style purple gradient */}
      <section className="relative overflow-hidden">
        {/* Purple radial gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-purple-500/20 blur-[80px]" />
        </div>

        {/* Floating visual above headline */}
        <div className="relative flex justify-center pt-16 pb-4 pointer-events-none select-none">
          <div className="relative w-[640px] h-[220px]">
            {/* Student card */}
            <div className="animate-float-slow absolute left-0 top-4 w-56 bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300">A</div>
                <div>
                  <p className="text-xs font-semibold text-white/90">Aaliyah M.</p>
                  <p className="text-[10px] text-white/40">CCNY · CS Major</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {["React", "Figma", "Node.js"].map(s => (
                  <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{s}</span>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-white/30">Available now · 4.9★</div>
            </div>

            {/* Center AI orb */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-pulse-orb relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
                <div className="animate-spin-slow absolute inset-0 rounded-full border border-violet-400/30 border-dashed" />
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Employer card */}
            <div className="animate-float-reverse absolute right-0 top-8 w-56 bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90">Brooklyn Eats Co.</p>
                  <p className="text-[10px] text-white/40">Local Business · NYC</p>
                </div>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                &ldquo;Redesign our menu website — $400 budget&rdquo;
              </p>
              <div className="mt-2 text-[10px] text-emerald-400">● Open · Deadline in 3 weeks</div>
            </div>

            {/* Left beam */}
            <div className="absolute top-1/2 left-[230px] right-[calc(50%+40px)] h-px -translate-y-1/2 overflow-hidden">
              <div className="animate-beam-left h-full bg-gradient-to-r from-transparent via-violet-400 to-violet-500" />
            </div>
            {/* Right beam */}
            <div className="absolute top-1/2 left-[calc(50%+40px)] right-[230px] h-px -translate-y-1/2 overflow-hidden">
              <div className="animate-beam-right h-full bg-gradient-to-r from-violet-500 via-violet-400 to-transparent" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="container mx-auto px-6 pb-28 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5">
            AI-powered career<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-violet-500">
              matching for CUNY.
            </span>
          </h1>
          <p className="text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
            Real projects. Real pay. Real portfolio. We break the experience paradox
            by connecting CUNY students with NYC businesses — powered by Claude AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild
              className="bg-white text-black hover:bg-white/90 font-semibold gap-2 px-7 rounded-full">
              <Link href="/auth/signup?role=student">
                <GraduationCap className="h-4 w-4" />
                Get started free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild
              className="border-white/20 text-white hover:bg-white/10 gap-2 px-7 rounded-full">
              <Link href="/auth/signup?role=employer">
                Post a project <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/25">No experience required. Free to join.</p>
        </div>
      </section>

      {/* School logos strip */}
      <div className="border-y border-white/8 py-8 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <p className="text-center text-white/25 text-xs mb-6 tracking-widest uppercase">Students from every CUNY campus</p>
          <div className="flex flex-wrap items-center justify-center gap-10 text-white/20 font-semibold text-xs tracking-widest uppercase">
            {["City College", "Baruch", "Hunter", "Brooklyn College", "Queens College", "Lehman", "BMCC"].map((school) => (
              <span key={school}>{school}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== ANIMATED AI MATCHING SECTION ===================== */}
      <section id="how-it-works" className="relative py-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-violet-900/20 blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-600/15 blur-[80px]" />
        </div>

        {/* Floating background particles */}
        {[
          { top: "15%", left: "8%", delay: "0s", size: 3 },
          { top: "70%", left: "5%", delay: "1.2s", size: 2 },
          { top: "30%", right: "6%", delay: "0.6s", size: 3 },
          { top: "80%", right: "10%", delay: "1.8s", size: 2 },
          { top: "50%", left: "15%", delay: "2.4s", size: 2 },
          { top: "20%", right: "18%", delay: "0.3s", size: 2 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-violet-400/40"
            style={{
              top: p.top,
              left: (p as any).left,
              right: (p as any).right,
              width: p.size,
              height: p.size,
              animation: `particle-drift ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs text-violet-400 uppercase tracking-widest">How the magic works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              Watch the AI work in real time.
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Claude reads every student profile and every brief — then finds the perfect match in seconds.
            </p>
          </div>

          {/* Three-column live demo */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">

            {/* Student side */}
            <div className="flex flex-col gap-4">
              <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-1">Student</div>
              {[
                { name: "Aaliyah M.", school: "CCNY", skills: ["React", "Figma"], score: 97 },
                { name: "David R.", school: "Baruch", skills: ["Python", "SQL"], score: 84 },
                { name: "Priya K.", school: "Hunter", skills: ["Node.js", "UX"], score: 79 },
              ].map((s, i) => (
                <div
                  key={s.name}
                  className="animate-float-slow border border-white/10 rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    animationDelay: `${i * 0.6}s`,
                    animationDuration: `${4 + i}s`,
                  }}
                >
                  {/* Score badge */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full">
                    {s.score}%
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-violet-500/25 flex items-center justify-center text-[11px] font-bold text-violet-300">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90">{s.name}</p>
                      <p className="text-[10px] text-white/35">{s.school}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {s.skills.map(sk => (
                      <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/50">{sk}</span>
                    ))}
                  </div>
                  {/* Scan line effect */}
                  {i === 0 && (
                    <div className="animate-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-0 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Center — AI engine */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-1">AI Engine</div>

              <div className="relative flex flex-col items-center justify-center">
                {/* Outer ring */}
                <div className="animate-spin-slow absolute h-36 w-36 rounded-full border border-dashed border-violet-500/20" />
                {/* Middle ring */}
                <div className="absolute h-24 w-24 rounded-full border border-violet-500/15"
                  style={{ animation: "spin-slow 8s linear infinite reverse" }} />
                {/* Core orb */}
                <div className="animate-pulse-orb relative h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-violet-800 flex items-center justify-center z-10 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs text-violet-300 font-medium">Claude AI</p>
                <p className="text-[10px] text-white/30 leading-relaxed max-w-[120px]">
                  Reading skills, briefs, and context in real time
                </p>
              </div>

              {/* Connecting arrows */}
              <div className="flex flex-col items-center gap-1 text-white/15">
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-violet-500/40 to-transparent" />
                <ArrowRight className="h-3 w-3 rotate-90 text-violet-500/40" />
              </div>
              <div className="border border-violet-500/20 rounded-xl px-4 py-2 bg-violet-500/5 text-center">
                <p className="text-[10px] text-violet-300 font-medium">Match found</p>
                <p className="text-[9px] text-white/30 mt-0.5">97% compatibility</p>
              </div>
            </div>

            {/* Employer side */}
            <div className="flex flex-col gap-4">
              <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-1">Employer Brief</div>
              {[
                { company: "Brooklyn Eats", task: "Restaurant website redesign", budget: 400, tag: "React, Design" },
                { company: "Harlem Goods", task: "E-commerce store build", budget: 600, tag: "Next.js, SQL" },
                { company: "Queens Clinic", task: "Patient portal UI", budget: 500, tag: "UX, Frontend" },
              ].map((b, i) => (
                <div
                  key={b.company}
                  className="animate-float-reverse border border-white/10 rounded-2xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: `${5 + i}s`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-white/90">{b.company}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{b.task}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 ml-2">${b.budget}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/50">{b.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom label */}
          <p className="text-center text-white/25 text-sm mt-12">
            Every match is scored, ranked, and explained — no black box.
          </p>
        </div>
      </section>
      {/* ===================================================================== */}

      {/* Features */}
      <section className="border-t border-white/8 py-28 container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            The experience paradox.<br />Now, it&apos;s a head start.
          </h2>
          <p className="text-white/45 text-lg">
            We break the cycle that locks talented students out of opportunities.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden">
          {[
            { icon: GraduationCap, title: "125,000+ CUNY students", desc: "Talented, motivated, and ready — but overlooked because they lack a portfolio." },
            { icon: Briefcase, title: "NYC small businesses", desc: "Need websites, content, and design work but can't afford agency rates." },
            { icon: Sparkles, title: "AI bridges the gap", desc: "Claude coaches students to pitch better and matches them to the right projects." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#080810] p-8">
              <div className="h-10 w-10 bg-violet-500/15 border border-violet-500/20 rounded-lg flex items-center justify-center mb-5">
                <Icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/8 py-28">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div id="for-students">
              <span className="text-xs text-violet-400 uppercase tracking-widest">For Students</span>
              <h2 className="text-3xl font-bold mt-3 mb-8">Go from student to professional in weeks.</h2>
              <ol className="space-y-5">
                {[
                  "Sign up with your CUNY email and list your skills",
                  "Get matched to relevant projects automatically",
                  "Use the AI pitch coach to craft a winning intro",
                  "Complete the project and upload your deliverable",
                  "Earn payment and build your portfolio",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-white/55">{step}</span>
                  </li>
                ))}
              </ol>
              <Button className="mt-8 bg-white text-black hover:bg-white/90 gap-2 rounded-full" asChild>
                <Link href="/auth/signup?role=student">
                  Find your first project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div id="for-employers">
              <span className="text-xs text-violet-400 uppercase tracking-widest">For Employers</span>
              <h2 className="text-3xl font-bold mt-3 mb-8">Hire smart talent without the agency markup.</h2>
              <ol className="space-y-5">
                {[
                  "Post a project brief with your budget and deadline",
                  "AI checks your brief quality and suggests improvements",
                  "Review matched student candidates",
                  "Collaborate in the project workspace",
                  "Rate the work and release payment",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-white/55">{step}</span>
                  </li>
                ))}
              </ol>
              <Button className="mt-8 border border-white/15 text-white hover:bg-white/8 gap-2 rounded-full" variant="outline" asChild>
                <Link href="/auth/signup?role=employer">
                  Post a project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-white/8 py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white/75">
            &ldquo;CUNY Launchpad completely changed my expectations of what
            building a career looks like. I landed my first client before
            graduation.&rdquo;
          </p>
          <p className="mt-6 text-white/25 text-sm">— Student, City College of New York</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/8 py-24">
        <div className="container mx-auto px-6">
          <p className="text-center text-white/30 text-xs mb-14 uppercase tracking-widest">By the numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-3xl mx-auto text-center">
            {[
              { value: "125K+", label: "CUNY students" },
              { value: "1 in 3", label: "land a project in month 1" },
              { value: "$500", label: "avg project value" },
              { value: "4.9", label: "avg rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">{value}</div>
                <div className="text-white/35 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-white/8 py-24 bg-white/[0.015]">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-14">Standard job boards stop short.<br />We go further.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "AI-verified briefs", desc: "Every employer brief is reviewed by Claude before it reaches students — no vague requests." },
              { icon: Shield, title: "Escrow payments", desc: "Funds are held in escrow and only released when you approve the work." },
              { icon: TrendingUp, title: "Portfolio ownership", desc: "Everything you build is yours. Showcase it permanently on your Launchpad profile." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-white/8 rounded-2xl p-6 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                <div className="h-9 w-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            StartNow
          </div>
          <p>© {new Date().getFullYear()} StartNow. Built at CUNY AI Innovation.</p>
        </div>
      </footer>
    </div>
  )
}
