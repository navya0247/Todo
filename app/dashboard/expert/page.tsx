"use client"

import { useState } from "react"
import { useSolutions } from "@/context/solutions-context"
import { SolutionCard } from "@/components/cards/solution-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, X, Search } from "lucide-react"

export default function ExpertDashboard() {
  const { solutions } = useSolutions()
  const [techFilter, setTechFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("highest")
  const [searchQuery, setSearchQuery] = useState("")

  const pendingReviews = solutions
    .filter((s) => s.status === "pending-review" || s.status === "in-validation")
    .filter((s) => {
      // Search
      if (searchQuery) {
        if (!s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !s.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      // Tech Filter
      if (techFilter !== "all") {
        if (!s.techStack.some(t => t.toLowerCase().includes(techFilter.toLowerCase()))) return false;
      }
      // Score Filter
      if (scoreFilter !== "all") {
        const score = s.validationReport?.score || 0;
        if (scoreFilter === "high" && score < 90) return false;
        if (scoreFilter === "mid" && (score < 70 || score >= 90)) return false;
        if (scoreFilter === "low" && score >= 70) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (riskFilter === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (riskFilter === "highest") {
        const scoreA = a.validationReport?.score ?? 100;
        const scoreB = b.validationReport?.score ?? 100;
        return scoreA - scoreB; // Lower score = Higher risk
      }
      if (riskFilter === "lowest") {
        const scoreA = a.validationReport?.score ?? 0;
        const scoreB = b.validationReport?.score ?? 0;
        return scoreB - scoreA; // Higher score = Lowest risk (best validation)
      }
      return 0;
    })

  const clearFilters = () => {
    setTechFilter("all")
    setScoreFilter("all")
    setRiskFilter("highest")
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Solutions assigned for expert review
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pending reviews by name or keywords..."
            className="w-full bg-background pl-9 border-border placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="All Tech Stacks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tech Stacks</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="node">Node.js</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="All Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="high">High (90+)</SelectItem>
              <SelectItem value="mid">Mid (70-89)</SelectItem>
              <SelectItem value="low">Low (0-69)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Highest Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest Risk</SelectItem>
              <SelectItem value="lowest">Lowest Risk</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:bg-muted">
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground">No pending reviews</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back later for new assignments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingReviews.map((sol) => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              href={`/dashboard/expert/review/${sol.id}`}
              showBookmark={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
