// src/store/slices/bookingsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Booking, BookingsState, CreateBookingData } from '@/types'
import { bookingService } from '@/services/api'

const initialState: BookingsState = {
  items: [], current: null, isLoading: false, error: null,
}

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try { return await bookingService.getMyBookings() }
    catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to load bookings') }
  }
)

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data: CreateBookingData, { rejectWithValue }) => {
    try { return await bookingService.create(data) }
    catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to create booking') }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id: string, { rejectWithValue }) => {
    try { return await bookingService.cancel(id) }
    catch (err: any) { return rejectWithValue(err.response?.data?.detail || 'Failed to cancel') }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError:  (s) => { s.error = null },
    setCurrentBooking:  (s, a: PayloadAction<Booking | null>) => { s.current = a.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(fetchMyBookings.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload })
      .addCase(fetchMyBookings.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })
      .addCase(createBooking.pending,     (s) => { s.isLoading = true;  s.error = null })
      .addCase(createBooking.fulfilled,   (s, a) => {
        s.isLoading = false; s.items.unshift(a.payload); s.current = a.payload
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
