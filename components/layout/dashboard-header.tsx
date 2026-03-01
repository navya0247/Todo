"use client"

import { useAuth } from "@/context/auth-context"
import { useUI } from "@/context/ui-context"
import { useSolutions } from "@/context/solutions-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Sparkles, ChevronDown, Menu, LogOut, User as UserIcon, Check, Settings, Code, FileText, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, Shield, Play, Github } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardHeader() {
  const { user, logout, notifications, markNotificationRead } = useAuth()
  const { toggleSidebar, toggleAI } = useUI()
  const { searchTerm, setSearchTerm } = useSolutions()
  const navigate = useNavigate();
  const location = useLocation();

  const isRootDashboard = ["/dashboard/admin", "/dashboard/expert"].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith("/dashboard/admin")
  const isExpertPage = location.pathname.startsWith("/dashboard/expert")
  const [searchQuery, setSearchQuery] = useState(searchTerm)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    setSearchQuery(searchTerm)
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchQuery)
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-sm mt-4 mx-4 rounded-xl border-x shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>

        {!isRootDashboard && !isAdminPage && !isExpertPage && location.pathname !== "/dashboard/user/submit" ? (
          <form onSubmit={handleSearch} className="flex max-w-2xl flex-1 items-center ml-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search solutions, documentation, or error codes..."
                className="h-10 w-full border-border bg-muted/30 pl-9 pr-14 text-sm focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type={searchQuery ? "submit" : "button"}
                onClick={() => {
                  if (!searchQuery) searchInputRef.current?.focus()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded border border-border bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {searchQuery ? "↵ Enter" : "⌘K"}
              </button>

              {/* Keyword Search Popover */}
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-background shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50 p-2">
                <div className="flex items-center justify-between px-2 mb-2 pb-2 border-b border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Suggested Keywords</p>
                  <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/50">
                    <span className="font-semibold text-primary">Key</span> Search
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 p-1">
                  {["Authentication", "React", "Docker", "Database", "AWS", "Stripe API", "Data Table"].map(kw => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSearchQuery(kw);
                        setSearchTerm(kw);
                        searchInputRef.current?.focus();
                      }}
                      className="text-xs bg-muted/50 hover:bg-muted text-foreground px-2.5 py-1.5 rounded-md transition-colors border border-transparent hover:border-border cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="h-3 w-3 text-muted-foreground" />
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      <div className="flex items-center gap-3">
        {user?.role === "user" && (
          <Button size="sm" onClick={toggleAI} className="gap-2 bg-[#6E56CF] text-white hover:bg-[#6E56CF]/90">
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors focus:outline-none">
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-blue-600" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors relative border-t first:border-t-0 border-border/50 ${notif.read ? 'opacity-60' : ''}`}
                    >
                      {!notif.read && <span className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-blue-600" />}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                        notif.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-blue-500/10 text-blue-600'
                        }`}>
                        {notif.type === 'success' ? <Check className="h-4 w-4" /> :
                          notif.type === 'warning' ? <FileText className="h-4 w-4" /> :
                            <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium leading-none">{notif.title}</span>
                        <span className="text-xs text-muted-foreground">{notif.message}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{notif.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-2 bg-muted/10">
              <Button variant="ghost" className="w-full h-8 text-xs font-medium justify-center text-muted-foreground">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E56CF] text-xs font-bold text-white">
                {user?.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) ?? "JD"}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
