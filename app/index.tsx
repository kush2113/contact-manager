import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const GetStarted = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/home");
      }
      // Otherwise stay on this screen or navigate to login
    }
  }, [user, loading]);

  if (loading) {
    return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
    );
  }

  return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-3xl font-bold mb-6 text-center">
          Welcome to MyApp
        </Text>
        <Text className="text-center text-gray-600 mb-8">
          Get started by logging in or creating a new account.
        </Text>

        <TouchableOpacity
            className="bg-blue-500 rounded-lg py-3 px-8 mb-4"
            onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-white text-center font-semibold">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
            className="bg-gray-200 rounded-lg py-3 px-8"
            onPress={() => router.push("/(auth)/signup")}
        >
          <Text className="text-black text-center font-semibold">
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
  );
};

export default GetStarted;
