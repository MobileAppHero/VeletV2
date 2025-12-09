import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Calendar, Bell, Gift } from "lucide-react-native";
import { router } from "expo-router";

export default function BirthdaysScreen() {
  // Mock birthday data - later will fetch from Supabase
  const birthdays = [
    {
      id: "1",
      name: "Sarah Johnson",
      birthday: "2024-08-15",
      relationship: "Partner",
      daysUntil: 10,
    },
    {
      id: "2",
      name: "Michael Chen",
      birthday: "2024-10-22",
      relationship: "Friend",
      daysUntil: 45,
    },
    {
      id: "3",
      name: "Emma Wilson",
      birthday: "2025-01-15",
      relationship: "Sister",
      daysUntil: 100,
    },
  ];

  const getBirthdayCategory = (daysUntil: number) => {
    if (daysUntil === 0) return { label: "Today!", color: "bg-red-500" };
    if (daysUntil === 1) return { label: "Tomorrow", color: "bg-orange-500" };
    if (daysUntil <= 7) return { label: "This Week", color: "bg-yellow-500" };
    if (daysUntil <= 30) return { label: "This Month", color: "bg-green-500" };
    return { label: "Later", color: "bg-blue-500" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

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
              Birthdays
            </Text>
            
            <TouchableOpacity className="p-2 bg-white/80 rounded-full">
              <Bell size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Calendar View */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Calendar size={20} color="#E45B5B" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                Upcoming Birthdays
              </Text>
            </View>
            <Text className="text-gray-600">
              {birthdays.length} birthdays in your calendar
            </Text>
          </View>

          {/* Birthday List */}
          {birthdays.map((birthday) => {
            const category = getBirthdayCategory(birthday.daysUntil);
            return (
              <TouchableOpacity
                key={birthday.id}
                onPress={() => router.push(`/profile/${birthday.id}`)}
                className="bg-white rounded-xl shadow-sm p-4 mb-4"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        {birthday.name}
                      </Text>
                      <View
                        className={`ml-2 px-2 py-0.5 rounded-full ${category.color}`}
                      >
                        <Text className="text-white text-xs font-medium">
                          {category.label}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-600">
                      {formatDate(birthday.birthday)} • {birthday.relationship}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {birthday.daysUntil === 0
                        ? "Today is the day!"
                        : birthday.daysUntil === 1
                        ? "Tomorrow"
                        : `In ${birthday.daysUntil} days`}
                    </Text>
                  </View>
                  
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log("Set reminder for:", birthday.name);
                      }}
                      className="p-2 bg-pink-100 rounded-full mr-2"
                    >
                      <Bell size={16} color="#EC4899" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log("Get gift ideas for:", birthday.name);
                      }}
                      className="p-2 bg-green-100 rounded-full"
                    >
                      <Gift size={16} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}