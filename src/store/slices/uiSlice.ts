// src/store/slices/uiSlice.ts
// AFA Week XII: Theme switching + i18n language state
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, Theme, Language } from '@/types'
import i18n from '@/i18n'

const initialState: UIState = {
  theme:       (localStorage.getItem('sfbs_theme') as Theme) || 'light',
  language:    (localStorage.getItem('sfbs_lang')  as Language) || 'en',
  sidebarOpen: false,
}

// Apply theme on load
if (initialState.theme === 'dark') {
  document.documentElement.classList.add('dark')
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('sfbs_theme', state.theme)
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      localStorage.setItem('sfbs_theme', action.payload)
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
      localStorage.setItem('sfbs_lang', action.payload)
      i18n.changeLanguage(action.payload)
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    closeSidebar:  (state) => { state.sidebarOpen = false },
  },
})

export const { toggleTheme, setTheme, setLanguage, toggleSidebar, closeSidebar } = uiSlice.actions
export default uiSlice.reducer
