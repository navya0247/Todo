"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { User, UserRole } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  notifications: Notification[]
  markNotificationRead: (id: string) => void
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "success" | "info" | "warning" | "error"
  read: boolean
}

export interface SignupData {
  fullName: string
  email: string
  password: string
  role: UserRole
  organization?: string
  techStack?: string[]
  phone?: string
  location?: string
  bio?: string
  domains?: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Welcome!", message: "Welcome to SolveBase! Start exploring solutions.", time: "Just now", type: "info", read: false },
    { id: "2", title: "Profile Incomplete", message: "Please complete your profile to get full access.", time: "10 mins ago", type: "warning", read: false },
  ])

  const login = useCallback(
    async (email: string, _password: string, role: UserRole): Promise<boolean> => {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 800))

      const user = mockUsers.find(
        (u) => u.email === email && u.role === role
      )

      if (user) {
        setAuthState({ user, isAuthenticated: true })
        return true
      }

      // For demo: allow any email with matching role
      const fallbackUser = mockUsers.find((u) => u.role === role)
      if (fallbackUser) {
        setAuthState({
          user: { ...fallbackUser, email },
          isAuthenticated: true,
        })
        return true
      }

      return false
    },
    []
  )

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    // BACKEND_READY: Replace with fetch('/api/auth/signup')
    await new Promise((r) => setTimeout(r, 800))

    const newUser: User = {
      id: `u${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      organization: data.organization || "",
      techStack: data.techStack || [],
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      createdAt: new Date().toISOString(),
    }

    setAuthState({ user: newUser, isAuthenticated: true })
    return true
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    // BACKEND_READY: Replace with fetch('/api/user/profile', { method: 'PATCH' })
    await new Promise((r) => setTimeout(r, 600))

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null
    }))
    return true
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    // BACKEND_READY: Replace with fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const logout = useCallback(() => {
    // BACKEND_READY: Clear tokens/session
    setAuthState({ user: null, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...authState, login, signup, logout, updateProfile, notifications, markNotificationRead }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
