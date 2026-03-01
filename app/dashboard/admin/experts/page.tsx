"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TECH_STACK_OPTIONS } from "@/lib/constants"
import { Loader2, User, Mail, Shield, Briefcase, Zap, Info, ArrowRight, X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const DOMAIN_OPTIONS = [
  "Web Development", "Backend", "Frontend", "Cloud Architecture", "DevOps",
  "Security", "Data Engineering", "AI/ML", "Mobile", "Infrastructure",
  "Blockchain", "UX Design", "Databases",
]

export default function ExpertOnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [domains, setDomains] = useState("")
  const [techStack, setTechStack] = useState<string[]>([])
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [showTechPicker, setShowTechPicker] = useState(false)

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !yearsOfExperience) {
      toast.error("Please fill in required fields")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Expert profile provisioned successfully!")
    setLoading(false)
    navigate("/dashboard/admin/users")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Expert Onboarding</h1>
        <p className="text-muted-foreground">Provision new expert accounts with domain-specific access and review weight.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
              <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Quick Tip
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assigning the correct domain is critical for our matching algorithm. Reviewers are assigned based on their primary expertise.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-l-2 border-muted/50 pl-6 ml-2">
              <div className="group">
                <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">Identity</p>
                <p className="text-xs text-muted-foreground mt-0.5">Basic contact details</p>
              </div>
              <div className="group">
                <p className="text-sm font-semibold text-muted-foreground">Expertise</p>
                <p className="text-xs text-muted-foreground mt-0.5">Domains & technologies</p>
              </div>
              <div className="group">
                <p className="text-sm font-semibold text-muted-foreground">Experience</p>
                <p className="text-xs text-muted-foreground mt-0.5">Professional depth</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="border-border shadow-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    Identity & Access
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</Label>
                      <Input
                        placeholder="e.g., Sarah Johnson"
                        className="h-10 border-border bg-muted/20"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="s.johnson@platform.com"
                        className="h-10 border-border bg-muted/20"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Expertise */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    <Briefcase className="h-4 w-4" />
                    Expertise Configuration
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Primary Domain</Label>
                    <Select value={domains} onValueChange={setDomains}>
                      <SelectTrigger className="h-10 border-border bg-muted/20"><SelectValue placeholder="Select primary domain" /></SelectTrigger>
                      <SelectContent>
                        {DOMAIN_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Technologies</Label>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/20 border border-border min-h-[44px]">
                      {techStack.map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1 pr-1 h-7">
                          {t}
                          <button type="button" onClick={() => toggleTech(t)} className="rounded-full p-0.5 hover:bg-muted">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {techStack.length === 0 && <span className="text-xs text-muted-foreground self-center px-1">No technologies selected</span>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 ml-auto rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowTechPicker(!showTechPicker)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {showTechPicker && (
                      <div className="flex flex-wrap gap-1.5 rounded-md border border-border p-3 bg-card shadow-lg mt-1 animate-in fade-in zoom-in duration-200">
                        {TECH_STACK_OPTIONS.map((tech) => (
                          <Badge
                            key={tech}
                            variant={techStack.includes(tech) ? "default" : "outline"}
                            className="cursor-pointer hover:border-primary transition-colors h-7"
                            onClick={() => toggleTech(tech)}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Experience */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    <Zap className="h-4 w-4" />
                    Professional Maturity
                  </div>
                  <div className="flex flex-col gap-2 max-w-[200px]">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Years of Experience</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="e.g., 8"
                        className="h-10 border-border bg-muted/20 pr-12 font-medium"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        required
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase">years</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Influences review weight & tier.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
                  <Button type="button" variant="ghost" onClick={() => navigate("/dashboard/admin/users")}>
                    Cancel
                  </Button>
                  <Button type="submit" className="h-11 px-8 gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Complete Onboarding
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
