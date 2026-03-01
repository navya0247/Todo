import { Link } from "react-router-dom"
import { Layers } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[oklch(0.26_0.03_261)] bg-[oklch(0.11_0.018_261)] px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 lg:px-8 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-tight text-[oklch(0.90_0.01_240)]">
              Solution Reusability
            </span>
            <span className="text-[9px] leading-tight text-[oklch(0.50_0.015_261)]">
              Validation Platform
            </span>
          </div>
        </div>
        <nav className="flex gap-6 text-sm text-[oklch(0.55_0.015_261)]">
          <Link to="#" className="transition-colors hover:text-[oklch(0.85_0.01_240)]">
            Privacy
          </Link>
          <Link to="#" className="transition-colors hover:text-[oklch(0.85_0.01_240)]">
            Terms
          </Link>
          <Link to="#" className="transition-colors hover:text-[oklch(0.85_0.01_240)]">
            Contact
          </Link>
          <Link to="#" className="transition-colors hover:text-[oklch(0.85_0.01_240)]">
            Documentation
          </Link>
        </nav>
        <p className="text-sm text-[oklch(0.45_0.015_261)]">
          2026 SolveBase. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
