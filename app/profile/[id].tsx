import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  MapPin,
  Shirt,
  ShoppingBag,
  Music,
  MoreHorizontal,
  User,
  Gift,
  DollarSign,
  ExternalLink,
} from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getLovedOneProfile } from "../../lib/database";

interface Profile {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  interests: string[];
  favoriteFood?: string;
  favoriteArtist?: string;
  splurgeOn?: string;
  photoUrl?: string;
  userId?: string;
  anniversary?: string;
  firstDate?: string;
  notes?: string[];
  places?: Array<{ name: string; note: string; image?: string }>;
  sizes?: {
    shoes?: string;
    tops?: string;
    bottoms?: string;
    dresses?: string;
  };
  giftIdeas?: Array<{ title: string; description?: string; link?: string; price?: string }>;
}

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(45);

  useEffect(() => {
    loadProfile();
  }, [id, user]);

  const loadProfile = async () => {
    if (user && id && typeof id === 'string') {
      const lovedOneProfile = await getLovedOneProfile(id, user.id);
      
      if (lovedOneProfile) {
        setProfile({
          id: lovedOneProfile.id || id,
          name: lovedOneProfile.name,
          relationship: lovedOneProfile.relationship || "",
          birthday: lovedOneProfile.birthday || "",
          interests: lovedOneProfile.interests || [],
          favoriteFood: lovedOneProfile.favorite_food || "",
          favoriteArtist: lovedOneProfile.favorite_artist || "",
          splurgeOn: lovedOneProfile.splurge_on || "",
          photoUrl: lovedOneProfile.photo_url || null,
          userId: lovedOneProfile.user_id,
          // Mock data for now
          anniversary: "03/17/2012",
          firstDate: "02/01/2011",
          notes: ["Grant Park", "Grant Park", "Grant Park"],
          places: [
            {
              name: "Grant Park",
              note: "Our first date we had ice cream...",
              image: null
            },
            {
              name: "Grant Park",
              note: "Our first date we had ice cream...",
            },
            {
              name: "Grant Park",
              note: "",
            }
          ],
          sizes: {
            shoes: "8",
            tops: "S",
            bottoms: "M",
            dresses: "M"
          },
          giftIdeas: lovedOneProfile.gift_ideas || []
        });
        
        // Calculate completion percentage based on filled fields
        let filledFields = 0;
        let totalFields = 12;
        
        if (lovedOneProfile.name) filledFields++;
        if (lovedOneProfile.relationship) filledFields++;
        if (lovedOneProfile.birthday) filledFields++;
        if (lovedOneProfile.interests?.length) filledFields++;
        if (lovedOneProfile.favorite_food) filledFields++;
        if (lovedOneProfile.favorite_artist) filledFields++;
        if (lovedOneProfile.splurge_on) filledFields++;
        if (lovedOneProfile.photo_url) filledFields++;
        
        setCompletionPercentage(Math.round((filledFields / totalFields) * 100));
      }
    }
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
        <Text className="text-gray-400">Loading...</Text>
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
              
              <TouchableOpacity className="p-2">
                <MoreHorizontal size={24} color="white" />
              </TouchableOpacity>
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
              {profile.name}
            </Text>
            <Text className="text-gray-400 mt-1">{profile.relationship}</Text>
            
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
          <View className="mx-4 mb-6">
            <View className="bg-gray-900/80 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-400 text-sm uppercase tracking-wide">
                  Next 3 Months
                </Text>
                <TouchableOpacity>
                  <RefreshCw size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              {daysUntilBirthday && (
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
              )}
            </View>
          </View>

          {/* Interests Section */}
          {profile.interests.length > 0 && (
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
              
              {profile.splurgeOn && (
                <Text className="text-gray-400 mt-3 italic">
                  "{profile.splurgeOn}"
                </Text>
              )}
            </View>
          )}

          {/* Places Section */}
          <View className="mx-4 mb-6">
            <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
              Places
            </Text>
            {profile.places?.map((place, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center"
              >
                {place.image ? (
                  <Image
                    source={{ uri: place.image }}
                    style={{ width: 50, height: 50, borderRadius: 8 }}
                    className="mr-3"
                  />
                ) : (
                  <View className="w-12 h-12 bg-gray-700 rounded-lg mr-3 items-center justify-center">
                    <MapPin size={20} color="#9CA3AF" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white font-medium">{place.name}</Text>
                  {place.note && (
                    <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                      {place.note}
                    </Text>
                  )}
                </View>
                <Text className="text-gray-500">›</Text>
              </TouchableOpacity>
            ))}
          </View>

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
                >
                  <Text className="text-white">{note}</Text>
                  <Text className="text-gray-500">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dates Section */}
          <View className="mx-4 mb-6">
            <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
              Dates
            </Text>
            
            {profile.birthday && (
              <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={20} color="white" className="mr-3" />
                  <Text className="text-white">Birthday</Text>
                </View>
                <View className="bg-gray-800 px-3 py-1 rounded">
                  <Text className="text-gray-300">
                    {new Date(profile.birthday).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
            
            {profile.anniversary && (
              <View className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={20} color="white" className="mr-3" />
                  <Text className="text-white">Anniversary</Text>
                </View>
                <View className="bg-gray-800 px-3 py-1 rounded">
                  <Text className="text-gray-300">{profile.anniversary}</Text>
                </View>
              </View>
            )}
            
            {profile.firstDate && (
              <View className="bg-gray-900/60 rounded-xl p-4 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Calendar size={20} color="white" className="mr-3" />
                    <Text className="text-white">First Date</Text>
                  </View>
                  <View className="bg-gray-800 px-3 py-1 rounded">
                    <Text className="text-gray-300">{profile.firstDate}</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-sm ml-8">
                  She really cares about this
                </Text>
              </View>
            )}
          </View>

          {/* Sizes Section */}
          {profile.sizes && (
            <View className="mx-4 mb-8">
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
                <View className="bg-gray-900/60 rounded-xl p-4 mb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Shirt size={20} color="white" className="mr-3" />
                      <Text className="text-white">Tops</Text>
                    </View>
                    <View className="bg-gray-800 px-4 py-1 rounded">
                      <Text className="text-white font-medium">{profile.sizes.tops}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-sm ml-8">
                    • Wears M for "the baggy look"
                  </Text>
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
            <View className="mx-4 mb-8">
              <Text className="text-gray-400 text-sm uppercase tracking-wide mb-3">
                Gift Ideas
              </Text>
              {profile.giftIdeas.map((gift, index) => (
                <View
                  key={index}
                  className="bg-gray-900/60 rounded-xl p-4 mb-2"
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
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}