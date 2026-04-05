import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null; // Stores profiles row (username, avatar, etc.)
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signIn: (email: string, pass: string) => Promise<{ error: any }>;
    signUp: (email: string, pass: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
    signInWithGoogle: async () => { },
    signIn: async () => { return { error: null } },
    signUp: async () => { return { error: null } },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, onDone?: () => void) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
            }
            setProfile(data || null);
        } catch (err) {
            console.error("Unexpected error in fetchProfile:", err);
            setProfile(null);
        } finally {
            onDone?.();
        }
    };

    useEffect(() => {
        let mounted = true;

        const timer = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 3000);

        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) console.error("Session error:", error);

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
            }

            if (session?.user) {
                fetchProfile(session.user.id, () => {
                    if (mounted) setLoading(false);
                });
            } else {
                if (mounted) setLoading(false);
            }
        }).catch(err => {
            console.error("Session fetch caught error:", err);
            if (mounted) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
            }
            if (session?.user) {
                fetchProfile(session.user.id, () => {
                    if (mounted) setLoading(false);
                });
            } else {
                if (mounted) {
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/home`,
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error("Google sign-in error:", err);
            throw err;
        }
    };

    const signIn = async (email: string, pass: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
    };

    const signUp = async (email: string, pass: string) => {
        return await supabase.auth.signUp({
            email,
            password: pass,
        });
    };

    const signInWithPhone = async (phone: string) => {
        return await supabase.auth.signInWithOtp({
            phone
        });
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error("Sign out API error (ignored):", e);
        }
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const isAdmin = !!(profile?.is_admin);

    const contextValue = useMemo(() => ({
        user,
        session,
        profile,
        loading,
        isAdmin,
        signOut,
        signInWithGoogle,
        signIn,
        signUp,
        signInWithPhone
    }), [user, session, profile, loading, isAdmin, signOut, signInWithGoogle, signIn, signUp, signInWithPhone]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
