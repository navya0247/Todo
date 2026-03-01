"use client"

import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import type { Solution } from "@/lib/types"
import { Bookmark, Shield, Code, Play } from "lucide-react"
import { getTechIconUrl } from "@/lib/utils"
import { useSolutions } from "@/context/solutions-context"
import { useState } from "react"

interface SolutionCardProps {
  solution: Solution
  href?: string
  showBookmark?: boolean
  onBookmark?: () => void
}

export function SolutionCard({ solution, href, showBookmark = true, onBookmark }: SolutionCardProps) {
  const techLogoSrc = (solution.techStack && solution.techStack.length > 0) ? getTechIconUrl(solution.techStack[0]) : ""
  const { savedSolutionIds, toggleBookmark } = useSolutions()
  const isSaved = savedSolutionIds.includes(solution.id)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onBookmark) onBookmark()
    else toggleBookmark(solution.id)
  }

  const content = (
    <Card className="group h-full flex flex-col border-border transition-all hover:border-primary/30 hover:shadow-md relative overflow-hidden">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
              {techLogoSrc ? (
                <>
                  <img src={techLogoSrc} alt={solution.techStack[0]} className="h-6 w-6 object-contain" onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }} />
                  <Shield className="fallback-icon hidden h-6 w-6 text-muted-foreground" />
                </>
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary">
                {solution.title}
              </h3>
              <span className="text-xs text-muted-foreground">v{solution.validationReport ? "2.4.1" : "1.0.0"}</span>
            </div>
          </div>
          <Badge className={STATUS_COLORS[solution.status]}>
            {STATUS_LABELS[solution.status]}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {solution.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {solution.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
              {solution.submittedByName.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className="text-xs text-muted-foreground">{solution.submittedByName}</span>
          </div>
          <div className="flex items-center gap-3">
            {solution.validationReport && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-primary">
                  {solution.validationReport.score}/100
                </span>
                <span className="text-[10px] text-muted-foreground">SCORE</span>
              </div>
            )}
            {showBookmark && (
              <button
                onClick={handleSave}
                className={`rounded p-1 transition-colors hover:bg-muted ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link to={href}>{content}</Link>
  }

  return content
}
