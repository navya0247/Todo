"use client"

import { use, useState } from "react"
import { useSolutions } from "@/context/solutions-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import { ArrowLeft, Download, CheckCircle2, XCircle, AlertTriangle, Shield, TrendingUp, Users, Activity, FileText, Play, ExternalLink } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { getTechIconUrl } from "@/lib/utils"
import { toast } from "sonner"
export default function SolutionDetailPage() {
  const { solutionId } = useParams() as { solutionId: string }
  const navigate = useNavigate()
  const { getSolution } = useSolutions()
  const solution = getSolution(solutionId)
  const [activeTab, setActiveTab] = useState("overview")

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium text-foreground">Solution not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/user">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const score = solution.validationReport?.score
  const techLogoSrc = (solution.techStack && solution.techStack.length > 0) ? getTechIconUrl(solution.techStack[0]) : ""

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
              {techLogoSrc ? (
                <>
                  <img src={techLogoSrc} alt={solution.techStack[0]} className="h-6 w-6 object-contain" onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }} />
                  <Shield className="fallback-icon hidden h-6 w-6 text-muted-foreground" />
                </>
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{solution.title}</h1>
              <Badge className={STATUS_COLORS[solution.status]}>
                {STATUS_LABELS[solution.status]}
              </Badge>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {solution.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Version: v2.1.0</span>
            <span>Owner: {solution.submittedByName}</span>
            <div className="flex items-center gap-1 text-primary">
              <ExternalLink className="h-3 w-3" />
              <a href={solution.sourceUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:underline">View on GitHub</a>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {solution.techStack.map((tech) => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
            {solution.tags.map((tag) => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
        </div>
        {score !== undefined && (
          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-primary">
            <span className="text-2xl font-bold text-primary">{score}</span>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">What it does</h3>
              <p className="leading-relaxed text-muted-foreground">{solution.description}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Intended Use</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>Ideal for enterprise applications requiring robust authentication</li>
                <li>Suitable for microservices architectures</li>
                <li>Can be customized for specific business requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Quick Start</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">1. Installation</p>
                  <pre className="rounded-lg bg-[oklch(0.16_0.025_261)] p-4 text-sm text-[oklch(0.85_0.01_240)]">
                    <code>{"npm install\n# or\nyarn install"}</code>
                  </pre>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">2. Configuration</p>
                  <pre className="rounded-lg bg-[oklch(0.16_0.025_261)] p-4 text-sm text-[oklch(0.85_0.01_240)]">
                    <code>{"# Copy environment template\ncp .env.example .env\n\n# Configure your environment variables\nDATABASE_URL=postgresql://...\nJWT_SECRET=your-secret-key"}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {solution.validationReport && (
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Dependencies</h3>
                <div className="grid grid-cols-2 gap-3">
                  {solution.techStack.map((tech) => (
                    <div key={tech} className="flex items-center justify-between rounded-md border border-border px-4 py-2">
                      <span className="text-sm text-foreground">{tech}</span>
                      <span className="text-xs text-muted-foreground">Latest</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          {solution.validationReport ? (
            <div className="flex flex-col gap-4">
              <Card className="border-border overflow-hidden">
                <div className="bg-muted/30 border-b border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Agent Validation Report
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Comprehensive automated security and structure analysis generated by AI.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Passed
                    </div>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">Detailed Report Available</h4>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                    Our AI validation agent has compiled a full PDF report including security vulnerabilities, dependency checks, and architecture compliance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => toast.success("Downloading Validation Report PDF...")}>
                      <Download className="h-4 w-4" />
                      Download PDF Report
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">Generated on: {new Date(solution.updatedAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center py-12">
                <div className="h-16 w-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
                <p className="text-lg font-medium text-foreground">Validation in progress</p>
                <p className="mt-1 text-sm text-muted-foreground">An AI agent is analyzing this solution. A full report will actuate shortly.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>


      </Tabs>
    </div>
  )
}
