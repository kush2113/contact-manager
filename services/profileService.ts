import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    Unsubscribe
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import {
    User,
    SocialLink,
    Activity,
    FirebaseResponse,
    CreateSocialLinkData,
    CreateActivityData,
    UpdateUserData, SocialIcon, ActivityType
} from '../types/profile';

export class ProfileService {
    private db;
    private storage;

    constructor(firebaseApp: any) {
        this.db = getFirestore(firebaseApp);
        this.storage = getStorage(firebaseApp);
    }

    // Profile CRUD Operations
    async getProfile(profileId: string = 'profile'): Promise<FirebaseResponse<User>> {
        try {
            const userDoc = doc(this.db, 'users', profileId);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data() as User;
                return {
                    success: true,
                    data: {
                        ...userData,
                        id: userSnapshot.id
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Profile not found'
                };
            }
        } catch (error) {
            console.error('Error getting profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profile'
            };
        }
    }

    async createProfile(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<User>> {
        try {
            const userDoc = doc(this.db, 'users', 'profile');
            const profileData = {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await updateDoc(userDoc, profileData);

            return {
                success: true,
                data: { ...profileData, id: 'profile' } as User
            };
        } catch (error) {
            console.error('Error creating profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create profile'
            };
        }
    }

    async updateProfile(profileId: string = 'profile', updateData: UpdateUserData): Promise<FirebaseResponse<User>> {
        try {
            const userDoc = doc(this.db, 'users', profileId);
            const updatedData = {
                ...updateData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(userDoc, updatedData);

            return {
                success: true,
                data: { ...updatedData, id: profileId } as User
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update profile'
            };
        }
    }

    async deactivateProfile(profileId: string = 'profile'): Promise<FirebaseResponse<boolean>> {
        try {
            const userDoc = doc(this.db, 'users', profileId);
            await updateDoc(userDoc, {
                isActive: false,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error deactivating profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to deactivate profile'
            };
        }
    }

    // Social Links CRUD Operations
    async getSocialLinks(): Promise<FirebaseResponse<SocialLink[]>> {
        try {
            const socialCollection = collection(this.db, 'socialLinks');
            const snapshot = await getDocs(socialCollection);
            const links: SocialLink[] = [];

            snapshot.forEach((doc) => {
                links.push({
                    id: doc.id,
                    ...doc.data()
                } as SocialLink);
            });

            return {
                success: true,
                data: links
            };
        } catch (error) {
            console.error('Error getting social links:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get social links'
            };
        }
    }

    subscribeSocialLinks(callback: (links: SocialLink[]) => void): Unsubscribe {
        const socialCollection = collection(this.db, 'socialLinks');

        return onSnapshot(socialCollection, (snapshot) => {
            const links: SocialLink[] = [];
            snapshot.forEach((doc) => {
                links.push({
                    id: doc.id,
                    ...doc.data()
                } as SocialLink);
            });
            callback(links);
        });
    }

    async createSocialLink(linkData: CreateSocialLinkData): Promise<FirebaseResponse<SocialLink>> {
        try {
            const socialCollection = collection(this.db, 'socialLinks');
            const data = {
                ...linkData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(socialCollection, data);

            return {
                success: true,
                data: {
                    id: docRef.id,
                    ...data
                } as SocialLink
            };
        } catch (error) {
            console.error('Error creating social link:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create social link'
            };
        }
    }

    async updateSocialLink(linkId: string, updateData: Partial<CreateSocialLinkData>): Promise<FirebaseResponse<boolean>> {
        try {
            const socialDoc = doc(this.db, 'socialLinks', linkId);
            const data = {
                ...updateData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(socialDoc, data);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error updating social link:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update social link'
            };
        }
    }

    async deleteSocialLink(linkId: string): Promise<FirebaseResponse<boolean>> {
        try {
            const socialDoc = doc(this.db, 'socialLinks', linkId);
            await deleteDoc(socialDoc);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error deleting social link:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete social link'
            };
        }
    }

    // Activities CRUD Operations
    async getActivities(): Promise<FirebaseResponse<Activity[]>> {
        try {
            const activitiesCollection = collection(this.db, 'activities');
            const snapshot = await getDocs(activitiesCollection);
            const activities: Activity[] = [];

            snapshot.forEach((doc) => {
                activities.push({
                    id: doc.id,
                    ...doc.data()
                } as Activity);
            });

            // Sort by date (newest first)
            activities.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.seconds - a.createdAt.seconds;
                }
                return 0;
            });

            return {
                success: true,
                data: activities
            };
        } catch (error) {
            console.error('Error getting activities:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get activities'
            };
        }
    }

    subscribeActivities(callback: (activities: Activity[]) => void): Unsubscribe {
        const activitiesCollection = collection(this.db, 'activities');

        return onSnapshot(activitiesCollection, (snapshot) => {
            const activities: Activity[] = [];
            snapshot.forEach((doc) => {
                activities.push({
                    id: doc.id,
                    ...doc.data()
                } as Activity);
            });

            // Sort by date (newest first)
            activities.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.seconds - a.createdAt.seconds;
                }
                return 0;
            });

            callback(activities);
        });
    }

    async createActivity(activityData: CreateActivityData): Promise<FirebaseResponse<Activity>> {
        try {
            const activitiesCollection = collection(this.db, 'activities');
            const data = {
                ...activityData,
                date: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(activitiesCollection, data);

            return {
                success: true,
                data: {
                    id: docRef.id,
                    ...data
                } as Activity
            };
        } catch (error) {
            console.error('Error creating activity:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create activity'
            };
        }
    }

    async updateActivity(activityId: string, updateData: Partial<CreateActivityData>): Promise<FirebaseResponse<boolean>> {
        try {
            const activityDoc = doc(this.db, 'activities', activityId);
            const data = {
                ...updateData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(activityDoc, data);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error updating activity:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update activity'
            };
        }
    }

    async deleteActivity(activityId: string): Promise<FirebaseResponse<boolean>> {
        try {
            const activityDoc = doc(this.db, 'activities', activityId);
            await deleteDoc(activityDoc);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error deleting activity:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete activity'
            };
        }
    }

    // Image Storage Operations
    async uploadImage(uri: string, folder: string = 'profile_images'): Promise<FirebaseResponse<string>> {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const filename = `${folder}/${Date.now()}.jpg`;
            const storageRef = ref(this.storage, filename);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            return {
                success: true,
                data: downloadURL
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image'
            };
        }
    }

    async deleteImage(imageUrl: string): Promise<FirebaseResponse<boolean>> {
        try {
            const storageRef = ref(this.storage, imageUrl);
            await deleteObject(storageRef);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            console.error('Error deleting image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete image'
            };
        }
    }
}

// Constants
export const SOCIAL_ICONS: SocialIcon[] = [
    { name: 'github', label: 'GitHub' },
    { name: 'linkedin-square', label: 'LinkedIn' },
    { name: 'twitter', label: 'Twitter' },
    { name: 'facebook-square', label: 'Facebook' },
    { name: 'instagram', label: 'Instagram' },
    { name: 'link', label: 'Website' }
];

export const ACTIVITY_TYPES: ActivityType[] = [
    { icon: 'code', color: '#60a5fa', label: 'Code' },
    { icon: 'heart', color: '#ef4444', label: 'Like' },
    { icon: 'message-square', color: '#10b981', label: 'Comment' },
    { icon: 'share-2', color: '#f59e0b', label: 'Share' },
    { icon: 'star', color: '#8b5cf6', label: 'Star' },
    { icon: 'bookmark', color: '#06b6d4', label: 'Bookmark' }
];
