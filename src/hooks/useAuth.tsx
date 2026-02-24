import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
    firebaseUser: FirebaseUser | null;
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from API
    const fetchUserProfile = useCallback(async () => {
        try {
            setError(null);
            const res = await api.get('/users/me');
            const userData = res.data.data || res.data;
            console.log('[Auth] User profile loaded:', userData);
            setUser(userData);
        } catch (err) {
            console.error('[Auth] Failed to fetch user profile:', err);
            setError('Gagal memuat profil pengguna dari server');
            setUser(null);
        }
    }, []);

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log('[Auth] Firebase state changed:', fbUser?.email || 'null');
            setFirebaseUser(fbUser);
            if (fbUser) {
                await fetchUserProfile();
            } else {
                setUser(null);
                setError(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [fetchUserProfile]);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the rest
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ firebaseUser, user, loading, error, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
