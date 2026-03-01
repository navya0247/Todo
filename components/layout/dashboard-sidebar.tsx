"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { useUI } from "@/context/ui-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  Clock,
  Bookmark,
  FileText,
  ClipboardList,
  Users,
  UserPlus,
  FolderOpen,
  LogOut,
  Layers,
} from "lucide-react"

const userNavItems = [
  { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
  { label: "Submit Solution", href: "/dashboard/user/submit", icon: Upload },
  { label: "Pending", href: "/dashboard/user/pending", icon: Clock },
  { label: "Saved Solutions", href: "/dashboard/user/saved", icon: Bookmark },
  { label: "My Submissions", href: "/dashboard/user/submissions", icon: FileText },
]

const expertNavItems = [
  { label: "Review Queue", href: "/dashboard/expert", icon: ClipboardList },
]

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { label: "Expert Onboarding", href: "/dashboard/admin/experts", icon: UserPlus },
  { label: "Submitted Solutions", href: "/dashboard/admin/solutions", icon: FolderOpen },
]

export function DashboardSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth()
  const { isSidebarOpen } = useUI()

  const navItems =
    user?.role === "admin"
      ? adminNavItems
      : user?.role === "expert"
        ? expertNavItems
        : userNavItems

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-border bg-[oklch(0.16_0.025_261)] transition-transform duration-300",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-14 items-center gap-2 border-b border-[oklch(0.26_0.03_261)] px-4">
        <Layers className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold leading-tight text-[oklch(0.95_0.005_240)]">
            Solution Reusability
          </span>
          <span className="text-[10px] leading-tight text-[oklch(0.60_0.015_261)]">
            Validation Platform
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-[oklch(0.70_0.015_261)] hover:bg-[oklch(0.22_0.03_261)] hover:text-[oklch(0.90_0.01_240)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[oklch(0.26_0.03_261)] p-3">
        {user && (
          <div className="mb-3 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-[oklch(0.90_0.01_240)]">
                {user.fullName}
              </span>
              <span className="truncate text-[10px] text-[oklch(0.55_0.015_261)]">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
