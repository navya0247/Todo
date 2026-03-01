"use client"

import { useAuth } from "@/context/auth-context"
import { useSolutions } from "@/context/solutions-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { SlidersHorizontal, ArrowLeft, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PendingPage() {
  const { user } = useAuth()
  const { solutions, searchTerm } = useSolutions()
  const navigate = useNavigate()
  const [localFilter, setLocalFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const allUserSolutions = solutions.filter((s) => {
    if (s.submittedBy !== user?.id) return false;

    // Status filter
    if (localFilter === "pending" && !["in-validation", "pending-review"].includes(s.status)) return false;
    if (localFilter === "rejected" && s.status !== "rejected") return false;

    // Search filter (Global)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesSearch = s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "high-risk") {
      const scoreA = a.validationReport?.score ?? 100;
      const scoreB = b.validationReport?.score ?? 100;
      return scoreA - scoreB; // Lower score = Higher risk
    }
    if (sortBy === "low-risk") {
      const scoreA = a.validationReport?.score ?? 100;
      const scoreB = b.validationReport?.score ?? 100;
      return scoreB - scoreA; // Higher score = Lower risk
    }
    return 0;
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Solutions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track the validation progress of your submitted solutions
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
          <button
            onClick={() => setLocalFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${localFilter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setLocalFilter("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${localFilter === "pending" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setLocalFilter("rejected")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${localFilter === "rejected" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{allUserSolutions.length}</span> submissions
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setSortBy("recent")} className={cn(sortBy === "recent" && "bg-muted font-medium")}>
              Recently Submitted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")} className={cn(sortBy === "oldest" && "bg-muted font-medium")}>
              Oldest Submitted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("high-risk")} className={cn(sortBy === "high-risk" && "bg-muted font-medium")}>
              Highest Risk
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("low-risk")} className={cn(sortBy === "low-risk" && "bg-muted font-medium")}>
              Lowest Risk
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solution Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validation Score</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUserSolutions.map((sol) => (
                <tr key={sol.id} className="border-b border-border last:border-b-0 hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{sol.title}</td>
                  <td className="px-5 py-4">
                    <Badge className={STATUS_COLORS[sol.status]}>
                      {STATUS_LABELS[sol.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(sol.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground font-semibold">
                    {sol.validationReport ? (
                      <span className={sol.validationReport.score >= 80 ? "text-emerald-600" : "text-amber-600"}>
                        {sol.validationReport.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Scanning...</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {sol.status === "in-validation" ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Automated Check
                      </div>
                    ) : sol.status === "pending-review" ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Expert Review
                      </div>
                    ) : (
                      "Completed"
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/dashboard/user/solutions/${sol.id}`} className="inline-flex items-center justify-center rounded-md bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {allUserSolutions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No matching submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
