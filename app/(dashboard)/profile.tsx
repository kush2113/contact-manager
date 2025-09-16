import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    FlatList,
    Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Data keys for AsyncStorage
const STORAGE_KEYS = {
    USER_PROFILE: 'user_profile',
    SOCIAL_LINKS: 'social_links',
    ACTIVITIES: 'activities'
};

const ProfileScreen = () => {
    // Default empty profile structure
    const defaultProfile = {
        id: Date.now().toString(),
        name: '',
        username: '',
        location: '',
        bio: '',
        followers: '0',
        following: '0',
        posts: '0',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        isActive: true,
        joinDate: new Date().toISOString().split('T')[0],
        email: '',
        phone: ''
    };

    // User profile state
    const [user, setUser] = useState(defaultProfile);
    const [socialLinks, setSocialLinks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState({ ...user });
    const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
    const [isSocialModalVisible, setIsSocialModalVisible] = useState(false);
    const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

    // Form states
    const [editingSocial, setEditingSocial] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [newSocial, setNewSocial] = useState({ platform: '', url: '', icon: 'link' });
    const [newActivity, setNewActivity] = useState({ type: '', description: '', icon: 'activity', color: '#60a5fa' });
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '' });

    // Available icons for social platforms
    const socialIcons = [
        { name: 'github', label: 'GitHub' },
        { name: 'linkedin-square', label: 'LinkedIn' },
        { name: 'twitter', label: 'Twitter' },
        { name: 'facebook-square', label: 'Facebook' },
        { name: 'instagram', label: 'Instagram' },
        { name: 'link', label: 'Website' }
    ];

    // Available activity types
    const activityTypes = [
        { icon: 'code', color: '#60a5fa', label: 'Code' },
        { icon: 'heart', color: '#ef4444', label: 'Like' },
        { icon: 'message-square', color: '#10b981', label: 'Comment' },
        { icon: 'share-2', color: '#f59e0b', label: 'Share' },
        { icon: 'star', color: '#8b5cf6', label: 'Star' },
        { icon: 'bookmark', color: '#06b6d4', label: 'Bookmark' }
    ];

    useEffect(() => {
        loadAllData();
    }, []);

    // DATA PERSISTENCE FUNCTIONS
    const loadAllData = async () => {
        try {
            setIsLoading(true);

            // Load profile data
            const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (profileData) {
                const parsedProfile = JSON.parse(profileData);
                setUser(parsedProfile);
                setEditedUser(parsedProfile);
            }

            // Load social links
            const socialData = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
            if (socialData) {
                setSocialLinks(JSON.parse(socialData));
            }

            // Load activities
            const activityData = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
            if (activityData) {
                setActivities(JSON.parse(activityData));
            }

        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const saveUserProfile = async (profileData: { isActive: boolean; id: string; name: string; username: string; location: string; bio: string; followers: string; following: string; posts: string; avatar: string; joinDate: string; email: string; phone: string; }) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData));
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    };

    const saveSocialLinks = async (links: any[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(links));
        } catch (error) {
            console.error('Error saving social links:', error);
            throw error;
        }
    };

    const saveActivities = async (activities: any[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
        } catch (error) {
            console.error('Error saving activities:', error);
            throw error;
        }
    };

    // PROFILE CRUD OPERATIONS
    const createProfile = async (profileData: { id: string; name: string; username: string; location: string; bio: string; followers: string; following: string; posts: string; avatar: string; isActive: boolean; joinDate: string; email: string; phone: string; }) => {
        try {
            const newProfile = {
                ...defaultProfile,
                ...profileData,
                id: Date.now().toString(),
                joinDate: new Date().toISOString().split('T')[0]
            };

            await saveUserProfile(newProfile);
            setUser(newProfile);
            setEditedUser(newProfile);
            Alert.alert('Success', 'Profile created successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create profile');
        }
    };

    const updateProfile = async (updatedData: { id: string; name: string; username: string; location: string; bio: string; followers: string; following: string; posts: string; avatar: string; isActive: boolean; joinDate: string; email: string; phone: string; }) => {
        try {
            const updatedProfile = { ...user, ...updatedData };
            await saveUserProfile(updatedProfile);
            setUser(updatedProfile);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const deleteProfile = async () => {
        try {
            // Deactivate instead of completely deleting
            const deactivatedProfile = { ...user, isActive: false };
            await saveUserProfile(deactivatedProfile);
            setUser(deactivatedProfile);
            Alert.alert('Profile Deactivated', 'Your profile has been deactivated.');
        } catch (error) {
            Alert.alert('Error', 'Failed to deactivate profile');
        }
    };

    const resetAllData = async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USER_PROFILE,
                STORAGE_KEYS.SOCIAL_LINKS,
                STORAGE_KEYS.ACTIVITIES
            ]);

            setUser(defaultProfile);
            setEditedUser(defaultProfile);
            setSocialLinks([]);
            setActivities([]);

            Alert.alert('Success', 'All data has been reset');
        } catch (error) {
            Alert.alert('Error', 'Failed to reset data');
        }
    };

    // SOCIAL LINKS CRUD OPERATIONS
    const createSocialLink = async () => {
        if (!newSocial.platform || !newSocial.url) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const newLink = {
                id: Date.now().toString(),
                ...newSocial,
                createdAt: new Date().toISOString()
            };

            const updatedLinks = [...socialLinks, newLink];
            await saveSocialLinks(updatedLinks);
            setSocialLinks(updatedLinks);

            setNewSocial({ platform: '', url: '', icon: 'link' });
            setIsSocialModalVisible(false);
            Alert.alert('Success', 'Social link added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add social link');
        }
    };

    const updateSocialLink = async () => {
        if (!newSocial.platform || !newSocial.url) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const updatedLinks = socialLinks.map(link =>
                link.id === editingSocial.id
                    ? { ...link, ...newSocial, updatedAt: new Date().toISOString() }
                    : link
            );

            await saveSocialLinks(updatedLinks);
            setSocialLinks(updatedLinks);

            setEditingSocial(null);
            setNewSocial({ platform: '', url: '', icon: 'link' });
            setIsSocialModalVisible(false);
            Alert.alert('Success', 'Social link updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update social link');
        }
    };

    const deleteSocialLink = async (id: string) => {
        try {
            const updatedLinks = socialLinks.filter(link => link.id !== id);
            await saveSocialLinks(updatedLinks);
            setSocialLinks(updatedLinks);
            Alert.alert('Success', 'Social link deleted successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete social link');
        }
    };

    // ACTIVITIES CRUD OPERATIONS
    const createActivity = async () => {
        if (!newActivity.description) {
            Alert.alert('Error', 'Please enter activity description');
            return;
        }

        try {
            const activity = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                ...newActivity
            };

            const updatedActivities = [activity, ...activities];
            await saveActivities(updatedActivities);
            setActivities(updatedActivities);

            setNewActivity({ type: '', description: '', icon: 'activity', color: '#60a5fa' });
            setIsActivityModalVisible(false);
            Alert.alert('Success', 'Activity added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add activity');
        }
    };

    const updateActivity = async () => {
        if (!newActivity.description) {
            Alert.alert('Error', 'Please enter activity description');
            return;
        }

        try {
            const updatedActivities = activities.map(activity =>
                activity.id === editingActivity.id
                    ? { ...activity, ...newActivity, updatedAt: new Date().toISOString() }
                    : activity
            );

            await saveActivities(updatedActivities);
            setActivities(updatedActivities);

            setEditingActivity(null);
            setNewActivity({ type: '', description: '', icon: 'activity', color: '#60a5fa' });
            setIsActivityModalVisible(false);
            Alert.alert('Success', 'Activity updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update activity');
        }
    };

    const deleteActivity = async (id) => {
        try {
            const updatedActivities = activities.filter(activity => activity.id !== id);
            await saveActivities(updatedActivities);
            setActivities(updatedActivities);
            Alert.alert('Success', 'Activity deleted successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete activity');
        }
    };

    // UTILITY FUNCTIONS
    const isProfileEmpty = () => {
        return !user.name && !user.username && !user.bio && !user.email && !user.phone;
    };

    // Image picker function
    const pickImage = async (source) => {
        let result;

        if (source === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera permissions to make this work!');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        }

        if (!result.canceled) {
            setEditedUser({ ...editedUser, avatar: result.assets[0].uri });
        }
        setIsImagePickerVisible(false);
    };

    const handleEditProfile = () => {
        setEditedUser({ ...user });
        setIsEditMode(true);
    };

    const handleSaveProfile = () => {
        if (user.id === defaultProfile.id && isProfileEmpty()) {
            createProfile(editedUser);
        } else {
            updateProfile(editedUser);
        }
        setIsEditMode(false);
    };

    const handleCancelEdit = () => {
        setEditedUser({ ...user });
        setIsEditMode(false);
    };

    const openSocialModal = (social = null) => {
        if (social) {
            setEditingSocial(social);
            setNewSocial({ ...social });
        } else {
            setEditingSocial(null);
            setNewSocial({ platform: '', url: '', icon: 'link' });
        }
        setIsSocialModalVisible(true);
    };

    const openActivityModal = (activity = null) => {
        if (activity) {
            setEditingActivity(activity);
            setNewActivity({ ...activity });
        } else {
            setEditingActivity(null);
            setNewActivity({ type: '', description: '', icon: 'activity', color: '#60a5fa' });
        }
        setIsActivityModalVisible(true);
    };

    const confirmDelete = (type, id) => {
        setDeleteTarget({ type, id });
        setIsDeleteConfirmVisible(true);
    };

    const executeDelete = () => {
        if (deleteTarget.type === 'social') {
            deleteSocialLink(deleteTarget.id);
        } else if (deleteTarget.type === 'activity') {
            deleteActivity(deleteTarget.id);
        } else if (deleteTarget.type === 'profile') {
            deleteProfile();
        }
        setIsDeleteConfirmVisible(false);
        setDeleteTarget({ type: '', id: '' });
    };

    const renderEditableField = (field, value, placeholder, multiline = false) => (
        <View style={styles.editFieldContainer}>
            <Text style={styles.editFieldLabel}>{field}</Text>
            <TextInput
                style={[styles.editInput, multiline && styles.multilineInput]}
                value={value}
                onChangeText={(text) => setEditedUser({ ...editedUser, [field.toLowerCase()]: text })}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                multiline={multiline}
            />
        </View>
    );

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <MaterialIcons name="account-circle" size={100} color="#64748b" />
                    <Text style={styles.loadingText}>Loading Profile...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Modal Components (keeping the same as before)
    const ImagePickerModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isImagePickerVisible}
            onRequestClose={() => setIsImagePickerVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Profile Picture</Text>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => pickImage('camera')}
                    >
                        <Feather name="camera" size={24} color="#a855f7" />
                        <Text style={styles.modalOptionText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => pickImage('gallery')}
                    >
                        <Feather name="image" size={24} color="#a855f7" />
                        <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setIsImagePickerVisible(false)}
                    >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const SocialLinksModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isSocialModalVisible}
            onRequestClose={() => setIsSocialModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {editingSocial ? 'Edit Social Link' : 'Add Social Link'}
                    </Text>

                    <TextInput
                        style={styles.editInput}
                        value={newSocial.platform}
                        onChangeText={(text) => setNewSocial({ ...newSocial, platform: text })}
                        placeholder="Platform name (e.g., GitHub)"
                        placeholderTextColor="#94a3b8"
                    />

                    <TextInput
                        style={[styles.editInput, { marginTop: 10 }]}
                        value={newSocial.url}
                        onChangeText={(text) => setNewSocial({ ...newSocial, url: text })}
                        placeholder="URL (e.g., https://github.com/username)"
                        placeholderTextColor="#94a3b8"
                    />

                    <Text style={styles.modalSubTitle}>Select Icon:</Text>
                    <View style={styles.iconGrid}>
                        {socialIcons.map((iconData) => (
                            <TouchableOpacity
                                key={iconData.name}
                                style={[
                                    styles.iconOption,
                                    newSocial.icon === iconData.name && styles.iconOptionSelected
                                ]}
                                onPress={() => setNewSocial({ ...newSocial, icon: iconData.name })}
                            >
                                <AntDesign name={iconData.name} size={24} color="#e2e8f0" />
                                <Text style={styles.iconLabel}>{iconData.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.saveButton]}
                            onPress={editingSocial ? updateSocialLink : createSocialLink}
                        >
                            <Text style={styles.primaryButtonText}>
                                {editingSocial ? 'Update' : 'Add'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.cancelButton]}
                            onPress={() => {
                                setIsSocialModalVisible(false);
                                setEditingSocial(null);
                                setNewSocial({ platform: '', url: '', icon: 'link' });
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const ActivityModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isActivityModalVisible}
            onRequestClose={() => setIsActivityModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {editingActivity ? 'Edit Activity' : 'Add Activity'}
                    </Text>

                    <TextInput
                        style={[styles.editInput, styles.multilineInput]}
                        value={newActivity.description}
                        onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
                        placeholder="Activity description..."
                        placeholderTextColor="#94a3b8"
                        multiline={true}
                    />

                    <Text style={styles.modalSubTitle}>Select Activity Type:</Text>
                    <View style={styles.iconGrid}>
                        {activityTypes.map((type) => (
                            <TouchableOpacity
                                key={type.icon}
                                style={[
                                    styles.iconOption,
                                    newActivity.icon === type.icon && styles.iconOptionSelected
                                ]}
                                onPress={() => setNewActivity({
                                    ...newActivity,
                                    icon: type.icon,
                                    color: type.color,
                                    type: type.label.toLowerCase()
                                })}
                            >
                                <Feather name={type.icon} size={24} color={type.color} />
                                <Text style={styles.iconLabel}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.saveButton]}
                            onPress={editingActivity ? updateActivity : createActivity}
                        >
                            <Text style={styles.primaryButtonText}>
                                {editingActivity ? 'Update' : 'Add'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.cancelButton]}
                            onPress={() => {
                                setIsActivityModalVisible(false);
                                setEditingActivity(null);
                                setNewActivity({ type: '', description: '', icon: 'activity', color: '#60a5fa' });
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const DeleteConfirmModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isDeleteConfirmVisible}
            onRequestClose={() => setIsDeleteConfirmVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.deleteModalContent]}>
                    <MaterialIcons name="warning" size={48} color="#ef4444" />
                    <Text style={styles.deleteModalTitle}>Confirm Delete</Text>
                    <Text style={styles.deleteModalText}>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </Text>
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.deleteConfirmButton]}
                            onPress={executeDelete}
                        >
                            <Text style={styles.primaryButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalActionButton, styles.cancelButton]}
                            onPress={() => setIsDeleteConfirmVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Deactivated profile state
    if (!user.isActive) {
        return (
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.container}>
                <View style={styles.deactivatedContainer}>
                    <MaterialIcons name="account-circle" size={100} color="#64748b" />
                    <Text style={styles.deactivatedTitle}>Profile Deactivated</Text>
                    <Text style={styles.deactivatedText}>This profile has been deactivated.</Text>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton, { marginTop: 20 }]}
                        onPress={() => {
                            const reactivatedProfile = { ...user, isActive: true };
                            updateProfile(reactivatedProfile);
                        }}
                    >
                        <Text style={styles.primaryButtonText}>Reactivate Profile</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: isEditMode ? editedUser.avatar : user.avatar }}
                            style={styles.avatar}
                        />
                        {isEditMode && (
                            <TouchableOpacity
                                style={styles.editAvatarButton}
                                onPress={() => setIsImagePickerVisible(true)}
                            >
                                <Feather name="camera" size={16} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditMode ? (
                        <View style={styles.editContainer}>
                            {renderEditableField('Name', editedUser.name, 'Enter your name')}
                            {renderEditableField('Username', editedUser.username, 'Enter username')}
                            {renderEditableField('Location', editedUser.location, 'Enter your location')}
                            {renderEditableField('Email', editedUser.email, 'Enter your email')}
                            {renderEditableField('Phone', editedUser.phone, 'Enter your phone')}
                        </View>
                    ) : (
                        <>
                            <Text style={styles.name}>{user.name || 'No Name Set'}</Text>
                            <Text style={styles.username}>{user.username || 'No Username Set'}</Text>
                            <View style={styles.locationContainer}>
                                <Feather name="map-pin" size={16} color="#94a3b8" />
                                <Text style={styles.locationText}>{user.location || 'No Location Set'}</Text>
                            </View>
                            <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
                        </>
                    )}
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.followers}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.following}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.posts}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                </View>

                {/* Bio Section */}
                <View style={styles.bioContainer}>
                    <Text style={styles.bioTitle}>About Me</Text>
                    {isEditMode ? (
                        renderEditableField('Bio', editedUser.bio, 'Tell us about yourself...', true)
                    ) : (
                        <Text style={styles.bioText}>{user.bio || 'No bio added yet.'}</Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {isEditMode ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.primaryButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryButton]}
                                onPress={handleEditProfile}
                            >
                                <Text style={styles.primaryButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => confirmDelete('profile', user.id)}
                            >
                                <MaterialIcons name="delete" size={20} color="#ef4444" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    Alert.alert(
                                        'Reset All Data',
                                        'This will delete all profile data, social links, and activities. Continue?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Reset All', style: 'destructive', onPress: resetAllData }
                                        ]
                                    );
                                }}
                            >
                                <MaterialIcons name="refresh" size={20} color="#f59e0b" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Social Links */}
                {!isEditMode && (
                    <View style={styles.socialContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Social Links ({socialLinks.length})</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => openSocialModal()}
                            >
                                <Feather name="plus" size={16} color="#a855f7" />
                            </TouchableOpacity>
                        </View>
                        {socialLinks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="link-off" size={48} color="#64748b" />
                                <Text style={styles.emptyStateText}>No social links added yet</Text>
                                <Text style={styles.emptyStateSubtext}>Tap the + button to add your first social link</Text>
                            </View>
                        ) : (
                            socialLinks.map((social) => (
                                <View key={social.id} style={styles.socialItem}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <AntDesign name={social.icon} size={24} color="#e2e8f0" />
                                        <View style={styles.socialTextContainer}>
                                            <Text style={styles.socialText}>{social.platform}</Text>
                                            <Text style={styles.socialUrl} numberOfLines={1}>{social.url}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.itemActions}>
                                        <TouchableOpacity
                                            style={styles.editItemButton}
                                            onPress={() => openSocialModal(social)}
                                        >
                                            <Feather name="edit-2" size={16} color="#10b981" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteItemButton}
                                            onPress={() => confirmDelete('social', social.id)}
                                        >
                                            <Feather name="trash-2" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* Recent Activity */}
                {!isEditMode && (
                    <View style={styles.recentActivity}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Activity ({activities.length})</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => openActivityModal()}
                            >
                                <Feather name="plus" size={16} color="#a855f7" />
                            </TouchableOpacity>
                        </View>
                        {activities.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="history" size={48} color="#64748b" />
                                <Text style={styles.emptyStateText}>No activities recorded yet</Text>
                                <Text style={styles.emptyStateSubtext}>Tap the + button to add your first activity</Text>
                            </View>
                        ) : (
                            activities.slice(0, 10).map((activity) => (
                                <View key={activity.id} style={styles.activityItem}>
                                    <View style={styles.activityCard}>
                                        <Feather name={activity.icon} size={20} color={activity.color} />
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityText}>{activity.description}</Text>
                                            <Text style={styles.activityDate}>{activity.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemActions}>
                                        <TouchableOpacity
                                            style={styles.editItemButton}
                                            onPress={() => openActivityModal(activity)}
                                        >
                                            <Feather name="edit-2" size={16} color="#10b981" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteItemButton}
                                            onPress={() => confirmDelete('activity', activity.id)}
                                        >
                                            <Feather name="trash-2" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                        {activities.length > 10 && (
                            <TouchableOpacity style={styles.viewMoreButton}>
                                <Text style={styles.viewMoreText}>View More Activities</Text>
                                <Feather name="chevron-down" size={16} color="#a855f7" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Data Export/Import Section - Development Tools */}
                {__DEV__ && (
                    <View style={styles.devToolsContainer}>
                        <Text style={styles.sectionTitle}>Developer Tools</Text>
                        <View style={styles.devButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.devButton, styles.exportButton]}
                                onPress={async () => {
                                    try {
                                        const exportData = {
                                            profile: user,
                                            socialLinks: socialLinks,
                                            activities: activities,
                                            exportDate: new Date().toISOString()
                                        };
                                        console.log('Export Data:', JSON.stringify(exportData, null, 2));
                                        Alert.alert('Success', 'Data exported to console');
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to export data');
                                    }
                                }}
                            >
                                <Feather name="download" size={16} color="#10b981" />
                                <Text style={styles.devButtonText}>Export Data</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.devButton, styles.importButton]}
                                onPress={() => {
                                    Alert.alert(
                                        'Import Sample Data',
                                        'This will replace current data with sample data. Continue?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Import',
                                                onPress: async () => {
                                                    const sampleData = {
                                                        profile: {
                                                            ...defaultProfile,
                                                            id: Date.now().toString(),
                                                            name: 'John Doe',
                                                            username: '@johndoe',
                                                            location: 'New York, USA',
                                                            bio: 'Software developer passionate about mobile apps and clean code.',
                                                            followers: '1.2K',
                                                            following: '500',
                                                            posts: '85',
                                                            email: 'john@example.com',
                                                            phone: '+1 555 123 4567'
                                                        },
                                                        socialLinks: [
                                                            {
                                                                id: '1',
                                                                platform: 'GitHub',
                                                                url: 'https://github.com/johndoe',
                                                                icon: 'github'
                                                            },
                                                            {
                                                                id: '2',
                                                                platform: 'LinkedIn',
                                                                url: 'https://linkedin.com/in/johndoe',
                                                                icon: 'linkedin-square'
                                                            }
                                                        ],
                                                        activities: [
                                                            {
                                                                id: '1',
                                                                type: 'code',
                                                                description: 'Released a new React Native component library',
                                                                date: new Date().toISOString().split('T')[0],
                                                                icon: 'code',
                                                                color: '#60a5fa'
                                                            },
                                                            {
                                                                id: '2',
                                                                type: 'star',
                                                                description: 'Starred an interesting machine learning repository',
                                                                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                                                                icon: 'star',
                                                                color: '#8b5cf6'
                                                            }
                                                        ]
                                                    };

                                                    try {
                                                        await saveUserProfile(sampleData.profile);
                                                        await saveSocialLinks(sampleData.socialLinks);
                                                        await saveActivities(sampleData.activities);

                                                        setUser(sampleData.profile);
                                                        setEditedUser(sampleData.profile);
                                                        setSocialLinks(sampleData.socialLinks);
                                                        setActivities(sampleData.activities);

                                                        Alert.alert('Success', 'Sample data imported successfully!');
                                                    } catch (error) {
                                                        Alert.alert('Error', 'Failed to import sample data');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Feather name="upload" size={16} color="#f59e0b" />
                                <Text style={styles.devButtonText}>Import Sample</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Modals */}
            <ImagePickerModal />
            <SocialLinksModal />
            <ActivityModal />
            <DeleteConfirmModal />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#94a3b8',
        marginTop: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#a855f7',
        position: 'relative',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#a855f7',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 5,
    },
    username: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 5,
    },
    locationText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    joinDate: {
        fontSize: 12,
        color: '#64748b',
        fontStyle: 'italic',
    },
    editContainer: {
        width: '100%',
        marginTop: 10,
    },
    editFieldContainer: {
        marginBottom: 15,
    },
    editFieldLabel: {
        fontSize: 14,
        color: '#e2e8f0',
        marginBottom: 5,
        fontWeight: '600',
    },
    editInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#e2e8f0',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        paddingVertical: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e8f0',
    },
    statLabel: {
        fontSize: 14,
        color: '#94a3b8',
    },
    bioContainer: {
        width: '100%',
        marginBottom: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    bioTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 10,
    },
    bioText: {
        fontSize: 16,
        color: '#cbd5e1',
        lineHeight: 22,
    },
    actionsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    actionButton: {
        padding: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#a855f7',
    },
    saveButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#10b981',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ef4444',
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Section styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e8f0',
    },
    addButton: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#a855f7',
    },
    // Empty state styles
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 15,
        marginBottom: 5,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Social links styles
    socialContainer: {
        width: '100%',
        marginBottom: 30,
    },
    socialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        gap: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flex: 1,
        marginRight: 10,
    },
    socialTextContainer: {
        flex: 1,
    },
    socialText: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '600',
    },
    socialUrl: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 5,
    },
    editItemButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    deleteItemButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    // Activity styles
    recentActivity: {
        width: '100%',
        marginBottom: 30,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 15,
        gap: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flex: 1,
        marginRight: 10,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        color: '#cbd5e1',
        fontSize: 16,
        marginBottom: 5,
    },
    activityDate: {
        color: '#64748b',
        fontSize: 12,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        paddingVertical: 12,
        borderRadius: 15,
        marginTop: 10,
        gap: 8,
    },
    viewMoreText: {
        color: '#a855f7',
        fontSize: 14,
        fontWeight: '600',
    },
    // Development tools styles
    devToolsContainer: {
        width: '100%',
        marginTop: 20,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    devButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 10,
    },
    devButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    exportButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    importButton: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    devButtonText: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e8f0',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalSubTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e2e8f0',
        marginTop: 15,
        marginBottom: 10,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        gap: 15,
    },
    modalOptionText: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalActionButton: {
        flex: 1,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    iconOption: {
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 10,
        width: '30%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconOptionSelected: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: '#a855f7',
    },
    iconLabel: {
        color: '#e2e8f0',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    // Delete confirmation modal
    deleteModalContent: {
        alignItems: 'center',
    },
    deleteModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ef4444',
        marginTop: 15,
        marginBottom: 10,
    },
    deleteModalText: {
        fontSize: 16,
        color: '#cbd5e1',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    deleteConfirmButton: {
        backgroundColor: '#ef4444',
    },
    // Deactivated profile styles
    deactivatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    deactivatedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#64748b',
        marginTop: 20,
        marginBottom: 10,
    },
    deactivatedText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default ProfileScreen