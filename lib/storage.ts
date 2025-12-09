import { supabase } from './supabase'
import { decode } from 'base64-arraybuffer'

export async function uploadProfilePhoto(
  userId: string, 
  base64: string,
  profileType: 'user' | 'loved_one' = 'user'
): Promise<string | null> {
  try {
    // Determine file extension from base64 string
    const matches = base64.match(/^data:image\/(\w+);base64,/)
    let fileExt = matches ? matches[1] : 'jpeg'
    
    // Fix common MIME type issues
    if (fileExt === 'jpg') {
      fileExt = 'jpeg' // Correct MIME type for JPEG
    }
    
    // Validate MIME type
    const validMimeTypes = ['jpeg', 'png', 'gif', 'webp']
    if (!validMimeTypes.includes(fileExt)) {
      console.error(`Invalid image type: ${fileExt}. Using jpeg as fallback.`)
      fileExt = 'jpeg'
    }
    
    // Create unique filename with timestamp
    const fileName = `${profileType}_${userId}_${Date.now()}.${fileExt === 'jpeg' ? 'jpg' : fileExt}`
    const filePath = `${userId}/${fileName}`

    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')

    // Upload to Supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, decode(base64Data), {
        contentType: `image/${fileExt}`,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('The "profiles" bucket does not exist in Supabase. Please create it first.')
        console.error('Run the SQL in supabase/setup.sql to create the bucket and tables.')
      }
      
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    return null
  }
}

export async function deleteProfilePhoto(filePath: string): Promise<boolean> {
  try {
    // Extract just the path from a full URL if necessary
    const path = filePath.includes('/profiles/') 
      ? filePath.split('/profiles/')[1] 
      : filePath

    const { error } = await supabase.storage
      .from('profiles')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting photo:', error)
    return false
  }
}

// Helper function to get all photos for a user
export async function getUserPhotos(userId: string) {
  try {
    const { data, error } = await supabase.storage
      .from('profiles')
      .list(userId, {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('Error listing photos:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user photos:', error)
    return []
  }
}