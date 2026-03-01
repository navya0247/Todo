"use client"

import { useState } from "react"
import { useUsers } from "@/context/users-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function UserManagementPage() {
  const [tab, setTab] = useState("users")
  const { users, toggleUserStatus } = useUsers()

  const userList = users.filter((u) => u.role === "user")
  const expertList = users.filter((u) => u.role === "expert")

  const handleDisable = async (id: string, role: string) => {
    await toggleUserStatus(id)
    toast.success(`${role === "expert" ? "Expert" : "User"} updated successfully`)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">User Management</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="experts">Experts</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "users" && (
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {u.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-4">
                      <Badge className={u.status === "Disabled" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-600"}>
                        {u.status || "Active"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded p-1 hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/admin/users/${u.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDisable(u.id, "user")} className="text-destructive">Disable</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "experts" && (
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domains</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Reviews</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expertList.map((expert) => (
                  <tr key={expert.id} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {expert.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{expert.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{(expert.domains || []).join(", ") || "Generalist"}</td>
                    <td className="px-5 py-4 text-center text-sm font-medium text-foreground">5</td>
                    <td className="px-5 py-4">
                      <Badge className={expert.status === "Disabled" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-600"}>
                        {expert.status || "Active"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded p-1 hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/admin/users/${expert.id}?type=expert`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDisable(expert.id, "expert")} className="text-destructive">Disable</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
