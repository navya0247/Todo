import { Upload, Bot, Search } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Submit",
    description:
      "Upload your solution via GitHub, ZIP, or code snippet. Add metadata, tech stack, and tags for discoverability.",
  },
  {
    icon: Bot,
    step: "02",
    title: "Validate",
    description:
      "AI-powered validation checks structure, dependencies, secrets, and environment configuration automatically.",
  },
  {
    icon: Search,
    step: "03",
    title: "Discover",
    description:
      "Approved solutions are published to a searchable catalog with smart ranking and filtering.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-[oklch(0.13_0.02_261)] px-4 py-24">
      <div className="mx-auto max-w-7xl lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[oklch(0.95_0.005_240)] sm:text-4xl">
            Three steps to validated solutions
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="group relative rounded-xl border border-[oklch(0.26_0.03_261)] bg-[oklch(0.17_0.025_261)] p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-mono text-sm text-[oklch(0.50_0.015_261)]">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[oklch(0.95_0.005_240)]">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-[oklch(0.60_0.015_261)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
