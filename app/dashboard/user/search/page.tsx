"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "react-router-dom"
import { useSolutions, type SearchFilters } from "@/context/solutions-context"
import { SolutionCard } from "@/components/cards/solution-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { TECH_STACK_OPTIONS } from "@/lib/constants"

function SearchContent() {
  const [searchParams] = useSearchParams()
  const { searchSolutions } = useSolutions()

  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("relevance")
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [minScore, setMinScore] = useState<number>(0)

  const results = searchSolutions(query, {
    sortBy,
    techStack: selectedTech.length > 0 ? selectedTech : undefined,
    minScore: minScore > 0 ? minScore : undefined,
  })

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Solutions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover validated and approved solutions
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, or tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-11 text-base"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sortBy ?? "relevance"} onValueChange={(v) => setSortBy(v as SearchFilters["sortBy"])}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort by..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="score">Highest Score</SelectItem>
            <SelectItem value="freshness">Most Recent</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1.5">
          {TECH_STACK_OPTIONS.slice(0, 8).map((tech) => (
            <Badge
              key={tech}
              variant={selectedTech.includes(tech) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setSelectedTech((prev) =>
                  prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
                )
              }
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {results.length} solution{results.length !== 1 ? "s" : ""}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground">No solutions found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search query or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((sol) => (
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
