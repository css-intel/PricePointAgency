import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import BookAdvisory from './pages/BookAdvisory'
import BookExploratory from './pages/BookExploratory'
import BookConsultation from './pages/BookConsultation'
import Chat from './pages/Chat'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="book" element={<BookConsultation />} />
          <Route path="book-advisory" element={<BookAdvisory />} />
          <Route path="book-exploratory" element={<BookExploratory />} />
          <Route path="chat" element={<Chat />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
