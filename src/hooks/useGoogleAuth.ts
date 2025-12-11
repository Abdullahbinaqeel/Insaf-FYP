/**
 * INSAF - Google Auth Hook
 * 
 * Custom hook for Google Sign-In using expo-auth-session
 */

import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../services/auth.service';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
// These should be configured in Firebase Console > Authentication > Sign-in method > Google
const GOOGLE_CLIENT_ID = {
    // Web client ID from Google Cloud Console / Firebase
    web: '804914296632-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    // For iOS, use your iOS client ID if you have one
    ios: undefined,
    // For Android, use your Android client ID if you have one
    android: undefined,
};

interface UseGoogleAuthOptions {
    defaultRole?: UserRole;
}

interface UseGoogleAuthReturn {
    signInWithGoogle: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}): UseGoogleAuthReturn => {
    const { defaultRole = 'CLIENT' } = options;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Configure Google Auth request
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CLIENT_ID.web,
        iosClientId: GOOGLE_CLIENT_ID.ios,
        androidClientId: GOOGLE_CLIENT_ID.android,
    });

    // Handle Google auth response
    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success') {
                setLoading(true);
                setError(null);

                try {
                    const { id_token } = response.params;

                    // Create Firebase credential with Google token
                    const credential = GoogleAuthProvider.credential(id_token);

                    // Sign in to Firebase with Google credential
                    const userCredential = await signInWithCredential(auth, credential);
                    const user = userCredential.user;

                    // Check if user profile exists in Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        // Create new user profile for first-time Google sign-in
                        const userProfile: UserProfile = {
                            uid: user.uid,
                            email: user.email || '',
                            displayName: user.displayName || 'User',
                            photoURL: user.photoURL || undefined,
                            role: defaultRole,
                            status: 'ACTIVE',
                            languagePreference: 'EN',
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        };

                        await setDoc(userDocRef, userProfile);
                    }

                    console.log('Google sign-in successful:', user.email);
                } catch (err: any) {
                    console.error('Google sign-in error:', err);
                    setError(err.message || 'Failed to sign in with Google');
                } finally {
                    setLoading(false);
                }
            } else if (response?.type === 'error') {
                setError(response.error?.message || 'Google sign-in failed');
            }
        };

        handleGoogleResponse();
    }, [response, defaultRole]);

    const signInWithGoogle = async () => {
        if (!request) {
            setError('Google sign-in is not available');
            return;
        }

        setError(null);
        await promptAsync();
    };

    return {
        signInWithGoogle,
        loading,
        error,
    };
};

export default useGoogleAuth;
