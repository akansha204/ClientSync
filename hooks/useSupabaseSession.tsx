import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

const useSupabaseSession = () => {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            setSession(data.session)
        }

        getSession()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return session
}

export default useSupabaseSession
