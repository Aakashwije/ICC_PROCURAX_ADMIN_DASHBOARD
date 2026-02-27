import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export interface FirebaseUser {
    name: string;
    email: string;
    role?: string;
    isApproved: boolean;
    isActive?: boolean;
    googleSheetUrl?: string | null;
    lastLogin?: string;
}

/**
 * Saves or merges user data into Firestore under the `users/{uid}` collection.
 */
export async function saveUserToFirestore(uid: string, userData: Partial<FirebaseUser>) {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            ...userData,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
}

/**
 * Retrieves a user's data from Firestore.
 */
export async function getUserFromFirestore(uid: string): Promise<FirebaseUser | null> {
    try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            return snap.data() as FirebaseUser;
        }
        return null;
    } catch (error) {
        console.error("Error getting user from Firestore:", error);
        return null;
    }
}

/**
 * Updates only the googleSheetUrl for a specific user.
 */
export async function updateUserSheetUrl(uid: string, googleSheetUrl: string) {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            googleSheetUrl,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error updating sheet URL in Firestore:", error);
    }
}
