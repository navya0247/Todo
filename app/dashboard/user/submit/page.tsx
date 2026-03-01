"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useSolutions, type SubmitSolutionData } from "@/context/solutions-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TECH_STACK_OPTIONS } from "@/lib/constants"
import { Github, Upload, Code2, FileUp, CheckCircle2, Loader2, CloudUpload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

type SourceType = "github" | "zip" | "snippet" | "file"

const sourceTypes = [
  { id: "github" as const, label: "GitHub URL", description: "Import from a GitHub repository", icon: Github },
  { id: "zip" as const, label: "ZIP Upload", description: "Upload a compressed archive", icon: Upload },
  { id: "snippet" as const, label: "Code Snippet", description: "Paste code directly", icon: Code2 },
  { id: "file" as const, label: "Single File", description: "Upload a single file", icon: FileUp },
]

const DOMAIN_OPTIONS = [
  "Web Development", "Backend", "Frontend", "Cloud Architecture", "DevOps",
  "Security", "Data Engineering", "AI/ML", "Mobile", "Infrastructure"
]

const LICENSE_OPTIONS = [
  "MIT", "Apache 2.0", "GPL 3.0", "BSD 3-Clause", "ISC", "Proprietary"
]

export default function SubmitSolutionPage() {
  const { user } = useAuth()
  const { submitSolution } = useSolutions()
  const navigate = useNavigate();

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [sourceType, setSourceType] = useState<SourceType>("github")
  const [sourceUrl, setSourceUrl] = useState("")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Step 2: Metadata
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [domain, setDomain] = useState("")
  const [license, setLicense] = useState("")
  const [techStack, setTechStack] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [intendedUse, setIntendedUse] = useState("")

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const data: SubmitSolutionData = {
        title,
        description,
        techStack,
        tags,
        sourceType: sourceType === "file" ? "zip" : sourceType,
        sourceUrl: sourceType === "github" ? sourceUrl : undefined,
        codeSnippet: sourceType === "snippet" ? codeSnippet : undefined,
        submittedBy: user?.id ?? "",
        submittedByName: user?.fullName ?? "",
      }
      await submitSolution(data)
      toast.success("Solution submitted for validation!")
      navigate("/dashboard/user/pending")
    } catch {
      toast.error("Failed to submit solution")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, label: "Source" },
    { number: 2, label: "Metadata" },
    { number: 3, label: "Review" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit New Solution</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your solution with the platform for validation and reuse
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  step > s.number
                    ? "bg-emerald-500 text-primary-foreground"
                    : step === s.number
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-border bg-background text-muted-foreground"
                )}
              >
                {step > s.number ? <CheckCircle2 className="h-5 w-5" /> : s.number}
              </div>
              <span className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-4 mb-5 h-0.5 w-20", step > s.number ? "bg-emerald-500" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Source */}
      {step === 1 && (
        <Card className="border-border">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Select Source Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {sourceTypes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSourceType(st.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    sourceType === st.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    sourceType === st.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <st.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{st.label}</p>
                    <p className="text-xs text-muted-foreground">{st.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {sourceType === "github" && (
              <div className="mt-6 flex flex-col gap-2">
                <Label>GitHub Repository URL</Label>
                <Input
                  placeholder="https://github.com/username/repository"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the repository is public or you have access permissions
                </p>
              </div>
            )}

            {(sourceType === "zip" || sourceType === "file") && (
              <div className="mt-6 flex flex-col gap-2">
                <Label onClick={() => document.getElementById("file-upload")?.click()} className="cursor-pointer">
                  {sourceType === "zip" ? "Upload ZIP Archive" : "Upload File"}
                </Label>
                <div
                  className={cn(
                    "relative mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-10 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                    uploadedFile && "border-primary/50 bg-primary/5"
                  )}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Input
                    id="file-upload"
                    type="file"
                    accept={sourceType === "zip" ? ".zip" : "*/*"}
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {!uploadedFile ? (
                    <>
                      <CloudUpload className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="mb-1 text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sourceType === "zip" ? "ZIP archive up to 50MB" : "Any file up to 10MB"}
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" />
                      <p className="mb-1 text-sm font-medium text-foreground">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {sourceType === "snippet" && (
              <div className="mt-6 flex flex-col gap-2">
                <Label>Code Snippet</Label>
                <Textarea
                  placeholder="Paste your code here..."
                  rows={8}
                  className="font-mono text-sm"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={
                  (sourceType === "github" && !sourceUrl) ||
                  (sourceType === "snippet" && !codeSnippet) ||
                  ((sourceType === "zip" || sourceType === "file") && !uploadedFile)
                }
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Metadata */}
      {step === 2 && (
        <Card className="border-border">
          <CardContent className="flex flex-col gap-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Solution Metadata</h2>

            <div className="flex flex-col gap-2">
              <Label>Solution Title *</Label>
              <Input
                placeholder="e.g., User Authentication Service"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Provide a clear description of what this solution does and its key features.."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Domain *</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger><SelectValue placeholder="Select domain..." /></SelectTrigger>
                  <SelectContent>
                    {DOMAIN_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>License *</Label>
                <Select value={license} onValueChange={setLicense}>
                  <SelectTrigger><SelectValue placeholder="Select license..." /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_OPTIONS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tech Stack *</Label>
              <div className="flex flex-wrap gap-1.5">
                {TECH_STACK_OPTIONS.slice(0, 10).map((tech) => (
                  <Badge
                    key={tech}
                    variant={techStack.includes(tech) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (e.g., authentication, security)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm">Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-1 text-xs">x</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Intended Use</Label>
              <Textarea
                placeholder="Describe the ideal use case and scenarios for this solution"
                rows={3}
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Owner</Label>
              <Input value={user?.fullName ?? ""} readOnly className="bg-muted" />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!title || !description}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card className="border-border">
          <CardContent className="flex flex-col gap-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>

            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
                {sourceType === "github" ? <Github className="h-4 w-4" /> :
                  sourceType === "zip" ? <Upload className="h-4 w-4" /> :
                    sourceType === "snippet" ? <Code2 className="h-4 w-4" /> :
                      <FileUp className="h-4 w-4" />}
                Source
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Type:</span> {sourceType === "github" ? "Github" : sourceType}
              </p>
              {sourceUrl && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">URL:</span> {sourceUrl}
                </p>
              )}
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">File:</span> {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 font-medium text-foreground">Metadata</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div><span className="font-medium text-foreground">Title</span><br /><span className="text-muted-foreground">{title}</span></div>
                <div><span className="font-medium text-foreground">Description</span><br /><span className="text-muted-foreground">{description}</span></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium text-foreground">Domain</span><br /><span className="text-muted-foreground">{domain || "Not set"}</span></div>
                  <div><span className="font-medium text-foreground">License</span><br /><span className="text-muted-foreground">{license || "Not set"}</span></div>
                </div>
                {techStack.length > 0 && (
                  <div>
                    <span className="font-medium text-foreground">Tech Stack</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {techStack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                    </div>
                  </div>
                )}
                {tags.length > 0 && (
                  <div>
                    <span className="font-medium text-foreground">Tags</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}
                    </div>
                  </div>
                )}
                {intendedUse && (
                  <div><span className="font-medium text-foreground">Intended Use</span><br /><span className="text-muted-foreground">{intendedUse}</span></div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-chart-4/30 bg-chart-4/5 p-4">
              <p className="mb-2 text-sm font-medium text-chart-4">What happens next?</p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                <li>Your solution will be assigned to an expert for validation</li>
                <li>Automated checks will run to verify security, structure, and dependencies</li>
                <li>{"You'll receive notifications about the validation progress"}</li>
                <li>Average review time is 2-3 business days</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
