import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { Image } from "expo-image";
import { Mail, Lock, User } from "lucide-react-native";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert(
          "Success",
          "Account created! Please check your email to verify your account."
        );
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 justify-center">
              {/* Logo and Title */}
              <View className="items-center mb-12">
                <Image
                  source={require("../assets/images/icon.png")}
                  style={{ width: 100, height: 100 }}
                  contentFit="contain"
                />
                <Text className="text-4xl font-bold text-gray-800 mt-4">
                  Valet
                </Text>
                <Text className="text-gray-600 text-lg mt-2">
                  Your personal gift concierge
                </Text>
              </View>

              {/* Auth Form */}
              <View className="bg-white/90 rounded-3xl p-6 shadow-xl">
                <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </Text>

                {/* Name Input (Sign Up only) */}
                {isSignUp && (
                  <View className="mb-4">
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                      <User size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 ml-3 text-gray-800 text-base"
                        placeholder="Full Name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                {/* Email Input */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <Mail size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 text-base"
                      placeholder="Email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <Lock size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 text-base"
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={loading}
                  className="bg-pink-500 rounded-xl py-4 mb-4"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      {isSignUp ? "Sign Up" : "Sign In"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Toggle Auth Mode */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsSignUp(!isSignUp);
                      setEmail("");
                      setPassword("");
                      setName("");
                    }}
                    disabled={loading}
                  >
                    <Text className="text-pink-500 font-semibold ml-2">
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Privacy */}
              {isSignUp && (
                <Text className="text-center text-gray-500 text-xs mt-6 px-8">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}