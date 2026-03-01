"use client"

import { useAuth } from "@/context/auth-context"
import { useSolutions } from "@/context/solutions-context"
import { Card, CardContent } from "@/components/ui/card"
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
import { SolutionCard } from "@/components/cards/solution-card"
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Database,
  Check
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

import { STATUS_LABELS } from "@/lib/constants"

export default function UserDashboard() {
  const { user } = useAuth()
  const { solutions } = useSolutions()
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { searchTerm } = useSolutions()

  // Example active filters based on screenshot
  const [filters, setFilters] = useState<{ type: string; value: string; key: string }[]>([])

  const [sortBy, setSortBy] = useState("relevance")

  // Generate a derived list of display solutions based on tabs, search/filters, and sort
  const displaySolutions = solutions
    .filter((s) => {
      // Base requirement from original code
      if (!["approved", "in-validation", "pending-review"].includes(s.status)) return false;

      // Tab filtering
      if (activeTab === "team" && s.submittedByName !== user?.fullName) return false;

      // We could add "recent" logic based on dates here, but for now just pass.

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
      if (sortBy === "score") {
        const scoreA = a.validationReport?.score ?? 0;
        const scoreB = b.validationReport?.score ?? 0;
        return scoreB - scoreA;
      }
      // 'relevance' (fallback to usageCount or just id for mock)
      return b.usageCount - a.usageCount;
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

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solution Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover validated tools, libraries, and services for your projects.
          </p>
        </div>
        <Button asChild className="gap-2 bg-primary">
          <Link to="/dashboard/user/submit">
            <Plus className="h-4 w-4" />
            Submit Solution
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Solutions</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-semibold text-foreground">1,248</p>
                <div className="flex items-center text-xs font-medium text-emerald-600 mb-1">
                  <ArrowUpRight className="h-3 w-3" />
                  12%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved & Active</p>
              <p className="text-2xl font-semibold text-foreground">892</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold text-foreground">45</p>
              </div>
              <span className="text-xs text-muted-foreground mb-1">Avg wait: 2d</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged/Issues</p>
                <p className="text-2xl font-semibold text-foreground">12</p>
              </div>
              <span className="text-xs text-destructive/80 mb-1">Action required</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border p-1 bg-background">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === "all" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                All Solutions
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 border border-transparent ${activeTab === "team" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground border-border hover:text-foreground hover:border-border"}`}
                style={{ marginLeft: 8 }}
              >
                My Team
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 border border-transparent ${activeTab === "recent" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground border-border hover:text-foreground hover:border-border"}`}
                style={{ marginLeft: 8 }}
              >
                Recently Updated
              </button>
            </div>

            <span className="text-border mx-2">|</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
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
                  {["Approved", "In Validation", "Pending Review"].map(status => (
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
                <SelectTrigger className="w-[140px] h-8 border-none shadow-none font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
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
          {filters.length > 0 && (
            <button
              onClick={() => setFilters([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Solutions Grid */}
      <div className={viewMode === "grid"
        ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        : "flex flex-col gap-4"
      }>
        {displaySolutions.length > 0 ? (
          displaySolutions.map((sol) => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              href={`/dashboard/user/solutions/${sol.id}`}
            />
          ))
        ) : (
          <div className="col-span-12 py-12 text-center text-muted-foreground">
            No solutions match your current filters.
          </div>
        )}
      </div>
    </div>
  )
}
