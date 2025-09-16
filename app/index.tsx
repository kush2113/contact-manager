import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Animated,
} from "react-native";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    const user = { email: "user@example.com" };

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push("/login");
        }, 2000);
    };

    return (
        <View style={styles.container}>
            {/* Background circles */}
            <View style={[styles.circle, styles.circleBlue]} />
            <View style={[styles.circle, styles.circlePink]} />

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>Welcome Home!</Text>
                <View style={styles.divider} />
                <Text style={styles.subtitle}>
                    Hello <Text style={styles.username}>{user.email}</Text>, ready to
                    embark on your journey?
                </Text>

                {/* Get Started button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleGetStarted}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Get Started ✨</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* Loading overlay */}
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.overlayBox}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.overlayText}>Preparing your login...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
    },
    circle: {
        position: "absolute",
        borderRadius: 9999,
        opacity: 0.15,
    },
    circleBlue: {
        width: 200,
        height: 200,
        backgroundColor: "#3B82F6",
        top: -80,
        right: -80,
    },
    circlePink: {
        width: 150,
        height: 150,
        backgroundColor: "#EC4899",
        bottom: -60,
        left: -60,
    },
    content: {
        width: width * 0.85,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 8,
    },
    divider: {
        width: 60,
        height: 4,
        backgroundColor: "#3B82F6",
        borderRadius: 2,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: "#4B5563",
        textAlign: "center",
        marginBottom: 20,
    },
    username: {
        color: "#2563EB",
        fontWeight: "600",
    },
    button: {
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        marginTop: 12,
        shadowColor: "#3B82F6",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonDisabled: {
        backgroundColor: "#93C5FD",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 18,
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    overlayBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
    },
    overlayText: {
        marginTop: 10,
        fontSize: 16,
        color: "#374151",
    },
});
