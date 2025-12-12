import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xsdhkhuzlfduriqcvzxt.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZGhraHV6bGZkdXJpcWN2enh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjQ5ODQsImV4cCI6MjA4MDg0MDk4NH0.t_DA_ZdqkxcbM-o2tsNf4TPRr6TzHCkMjdYB3f-BX78'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing. Please check environment variables.')
}

// Custom storage adapter for better session persistence
const supabaseStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const data = await AsyncStorage.getItem(key)
      return data
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error)
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error)
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error)
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})