import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null; // Stores profiles row (username, avatar, etc.)
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
            }
            setProfile(data || null);
        } catch (err) {
            console.error("Unexpected error in fetchProfile:", err);
            setProfile(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Fallback timer ensures loading state breaks after 2s if everything hangs
        const timer = setTimeout(() => {
            if (mounted && loading) setLoading(false);
        }, 2000);

        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) console.error("Session error:", error);

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false); // Stop loading immediately to unblock UI
            }

            if (session?.user) {
                fetchProfile(session.user.id);
            }
        }).catch(err => {
            console.error("Session fetch caught error:", err);
            if (mounted) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                if (mounted) setProfile(null);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    const isAdmin = !!(profile?.is_admin);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
