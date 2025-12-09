import React, { useEffect, useState } from 'react'
import { View, Text, Button, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SupabaseTest() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const { user, session, loading } = useAuth()

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('_test_connection')
        .select('*')
        .limit(1)
      
      if (error && error.code === '42P01') {
        setConnected(true)
        Alert.alert('Success', 'Supabase is connected! (No tables exist yet)')
      } else if (error) {
        setConnected(false)
        Alert.alert('Error', `Connection failed: ${error.message}`)
      } else {
        setConnected(true)
        Alert.alert('Success', 'Supabase is connected and working!')
      }
    } catch (err) {
      setConnected(false)
      Alert.alert('Error', 'Failed to connect to Supabase')
    }
  }

  return (
    <View className="p-4 bg-white rounded-lg m-4">
      <Text className="text-xl font-bold mb-4">Supabase Status</Text>
      
      <View className="mb-4">
        <Text className="text-gray-600">
          Connection Status: {connected === null ? 'Not tested' : connected ? '✅ Connected' : '❌ Disconnected'}
        </Text>
        <Text className="text-gray-600">
          Auth Loading: {loading ? 'Loading...' : 'Ready'}
        </Text>
        <Text className="text-gray-600">
          User: {user ? user.email : 'Not logged in'}
        </Text>
        <Text className="text-gray-600">
          Session: {session ? 'Active' : 'No session'}
        </Text>
      </View>

      <Button title="Test Connection" onPress={testConnection} />
    </View>
  )
}