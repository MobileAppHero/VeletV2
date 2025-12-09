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
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Heart,
  Music,
  Utensils,
  DollarSign,
  Gift,
  User,
} from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";

interface Profile {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  interests: string[];
  favoriteFood: string;
  favoriteArtist: string;
  splurgeOn: string;
  photoUrl?: string;
  userId?: string;
}

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // For now, we'll use mock data
    // Later this will fetch from Supabase
    const mockProfile: Profile = {
      id: id as string,
      name: "Sarah Johnson",
      relationship: "Partner",
      birthday: "2023-08-15",
      interests: ["Music", "Travel", "Cooking"],
      favoriteFood: "Italian pasta",
      favoriteArtist: "Taylor Swift",
      splurgeOn: "Vintage vinyl records",
      photoUrl: null,
      userId: user?.id,
    };
    setProfile(mockProfile);
  }, [id, user]);

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

  // Users can only see/edit profiles they created, not their own user profile
  // This is for profiles of OTHER people (friends, family) that the user tracks
  const isCreatedByUser = profile.userId === user?.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEdit = () => {
    if (isCreatedByUser) {
      router.push(`/profile/edit/${profile.id}`);
    }
  };

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
              
              {isCreatedByUser && (
                <TouchableOpacity
                  onPress={handleEdit}
                  className="p-2 bg-white/80 rounded-full"
                >
                  <Edit size={24} color="#374151" />
                </TouchableOpacity>
              )}
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
            </View>
            
            <Text className="text-3xl font-bold text-gray-800 mt-4">
              {profile.name}
            </Text>
            <Text className="text-lg text-gray-600">{profile.relationship}</Text>
          </View>

          {/* Profile Details */}
          <View className="px-4">
            {/* Birthday */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">Birthday</Text>
              </View>
              <Text className="text-gray-800 text-lg">
                {formatDate(profile.birthday)}
              </Text>
            </View>

            {/* Interests */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Heart size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">Interests</Text>
              </View>
              <View className="flex-row flex-wrap">
                {profile.interests.map((interest, index) => (
                  <View
                    key={index}
                    className="bg-pink-100 px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-pink-800">{interest}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Favorite Food */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Utensils size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">
                  Favorite Food
                </Text>
              </View>
              <Text className="text-gray-800 text-lg">{profile.favoriteFood}</Text>
            </View>

            {/* Favorite Artist */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Music size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">
                  Favorite Artist
                </Text>
              </View>
              <Text className="text-gray-800 text-lg">
                {profile.favoriteArtist}
              </Text>
            </View>

            {/* Splurge On */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <DollarSign size={20} color="#E45B5B" />
                <Text className="ml-2 text-gray-600 font-medium">
                  Loves to Splurge On
                </Text>
              </View>
              <Text className="text-gray-800 text-lg">{profile.splurgeOn}</Text>
            </View>

            {/* Gift Ideas Button */}
            <TouchableOpacity
              className="bg-pink-500 rounded-2xl py-4 mb-8 shadow-sm"
              onPress={() => Alert.alert("Coming Soon", "Gift suggestions feature coming soon!")}
            >
              <View className="flex-row items-center justify-center">
                <Gift size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Get Gift Ideas
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}