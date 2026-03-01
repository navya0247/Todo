export const TECH_STACK_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "TypeScript",
  "Java",
  "Spring Boot",
  "Django",
  "FastAPI",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST API",
  "Terraform",
  "CI/CD",
] as const

export const VALIDATION_THRESHOLD = 70

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  "in-validation": "bg-yellow-500/15 text-yellow-600",
  "pending-review": "bg-blue-500/15 text-blue-600",
  approved: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-600",
  flagged: "bg-orange-500/15 text-orange-600",
  deprecated: "bg-muted text-muted-foreground",
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  "in-validation": "In Validation",
  "pending-review": "Pending Review",
  approved: "Active",
  rejected: "Rejected",
  flagged: "Flagged",
  deprecated: "Deprecated",
}
