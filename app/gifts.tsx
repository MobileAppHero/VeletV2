import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Gift, ShoppingCart, Heart } from "lucide-react-native";
import { router } from "expo-router";

export default function GiftsScreen() {
  // Mock gift suggestions
  const giftSuggestions = [
    {
      id: "1",
      title: "Wireless Headphones",
      recipient: "Sarah Johnson",
      price: "$129",
      category: "Technology",
      liked: false,
    },
    {
      id: "2",
      title: "Cooking Class Voucher",
      recipient: "Sarah Johnson",
      price: "$85",
      category: "Experiences",
      liked: true,
    },
    {
      id: "3",
      title: "Gaming Keyboard",
      recipient: "Michael Chen",
      price: "$149",
      category: "Technology",
      liked: false,
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
              Gift Ideas
            </Text>
            
            <View className="w-10" />
          </View>

          {/* Gift Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {["All", "Technology", "Experiences", "Fashion", "Books", "Home"].map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full mr-2 ${
                  category === "All" ? "bg-pink-500" : "bg-white"
                }`}
              >
                <Text
                  className={`font-medium ${
                    category === "All" ? "text-white" : "text-gray-700"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Gift Cards */}
          <View className="mb-4">
            <Text className="text-lg text-gray-600 mb-4">
              {giftSuggestions.length} Gift Ideas
            </Text>
            
            {giftSuggestions.map((gift) => (
              <View
                key={gift.id}
                className="bg-white rounded-xl shadow-sm p-4 mb-4"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {gift.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      For {gift.recipient}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Heart
                      size={20}
                      color={gift.liked ? "#EC4899" : "#9CA3AF"}
                      fill={gift.liked ? "#EC4899" : "none"}
                    />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row justify-between items-center mt-3">
                  <View>
                    <Text className="text-pink-600 font-bold text-lg">
                      {gift.price}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {gift.category}
                    </Text>
                  </View>
                  
                  <TouchableOpacity className="bg-pink-500 px-4 py-2 rounded-lg flex-row items-center">
                    <ShoppingCart size={16} color="white" />
                    <Text className="text-white font-medium ml-2">
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}