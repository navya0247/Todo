"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Layers, Loader2, Shield, CheckCircle2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("user")
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const success = await login(email, password, role)
      if (success) {
        toast.success("Login successful!")
        const routes: Record<UserRole, string> = {
          user: "/dashboard/user",
          expert: "/dashboard/expert",
          admin: "/dashboard/admin",
        }
        navigate(routes[role])
      } else {
        toast.error("Invalid credentials")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left dark panel */}
      <div className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-[oklch(0.13_0.02_261)] p-10 lg:flex">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(oklch(0.18_0.025_261)_1px,transparent_1px),linear-gradient(90deg,oklch(0.18_0.025_261)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/8 blur-[100px]" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-[oklch(0.95_0.005_240)]">
                Solution Reusability
              </span>
              <span className="text-[10px] leading-tight text-[oklch(0.55_0.015_261)]">
                Validation Platform
              </span>
            </div>
          </Link>
        </div>

        <div className="relative flex flex-col gap-6">
          <h2 className="text-balance text-2xl font-bold leading-snug text-[oklch(0.95_0.005_240)]">
            Validate, reuse, and ship solutions with confidence.
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-[oklch(0.60_0.015_261)]">
                AI-powered validation pipeline for code quality, security, and compliance.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-[oklch(0.60_0.015_261)]">
                Domain experts review and approve solutions before catalog inclusion.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-[oklch(0.60_0.015_261)]">
                Smart search and discovery across your entire solution catalog.
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-[oklch(0.40_0.015_261)]">
          2026 Solution Reusability Platform. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link to="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-foreground">
                  Solution Reusability
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  Validation Platform
                </span>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User (Developer)</SelectItem>
                      <SelectItem value="expert">Expert (Reviewer)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo credentials: use any email with matching role
          </p>
        </div>
      </div>
    </div>
  )
}
