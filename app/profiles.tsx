import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Plus } from "lucide-react-native";
import { router } from "expo-router";
import ProfileCard from "./components/ProfileCard";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilesScreen() {
  const { user } = useAuth();
  
  // Mock data for now - later will fetch from Supabase
  const profiles = [
    {
      id: "1",
      name: "Sarah Johnson",
      relationship: "Partner",
      birthday: "2023-08-15",
      interests: ["Music", "Travel", "Cooking"],
    },
    {
      id: "2",
      name: "Michael Chen",
      relationship: "Friend",
      birthday: "2023-10-22",
      interests: ["Gaming", "Technology", "Movies"],
    },
  ];

  return (
    <LinearGradient
      colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4 mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-white/80 rounded-full"
            >
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-gray-800">
              All Profiles
            </Text>
            
            <TouchableOpacity
              onPress={() => console.log("Add new profile")}
              className="p-2 bg-white/80 rounded-full"
            >
              <Plus size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Profiles List */}
          <View className="mb-4">
            <Text className="text-lg text-gray-600 mb-4">
              {profiles.length} {profiles.length === 1 ? 'Person' : 'People'} in your list
            </Text>
            
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                relationship={profile.relationship}
                birthday={profile.birthday}
                onEdit={() => router.push(`/profile/edit/${profile.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}