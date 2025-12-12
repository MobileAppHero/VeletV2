import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
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
  RefreshCw,
  MoreHorizontal,
  Music,
  Shirt,
  ShoppingBag,
  FileText,
  Gift,
  DollarSign,
  ExternalLink,
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
  interests?: string[];
  places?: Array<{ name: string; note: string }>;
  notes?: Array<{ title: string; content: string }>;
  dates?: Array<{ name: string; date: string; recurring: boolean }>;
  sizes?: {
    shoes?: string;
    tops?: string;
    bottoms?: string;
    dresses?: string;
  };
  giftIdeas?: Array<{ title: string; description?: string; link?: string; price?: string }>;
}

export default function MyProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Reload profile when screen comes into focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user])
  );

  const loadProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id);
      console.log('Loaded user profile:', userProfile); // Debug log
      
      setProfile({
        id: user.id,
        email: user.email || "",
        name: userProfile?.name || "",
        birthday: userProfile?.birthday || "",
        location: userProfile?.location || "",
        photoUrl: userProfile?.photo_url || null,
        interests: userProfile?.interests || [],
        places: userProfile?.places || [],
        notes: userProfile?.notes || [],
        dates: userProfile?.dates || [],
        sizes: userProfile?.sizes || {},
        giftIdeas: userProfile?.gift_ideas || [],
      });

      // Calculate completion percentage
      let filledFields = 0;
      let totalFields = 10;
      
      if (userProfile?.name) filledFields++;
      if (userProfile?.birthday) filledFields++;
      if (userProfile?.location) filledFields++;
      if (userProfile?.photo_url) filledFields++;
      if (user.email) filledFields++;
      if (userProfile?.interests?.length) filledFields++;
      if (userProfile?.places?.length) filledFields++;
      if (userProfile?.notes?.length) filledFields++;
      if (userProfile?.dates?.length) filledFields++;
      if (userProfile?.sizes && Object.keys(userProfile.sizes).length) filledFields++;
      if (userProfile?.gift_ideas?.length) filledFields++;
      
      setCompletionPercentage(Math.round((filledFields / totalFields) * 100));
    }
  };

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

  const calculateDaysUntilBirthday = () => {
    if (!profile?.birthday) return null;
    const today = new Date();
    const birthday = new Date(profile.birthday);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil(
      (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntil;
  };

  if (!profile) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  const daysUntilBirthday = calculateDaysUntilBirthday();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#5A67D8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 200,
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2"
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              
              <View className="flex-row">
                <TouchableOpacity
                  onPress={handleEdit}
                  className="p-2"
                >
                  <Edit size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <MoreHorizontal size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Profile Header */}
          <View className="items-center mt-4 mb-6">
            {profile.photoUrl ? (
              <Image
                source={{ uri: profile.photoUrl }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                contentFit="cover"
              />
            ) : (
              <View className="w-25 h-25 rounded-full bg-gray-700 items-center justify-center">
                <User size={40} color="#9CA3AF" />
              </View>
            )}
            
            <Text className="text-3xl font-bold text-white mt-4">
              {profile.name || "Your Name"}
            </Text>
            <Text className="text-gray-400 mt-1">Your Account</Text>
            
            {/* Completion Progress */}
            <View className="mt-4 px-8 w-full">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">{completionPercentage}% Complete</Text>
              </View>
              <View className="h-1 bg-gray-700 rounded-full">
                <View 
                  className="h-1 bg-white rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
            </View>
          </View>

          {/* Next Event Card */}
          {daysUntilBirthday && (
            <View className="mx-4 mb-6">
              <View className="bg-gray-900/80 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Your Birthday
                  </Text>
                  <TouchableOpacity>
                    <RefreshCw size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center justify-between bg-gray-800 rounded-xl p-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
                      <Calendar size={20} color="white" />
                    </View>
                    <Text className="text-white font-medium">Birthday</Text>
                  </View>
                  <View className="bg-orange-500/20 px-3 py-1 rounded-full">
                    <Text className="text-orange-400 font-medium">
                      {daysUntilBirthday} Days
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Profile Information */}
          <View className="mx-4 mb-6">
            <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
              Account Information
            </Text>
            
            {/* Email */}
            <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Mail size={20} color="white" className="mr-3" />
                <View>
                  <Text className="text-white">Email</Text>
                  <Text className="text-gray-400 text-sm mt-1">{profile.email}</Text>
                </View>
              </View>
            </View>

            {/* Birthday */}
            <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={20} color="white" className="mr-3" />
                <Text className="text-white">Birthday</Text>
              </View>
              <TouchableOpacity 
                onPress={handleEdit}
                className="bg-gray-800 px-3 py-1 rounded"
              >
                <Text className="text-gray-300">
                  {profile.birthday
                    ? new Date(profile.birthday).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not set"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MapPin size={20} color="white" className="mr-3" />
                <Text className="text-white">Location</Text>
              </View>
              <TouchableOpacity 
                onPress={handleEdit}
                className="bg-gray-800 px-3 py-1 rounded"
              >
                <Text className="text-gray-300">
                  {profile.location || "Not set"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Interests
              </Text>
              <View className="flex-row flex-wrap">
                {profile.interests.map((interest, index) => (
                  <View
                    key={index}
                    className="bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Music size={14} color="white" className="mr-1" />
                    <Text className="text-white text-sm ml-1">{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Places Section */}
          {profile.places && profile.places.length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Favorite Places
              </Text>
              {profile.places.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-gray-900/60 rounded-xl p-4 mb-2"
                  onPress={handleEdit}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-white font-medium">{place.name}</Text>
                      {place.note && (
                        <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                          {place.note}
                        </Text>
                      )}
                    </View>
                    <Text className="text-gray-500">›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notes Section */}
          {profile.notes && profile.notes.length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Notes
              </Text>
              {profile.notes.map((note, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between"
                  onPress={handleEdit}
                >
                  <View className="flex-1">
                    <Text className="text-white font-medium">{note.title}</Text>
                    {note.content && (
                      <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                        {note.content}
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-500">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Important Dates Section */}
          {profile.dates && profile.dates.length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Important Dates
              </Text>
              {profile.dates.map((date, index) => (
                <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar size={20} color="white" className="mr-3" />
                    <View>
                      <Text className="text-white">{date.name}</Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(date.date).toLocaleDateString()}
                        {date.recurring && " (Recurring)"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Sizes Section */}
          {profile.sizes && Object.keys(profile.sizes).length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Sizes
              </Text>
              
              {profile.sizes.shoes && (
                <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <ShoppingBag size={20} color="white" className="mr-3" />
                    <Text className="text-white">Shoes</Text>
                  </View>
                  <View className="bg-gray-800 px-4 py-1 rounded">
                    <Text className="text-white font-medium">{profile.sizes.shoes}</Text>
                  </View>
                </View>
              )}
              
              {profile.sizes.tops && (
                <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shirt size={20} color="white" className="mr-3" />
                    <Text className="text-white">Tops</Text>
                  </View>
                  <View className="bg-gray-800 px-4 py-1 rounded">
                    <Text className="text-white font-medium">{profile.sizes.tops}</Text>
                  </View>
                </View>
              )}
              
              {profile.sizes.bottoms && (
                <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shirt size={20} color="white" className="mr-3" />
                    <Text className="text-white">Bottoms</Text>
                  </View>
                  <View className="bg-gray-800 px-4 py-1 rounded">
                    <Text className="text-white font-medium">{profile.sizes.bottoms}</Text>
                  </View>
                </View>
              )}
              
              {profile.sizes.dresses && (
                <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shirt size={20} color="white" className="mr-3" />
                    <Text className="text-white">Dresses</Text>
                  </View>
                  <View className="bg-gray-800 px-4 py-1 rounded">
                    <Text className="text-white font-medium">{profile.sizes.dresses}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Gift Ideas Section */}
          {profile.giftIdeas && profile.giftIdeas.length > 0 && (
            <View className="mx-4 mb-6">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                My Gift Ideas
              </Text>
              {profile.giftIdeas.map((gift, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-gray-900/60 rounded-xl p-4 mb-2"
                  onPress={handleEdit}
                >
                  <View className="flex-row items-start">
                    <Gift size={20} color="white" className="mr-3 mt-1" />
                    <View className="flex-1">
                      <Text className="text-white font-medium">{gift.title}</Text>
                      {gift.description && (
                        <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                          {gift.description}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-2">
                        {gift.price && (
                          <View className="flex-row items-center mr-3">
                            <DollarSign size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-sm">{gift.price}</Text>
                          </View>
                        )}
                        {gift.link && (
                          <View className="flex-row items-center">
                            <ExternalLink size={14} color="#60A5FA" className="mr-1" />
                            <Text className="text-blue-400 text-sm">View Link</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View className="mx-4 mb-8">
            <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
              Actions
            </Text>
            
            <TouchableOpacity
              className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between"
              onPress={() => router.push("/settings")}
            >
              <View className="flex-row items-center">
                <Settings size={20} color="white" className="mr-3" />
                <Text className="text-white">Settings</Text>
              </View>
              <Text className="text-gray-500">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-900/40 rounded-xl p-4 flex-row items-center justify-between"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <LogOut size={20} color="#EF4444" className="mr-3" />
                <Text className="text-red-400 font-medium">Logout</Text>
              </View>
              <Text className="text-red-400">›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}