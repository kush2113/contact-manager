import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Animated,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '@/services/authService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleLogin = async () => {
        // Reset errors
        setEmailError('');
        setPasswordError('');

        // Validation
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (isLoading) return;

        animateButton();
        setIsLoading(true);

        try {
            await login(email, password);
            console.log('Login successful');
            router.push('/home');
        } catch (err) {
            console.error(err);
            Alert.alert('Login Failed', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Background Elements */}
                    <View style={styles.backgroundElements}>
                        <Animated.View
                            style={[
                                styles.backgroundCircle,
                                styles.circle1,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: pulseAnim }]
                                }
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.backgroundCircle,
                                styles.circle2,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: scaleAnim }]
                                }
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.backgroundCircle,
                                styles.circle3,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: pulseAnim }]
                                }
                            ]}
                        />
                    </View>

                    <View style={styles.content}>
                        <Animated.View
                            style={[
                                styles.loginCard,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ]
                                }
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <Animated.View
                                    style={[
                                        styles.iconContainer,
                                        { transform: [{ scale: pulseAnim }] }
                                    ]}
                                >
                                    <Icon name="check-circle" size={32} color="#fff" />
                                </Animated.View>
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subtitle}>Sign in to your Task Manager account</Text>
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[
                                    styles.inputContainer,
                                    emailError ? styles.inputError : styles.inputNormal
                                ]}>
                                    <Icon name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#9CA3AF"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (emailError) setEmailError('');
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                {emailError ? (
                                    <Animated.Text
                                        style={[styles.errorText, { opacity: fadeAnim }]}
                                    >
                                        {emailError}
                                    </Animated.Text>
                                ) : null}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    passwordError ? styles.inputError : styles.inputNormal
                                ]}>
                                    <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Icon
                                            name={showPassword ? "visibility-off" : "visibility"}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {passwordError ? (
                                    <Animated.Text
                                        style={[styles.errorText, { opacity: fadeAnim }]}
                                    >
                                        {passwordError}
                                    </Animated.Text>
                                ) : null}
                            </View>

                            {/* Login Button */}
                            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                                <TouchableOpacity
                                    style={[
                                        styles.loginButton,
                                        isLoading && styles.loginButtonDisabled
                                    ]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator color="#fff" size="small" />
                                            <Text style={styles.loadingText}>Signing in...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.loginButtonText}>Sign In</Text>
                                            <Icon name="arrow-forward" size={20} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Register Link */}
                            <Pressable
                                onPress={() => router.push('/register')}
                                style={styles.registerLink}
                            >
                                <Text style={styles.registerText}>
                                    Don't have an account? <Text style={styles.registerTextBold}>Register here</Text>
                                </Text>
                            </Pressable>

                            {/* Decorative Elements */}
                            <Animated.View
                                style={[
                                    styles.decorativeElement1,
                                    { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.decorativeElement2,
                                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                                ]}
                            />
                        </Animated.View>
                    </View>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                            <View style={styles.overlayContent}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.overlayText}>Authenticating...</Text>
                            </View>
                        </Animated.View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    keyboardView: {
        flex: 1,
    },
    backgroundElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundCircle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circle1: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        top: -width * 0.4,
        right: -width * 0.2,
    },
    circle2: {
        width: width * 0.9,
        height: width * 0.9,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        bottom: -width * 0.4,
        left: -width * 0.2,
    },
    circle3: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        top: height * 0.15,
        left: width * 0.05,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
    },
    loginCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(249, 250, 251, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputNormal: {
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: 'rgba(254, 242, 242, 0.8)',
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 24,
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    loginButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    registerLink: {
        alignItems: 'center',
    },
    registerText: {
        color: '#3B82F6',
        fontSize: 16,
    },
    registerTextBold: {
        fontWeight: '600',
    },
    decorativeElement1: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    decorativeElement2: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    overlayContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    overlayText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
    },
});

export default Login