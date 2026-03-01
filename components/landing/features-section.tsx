import { Bot, ShieldCheck, Users, Search, GitBranch, Activity } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Validation",
    description:
      "Automated validation pipeline analyzes code structure, dependencies, secrets, and environment configuration.",
  },
  {
    icon: ShieldCheck,
    title: "Sandbox Execution",
    description:
      "Solutions are tested in isolated sandbox environments to ensure security and reliability.",
  },
  {
    icon: Users,
    title: "Expert Review",
    description:
      "Domain experts review validated solutions, providing feedback and approval for catalog inclusion.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Discover reusable solutions with intelligent ranking based on relevance, score, freshness, and usage.",
  },
  {
    icon: GitBranch,
    title: "Multi-Source Support",
    description:
      "Submit via GitHub repositories, ZIP archives, or code snippets. Flexibility for any workflow.",
  },
  {
    icon: Activity,
    title: "Full Audit Trail",
    description:
      "Every action is logged with comprehensive audit trails for compliance and transparency.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background px-4 py-24">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for solution governance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            From automated validation to expert review, our platform ensures every solution meets your standards.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
