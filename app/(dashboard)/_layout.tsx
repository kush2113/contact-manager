import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// Define the tab configuration with more details for better design
const tabs = [
    { label: "Home", name: "home", icon: "home-filled" },
    { label: "Contacts", name: "contact", icon: "contacts" },
    { label: "Profile", name: "profile", icon: "person" },
    { label: "Settings", name: "settings", icon: "settings" },
] as const;

// Custom Tab Bar Component to apply a custom design
const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.tabBarContainer}>
            <LinearGradient
                colors={['#1f2937', '#111827']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabBarGradient}
            >
                <View style={styles.tabBarInner}>
                    {state.routes.map((route: { key: string | number; name: string; }, index: React.Key | null | undefined) => {
                        const { options } = descriptors[route.key];
                        const label = options.title !== undefined ? options.title : route.name;
                        const isFocused = state.index === index;

                        const tabConfig = tabs.find(tab => tab.name === route.name);
                        const iconName = tabConfig ? tabConfig.icon : 'help'; // Default icon

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        return (
                            <TouchableOpacity
                                key={index}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={styles.tabButton}
                            >
                                <MaterialIcons
                                    name={iconName}
                                    size={isFocused ? 28 : 24} // Larger icon for active tab
                                    color={isFocused ? '#a855f7' : '#6b7280'}
                                    style={isFocused && styles.activeIconShadow}
                                />
                                <Text style={[
                                    styles.tabLabel,
                                    isFocused ? styles.activeTabLabel : styles.inactiveTabLabel
                                ]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </LinearGradient>
        </View>
    );
};

const DashboardLayout = () => {
    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            {tabs.map(({ name, label }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title: label,
                    }}
                />
            ))}
        </Tabs>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15, // For Android shadow
    },
    tabBarGradient: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabBarInner: {
        flexDirection: 'row',
        height: '100%',
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: '#a855f7',
    },
    inactiveTabLabel: {
        color: '#6b7280',
    },
    activeIconShadow: {
        textShadowColor: '#a855f7',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});

export default DashboardLayout;