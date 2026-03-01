"use client"

import { useUI } from "@/context/ui-context"
import { cn } from "@/lib/utils"
import { X, Send, Image as ImageIcon, File, Paperclip, Bot, User } from "lucide-react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

export function AIAssistantSidebar() {
    const { isAIOpen, toggleAI } = useUI()
    const [messages, setMessages] = useState<{ role: "agent" | "user", content: string, attachment?: string }[]>([
        { role: "agent", content: "Hi there! I'm your AI validation assistant. How can I help you today?" }
    ])
    const [input, setInput] = useState("")
    const [preview, setPreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isAIOpen])

    if (!isAIOpen) return null;

    const handleSend = () => {
        if (!input.trim() && !preview) return;

        setMessages(prev => [...prev, { role: "user", content: input, attachment: preview || undefined }])
        setInput("")
        setPreview(null)

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "agent", content: "I've analyzed that for you. Everything looks structurally sound, but make sure to check your environment variables." }])
        }, 1000)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file)
                setPreview(url)
            } else {
                setPreview(file.name)
            }
        }
    }

    return (
        <aside className={cn(
            "fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-border bg-background shadow-xl transition-transform duration-300",
            isAIOpen ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Assistant
                </h3>
                <button onClick={toggleAI} className="rounded p-1.5 text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col gap-1 text-sm max-w-[85%]", m.role === "user" ? "self-end items-end" : "self-start")}>
                        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground mb-1", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20", m.role === "user" ? "bg-primary text-primary-foreground" : "text-primary")}>
                                {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                            </div>
                            {m.role === "user" ? "You" : "Validation Agent"}
                        </div>

                        <div className={cn("rounded-lg p-3", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                            {m.attachment && (
                                m.attachment.startsWith("blob:")
                                    ? <img src={m.attachment} alt="attachment" className="max-w-[150px] rounded mb-2 border border-border" />
                                    : <div className="flex items-center gap-2 mb-2 p-2 rounded bg-background/20"><File className="h-4 w-4" /> {m.attachment}</div>
                            )}
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="shrink-0 p-4 border-t border-border bg-background">
                {preview && (
                    <div className="mb-3 relative inline-block p-2 rounded-lg border border-border bg-muted/30">
                        {preview.startsWith("blob:") ? (
                            <img src={preview} alt="preview" className="h-16 w-16 object-cover rounded shadow-sm border border-border" />
                        ) : (
                            <div className="flex items-center gap-2 h-16 px-3 bg-background rounded border border-border shadow-sm">
                                <File className="h-4 w-4 text-primary" />
                                <span className="text-xs truncate max-w-[100px] font-medium">{preview}</span>
                            </div>
                        )}
                        <button onClick={() => setPreview(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                <div className="relative flex flex-col rounded-xl border border-input bg-muted/40 p-2 shadow-sm transition-all focus-within:border-border focus-within:ring-0">
                    <Input type="file" ref={fileRef} className="hidden" onChange={handleFileChange} />

                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message AI Validation Agent..."
                        className="min-h-[60px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-sm pb-10"
                        rows={Math.max(1, Math.min(4, input.split('\n').length))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>

                        <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform"
                            onClick={handleSend}
                            disabled={!input.trim() && !preview}
                        >
                            <Send className="h-4 w-4 ml-0.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
            {...props}
        />
    )
}
