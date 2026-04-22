/**
 * src/tests/components.test.tsx
 * Sprint 3 [Salma] — AFA Week XII: Component tests (Vitest + Testing Library)
 * Minimum 30% coverage of key interfaces
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

// ── Mock i18n ─────────────────────────────────────────────────────────────── //
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

// ── Mock react-router-dom navigate ────────────────────────────────────────── //
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Minimal store factory ─────────────────────────────────────────────────── //
import { store as realStore } from '../store'

function makeStore(preloadedState?: any) {
  return configureStore({
    reducer: (realStore as any).reducer ?? {
      auth:       (s = { user: null, token: null, isAuthenticated: false, isLoading: false, error: null }) => s,
      facilities: (s = { items: [], selected: null, isLoading: false, error: null, filter: { available_only: false, search: '' } }) => s,
      bookings:   (s = { items: [], isLoading: false, error: null }) => s,
      ui:         (s = { notifications: [], theme: { mode: 'light', language: 'en' }, sidebarOpen: true }) => s,
    },
    preloadedState,
  })
}

// ── Wrapper ───────────────────────────────────────────────────────────────── //
const Wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
)

// ─────────────────────────────────────────────────────────────────────────── //
//  BADGE TESTS                                                                //
// ─────────────────────────────────────────────────────────────────────────── //

import { Badge, Button, Input, Spinner } from '../components'

describe('Badge component', () => {
  it('renders with available status', () => {
    render(<Badge status="available" />)
    expect(screen.getByText('available')).toBeInTheDocument()
  })

  it('renders with booked status', () => {
    render(<Badge status="booked" />)
    expect(screen.getByText('booked')).toBeInTheDocument()
  })

  it('renders with cancelled status', () => {
    render(<Badge status="cancelled" />)
    expect(screen.getByText('cancelled')).toBeInTheDocument()
  })

  it('renders with unknown status without crashing', () => {
    render(<Badge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })

  it('applies correct CSS class for available', () => {
    const { container } = render(<Badge status="available" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies correct CSS class for booked', () => {
    const { container } = render(<Badge status="booked" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})

// ─────────────────────────────────────────────────────────────────────────── //
//  BUTTON TESTS                                                               //
// ─────────────────────────────────────────────────────────────────────────── //

describe('Button component', () => {
  it('renders children text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    const { container } = render(<Button isLoading>Test</Button>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('applies primary variant classes by default', () => {
    const { container } = render(<Button>Primary</Button>)
    expect(container.firstChild).toHaveClass('bg-primary-600')
  })

  it('applies danger variant classes', () => {
    const { container } = render(<Button variant="danger">Delete</Button>)
    expect(container.firstChild).toHaveClass('bg-red-600')
  })

  it('applies secondary variant classes', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    expect(container.firstChild).toHaveClass('bg-gray-100')
  })

  it('is disabled when disabled prop passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────── //
//  INPUT TESTS                                                                //
// ─────────────────────────────────────────────────────────────────────────── //

describe('Input component', () => {
  it('renders with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('renders input element', () => {
    render(<Input label="Email" type="email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows error message when error prop provided', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('does not show error when no error prop', () => {
    render(<Input label="Name" />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('accepts typed input', () => {
    render(<Input label="Search" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test value' } })
    expect(input.value).toBe('test value')
  })

  it('applies error border class when error present', () => {
    const { container } = render(<Input label="Field" error="Error" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-red-500')
  })
})

// ─────────────────────────────────────────────────────────────────────────── //
//  SPINNER TESTS                                                              //
// ─────────────────────────────────────────────────────────────────────────── //

describe('Spinner component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('contains animated element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────── //
//  STORE TESTS                                                                //
// ─────────────────────────────────────────────────────────────────────────── //

import { toggleTheme, setLanguage, addNotification,
         removeNotification, setFilter } from '../store'

describe('UI store slice', () => {
  it('toggles theme from light to dark', () => {
    const store = makeStore({ ui: { notifications: [], theme: { mode: 'light', language: 'en' }, sidebarOpen: true } })
    store.dispatch(toggleTheme())
    expect(store.getState().ui.theme.mode).toBe('dark')
  })

  it('toggles theme from dark to light', () => {
    const store = makeStore({ ui: { notifications: [], theme: { mode: 'dark', language: 'en' }, sidebarOpen: true } })
    store.dispatch(toggleTheme())
    expect(store.getState().ui.theme.mode).toBe('light')
  })

  it('sets language', () => {
    const store = makeStore({ ui: { notifications: [], theme: { mode: 'light', language: 'en' }, sidebarOpen: true } })
    store.dispatch(setLanguage('pl'))
    expect(store.getState().ui.theme.language).toBe('pl')
  })

  it('adds notification', () => {
    const store = makeStore({ ui: { notifications: [], theme: { mode: 'light', language: 'en' }, sidebarOpen: true } })
    store.dispatch(addNotification({ type: 'success', message: 'Test notification' }))
    expect(store.getState().ui.notifications).toHaveLength(1)
    expect(store.getState().ui.notifications[0].message).toBe('Test notification')
    expect(store.getState().ui.notifications[0].type).toBe('success')
  })

  it('removes notification by id', () => {
    const store = makeStore({ ui: { notifications: [{ id: 'test-id', type: 'info', message: 'Hello' }], theme: { mode: 'light', language: 'en' }, sidebarOpen: true } })
    store.dispatch(removeNotification('test-id'))
    expect(store.getState().ui.notifications).toHaveLength(0)
  })

  it('adds notification with unique id', () => {
    const store = makeStore({ ui: { notifications: [], theme: { mode: 'light', language: 'en' }, sidebarOpen: true } })
    store.dispatch(addNotification({ type: 'error', message: 'Error 1' }))
    store.dispatch(addNotification({ type: 'error', message: 'Error 2' }))
    const ids = store.getState().ui.notifications.map((n: any) => n.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('Facilities store slice', () => {
  it('sets search filter', () => {
    const store = makeStore()
    store.dispatch(setFilter({ search: 'gym' }))
    expect(store.getState().facilities.filter.search).toBe('gym')
  })

  it('sets available_only filter', () => {
    const store = makeStore()
    store.dispatch(setFilter({ available_only: true }))
    expect(store.getState().facilities.filter.available_only).toBe(true)
  })

  it('sets environment filter', () => {
    const store = makeStore()
    store.dispatch(setFilter({ environment: 'indoor' }))
    expect(store.getState().facilities.filter.environment).toBe('indoor')
  })
})

// ─────────────────────────────────────────────────────────────────────────── //
//  AUTH STORE TESTS                                                           //
// ─────────────────────────────────────────────────────────────────────────── //

import { logout } from '../store'

describe('Auth store slice', () => {
  it('clears user on logout', () => {
    const store = makeStore({
      auth: {
        user: { id: '1', username: 'test', email: 'test@test.com', full_name: 'Test', role: 'customer', status: 'active', loyalty_points: 0, created_at: '' },
        token: 'some-token', isAuthenticated: true, isLoading: false, error: null,
      }
    })
    store.dispatch(logout())
    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().auth.token).toBeNull()
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })
})
