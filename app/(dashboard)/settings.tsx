import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    SafeAreaView,
    Alert,
    StatusBar,
    Animated,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SettingScreen = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [autoSync, setAutoSync] = useState(true);

    const toggleDarkMode = () => {
        setIsDarkMode(previousState => !previousState);
        // You can implement theme change logic here
        Alert.alert('Theme Changed', `Switched to ${!isDarkMode ? 'Dark' : 'Light'} mode`);
    };

    const toggleNotifications = () => {
        setReceiveNotifications(previousState => !previousState);
        if (receiveNotifications) {
            Alert.alert(
                'Disable Notifications',
                'Are you sure you want to disable all notifications?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Disable', style: 'destructive', onPress: () => setReceiveNotifications(false) }
                ]
            );
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Add logout logic here
                        console.log('User logged out');
                        Alert.alert('Success', 'You have been logged out successfully');
                    }
                }
            ]
        );
    };

    const handleNavigation = (screen: string) => {
        Alert.alert('Navigation', `Navigate to ${screen}`, [
            { text: 'OK' }
        ]);
    };

    // Reusable component for a single setting item with enhanced styling
    const SettingItem = ({
                             title,
                             subtitle,
                             iconName,
                             iconColor,
                             onPress,
                             isSwitch,
                             switchValue,
                             onSwitchChange,
                             showBadge = false,
                             badgeText = '',
                             disabled = false
                         }: {

        title: string;
        subtitle?: string;
        iconName: string;
        iconColor: string;
        onPress?: () => void;
        isSwitch?: boolean;
        switchValue?: boolean;
        onSwitchChange?: (value: boolean) => void;
        showBadge?: boolean;
        badgeText?: string;
        disabled?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.settingItem, disabled && styles.disabledItem]}
            onPress={onPress}
            disabled={isSwitch || disabled}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Feather name={iconName} size={20} color={iconColor} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, disabled && styles.disabledText]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {showBadge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeText}</Text>
                </View>
            )}
            {isSwitch ? (
                <Switch
                    trackColor={{ false: "rgba(120, 120, 128, 0.16)", true: "#8b5cf6" }}
                    thumbColor={switchValue ? "#ffffff" : "#ffffff"}
                    ios_backgroundColor="rgba(120, 120, 128, 0.16)"
                    onValueChange={onSwitchChange}
                    value={switchValue}
                    style={styles.switch}
                />
            ) : (
                <MaterialIcons name="keyboard-arrow-right" size={24} color="#64748b" />
            )}
        </TouchableOpacity>
    );

    // Profile section component
    const ProfileSection = () => (
        <View style={styles.profileSection}>
            <LinearGradient
                colors={['#8b5cf6', '#ec4899']}
                style={styles.profileAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.profileAvatarText}>JD</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>John Doe</Text>
                <Text style={styles.profileEmail}>john.doe@example.com</Text>
                <Text style={styles.profileStatus}>Premium Member</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
                <Feather name="edit-2" size={16} color="#8b5cf6" />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#0f172a']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
                    </View>

                    {/* Profile Section */}
                    <ProfileSection />

                    {/* Account Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.settingsSection}>
                            <SettingItem
                                title="Edit Profile"
                                subtitle="Update your personal information"
                                iconName="user"
                                iconColor="#60a5fa"
                                onPress={() => handleNavigation('Edit Profile')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Change Password"
                                subtitle="Update your login credentials"
                                iconName="lock"
                                iconColor="#f87171"
                                onPress={() => handleNavigation('Change Password')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Privacy Settings"
                                subtitle="Control your data and privacy"
                                iconName="shield"
                                iconColor="#34d399"
                                onPress={() => handleNavigation('Privacy Settings')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Biometric Authentication"
                                subtitle="Use fingerprint or face unlock"
                                iconName="fingerprint"
                                iconColor="#fbbf24"
                                isSwitch={true}
                                switchValue={biometricEnabled}
                                onSwitchChange={setBiometricEnabled}
                            />
                        </View>
                    </View>

                    {/* Preferences Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <View style={styles.settingsSection}>
                            <SettingItem
                                title="Dark Mode"
                                subtitle="Use dark theme throughout the app"
                                iconName="moon"
                                iconColor="#fcd34d"
                                isSwitch={true}
                                switchValue={isDarkMode}
                                onSwitchChange={toggleDarkMode}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Push Notifications"
                                subtitle="Receive push notifications"
                                iconName="smartphone"
                                iconColor="#a855f7"
                                isSwitch={true}
                                switchValue={pushNotifications}
                                onSwitchChange={setPushNotifications}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Email Notifications"
                                subtitle="Receive notifications via email"
                                iconName="mail"
                                iconColor="#06b6d4"
                                isSwitch={true}
                                switchValue={emailNotifications}
                                onSwitchChange={setEmailNotifications}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Auto Sync"
                                subtitle="Automatically sync your data"
                                iconName="refresh-cw"
                                iconColor="#10b981"
                                isSwitch={true}
                                switchValue={autoSync}
                                onSwitchChange={setAutoSync}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Language"
                                subtitle="English (US)"
                                iconName="globe"
                                iconColor="#ef4444"
                                onPress={() => handleNavigation('Language Settings')}
                                showBadge={true}
                                badgeText="EN"
                            />
                        </View>
                    </View>

                    {/* Storage Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Storage & Data</Text>
                        <View style={styles.settingsSection}>
                            <SettingItem
                                title="Storage Usage"
                                subtitle="2.4 GB of 5 GB used"
                                iconName="hard-drive"
                                iconColor="#8b5cf6"
                                onPress={() => handleNavigation('Storage Details')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Clear Cache"
                                subtitle="Free up space by clearing cache"
                                iconName="trash-2"
                                iconColor="#f59e0b"
                                onPress={() => {
                                    Alert.alert(
                                        'Clear Cache',
                                        'This will clear temporary files. Continue?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') }
                                        ]
                                    );
                                }}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Export Data"
                                subtitle="Download your data as backup"
                                iconName="download"
                                iconColor="#06b6d4"
                                onPress={() => handleNavigation('Export Data')}
                            />
                        </View>
                    </View>

                    {/* Support Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Support & About</Text>
                        <View style={styles.settingsSection}>
                            <SettingItem
                                title="Help & Support"
                                subtitle="Get help and contact support"
                                iconName="help-circle"
                                iconColor="#60a5fa"
                                onPress={() => handleNavigation('Help & Support')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Send Feedback"
                                subtitle="Help us improve the app"
                                iconName="message-square"
                                iconColor="#a855f7"
                                onPress={() => handleNavigation('Send Feedback')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="Rate App"
                                subtitle="Rate us on the App Store"
                                iconName="star"
                                iconColor="#fbbf24"
                                onPress={() => handleNavigation('Rate App')}
                            />
                            <View style={styles.separator} />
                            <SettingItem
                                title="About App"
                                subtitle="Version 1.2.3 • Build 456"
                                iconName="info"
                                iconColor="#64748b"
                                onPress={() => handleNavigation('About App')}
                            />
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LinearGradient
                            colors={['rgba(248, 113, 129, 0.1)', 'rgba(248, 113, 129, 0.2)']}
                            style={styles.logoutButtonGradient}
                        >
                            <Feather name="log-out" size={20} color="#f87171" />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={styles.versionText}>ContactManager v1.2.3</Text>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
    },
    profileSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileAvatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 2,
    },
    profileStatus: {
        fontSize: 12,
        color: '#fbbf24',
        fontWeight: '500',
    },
    editProfileButton: {
        padding: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8b5cf6',
        marginBottom: 12,
        marginLeft: 4,
    },
    settingsSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    disabledItem: {
        opacity: 0.5,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#e2e8f0',
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 16,
    },
    disabledText: {
        color: '#64748b',
    },
    badge: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginLeft: 68,
    },
    logoutButton: {
        marginTop: 20,
        marginBottom: 20,
    },
    logoutButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 129, 0.3)',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f87171',
        marginLeft: 12,
    },
    versionText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 12,
        marginTop: 10,
    },
});

export default SettingScreen;