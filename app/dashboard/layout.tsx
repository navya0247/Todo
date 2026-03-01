"use client"

import { useAuth } from "@/context/auth-context"
import { useNavigate, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SolutionsProvider } from "@/context/solutions-context"
import { UsersProvider } from "@/context/users-context"
import { UIProvider, useUI } from "@/context/ui-context"
import { AIAssistantSidebar } from "@/components/layout/ai-assistant-sidebar.tsx"
import { cn } from "@/lib/utils"

function DashboardContent() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate();
  const { isSidebarOpen, isAIOpen } = useUI()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      <DashboardSidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 relative h-screen overflow-y-auto",
        isSidebarOpen ? "ml-52" : "ml-0",
        isAIOpen ? "mr-80" : "mr-0"
      )}>
        <DashboardHeader />
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
      <AIAssistantSidebar />
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <UIProvider>
      <UsersProvider>
        <DashboardContent />
      </UsersProvider>
    </UIProvider>
  )
}
