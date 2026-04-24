import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/Navbar"
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
          Built for CUNY Students
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Real work.{" "}
          <span className="text-blue-600">Real skills.</span>
          <br />
          Real credibility.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          CUNY students graduate with degrees but no portfolio. Employers want experience, but
          experience requires opportunity. We break that cycle — matching students with real
          paid projects from day one.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/auth/signup?role=student">
              <GraduationCap className="h-5 w-5" />
              I&apos;m a CUNY Student
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link href="/auth/signup?role=employer">
              <Briefcase className="h-5 w-5" />
              I&apos;m an Employer
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-400">Free to join. No experience required.</p>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The experience paradox is real.
            </h2>
            <p className="text-lg text-gray-600">
              CUNY students are locked out of opportunities that require a portfolio to even apply.
              Meanwhile, small businesses need affordable talent. We connect both sides.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: GraduationCap,
                title: "125,000+ CUNY students",
                desc: "Talented, motivated, and ready — but overlooked because they lack a portfolio.",
              },
              {
                icon: Briefcase,
                title: "NYC small businesses",
                desc: "Need websites, content, and design but can't afford agency rates.",
              },
              {
                icon: Sparkles,
                title: "AI bridges the gap",
                desc: "Claude coaches students to pitch better and matches them to the right projects.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">How it works</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Employer flow */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold">For Employers</h3>
            </div>
            <ol className="space-y-4">
              {[
                "Post a project brief with your budget and deadline",
                "AI checks your brief quality and suggests improvements",
                "Review matched student candidates",
                "Collaborate in the project workspace",
                "Rate the work and release payment",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/auth/signup?role=employer">
                Post a project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Student flow */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">For Students</h3>
            </div>
            <ol className="space-y-4">
              {[
                "Sign up with your CUNY email and list your skills",
                "Get matched to relevant projects automatically",
                "Use the AI pitch coach to craft a winning intro",
                "Complete the project and upload your deliverable",
                "Earn payment and build your portfolio",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
            <Button className="mt-6" asChild>
              <Link href="/auth/signup?role=student">
                Find your first project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[
              { value: "4.9★", label: "Average rating" },
              { value: "$500", label: "Avg project value" },
              { value: "100%", label: "Portfolio growth" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold mb-1">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup CTA */}
      <section className="py-24 container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Start building your story today.
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Choose your path and get started in minutes.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <CardContent className="pt-8 pb-8 text-center">
              <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">I&apos;m a Student</h3>
              <p className="text-gray-500 text-sm mb-6">CUNY email required. Free forever.</p>
              <Button className="w-full" asChild>
                <Link href="/auth/signup?role=student">Sign up as Student</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer">
            <CardContent className="pt-8 pb-8 text-center">
              <Briefcase className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">I&apos;m an Employer</h3>
              <p className="text-gray-500 text-sm mb-6">Business email required. Post free.</p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                <Link href="/auth/signup?role=employer">Sign up as Employer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            CUNY Launchpad
          </div>
          <p>© {new Date().getFullYear()} CUNY Launchpad. Built at CUNY AI Innovation.</p>
        </div>
      </footer>
    </div>
  )
}
