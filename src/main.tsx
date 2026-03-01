import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/app/globals.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/auth-context'
import { SolutionsProvider } from '@/context/solutions-context'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <SolutionsProvider>
                <div className="font-sans antialiased">
                    <App />
                    <Toaster richColors position="top-right" />
                </div>
            </SolutionsProvider>
        </AuthProvider>
    </React.StrictMode>,
)
