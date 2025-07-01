import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Gift, Calendar, User } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import ProfileCard from "./components/ProfileCard";
import SuggestionCardList from "./components/SuggestionCardList";
import OnboardingFlow from "./components/OnboardingFlow";

export default function HomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profiles, setProfiles] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      relationship: "Partner",
      birthday: "2023-08-15",
      interests: ["Music", "Travel", "Cooking"],
      favoriteFood: "Italian pasta",
      favoriteArtist: "Taylor Swift",
      splurgeOn: "Vintage vinyl records",
    },
    {
      id: "2",
      name: "Michael Chen",
      relationship: "Friend",
      birthday: "2023-10-22",
      interests: ["Gaming", "Technology", "Movies"],
      favoriteFood: "Sushi",
      favoriteArtist: "Kendrick Lamar",
      splurgeOn: "Latest tech gadgets",
    },
  ]);

  const upcomingBirthdays = profiles
    .sort((a, b) => {
      const dateA = new Date(a.birthday);
      const dateB = new Date(b.birthday);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 2);

  const handleAddPerson = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (newProfile) => {
    setProfiles([...profiles, { id: `${profiles.length + 1}`, ...newProfile }]);
    setShowOnboarding(false);
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
  };

  return (
    <LinearGradient
      colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        {showOnboarding ? (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onCancel={handleOnboardingCancel}
          />
        ) : (
          <ScrollView className="flex-1 px-4 pt-12">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-3xl font-bold text-gray-800">Valet</Text>
                <Text className="text-gray-600 text-base">
                  Your personal gift concierge
                </Text>
              </View>
              <Image
                source={require("../assets/images/icon.png")}
                style={{ width: 50, height: 50 }}
                contentFit="contain"
              />
            </View>

            {/* Profiles Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-gray-800">
                  Loved Ones
                </Text>
                <TouchableOpacity
                  onPress={handleAddPerson}
                  className="flex-row items-center bg-white px-3 py-1 rounded-full shadow-sm"
                >
                  <Plus size={16} color="#E45B5B" />
                  <Text className="ml-1 text-gray-800">Add Person</Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onEdit={() => console.log("Edit profile", profile.id)}
                  />
                ))}
              </View>
            </View>

            {/* Upcoming Birthdays */}
            <View className="mb-8">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Upcoming Birthdays
              </Text>
              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((profile) => (
                  <View
                    key={profile.id}
                    className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-pink-200 items-center justify-center mr-3">
                        <Text className="font-bold text-pink-800">
                          {profile.name.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-medium text-gray-800">
                          {profile.name}
                        </Text>
                        <Text className="text-gray-500">
                          {new Date(profile.birthday).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric" },
                          )}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity className="bg-pink-100 px-3 py-1 rounded-full">
                      <Text className="text-pink-800 font-medium">
                        Set Reminder
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View className="bg-white p-4 rounded-xl shadow-sm items-center">
                  <Text className="text-gray-500">No upcoming birthdays</Text>
                </View>
              )}
            </View>

            {/* Gift Suggestions */}
            <View className="mb-8">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Gift Suggestions
              </Text>
              <SuggestionCardList
                profileId={profiles.length > 0 ? profiles[0].id : null}
                onSelectSuggestion={(suggestion) =>
                  console.log("Selected suggestion", suggestion)
                }
              />
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row justify-around mb-8 bg-white rounded-2xl p-4 shadow-sm">
              <TouchableOpacity className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-1">
                  <User size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-800">Profiles</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-1">
                  <Gift size={24} color="#10B981" />
                </View>
                <Text className="text-gray-800">Gifts</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center">
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-1">
                  <Calendar size={24} color="#8B5CF6" />
                </View>
                <Text className="text-gray-800">Birthdays</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
