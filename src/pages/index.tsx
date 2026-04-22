/**
 * src/pages/index.tsx
 * All application pages
 * Sprint 1 [Salma]    — AFA Week VI:   Basic views with mock data + routing
 * Sprint 2 [Muhammad] — AFA Week VIII: Wired to Redux state
 * Sprint 3 [Muhammad] — AFA Week X:    Live API calls
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector, fetchFacilities, setFilter,
         fetchMyBookings, createBookingThunk, addNotification } from '../store'
import { facilityService } from '../services/api'
import type { Facility } from '../types'
import { Spinner, FacilityCard, BookingCard, Button, Input, Badge } from '../components'

// ── Home Page ─────────────────────────────────────────────────────────────── //
export const HomePage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector(s => s.facilities)

  useEffect(() => { dispatch(fetchFacilities(true)) }, [])

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sfbs-dark to-primary-800 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">{t('home.hero_title')}</h1>
        <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">{t('home.hero_subtitle')}</p>
        <Link to="/facilities">
          <Button className="text-lg px-8 py-3">{t('home.cta')}</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '⚡', title: 'Easy Booking', desc: 'Book in minutes, no paperwork' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Stripe-powered transactions' },
            { icon: '📅', title: 'Real-time Availability', desc: 'Always up-to-date schedules' },
          ].map(f => (
            <div key={f.title} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <span className="text-4xl block mb-3">{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Facilities Preview */}
      {items.length > 0 && (
        <section className="py-8 px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.slice(0, 3).map(f => <FacilityCard key={f.id} facility={f} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/facilities"><Button variant="secondary">{t('home.cta')}</Button></Link>
          </div>
        </section>
      )}
    </div>
  )
}

// ── Facilities Page ───────────────────────────────────────────────────────── //
export const FacilitiesPage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items, isLoading, error, filter } = useAppSelector(s => s.facilities)

  useEffect(() => { dispatch(fetchFacilities(filter.available_only)) }, [filter.available_only])

  const filtered = items.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                        f.facility_type.includes(filter.search.toLowerCase())
    const matchEnv    = !filter.environment || f.environment === filter.environment
    const matchType   = !filter.type        || f.facility_type === filter.type
    return matchSearch && matchEnv && matchType
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('facilities.title')}</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            placeholder={t('facilities.search')}
            value={filter.search}
            onChange={e => dispatch(setFilter({ search: e.target.value }))}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:border-primary-500"
          />
          <select
            value={filter.environment ?? ''}
            onChange={e => dispatch(setFilter({ environment: e.target.value as any || undefined }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            <option value="">{t('facilities.filter_all')}</option>
            <option value="indoor">{t('facilities.filter_indoor')}</option>
            <option value="outdoor">{t('facilities.filter_outdoor')}</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={filter.available_only}
              onChange={e => dispatch(setFilter({ available_only: e.target.checked }))} />
            {t('facilities.filter_available')}
          </label>
        </div>

        {/* Results */}
        {isLoading && <Spinner />}
        {error     && <div className="text-center text-red-500 py-8">{error}</div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            <span className="text-5xl block mb-4">🏟️</span>
            <p>{t('facilities.no_results')}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(f => <FacilityCard key={f.id} facility={f} />)}
        </div>
      </div>
    </div>
  )
}

// ── Booking Form Page ─────────────────────────────────────────────────────── //
export const BookingFormPage = () => {
  const { t }           = useTranslation()
  const { facilityId }  = useParams<{ facilityId: string }>()
  const dispatch        = useAppDispatch()
  const navigate        = useNavigate()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading]   = useState(true)
  const [totalCost, setTotalCost] = useState(0)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{
    start_time: string; end_time: string; notes: string
  }>()

  useEffect(() => {
    if (!facilityId) return
    facilityService.getById(facilityId)
      .then(setFacility)
      .catch(() => navigate('/facilities'))
      .finally(() => setLoading(false))
  }, [facilityId])

  const startTime = watch('start_time')
  const endTime   = watch('end_time')

  useEffect(() => {
    if (facility && startTime && endTime) {
      const hours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000
      if (hours > 0) setTotalCost(Math.round(facility.hourly_rate * hours * 100) / 100)
    }
  }, [startTime, endTime, facility])

  const onSubmit = async (data: any) => {
    if (!facilityId) return
    const result = await dispatch(createBookingThunk({
      facility_id: facilityId,
      start_time:  new Date(data.start_time).toISOString(),
      end_time:    new Date(data.end_time).toISOString(),
      notes:       data.notes,
    }))
    if (createBookingThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: t('booking.success') }))
      navigate('/bookings')
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload as string || 'Booking failed' }))
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← {t('common.back')}</Button>

        {facility && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{facility.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize mt-1">
              {facility.facility_type.replace(/_/g,' ')} • {facility.environment}
            </p>
            <p className="text-primary-600 font-semibold mt-2">${facility.hourly_rate}/hr</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('booking.title')}</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('booking.start_time')} type="datetime-local"
              {...register('start_time', { required: 'Start time required' })}
              error={errors.start_time?.message}
            />
            <Input
              label={t('booking.end_time')} type="datetime-local"
              {...register('end_time', { required: 'End time required' })}
              error={errors.end_time?.message}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('booking.notes')}</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:border-primary-500"
              />
            </div>
            {totalCost > 0 && (
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('booking.total')}</span>
                <span className="text-2xl font-bold text-primary-600">${totalCost}</span>
              </div>
            )}
            <Button className="w-full justify-center" isLoading={isSubmitting}>{t('booking.confirm')}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── My Bookings Page ──────────────────────────────────────────────────────── //
export const MyBookingsPage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items, isLoading, error } = useAppSelector(s => s.bookings)

  useEffect(() => { dispatch(fetchMyBookings()) }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('booking.my_bookings')}</h1>
          <Link to="/facilities"><Button>{t('home.cta')}</Button></Link>
        </div>
        {isLoading && <Spinner />}
        {error     && <div className="text-center text-red-500 py-8">{error}</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            <span className="text-5xl block mb-4">📅</span>
            <p>{t('booking.no_bookings')}</p>
            <Link to="/facilities" className="mt-4 inline-block">
              <Button className="mt-4">{t('home.cta')}</Button>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      </div>
    </div>
  )
}

// ── Unauthorized Page ─────────────────────────────────────────────────────── //
export const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <span className="text-6xl block mb-4">🔒</span>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have permission to view this page.</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  </div>
)

// ── Not Found Page ────────────────────────────────────────────────────────── //
export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <span className="text-8xl font-bold text-primary-600 block">404</span>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
      <Link to="/"><Button className="mt-4">Go Home</Button></Link>
    </div>
  </div>
)
