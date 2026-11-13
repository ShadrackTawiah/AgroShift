
import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'

import Landing from './pages/Landing'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import FarmAssessment from './pages/FarmAssessment'
import ClimateInsights from './pages/ClimateInsights'
import CropPlanner from './pages/CropPlanner'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/auth/ProtectedRoute'

function NotFound() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}

function AppRoutes() {
  const [farmLocation, setFarmLocation] = useState({
    latitude: 4.90,
    longitude: -1.75,
  })

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application pages */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout
              farmLocation={farmLocation}
              setFarmLocation={setFarmLocation}
            />
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farm-assessment" element={<FarmAssessment />} />
          <Route path="/climate" element={<ClimateInsights />} />
          <Route path="/crop-planner" element={<CropPlanner />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Public fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
