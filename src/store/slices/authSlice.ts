// src/store/slices/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, LoginCredentials, RegisterData, User } from '@/types'
import { authService } from '@/services/api'

const storedToken = localStorage.getItem('sfbs_token')
const storedUser  = localStorage.getItem('sfbs_user')

const initialState: AuthState = {
  user:            storedUser ? JSON.parse(storedUser) : null,
  token:           storedToken,
  isLoading:       false,
  error:           null,
  isAuthenticated: !!storedToken,
}

// ── Thunks ────────────────────────────────────────────────────────────────── //

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials.username, credentials.password)
      localStorage.setItem('sfbs_token', data.access_token)
      localStorage.setItem('sfbs_user',  JSON.stringify(data.user))
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      return await authService.register(userData)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe()
    } catch (err: any) {
      return rejectWithValue('Session expired')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────── //

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.error           = null
      localStorage.removeItem('sfbs_token')
      localStorage.removeItem('sfbs_user')
    },
    clearError: (state) => { state.error = null },
    updateUser:  (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem('sfbs_user', JSON.stringify(action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading       = false
        s.user            = a.payload.user
        s.token           = a.payload.access_token
        s.isAuthenticated = true
      })
      .addCase(loginUser.rejected,  (s, a) => {
        s.isLoading = false
        s.error     = a.payload as string
      })
      // Register
      .addCase(registerUser.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(registerUser.fulfilled, (s) => { s.isLoading = false })
      .addCase(registerUser.rejected,  (s, a) => {
        s.isLoading = false
        s.error     = a.payload as string
      })
      // Fetch me
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.user = a.payload })
      .addCase(fetchCurrentUser.rejected,  (s) => {
        s.user = null; s.token = null; s.isAuthenticated = false
        localStorage.removeItem('sfbs_token')
        localStorage.removeItem('sfbs_user')
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer
