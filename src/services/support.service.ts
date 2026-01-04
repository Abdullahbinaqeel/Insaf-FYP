/**
 * INSAF - Support Service
 *
 * Handles support ticket creation and management
 */

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from './firestore.service';

export type TicketCategory = 'general' | 'technical' | 'payment' | 'dispute' | 'verification' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    userRole: string;
    category: TicketCategory;
    subject: string;
    message: string;
    status: TicketStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Create a new support ticket
 */
export const createTicket = async (
    userId: string,
    userDetails: {
        name: string;
        email: string;
        phone?: string;
        role: string;
    },
    category: TicketCategory,
    subject: string,
    message: string
): Promise<string> => {
    const ticketData: Omit<SupportTicket, 'id'> = {
        userId,
        userName: userDetails.name,
        userEmail: userDetails.email,
        userPhone: userDetails.phone,
        userRole: userDetails.role,
        category,
        subject,
        message,
        status: 'open',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TICKETS), ticketData);
    return docRef.id;
};

/**
 * Get tickets for a user
 */
export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
    const q = query(
        collection(db, COLLECTIONS.TICKETS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as SupportTicket[];
};
