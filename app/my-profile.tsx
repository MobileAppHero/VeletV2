import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Edit,
  Settings,
  LogOut,
  User,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../lib/database";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  birthday?: string;
  location?: string;
  photoUrl?: string;
}

export default function MyProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch profile data from Supabase
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        
        setProfile({
          id: user.id,
          email: user.email || "",
          name: userProfile?.name || "",
          birthday: userProfile?.birthday || "",
          location: userProfile?.location || "",
          photoUrl: userProfile?.photo_url || null,
        });
      }
    };

    loadProfile();
  }, [user]);

  const handleEdit = () => {
    router.push("/my-profile/edit");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/auth");
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <LinearGradient
        colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading profile...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 bg-white/80 rounded-full"
              >
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-gray-800">
                My Profile
              </Text>
              
              <TouchableOpacity
                onPress={handleEdit}
                className="p-2 bg-white/80 rounded-full"
              >
                <Edit size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Photo and Name */}
          <View className="items-center mb-8">
            <View className="relative">
              {profile.photoUrl ? (
                <Image
                  source={{ uri: profile.photoUrl }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-30 h-30 rounded-full bg-white/80 items-center justify-center">
                  <User size={50} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                onPress={handleEdit}
                className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full"
              >
                <Edit size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-3xl font-bold text-gray-800 mt-4">
              {profile.name || "Add Your Name"}
            </Text>
            <Text className="text-lg text-gray-600">Your Account</Text>
          </View>

          {/* Profile Information */}
          <View className="px-4">
            {/* Email */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Mail size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">Email</Text>
              </View>
              <Text className="text-gray-800 text-lg">{profile.email}</Text>
            </View>

            {/* Birthday */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">Birthday</Text>
              </View>
              <Text className="text-gray-800 text-lg">
                {profile.birthday
                  ? new Date(profile.birthday).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not set"}
              </Text>
            </View>

            {/* Location */}
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
              <View className="flex-row items-center mb-2">
                <MapPin size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">Location</Text>
              </View>
              <Text className="text-gray-800 text-lg">
                {profile.location || "Not set"}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className="bg-white rounded-2xl py-4 mb-3 shadow-sm"
              onPress={() => router.push("/settings")}
            >
              <View className="flex-row items-center justify-center">
                <Settings size={20} color="#374151" />
                <Text className="text-gray-800 font-medium text-lg ml-2">
                  Settings
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-500 rounded-2xl py-4 mb-8 shadow-sm"
              onPress={handleLogout}
            >
              <View className="flex-row items-center justify-center">
                <LogOut size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}