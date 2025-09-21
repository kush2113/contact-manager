import { db, auth } from '@/firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import { UserProfile, SocialLink, Activity } from '@/types/profile';

// User Profile Operations
export const saveUserProfile = async (profileData: UserProfile): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const profileRef = doc(db, 'user_profiles', profileData.id);
    await setDoc(profileRef, { ...profileData, uId: auth.currentUser.uid }, { merge: true });
};

export const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const profileRef = doc(db, 'user_profiles', userId);
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
};

export const subscribeToUserProfile = (
    userId: string,
    callback: (profile: UserProfile | null) => void
): (() => void) => {
    const profileRef = doc(db, 'user_profiles', userId);
    return onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as UserProfile);
        } else {
            callback(null);
        }
    });
};

// Social Links Operations
export const saveSocialLink = async (socialLink: SocialLink): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const linkRef = doc(db, 'social_links', socialLink.id);
    await setDoc(linkRef, { ...socialLink, uId: auth.currentUser.uid }, { merge: true });
};

export const deleteSocialLink = async (linkId: string): Promise<void> => {
    const linkRef = doc(db, 'social_links', linkId);
    await deleteDoc(linkRef);
};

export const subscribeToSocialLinks = (
    userId: string,
    callback: (links: SocialLink[]) => void
): (() => void) => {
    const linksQuery = query(
        collection(db, 'social_links'),
        where('uId', '==', userId)
    );
    return onSnapshot(linksQuery, (querySnapshot) => {
        const links = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as SocialLink[];
        callback(links);
    });
};

// Activities Operations
export const saveActivity = async (activity: Activity): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const activityRef = doc(db, 'activities', activity.id);
    await setDoc(activityRef, { ...activity, uId: auth.currentUser.uid }, { merge: true });
};

export const deleteActivity = async (activityId: string): Promise<void> => {
    const activityRef = doc(db, 'activities', activityId);
    await deleteDoc(activityRef);
};

export const subscribeToActivities = (
    userId: string,
    callback: (activities: Activity[]) => void
): (() => void) => {
    const activitiesQuery = query(
        collection(db, 'activities'),
        where('uId', '==', userId)
    );
    return onSnapshot(activitiesQuery, (querySnapshot) => {
        const activities = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Activity[];
        callback(activities);
    });
};