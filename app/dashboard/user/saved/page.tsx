"use client"

import { useState } from "react"
import { useSolutions } from "@/context/solutions-context"
import { SolutionCard } from "@/components/cards/solution-card"
import { LayoutGrid, List, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export default function SavedSolutionsPage() {
  const { solutions, savedSolutionIds, searchTerm } = useSolutions()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const navigate = useNavigate()

  const savedSolutions = solutions.filter((s) => {
    if (!savedSolutionIds.includes(s.id)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  })

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Solutions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick access to your bookmarked solutions
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded p-1.5 transition-colors",
              viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded p-1.5 transition-colors",
              viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {savedSolutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground">No saved solutions</p>
          <p className="mt-1 text-sm text-muted-foreground">Browse and bookmark solutions to find them here</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-3"
        )}>
          {savedSolutions.map((sol) => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              href={`/dashboard/user/solutions/${sol.id}`}
              showBookmark
            />
          ))}
        </div>
      )}
    </div>
  )
}
