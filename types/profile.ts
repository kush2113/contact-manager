// types/profile.ts
export interface User {
    id: string;
    name: string;
    username: string;
    location: string;
    bio: string;
    followers: string;
    following: string;
    posts: string;
    avatar: string;
    isActive: boolean;
    joinDate: string;
    email: string;
    phone: string;
    createdAt?: any; // Firebase Timestamp
    updatedAt?: any; // Firebase Timestamp
}

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon: string;
    createdAt?: any; // Firebase Timestamp
    updatedAt?: any; // Firebase Timestamp
}

export interface Activity {
    id: string;
    type: string;
    description: string;
    icon: string;
    color: string;
    date: string;
    createdAt?: any; // Firebase Timestamp
    updatedAt?: any; // Firebase Timestamp
}

export interface SocialIcon {
    name: string;
    label: string;
}

export interface ActivityType {
    icon: string;
    color: string;
    label: string;
}

// Firebase response types
export interface FirebaseResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Form data types
export interface CreateSocialLinkData {
    platform: string;
    url: string;
    icon: string;
}

export interface CreateActivityData {
    type: string;
    description: string;
    icon: string;
    color: string;
}

export interface UpdateUserData extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {}
