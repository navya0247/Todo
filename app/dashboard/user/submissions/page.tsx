"use client"

import { useAuth } from "@/context/auth-context"
import { useSolutions } from "@/context/solutions-context"
import { SolutionCard } from "@/components/cards/solution-card"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  CheckCircle2,
  Star,
  ArrowLeft,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Check,
  Clock,
  AlertTriangle
} from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { STATUS_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function MySubmissionsPage() {
  const { user } = useAuth()
  const { solutions, searchTerm } = useSolutions()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState<{ type: string; value: string; key: string }[]>([])
  const [sortBy, setSortBy] = useState("newest")

  const allUserSolutions = solutions.filter((s) => s.submittedBy === user?.id)

  const displaySolutions = allUserSolutions
    .filter((s) => {
      // Tab filtering
      if (activeTab === "pending" && !["in-validation", "pending-review"].includes(s.status)) return false;
      if (activeTab === "approved" && s.status !== "approved") return false;

      // Custom Badge Filters
      if (filters.length > 0) {
        const hasFailedFilter = filters.some(f => {
          if (f.type === "Stack") return !s.techStack.includes(f.value);
          if (f.type === "Status") {
            const statusLabel = STATUS_LABELS[s.status]?.toLowerCase();
            return statusLabel !== f.value.toLowerCase();
          }
          return false;
        });
        if (hasFailedFilter) return false;
      }

      // Global Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesSearch = s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "score") {
        const scoreA = a.validationReport?.score ?? 0;
        const scoreB = b.validationReport?.score ?? 0;
        return scoreB - scoreA;
      }
      return 0;
    });

  const toggleFilter = (type: string, value: string) => {
    const key = `${type.toLowerCase()}-${value.toLowerCase()}`
    if (filters.find(f => f.key === key)) {
      setFilters(filters.filter(f => f.key !== key))
    } else {
      setFilters([...filters, { type, value, key }])
    }
  }

  const removeFilter = (key: string) => {
    setFilters(filters.filter(f => f.key !== key))
  }

  const approved = allUserSolutions.filter((s) => s.status === "approved").length
  const avgScore = allUserSolutions
    .filter((s) => s.validationReport)
    .reduce((acc, s) => acc + (s.validationReport?.score ?? 0), 0) /
    (allUserSolutions.filter((s) => s.validationReport).length || 1)

  const stats = [
    { label: "Total Submissions", value: allUserSolutions.length, icon: FileText, color: "bg-primary/10", textColor: "text-primary" },
    { label: "Approved", value: approved, icon: CheckCircle2, color: "bg-emerald-500/10", textColor: "text-emerald-600" },
    { label: "Avg. Score", value: Math.round(avgScore), icon: Star, color: "bg-amber-500/10", textColor: "text-amber-600" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Button asChild className="gap-2 bg-primary">
          <Link to="/dashboard/user/submit">
            <Plus className="h-4 w-4" />
            Submit New
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">My Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your contributions to the solution catalog
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", stat.color)}>
                <stat.icon className={cn("h-6 w-6", stat.textColor)} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border p-1 bg-background">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === "all" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 border border-transparent ${activeTab === "pending" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground border-border hover:text-foreground hover:border-border"}`}
                style={{ marginLeft: 8 }}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 border border-transparent ${activeTab === "approved" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground border-border hover:text-foreground hover:border-border"}`}
                style={{ marginLeft: 8 }}
              >
                Approved
              </button>
            </div>

            <span className="text-border mx-2">|</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Stack</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {["React", "Node.js", "TypeScript", "Python"].map(stack => (
                    <DropdownMenuItem
                      key={stack}
                      onSelect={(e) => { e.preventDefault(); toggleFilter("Stack", stack); }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      {stack}
                      {filters.find(f => f.key === `stack-${stack.toLowerCase()}`) && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {["Approved", "In Validation", "Pending Review", "Rejected"].map(status => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={(e) => { e.preventDefault(); toggleFilter("Status", status); }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      {status}
                      {filters.find(f => f.key === `status-${status.toLowerCase()}`) && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-8 border-none shadow-none font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md focus:ring-0">
                  <SelectValue placeholder="Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center rounded-md border p-0.5 bg-muted/40">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1.5 transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Row */}
        {filters.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Filters:</span>
              {filters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className={`gap-1 font-normal hover:bg-muted ${filter.type === "Stack" ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200/50" :
                    filter.type === "Status" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50" : ""
                    }`}
                >
                  <span className="opacity-70">{filter.type}:</span> {filter.value}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <button
              onClick={() => setFilters([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {displaySolutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No submissions found</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {searchTerm || filters.length > 0 || activeTab !== "all" ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFilters([]);
                setActiveTab("all");
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button asChild size="sm" className="mt-4">
              <Link to="/dashboard/user/submit">Submit Your First Solution</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        )}>
          {displaySolutions.map((sol) => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              href={`/dashboard/user/solutions/${sol.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
