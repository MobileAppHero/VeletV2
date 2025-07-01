import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Edit } from "lucide-react-native";
import { Image } from "expo-image";

interface ProfileCardProps {
  name?: string;
  relationship?: string;
  birthday?: string;
  daysUntilBirthday?: number;
  avatarUrl?: string;
  onEdit?: () => void;
}

const ProfileCard = ({
  name = "Sarah Johnson",
  relationship = "Partner",
  birthday = "May 15",
  daysUntilBirthday = 42,
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  onEdit = () => console.log("Edit profile"),
}: ProfileCardProps) => {
  return (
    <View className="w-[350px] h-[120px] bg-white rounded-xl shadow-md p-4 flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <Image
          source={{ uri: avatarUrl }}
          className="w-16 h-16 rounded-full bg-gray-200"
          contentFit="cover"
        />
        <View className="ml-4">
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
      </View>
      <TouchableOpacity
        onPress={onEdit}
        className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
      >
        <Edit size={16} color="#4B5563" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;
