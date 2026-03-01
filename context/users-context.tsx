"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react"
import type { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface UsersContextType {
    users: User[]
    getUser: (id: string) => User | undefined
    updateUser: (id: string, data: Partial<User>) => Promise<boolean>
    toggleUserStatus: (id: string) => Promise<boolean>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(mockUsers)

    const getUser = useCallback(
        (id: string) => users.find((u) => u.id === id),
        [users]
    )

    const updateUser = useCallback(async (id: string, data: Partial<User>): Promise<boolean> => {
        // BACKEND_READY: fetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
        await new Promise((r) => setTimeout(r, 600))
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...data } : u))
        )
        return true
    }, [])

    const toggleUserStatus = useCallback(async (id: string): Promise<boolean> => {
        // BACKEND_READY: fetch(`/api/users/${id}/status`, { method: 'POST' })
        await new Promise((r) => setTimeout(r, 500))
        setUsers((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    // Simulation: Toggle between Active and Disabled by using a 'status' field (added dynamically for UI)
                    return { ...u, status: u.status === 'Disabled' ? 'Active' : 'Disabled' } as any
                }
                return u
            })
        )
        return true
    }, [])

    return (
        <UsersContext.Provider value={{ users, getUser, updateUser, toggleUserStatus }}>
            {children}
        </UsersContext.Provider>
    )
}

export function useUsers() {
    const context = useContext(UsersContext)
    if (!context) {
        throw new Error("useUsers must be used within a UsersProvider")
    }
    return context
}
