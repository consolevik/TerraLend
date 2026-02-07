import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import LoanInitiationPage from './pages/LoanInitiationPage'
import AIVerificationPage from './pages/AIVerificationPage'
import DashboardPage from './pages/DashboardPage'
import ImpactPage from './pages/ImpactPage'
import AuditLogPage from './pages/AuditLogPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

import RequireAuth from './components/RequireAuth'

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/apply"
                        element={
                            <RequireAuth>
                                <LoanInitiationPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/verification/:loanId"
                        element={
                            <RequireAuth>
                                <AIVerificationPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <DashboardPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/impact"
                        element={
                            <RequireAuth>
                                <ImpactPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/audit"
                        element={
                            <RequireAuth>
                                <AuditLogPage />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
