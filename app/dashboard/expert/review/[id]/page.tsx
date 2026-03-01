"use client"

import { use, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useSolutions } from "@/context/solutions-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import { ArrowLeft, Download, Github, CheckCircle2, XCircle, AlertTriangle, Loader2, Shield, FileText, Play } from "lucide-react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getTechIconUrl } from "@/lib/utils"

import { useParams } from "react-router-dom"

export default function ExpertReviewPage() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const { getSolution, reviewSolution } = useSolutions()
  const navigate = useNavigate();
  const solution = getSolution(id)

  const [activeTab, setActiveTab] = useState("overview")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium text-foreground">Solution not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/expert">Back to Review Queue</Link>
        </Button>
      </div>
    )
  }

  const handleReview = async (decision: "approved" | "rejected") => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback before submitting your review")
      return
    }
    setLoading(true)
    try {
      reviewSolution(solution.id, {
        solutionId: solution.id,
        expertId: user?.id ?? "",
        expertName: user?.fullName ?? "",
        decision,
        feedback,
      })
      toast.success(`Solution ${decision === "approved" ? "approved" : "rejected"} successfully`)
      navigate("/dashboard/expert")
    } finally {
      setLoading(false)
    }
  }

  const techLogoSrc = (solution.techStack && solution.techStack.length > 0) ? getTechIconUrl(solution.techStack[0]) : ""

  return (
    <div className="flex flex-col gap-6">
      <Link to="/dashboard/expert" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Review Queue
      </Link>

      <Card className="border-border">
        <CardContent className="p-6">
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
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{solution.title}</h1>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">v2.3.1</span>
                    <Badge className={STATUS_COLORS[solution.status]}>
                      {STATUS_LABELS[solution.status]}
                    </Badge>
                    {solution.validationReport && (
                      <span className="text-sm font-medium text-primary">
                        Validation: {solution.validationReport.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {solution.submittedByName.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="text-sm text-muted-foreground">Submitted by {solution.submittedByName}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {solution.techStack.map((t) => <Badge key={t} variant="outline" className="border-primary/20 bg-primary/5 text-primary">{t}</Badge>)}
                {solution.tags.map((t) => <Badge key={t} variant="outline" className="bg-muted/50">{t}</Badge>)}
              </div>
            </div>
            {solution.sourceUrl && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={solution.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Description</h3>
              <p className="leading-relaxed text-muted-foreground">{solution.description}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Intended Use</h3>
              <p className="leading-relaxed text-muted-foreground">
                This module is intended for React applications that require secure user authentication.
                {"It's particularly useful for SaaS platforms, enterprise applications, and any system requiring multiple authentication methods."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Dependencies</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {solution.techStack.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t.toLowerCase()} ^latest
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {solution.codeSnippet && (
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Quick Start</h3>
                <pre className="rounded-lg bg-[oklch(0.16_0.025_261)] p-4 text-sm text-[oklch(0.85_0.01_240)]">
                  <code>{solution.codeSnippet}</code>
                </pre>
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

        <TabsContent value="review" className="mt-6 flex flex-col gap-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Submit Your Review</h3>
              <Textarea
                placeholder="Provide detailed feedback about this solution..."
                rows={6}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => handleReview("approved")}
                  disabled={loading}
                  className="gap-2 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview("rejected")}
                  disabled={loading}
                  variant="destructive"
                  className="gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
