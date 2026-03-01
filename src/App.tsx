import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '@/app/page'
import LoginPage from '@/app/login/page'
import SignupPage from '@/app/signup/page'

// Dashboard Layout
import DashboardLayout from '@/app/dashboard/layout'

// User Routes
import UserDashboard from '@/app/dashboard/user/page'
import SubmitSolution from '@/app/dashboard/user/submit/page'
import PendingSolutions from '@/app/dashboard/user/pending/page'
import SavedSolutions from '@/app/dashboard/user/saved/page'
import UserSubmissions from '@/app/dashboard/user/submissions/page'
import SearchSolutions from '@/app/dashboard/user/search/page'
import SolutionDetails from '@/app/dashboard/user/solution/[id]/page'

// Expert Routes
import ExpertDashboard from '@/app/dashboard/expert/page'
import ExpertReview from '@/app/dashboard/expert/review/[id]/page'

// Admin Routes
import AdminDashboard from '@/app/dashboard/admin/page'
import AdminUsers from '@/app/dashboard/admin/users/page'
import AdminUserDetails from '@/app/dashboard/admin/users/[id]/page'
import AdminExperts from '@/app/dashboard/admin/experts/page'
import AdminSolutions from '@/app/dashboard/admin/solutions/page'
import AdminSolutionDetails from '@/app/dashboard/admin/solutions/[id]/page'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Dashboard Routes with Layout */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    {/* User Routes */}
                    <Route path="user" element={<UserDashboard />} />
                    <Route path="user/submit" element={<SubmitSolution />} />
                    <Route path="user/pending" element={<PendingSolutions />} />
                    <Route path="user/saved" element={<SavedSolutions />} />
                    <Route path="user/submissions" element={<UserSubmissions />} />
                    <Route path="user/search" element={<SearchSolutions />} />
                    <Route path="user/solutions/:solutionId" element={<SolutionDetails />} />

                    {/* Expert Routes */}
                    <Route path="expert" element={<ExpertDashboard />} />
                    <Route path="expert/review/:id" element={<ExpertReview />} />

                    {/* Admin Routes */}
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="admin/users" element={<AdminUsers />} />
                    <Route path="admin/users/:id" element={<AdminUserDetails />} />
                    <Route path="admin/experts" element={<AdminExperts />} />
                    <Route path="admin/solutions" element={<AdminSolutions />} />
                    <Route path="admin/solutions/:id" element={<AdminSolutionDetails />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
