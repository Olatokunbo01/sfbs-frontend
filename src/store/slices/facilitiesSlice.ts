// src/store/slices/facilitiesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Facility, FacilitiesState, FacilityFilters } from '@/types'
import { facilityService } from '@/services/api'

const initialState: FacilitiesState = {
  items: [], selected: null,
  filters: { type: '', environment: '', available: false, maxRate: undefined },
  isLoading: false, error: null,
}

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchAll',
  async (availableOnly: boolean = false, { rejectWithValue }) => {
    try { return await facilityService.getAll(availableOnly) }
    catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to load facilities') }
  }
)

export const fetchFacilityById = createAsyncThunk(
  'facilities/fetchById',
  async (id: string, { rejectWithValue }) => {
    try { return await facilityService.getById(id) }
    catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Facility not found') }
  }
)

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    setFilters:      (s, a: PayloadAction<FacilityFilters>) => { s.filters = a.payload },
    clearFilters:    (s) => { s.filters = initialState.filters },
    selectFacility:  (s, a: PayloadAction<Facility | null>) => { s.selected = a.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(fetchFacilities.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload })
      .addCase(fetchFacilities.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })
      .addCase(fetchFacilityById.fulfilled, (s, a) => { s.selected = a.payload })
  },
})

export const { setFilters, clearFilters, selectFacility } = facilitiesSlice.actions
export default facilitiesSlice.reducer


// ── Bookings slice ────────────────────────────────────────────────────────── //
// src/store/slices/bookingsSlice.ts

import { createAsyncThunk as cat2, createSlice as cs2, PayloadAction as PA2 } from '@reduxjs/toolkit'
import { Booking, BookingsState, CreateBookingData } from '@/types'
import { bookingService } from '@/services/api'

const bookingsInitial: BookingsState = {
  items: [], current: null, isLoading: false, error: null,
}

export const fetchMyBookings = cat2('bookings/fetchMine', async (_, { rejectWithValue }) => {
  try { return await bookingService.getMyBookings() }
  catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to load bookings') }
})

export const createBooking = cat2('bookings/create', async (data: CreateBookingData, { rejectWithValue }) => {
  try { return await bookingService.create(data) }
  catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to create booking') }
})

export const cancelBooking = cat2('bookings/cancel', async (id: string, { rejectWithValue }) => {
  try { return await bookingService.cancel(id) }
  catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to cancel booking') }
})

const bookingsSlice = cs2({
  name: 'bookings',
  initialState: bookingsInitial,
  reducers: {
    clearBookingError: (s) => { s.error = null },
    setCurrentBooking: (s, a: PA2<Booking | null>) => { s.current = a.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(fetchMyBookings.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload })
      .addCase(fetchMyBookings.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })
      .addCase(createBooking.pending,     (s) => { s.isLoading = true;  s.error = null })
      .addCase(createBooking.fulfilled,   (s, a) => {
        s.isLoading = false
        s.items.unshift(a.payload)
        s.current = a.payload
      })
      .addCase(createBooking.rejected,    (s, a) => { s.isLoading = false; s.error = a.payload as string })
      .addCase(cancelBooking.fulfilled,   (s, a) => {
        const idx = s.items.findIndex(b => b.id === a.payload.id)
        if (idx !== -1) s.items[idx] = a.payload
      })
  },
})

export const { clearBookingError, setCurrentBooking } = bookingsSlice.actions
export default bookingsSlice.reducer
