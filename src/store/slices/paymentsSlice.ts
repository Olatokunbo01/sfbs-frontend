// src/store/slices/paymentsSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { PaymentsState } from '@/types'
import { paymentService } from '@/services/api'

const initialState: PaymentsState = {
  current: null, history: [], isLoading: false, error: null,
}

export const initiateStripePayment = createAsyncThunk(
  'payments/stripeIntent',
  async (bookingId: string, { rejectWithValue }) => {
    try { return await paymentService.createStripeIntent(bookingId) }
    catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Payment failed. Please try again.')
    }
  }
)

export const requestOfflinePayment = createAsyncThunk(
  'payments/offlineRequest',
  async ({ bookingId, amount }: { bookingId: string; amount: number }, { rejectWithValue }) => {
    try { return await paymentService.requestOfflinePayment(bookingId, amount) }
    catch (err: any) { return rejectWithValue('Offline payment request failed') }
  }
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (s) => { s.error = null },
    clearCurrentPayment: (s) => { s.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateStripePayment.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(initiateStripePayment.fulfilled, (s, a) => { s.isLoading = false; s.current = a.payload })
      .addCase(initiateStripePayment.rejected,  (s, a) => {
        s.isLoading = false
        s.error     = a.payload as string
      })
      .addCase(requestOfflinePayment.pending,   (s) => { s.isLoading = true })
      .addCase(requestOfflinePayment.fulfilled, (s) => { s.isLoading = false })
      .addCase(requestOfflinePayment.rejected,  (s, a) => {
        s.isLoading = false; s.error = a.payload as string
      })
  },
})

export const { clearPaymentError, clearCurrentPayment } = paymentsSlice.actions
export default paymentsSlice.reducer


// ── UI Slice (theme + language) ───────────────────────────────────────────── //
// src/store/slices/uiSlice.ts
// AFA Week XII: themes + i18n state
