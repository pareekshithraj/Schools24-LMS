import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App } from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { SuperAdminPage } from './pages/SuperAdminPage.jsx'
import { DevDashboard } from './pages/DevDashboard.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={<App />} />
          <Route path="/superadmin/*" element={<SuperAdminPage />} />
          <Route path="/dev" element={<DevDashboard />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
