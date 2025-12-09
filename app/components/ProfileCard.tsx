import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Edit } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

interface ProfileCardProps {
  id?: string;
  name?: string;
  relationship?: string;
  birthday?: string;
  daysUntilBirthday?: number;
  avatarUrl?: string;
  onEdit?: () => void;
  onPress?: () => void;
  showEdit?: boolean; // Only show edit if user owns this profile
}

const ProfileCard = ({
  id,
  name = "Sarah Johnson",
  relationship = "Partner",
  birthday = "May 15",
  daysUntilBirthday = 42,
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  onEdit = () => console.log("Edit profile"),
  onPress,
  showEdit = true, // Default to true for backward compatibility
}: ProfileCardProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/profile/${id}`);
    }
  };

  return (
    <View className="w-[350px] h-[120px] bg-white rounded-xl shadow-md p-4 flex-row items-center justify-between mb-3">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className="flex-row items-center flex-1">
        <Image
          source={{ uri: avatarUrl }}
          className="w-16 h-16 rounded-full bg-gray-200"
          contentFit="cover"
        />
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-800">{name}</Text>
          <Text className="text-gray-600">{relationship}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-500">{birthday}</Text>
            {daysUntilBirthday <= 60 && (
              <View className="ml-2 px-2 py-0.5 bg-pink-100 rounded-full">
                <Text className="text-xs text-pink-600">
                  {daysUntilBirthday === 0
                    ? "Today!"
                    : daysUntilBirthday === 1
                      ? "Tomorrow!"
                      : `${daysUntilBirthday} days`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {showEdit && (
        <TouchableOpacity
          onPress={() => {
            console.log('Edit button pressed for:', name);
            if (onEdit) {
              onEdit();
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2 bg-gray-100 rounded-full items-center justify-center ml-2"
        >
          <Edit size={18} color="#4B5563" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProfileCard;
