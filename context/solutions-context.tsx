"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { Solution, SolutionStatus, Review } from "@/lib/types"
import { mockSolutions } from "@/lib/mock-data"
import { VALIDATION_THRESHOLD } from "@/lib/constants"

interface SolutionsContextType {
  solutions: Solution[]
  getSolution: (id: string) => Solution | undefined
  getUserSolutions: (userId: string) => Solution[]
  getPendingReviews: () => Solution[]
  getApprovedSolutions: () => Solution[]
  submitSolution: (data: SubmitSolutionData) => Promise<Solution>
  updateSolutionStatus: (id: string, status: SolutionStatus) => void
  reviewSolution: (solutionId: string, review: Omit<Review, "id" | "createdAt">) => void
  searchSolutions: (query: string, filters?: SearchFilters) => Solution[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  savedSolutionIds: string[]
  toggleBookmark: (solutionId: string) => void
}

export interface SubmitSolutionData {
  title: string
  description: string
  techStack: string[]
  tags: string[]
  sourceType: "github" | "zip" | "snippet"
  sourceUrl?: string
  codeSnippet?: string
  submittedBy: string
  submittedByName: string
}

export interface SearchFilters {
  techStack?: string[]
  status?: SolutionStatus[]
  minScore?: number
  sortBy?: "relevance" | "score" | "freshness" | "usage"
}

const SolutionsContext = createContext<SolutionsContextType | undefined>(undefined)

export function SolutionsProvider({ children }: { children: ReactNode }) {
  const [solutions, setSolutions] = useState<Solution[]>(mockSolutions)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedSolutionIds, setSavedSolutionIds] = useState<string[]>([])

  const getSolution = useCallback(
    (id: string) => solutions.find((s) => s.id === id),
    [solutions]
  )

  const getUserSolutions = useCallback(
    (userId: string) => solutions.filter((s) => s.submittedBy === userId),
    [solutions]
  )

  const getPendingReviews = useCallback(
    () => solutions.filter((s) => s.status === "pending-review"),
    [solutions]
  )

  const getApprovedSolutions = useCallback(
    () => solutions.filter((s) => s.status === "approved"),
    [solutions]
  )

  const toggleBookmark = useCallback((id: string) => {
    setSavedSolutionIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }, [])

  const submitSolution = useCallback(
    async (data: SubmitSolutionData): Promise<Solution> => {
      await new Promise((r) => setTimeout(r, 1200))

      const newSolution: Solution = {
        id: `s${Date.now()}`,
        ...data,
        status: "in-validation",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || []
      }

      // Simulate validation after a delay
      setTimeout(() => {
        const score = Math.floor(Math.random() * 40) + 60
        const passed = score >= VALIDATION_THRESHOLD

        setSolutions((prev) =>
          prev.map((s) =>
            s.id === newSolution.id
              ? {
                ...s,
                status: passed ? "pending-review" : "rejected",
                validationReport: {
                  id: `vr${Date.now()}`,
                  solutionId: s.id,
                  score,
                  checks: [
                    { id: `c${Date.now()}1`, name: "Structure Validation", description: "Validates project directory structure", status: passed ? "pass" : "fail" },
                    { id: `c${Date.now()}2`, name: "Dependency Check", description: "Checks for vulnerable dependencies", status: "pass" },
                    { id: `c${Date.now()}3`, name: "Secret Scan", description: "Scans for hardcoded secrets", status: "pass" },
                    { id: `c${Date.now()}4`, name: "Environment Validation", description: "Validates env configuration", status: passed ? "pass" : "fail" },
                  ],
                  completedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              }
              : s
          )
        )
      }, 3000)

      setSolutions((prev) => [newSolution, ...prev])
      return newSolution
    },
    []
  )

  const updateSolutionStatus = useCallback(
    (id: string, status: SolutionStatus) => {
      setSolutions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status, updatedAt: new Date().toISOString() }
            : s
        )
      )
    },
    []
  )

  const reviewSolution = useCallback(
    (solutionId: string, review: Omit<Review, "id" | "createdAt">) => {
      const fullReview: Review = {
        ...review,
        id: `r${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      setSolutions((prev) =>
        prev.map((s) =>
          s.id === solutionId
            ? {
              ...s,
              review: fullReview,
              status: review.decision === "approved" ? "approved" : "rejected",
              updatedAt: new Date().toISOString(),
            }
            : s
        )
      )
    },
    []
  )

  const searchSolutions = useCallback(
    (query: string, filters?: SearchFilters) => {
      let results = solutions.filter((s) => s.status === "approved")

      if (query) {
        const q = query.toLowerCase()
        results = results.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      if (filters?.techStack?.length) {
        results = results.filter((s) =>
          filters.techStack!.some((t) => s.techStack.includes(t))
        )
      }

      if (filters?.minScore) {
        results = results.filter(
          (s) =>
            s.validationReport && s.validationReport.score >= filters.minScore!
        )
      }

      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case "score":
            results.sort(
              (a, b) =>
                (b.validationReport?.score ?? 0) -
                (a.validationReport?.score ?? 0)
            )
            break
          case "freshness":
            results.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            break
          case "usage":
            results.sort((a, b) => b.usageCount - a.usageCount)
            break
        }
      }

      return results
    },
    [solutions]
  )

  return (
    <SolutionsContext.Provider
      value={{
        solutions,
        getSolution,
        getUserSolutions,
        getPendingReviews,
        getApprovedSolutions,
        submitSolution,
        updateSolutionStatus,
        reviewSolution,
        searchSolutions,
        searchTerm,
        setSearchTerm,
        savedSolutionIds,
        toggleBookmark,
      }}
    >
      {children}
    </SolutionsContext.Provider>
  )
}

export function useSolutions() {
  const context = useContext(SolutionsContext)
  if (!context) {
    throw new Error("useSolutions must be used within a SolutionsProvider")
  }
  return context
}
