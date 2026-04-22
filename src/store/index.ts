/**
 * src/store/index.ts + all slices
 * Sprint 2 [Mohab] — AFA Week VIII: Redux Toolkit state management
 */

import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import { authService, facilityService, bookingService } from '../services/api'
import type {
  AuthState, User, LoginCredentials, RegisterData,
  FacilitiesState, Facility, FacilityFilter,
  BookingsState, Booking, BookingCreate,
  UIState, Notification, ThemeState,
} from '../types'

// ════════════════════════════════════════════════════════════════════════════ //
//  AUTH SLICE                                                                  //
// ════════════════════════════════════════════════════════════════════════════ //

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try { return await authService.login(credentials) }
    catch (e: any) { return rejectWithValue(e.response?.data?.detail ?? 'Login failed') }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try { return await authService.register(data) }
    catch (e: any) { return rejectWithValue(e.response?.data?.detail ?? 'Registration failed') }
  }
)

export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try { return await authService.getMe() }
    catch (e: any) { return rejectWithValue('Session expired') }
  }
)

const authInitial: AuthState = {
  user:            authService.getCurrentUser(),
  token:           authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  isLoading:       false,
  error:           null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitial,
  reducers: {
    logout(state) {
      authService.logout()
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.error           = null
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending,  (s) => { s.isLoading = true;  s.error = null })
    b.addCase(loginThunk.fulfilled,(s, a) => {
      s.isLoading      = false
      s.user           = a.payload.user
      s.token          = a.payload.access_token
      s.isAuthenticated= true
    })
    b.addCase(loginThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })

    b.addCase(registerThunk.pending,  (s) => { s.isLoading = true;  s.error = null })
    b.addCase(registerThunk.fulfilled,(s) => { s.isLoading = false })
    b.addCase(registerThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })

    b.addCase(getMeThunk.fulfilled, (s, a) => { s.user = a.payload })
    b.addCase(getMeThunk.rejected,  (s) => { s.user = null; s.token = null; s.isAuthenticated = false })
  },
})

// ════════════════════════════════════════════════════════════════════════════ //
//  FACILITIES SLICE                                                            //
// ════════════════════════════════════════════════════════════════════════════ //

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchAll',
  async (availableOnly: boolean = false, { rejectWithValue }) => {
    try { return await facilityService.getAll(availableOnly) }
    catch (e: any) { return rejectWithValue(e.response?.data?.detail ?? 'Failed to load facilities') }
  }
)

export const fetchFacilityById = createAsyncThunk(
  'facilities/fetchById',
  async (id: string, { rejectWithValue }) => {
    try { return await facilityService.getById(id) }
    catch (e: any) { return rejectWithValue('Facility not found') }
  }
)

const facilitiesInitial: FacilitiesState = {
  items:     [],
  selected:  null,
  isLoading: false,
  error:     null,
  filter:    { available_only: false, search: '' },
}

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState: facilitiesInitial,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<FacilityFilter>>) {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearSelected(state) { state.selected = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchFacilities.pending,   (s) => { s.isLoading = true;  s.error = null })
    b.addCase(fetchFacilities.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload })
    b.addCase(fetchFacilities.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })

    b.addCase(fetchFacilityById.pending,   (s) => { s.isLoading = true })
    b.addCase(fetchFacilityById.fulfilled, (s, a) => { s.isLoading = false; s.selected = a.payload })
    b.addCase(fetchFacilityById.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })
  },
})

// ════════════════════════════════════════════════════════════════════════════ //
//  BOOKINGS SLICE                                                              //
// ════════════════════════════════════════════════════════════════════════════ //

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try { return await bookingService.getMyBookings() }
    catch (e: any) { return rejectWithValue('Failed to load bookings') }
  }
)

export const createBookingThunk = createAsyncThunk(
  'bookings/create',
  async (data: BookingCreate, { rejectWithValue }) => {
    try { return await bookingService.create(data) }
    catch (e: any) { return rejectWithValue(e.response?.data?.detail ?? 'Booking failed') }
  }
)

export const cancelBookingThunk = createAsyncThunk(
  'bookings/cancel',
  async (id: string, { rejectWithValue }) => {
    try { await bookingService.cancel(id); return id }
    catch (e: any) { return rejectWithValue('Failed to cancel booking') }
  }
)

const bookingsInitial: BookingsState = { items: [], isLoading: false, error: null }

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: bookingsInitial,
  reducers: { clearError(state) { state.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchMyBookings.pending,   (s) => { s.isLoading = true })
    b.addCase(fetchMyBookings.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload })
    b.addCase(fetchMyBookings.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })

    b.addCase(createBookingThunk.fulfilled, (s, a) => { s.items.unshift(a.payload) })
    b.addCase(createBookingThunk.rejected,  (s, a) => { s.error = a.payload as string })

    b.addCase(cancelBookingThunk.fulfilled, (s, a) => {
      const bk = s.items.find(b => b.id === a.payload)
      if (bk) bk.status = 'cancelled'
    })
  },
})

// ════════════════════════════════════════════════════════════════════════════ //
//  UI SLICE  (theme + notifications)                                           //
// ════════════════════════════════════════════════════════════════════════════ //

const uiInitial: UIState = {
  notifications: [],
  theme: {
    mode:     (localStorage.getItem('sfbs_theme') as 'light' | 'dark') ?? 'light',
    language: (localStorage.getItem('sfbs_lang')  as 'en' | 'pl' | 'ar') ?? 'en',
  },
  sidebarOpen: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: uiInitial,
  reducers: {
    toggleTheme(state) {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('sfbs_theme', state.theme.mode)
      document.documentElement.classList.toggle('dark', state.theme.mode === 'dark')
    },
    setLanguage(state, action: PayloadAction<'en' | 'pl' | 'ar'>) {
      state.theme.language = action.payload
      localStorage.setItem('sfbs_lang', action.payload)
    },
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      state.notifications.push({ ...action.payload, id: crypto.randomUUID() })
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
  },
})

// ════════════════════════════════════════════════════════════════════════════ //
//  STORE                                                                       //
// ════════════════════════════════════════════════════════════════════════════ //

export const store = configureStore({
  reducer: {
    auth:       authSlice.reducer,
    facilities: facilitiesSlice.reducer,
    bookings:   bookingsSlice.reducer,
    ui:         uiSlice.reducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch          = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// ── Exported actions ──────────────────────────────────────────────────────── //
export const { logout, clearError: clearAuthError }   = authSlice.actions
export const { setFilter, clearSelected }             = facilitiesSlice.actions
export const { clearError: clearBookingError }        = bookingsSlice.actions
export const { toggleTheme, setLanguage, addNotification, removeNotification, toggleSidebar } = uiSlice.actions
