export type UserRole = "user" | "expert" | "admin"

export type SolutionStatus =
  | "draft"
  | "in-validation"
  | "pending-review"
  | "approved"
  | "rejected"
  | "flagged"
  | "deprecated"

export type ValidationCheckStatus = "pass" | "fail" | "running" | "pending"

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  organization: string
  techStack: string[]
  createdAt: string
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  domains?: string[]
  status?: "Active" | "Disabled"
}

export interface ValidationCheck {
  id: string
  name: string
  description: string
  status: ValidationCheckStatus
  details?: string
}

export interface ValidationReport {
  id: string
  solutionId: string
  score: number
  checks: ValidationCheck[]
  completedAt: string
}

export interface Review {
  id: string
  solutionId: string
  expertId: string
  expertName: string
  decision: "approved" | "rejected" | "pending"
  feedback: string
  createdAt: string
}

export interface Solution {
  id: string
  title: string
  description: string
  techStack: string[]
  tags: string[]
  status: SolutionStatus
  submittedBy: string
  submittedByName: string
  sourceType: "github" | "zip" | "snippet"
  sourceUrl?: string
  codeSnippet?: string
  validationReport?: ValidationReport
  review?: Review
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  action: string
  performedBy: string
  performedByName: string
  targetType: "solution" | "user" | "review"
  targetId: string
  details: string
  createdAt: string
}
