import { supabase } from './supabase'

// Types
export interface UserProfile {
  id?: string
  user_id: string
  name?: string
  birthday?: string
  location?: string
  photo_url?: string
  interests?: string[]
  places?: any[] // JSON array of {name, note}
  notes?: any[] // JSON array of {title, content}
  dates?: any[] // JSON array of {name, date, recurring}
  sizes?: any // JSON object with clothing sizes
  gift_ideas?: any[] // JSON array of {title, description, link, price}
  created_at?: string
  updated_at?: string
}

export interface LovedOneProfile {
  id?: string
  user_id: string
  name: string
  relationship?: string
  birthday?: string
  interests?: string[]
  favorite_food?: string
  favorite_artist?: string
  splurge_on?: string
  photo_url?: string
  gift_ideas?: any[] // JSON array of {title, description, link, price}
  created_at?: string
  updated_at?: string
}

// User Profile functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function upsertUserProfile(profile: UserProfile) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in upsertUserProfile:', error)
    return null
  }
}

// Loved Ones Profile functions
export async function getLovedOnesProfiles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('loved_ones_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching loved ones:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getLovedOnesProfiles:', error)
    return []
  }
}

export async function getLovedOneProfile(profileId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('loved_ones_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', userId) // Ensure user owns this profile
      .single()

    if (error) {
      console.error('Error fetching loved one profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getLovedOneProfile:', error)
    return null
  }
}

export async function createLovedOneProfile(profile: Omit<LovedOneProfile, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('loved_ones_profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating loved one profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createLovedOneProfile:', error)
    return null
  }
}

export async function updateLovedOneProfile(
  profileId: string, 
  userId: string, 
  updates: Partial<LovedOneProfile>
) {
  try {
    const { data, error } = await supabase
      .from('loved_ones_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .eq('user_id', userId) // Ensure user owns this profile
      .select()
      .single()

    if (error) {
      console.error('Error updating loved one profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateLovedOneProfile:', error)
    return null
  }
}

export async function deleteLovedOneProfile(profileId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('loved_ones_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', userId) // Ensure user owns this profile

    if (error) {
      console.error('Error deleting loved one profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteLovedOneProfile:', error)
    return false
  }
}

// Get upcoming birthdays
export async function getUpcomingBirthdays(userId: string, days: number = 30) {
  try {
    const profiles = await getLovedOnesProfiles(userId)
    
    const today = new Date()
    const upcoming = profiles
      .filter(profile => profile.birthday)
      .map(profile => {
        const birthday = new Date(profile.birthday!)
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        )
        
        // If birthday already passed this year, use next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1)
        }
        
        const daysUntil = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          ...profile,
          daysUntil,
          birthdayDate: thisYearBirthday
        }
      })
      .filter(profile => profile.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil)
    
    return upcoming
  } catch (error) {
    console.error('Error getting upcoming birthdays:', error)
    return []
  }
}