"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, CheckCircle2, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[oklch(0.13_0.02_261)]">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(oklch(0.18_0.025_261)_1px,transparent_1px),linear-gradient(90deg,oklch(0.18_0.025_261)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      {/* Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center lg:px-8 lg:py-32">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[oklch(0.26_0.03_261)] bg-[oklch(0.17_0.025_261)] px-4 py-1.5 text-sm text-[oklch(0.70_0.015_261)]">
          <Shield className="h-4 w-4 text-primary" />
          Enterprise-Grade Solution Platform
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-[oklch(0.95_0.005_240)] sm:text-5xl lg:text-6xl">
          Validate, Reuse, and{" "}
          <span className="text-primary">Ship Faster</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[oklch(0.60_0.015_261)]">
          The complete platform for submitting, validating, and discovering reusable software solutions.
          AI-powered validation, expert review, and smart search — all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 px-8">
            <Link to="/signup">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[oklch(0.30_0.03_261)] bg-transparent px-8 text-[oklch(0.85_0.01_240)] hover:bg-[oklch(0.20_0.03_261)] hover:text-[oklch(0.95_0.005_240)]">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-[oklch(0.50_0.015_261)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span>AI-Powered Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span>Expert Review</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Smart Discovery</span>
          </div>
        </div>
      </div>
    </section>
  )
}
