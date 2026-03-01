"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-[oklch(0.13_0.02_261)] px-4 py-24">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.26_0.03_261)] bg-[oklch(0.17_0.025_261)] px-8 py-16 text-center lg:px-16">
          {/* Glow accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_120%,oklch(0.45_0.18_255/0.12),transparent)]" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-[oklch(0.95_0.005_240)] sm:text-4xl">
              Ready to streamline your solution lifecycle?
            </h2>
            <p className="mt-4 text-lg text-[oklch(0.60_0.015_261)]">
              Join engineering teams who trust our platform for validated, reusable solutions.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/signup">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[oklch(0.30_0.03_261)] bg-transparent px-8 text-[oklch(0.85_0.01_240)] hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.95_0.005_240)]">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
