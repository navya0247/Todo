"use client"

import { useSolutions } from "@/context/solutions-context"
import { mockUsers, mockAuditLogs } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle2, AlertTriangle, Users, RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  const { solutions } = useSolutions()

  const totalSolutions = solutions.length;
  const activeSolutionsCount = solutions.filter((s) => s.status === "approved").length;
  const flaggedSolutionsCount = solutions.filter((s) => s.status === "flagged" || s.status === "rejected").length;

  const stats = [
    { label: "Total Solutions", value: totalSolutions.toLocaleString(), icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Solutions", value: activeSolutionsCount.toLocaleString(), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Flagged Solutions", value: flaggedSolutionsCount.toLocaleString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Total Users", value: mockUsers.length.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  ]

  const recentActivity = solutions.slice(0, 5).map((s) => {
    const statusMap: Record<string, { icon: any; color: string; action: string }> = {
      approved: { icon: CheckCircle2, color: "text-emerald-500", action: "approved" },
      rejected: { icon: AlertTriangle, color: "text-destructive", action: "rejected" },
      flagged: { icon: AlertTriangle, color: "text-amber-500", action: "flagged" },
      "pending-review": { icon: FileText, color: "text-blue-500", action: "submitted" },
      "in-validation": { icon: RefreshCw, color: "text-primary animate-spin", action: "validating" },
    }
    const info = statusMap[s.status] || { icon: FileText, color: "text-muted-foreground", action: "updated" }
    return {
      icon: info.icon,
      color: info.color,
      text: `Solution '${s.title}' ${info.action}`,
      time: new Date(s.updatedAt).toLocaleDateString(),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform Overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="flex flex-col gap-0">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border py-4 last:border-b-0">
                <div className="flex items-center gap-3">
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  <span className="text-sm text-foreground">{activity.text}</span>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
