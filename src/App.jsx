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

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/apply" element={<LoanInitiationPage />} />
                    <Route path="/verification/:loanId" element={<AIVerificationPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/impact" element={<ImpactPage />} />
                    <Route path="/audit" element={<AuditLogPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
