"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Layers, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "border-b border-[oklch(0.26_0.03_261)] bg-[oklch(0.16_0.025_261)] shadow-lg"
          : "bg-[oklch(0.16_0.025_261)]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-[oklch(0.95_0.005_240)]">
              Solution Reusability
            </span>
            <span className="text-[10px] leading-tight text-[oklch(0.55_0.015_261)]">
              Validation Platform
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:text-[oklch(0.90_0.01_240)]">
            How it Works
          </a>
          <a href="#features" className="text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:text-[oklch(0.90_0.01_240)]">
            Features
          </a>
          <a href="#about" className="text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:text-[oklch(0.90_0.01_240)]">
            About
          </a>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-[oklch(0.75_0.015_261)] hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.95_0.005_240)]">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[oklch(0.90_0.01_240)] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[oklch(0.26_0.03_261)] bg-[oklch(0.16_0.025_261)] px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <a
              href="#how-it-works"
              className="rounded-md px-3 py-2.5 text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.90_0.01_240)]"
              onClick={() => setMobileOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#features"
              className="rounded-md px-3 py-2.5 text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.90_0.01_240)]"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#about"
              className="rounded-md px-3 py-2.5 text-sm text-[oklch(0.65_0.015_261)] transition-colors hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.90_0.01_240)]"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full border-[oklch(0.26_0.03_261)] text-[oklch(0.90_0.01_240)] hover:bg-[oklch(0.22_0.03_261)]">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
