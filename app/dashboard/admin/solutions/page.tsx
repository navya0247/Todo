"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { useSolutions } from "@/context/solutions-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, X } from "lucide-react"

export default function AdminSolutionsPage() {
  const { solutions, updateSolutionStatus } = useSolutions()
  const [statusFilter, setStatusFilter] = useState("all")
  const [techFilter, setTechFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSolutions = solutions.filter((sol) => {
    if (statusFilter !== "all" && sol.status !== statusFilter) return false
    if (techFilter !== "all" && !sol.techStack.map(t => t.toLowerCase()).includes(techFilter.toLowerCase())) return false
    if (ownerFilter !== "all" && !sol.submittedByName.toLowerCase().includes(ownerFilter.toLowerCase())) return false

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matchesName = sol.title.toLowerCase().includes(q)
      const matchesTags = sol.tags.some(tag => tag.toLowerCase().includes(q))
      if (!matchesName && !matchesTags) return false
    }

    return true
  })

  const clearFilters = () => {
    setStatusFilter("all")
    setTechFilter("all")
    setOwnerFilter("all")
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Submitted Solutions</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name or tags..."
            className="pl-9 bg-background border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending-review">Under Review</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="in-validation">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-background"><SelectValue placeholder="Stack" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stacks</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="node">Node.js</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            Clear
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solution Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validation Score</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolutions.map((sol) => (
                <tr key={sol.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{sol.title}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{sol.submittedByName}</td>
                  <td className="px-5 py-4">
                    <Badge className={STATUS_COLORS[sol.status]}>
                      {STATUS_LABELS[sol.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-center text-sm font-medium text-primary">{sol.validationReport?.score || "N/A"}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(sol.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded p-1 hover:bg-muted">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/admin/solutions/${sol.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        {sol.status !== 'rejected' && (
                          <DropdownMenuItem className="text-destructive font-medium" onClick={() => {
                            updateSolutionStatus(sol.id, 'flagged')
                            toast.error("Solution flagged")
                          }}>Mark as Flagged</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
