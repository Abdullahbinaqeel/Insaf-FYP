/**
 * INSAF - User Preferences Service
 * 
 * Manages user favorites and blocked accounts in Firestore
 */

import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getLawyerProfile, LawyerProfile } from './lawyer.service';

// Collection references
const getFavoritesCollection = (userId: string) =>
    collection(db, 'users', userId, 'favorites');

const getBlockedCollection = (userId: string) =>
    collection(db, 'users', userId, 'blocked');

// ============ FAVORITES ============

/**
 * Add a lawyer to user's favorites
 */
export const addFavorite = async (userId: string, lawyerId: string): Promise<void> => {
    try {
        const favRef = doc(db, 'users', userId, 'favorites', lawyerId);
        await setDoc(favRef, {
            lawyerId,
            addedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

/**
 * Remove a lawyer from user's favorites
 */
export const removeFavorite = async (userId: string, lawyerId: string): Promise<void> => {
    try {
        const favRef = doc(db, 'users', userId, 'favorites', lawyerId);
        await deleteDoc(favRef);
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

/**
 * Check if a lawyer is in user's favorites
 */
export const isFavorite = async (userId: string, lawyerId: string): Promise<boolean> => {
    try {
        const favRef = doc(db, 'users', userId, 'favorites', lawyerId);
        const favSnap = await getDoc(favRef);
        return favSnap.exists();
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
};

/**
 * Get all favorited lawyers with their profiles
 */
export const getFavorites = async (userId: string): Promise<LawyerProfile[]> => {
    try {
        const favCollection = getFavoritesCollection(userId);
        const q = query(favCollection, orderBy('addedAt', 'desc'));
        const snapshot = await getDocs(q);

        const favorites: LawyerProfile[] = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const lawyerProfile = await getLawyerProfile(data.lawyerId);
            if (lawyerProfile) {
                favorites.push(lawyerProfile);
            }
        }

        return favorites;
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw error;
    }
};

// ============ BLOCKED ACCOUNTS ============

/**
 * Block a user/lawyer
 */
export const blockUser = async (userId: string, blockedUserId: string): Promise<void> => {
    try {
        const blockRef = doc(db, 'users', userId, 'blocked', blockedUserId);
        await setDoc(blockRef, {
            blockedUserId,
            blockedAt: serverTimestamp(),
        });

        // Also remove from favorites if present
        await removeFavorite(userId, blockedUserId).catch(() => { });
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
    }
};

/**
 * Unblock a user/lawyer
 */
export const unblockUser = async (userId: string, blockedUserId: string): Promise<void> => {
    try {
        const blockRef = doc(db, 'users', userId, 'blocked', blockedUserId);
        await deleteDoc(blockRef);
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error;
    }
};

/**
 * Check if a user is blocked
 */
export const isBlocked = async (userId: string, blockedUserId: string): Promise<boolean> => {
    try {
        const blockRef = doc(db, 'users', userId, 'blocked', blockedUserId);
        const blockSnap = await getDoc(blockRef);
        return blockSnap.exists();
    } catch (error) {
        console.error('Error checking blocked status:', error);
        return false;
    }
};

/**
 * Get all blocked users with their profiles
 */
export const getBlockedUsers = async (userId: string): Promise<LawyerProfile[]> => {
    try {
        const blockedCollection = getBlockedCollection(userId);
        const q = query(blockedCollection, orderBy('blockedAt', 'desc'));
        const snapshot = await getDocs(q);

        const blockedUsers: LawyerProfile[] = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const lawyerProfile = await getLawyerProfile(data.blockedUserId);
            if (lawyerProfile) {
                blockedUsers.push(lawyerProfile);
            }
        }

        return blockedUsers;
    } catch (error) {
        console.error('Error getting blocked users:', error);
        throw error;
    }
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (userId: string, lawyerId: string): Promise<boolean> => {
    const isFav = await isFavorite(userId, lawyerId);
    if (isFav) {
        await removeFavorite(userId, lawyerId);
        return false;
    } else {
        await addFavorite(userId, lawyerId);
        return true;
    }
};
