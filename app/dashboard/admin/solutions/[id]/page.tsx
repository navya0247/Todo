"use client"

import { use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Flag, ExternalLink, FileText, CheckCircle2, Shield, AlertTriangle, User, Mail, Calendar, Info, Clock, XCircle, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { getTechIconUrl } from "@/lib/utils"
import { useSolutions } from "@/context/solutions-context"
import { useParams } from "react-router-dom"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"

export default function AdminSolutionDetailPage() {
  const { id } = useParams() as { id: string }
  const { getSolution, updateSolutionStatus } = useSolutions()
  const solution = getSolution(id)

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium text-foreground">Solution not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/admin/solutions">Back to Solutions</Link>
        </Button>
      </div>
    )
  }

  const techLogoSrc = (solution.techStack && solution.techStack.length > 0) ? getTechIconUrl(solution.techStack[0]) : ""

  return (
    <div className="flex flex-col gap-6">
      <span className="text-sm text-muted-foreground">
        Submitted Solutions &gt; {solution.title}
      </span>

      <div className="grid grid-cols-1 gap-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
              {techLogoSrc ? (
                <img src={techLogoSrc} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">{solution.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={`${STATUS_COLORS[solution.status]} text-[10px] px-2 py-0 h-5`}>
                  {STATUS_LABELS[solution.status]}
                </Badge>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Validation: {solution.validationReport?.score || "N/A"}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              className="gap-2 h-9"
              onClick={() => {
                updateSolutionStatus(solution.id, 'flagged')
                toast.error("Solution marked as flagged for review")
              }}
            >
              <Flag className="h-4 w-4" />
              Mark as Flagged
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validation">Validation History</TabsTrigger>
            <TabsTrigger value="owner">Owner Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="leading-relaxed text-muted-foreground sm:text-sm">{solution.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {solution.techStack.map(t => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Validation Summary</h3>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-emerald-600">{solution.validationReport?.checks.filter(c => c.status === "pass").length || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Passed</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-destructive">{solution.validationReport?.checks.filter(c => c.status === "fail").length || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Failed</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1 font-medium italic">"The overall security profile is high, though minor dependency warnings were detected."</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Reviews</p>
                    <p className="text-lg font-bold leading-none mt-0.5">12</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Avg Score</p>
                    <p className="text-lg font-bold leading-none mt-0.5">94%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="mt-6">
            <div className="flex flex-col gap-4">
              {[
                { date: "Feb 20, 2026", score: 95, status: "Success", type: "Scheduled Audit" },
                { date: "Feb 15, 2026", score: 92, status: "Success", type: "Initial Submission" },
                { date: "Feb 14, 2026", score: 45, status: "Failed", type: "Automated Scan" },
              ].map((run, i) => (
                <Card key={i} className="border-border hover:bg-muted/10 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {run.status === "Success" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                      <div>
                        <p className="text-sm font-semibold">{run.type}</p>
                        <p className="text-xs text-muted-foreground">{run.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{run.score}/100</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{run.status}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="owner" className="mt-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground border border-border">
                    {solution.submittedByName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold leading-none">{solution.submittedByName}</h4>
                    <p className="text-sm text-muted-foreground mt-1">ID: {solution.submittedBy}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{solution.submittedByName.toLowerCase().replace(" ", ".")}@example.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Verified Contributor</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to={`/dashboard/admin/users/${solution.submittedBy}`}>View Full Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
