"use client"

import { use } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Calendar, User, Shield, Phone, MapPin, Briefcase, Info, TrendingUp, CheckCircle2, Clock, AlertTriangle, FileText, Code } from "lucide-react"
import { Link } from "react-router-dom"
import { Suspense, useState } from "react"
import { useSolutions } from "@/context/solutions-context"
import { useUsers } from "@/context/users-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

function UserProfileContent({ id }: { id: string }) {
  const { solutions } = useSolutions()
  const { getUser, updateUser, toggleUserStatus } = useUsers()
  const [searchParams] = useSearchParams()
  const isExpert = searchParams.get("type") === "expert"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    phone: "",
    location: "",
    organization: ""
  })

  const userData = getUser(id)
  const isDisabled = userData?.status === "Disabled"

  const userSubmissions = solutions.filter(s => s.submittedByName === userData?.fullName)
  const assignedReviews = solutions.filter(s => s.status === "pending-review").slice(0, 3)

  if (!userData) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {isExpert && (
          <span className="text-sm text-muted-foreground">
            User Management &gt; Experts &gt; {userData.fullName}
          </span>
        )}
      </div>



      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-6">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {isExpert ? (
                <Shield className="h-10 w-10 text-primary" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground text-center">{userData?.fullName}</h2>
            <Badge className={`mt-2 ${isDisabled ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-600"}`}>
              {isDisabled ? "Disabled" : "Active"}
            </Badge>

            <div className="mt-6 flex w-full flex-col gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined Date</p>
                  <p className="text-sm text-foreground">{new Date(userData?.createdAt || "").toLocaleDateString()}</p>
                </div>
              </div>
              {isExpert && (
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-sm text-foreground">12 / 15 reviews</p>
                  </div>
                </div>
              )}
              {!isExpert && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm text-foreground">{userData?.role === 'user' ? 'Developer' : 'Expert'}</p>
                  </div>
                </div>
              )}
            </div>

            {isExpert && "domains" in userData && (
              <div className="mt-6 w-full">
                <p className="mb-2 text-sm font-medium text-foreground">Domains</p>
                <div className="flex flex-wrap gap-1.5">
                  {userData.domains?.map((d: string) => (
                    <Badge key={d} variant="outline" className="border-primary/30 text-primary">{d}</Badge>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tech Stacks</Label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(userData.techStack || []).length > 0 ? (
                      userData.techStack?.map((t: string) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No tech stacks specified</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex w-full flex-col gap-2">
              <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                if (open && userData) {
                  setEditForm({
                    phone: userData.phone || "",
                    location: userData.location || "",
                    organization: userData.organization || ""
                  })
                }
                setIsEditModalOpen(open)
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update profile details for {userData.fullName}. Name cannot be changed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name (Read-only)</Label>
                      <Input id="name" value={userData.fullName} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={editForm.organization}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      await updateUser(userData.id, editForm)
                      toast.success("Profile updated successfully")
                      setIsEditModalOpen(false)
                    }}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant={isDisabled ? "default" : "outline"}
                className={`w-full ${!isDisabled ? "text-destructive hover:bg-destructive/10" : ""}`}
                onClick={async () => {
                  await toggleUserStatus(userData.id)
                }}
              >
                {isDisabled ? (isExpert ? "Enable Expert" : "Enable User") : (isExpert ? "Disable Expert" : "Disable User")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isExpert ? (
                <TabsTrigger value="assigned">Assigned Reviews</TabsTrigger>
              ) : (
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{userData?.phone || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">{userData?.location || "Remote"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Organization</p>
                          <p className="text-sm font-medium">{userData?.organization || "Independent"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Tech Stacks</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {userData?.techStack && userData.techStack.length > 0 ? (
                              userData.techStack.map(tech => (
                                <Badge key={tech} variant="secondary" className="px-1.5 py-0 text-[10px]">{tech}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-foreground">No tech stacks listed</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Account Standing</p>
                          <p className="text-sm font-medium text-emerald-600">Excellent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Performance Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-3xl font-bold text-foreground">{isExpert ? "42" : userSubmissions.length}</p>
                        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-tight">{isExpert ? "Reviews" : "Submissions"}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-3xl font-bold text-foreground">{isExpert ? "38" : userSubmissions.filter(s => s.status === 'approved').length}</p>
                        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-tight">Approved</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-3xl font-bold text-foreground">{isExpert ? "94%" : "N/A"}</p>
                        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-tight">{isExpert ? "Quality Score" : "Activity"}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {isExpert && (
                <Card className="border-border bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Onboarding Progress</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Identity Verified
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Domain Exam Passed
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Security Training (Optional)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="assigned" className="mt-6">
              <div className="flex flex-col gap-4">
                {assignedReviews.map((sol) => (
                  <Card key={sol.id} className="border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-foreground">{sol.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">v2.1.0</Badge>
                          <span className="text-xs text-muted-foreground">Assigned: {new Date(sol.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/admin/solutions/${sol.id}`}>View Solution</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {assignedReviews.length === 0 && (
                  <Card className="border-border border-dashed">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      No active reviews currently assigned to this expert.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <div className="flex flex-col gap-4">
                {userSubmissions.map((sol) => (
                  <Card key={sol.id} className="border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-semibold text-foreground">{sol.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn(
                              "text-[10px] h-4 border-none capitalize shadow-none",
                              STATUS_COLORS[sol.status]
                            )}>
                              {STATUS_LABELS[sol.status]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Score: {sol.validationReport?.score || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/admin/solutions/${sol.id}`}>View Stats</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {userSubmissions.length === 0 && (
                  <Card className="border-border border-dashed">
                    <CardContent className="p-12 text-center text-muted-foreground text-sm uppercase font-medium tracking-tight">
                      No solutions have been submitted by this user yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

import { useParams } from "react-router-dom"

export default function UserProfilePage() {
  const { id } = useParams() as { id: string }
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <UserProfileContent id={id} />
    </Suspense>
  )
}
