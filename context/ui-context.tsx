import { createContext, useContext, useState, ReactNode } from "react"

interface UIContextType {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    isAIOpen: boolean
    toggleAI: () => void
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isAIOpen, setIsAIOpen] = useState(false)

    return (
        <UIContext.Provider value={{
            isSidebarOpen,
            toggleSidebar: () => setIsSidebarOpen(o => !o),
            isAIOpen,
            toggleAI: () => setIsAIOpen(o => !o)
        }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const ctx = useContext(UIContext)
    if (!ctx) throw new Error("useUI must be used within UIProvider")
    return ctx
}
