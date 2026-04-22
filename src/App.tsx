/**
 * src/App.tsx
 * Sprint 1 [Muhammad] — AFA Week VI: routing configuration + protected routes
 */

import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, useAppSelector } from './store'
import { Navbar, ProtectedRoute, NotificationToast } from './components'
import { HomePage, FacilitiesPage, BookingFormPage,
         MyBookingsPage, UnauthorizedPage, NotFoundPage } from './pages'
import { LoginForm, RegisterForm } from './components'
import './i18n'
import './styles/index.css'

// Apply dark mode on load
const themeMode = localStorage.getItem('sfbs_theme')
if (themeMode === 'dark') document.documentElement.classList.add('dark')

const AppShell = () => {
  const { mode } = useAppSelector(s => s.ui.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <NotificationToast />
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/facilities/:facilityId/book" element={<BookingFormPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  )
}
