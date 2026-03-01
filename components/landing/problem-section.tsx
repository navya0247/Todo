import { AlertTriangle, RefreshCcw, Clock } from "lucide-react"

const problems = [
  {
    icon: RefreshCcw,
    title: "Duplicate Effort",
    description:
      "Teams rebuild the same solutions independently, wasting engineering hours and creating inconsistent implementations.",
  },
  {
    icon: AlertTriangle,
    title: "No Quality Gates",
    description:
      "Without automated validation, vulnerable or poorly structured code makes it into production.",
  },
  {
    icon: Clock,
    title: "Slow Discovery",
    description:
      "Existing solutions are buried in repositories. Engineers spend more time searching than building.",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-background px-4 py-24">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            The Problem
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Solution sprawl is costing your team
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="flex flex-col items-start rounded-xl border border-destructive/20 bg-destructive/5 p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <problem.icon className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {problem.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
