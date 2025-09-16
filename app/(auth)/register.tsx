import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    Alert,
    ActivityIndicator,
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { register } from "@/services/authService"

const Register = () => {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [isLodingReg, setIsLoadingReg] = useState<boolean>(false)

    const handleRegister = async () => {
        // Basic validation
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.")
            return
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.")
            return
        }

        if (isLodingReg) return

        setIsLoadingReg(true)

        await register(email, password)
            .then((res) => {
                console.log(res)
                Alert.alert("Success", "Registration successful. Please log in.")
                router.back()
            })
            .catch((err) => {
                console.error(err)
                Alert.alert("Registration Failed", "Something went wrong.")
            })
            .finally(() => {
                setIsLoadingReg(false)
            })
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center p-6">
            <View className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <Text className="text-3xl font-bold mb-8 text-blue-600 dark:text-blue-400 text-center">
                    Create an Account
                </Text>
                <TextInput
                    placeholder="Email"
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    placeholder="Password"
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    placeholder="Confirm Password"
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-6 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg mt-2 mb-4 shadow-md disabled:bg-blue-400"
                    onPress={handleRegister}
                    disabled={isLodingReg}
                >
                    {isLodingReg ? (
                        <ActivityIndicator color="#fff" size="large" />
                    ) : (
                        <Text className="text-center text-lg font-semibold text-white">
                            Register
                        </Text>
                    )}
                </TouchableOpacity>
                <Pressable onPress={() => router.back()}>
                    <Text className="text-center text-blue-500 dark:text-blue-400 text-base underline mt-2">
                        Already have an account? Login
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

export default Register