import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const auth = async () => {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    })
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      user
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
} 