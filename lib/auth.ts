import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const auth = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    return session
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
} 