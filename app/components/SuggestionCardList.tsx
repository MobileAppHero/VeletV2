import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Filter, Heart, Share2 } from "lucide-react-native";

type SuggestionCategory = "All" | "Gifts" | "Experiences" | "Digital";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceRange: string;
  category: SuggestionCategory;
  relevantInterests: string[];
  personName?: string;
};

type SuggestionCardListProps = {
  suggestions?: Suggestion[];
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  personName?: string;
};

const defaultSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "Vinyl Record Subscription",
    description:
      "A monthly delivery of curated vinyl records based on their music taste.",
    imageUrl:
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80",
    priceRange: "$30-50/month",
    category: "Gifts",
    relevantInterests: ["Music"],
  },
  {
    id: "2",
    title: "Cooking Class Experience",
    description:
      "A hands-on cooking class with a professional chef to learn new recipes.",
    imageUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
    priceRange: "$75-150",
    category: "Experiences",
    relevantInterests: ["Cooking"],
  },
  {
    id: "3",
    title: "Premium Streaming Subscription",
    description:
      "Access to thousands of movies and TV shows on a premium platform.",
    imageUrl:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80",
    priceRange: "$10-20/month",
    category: "Digital",
    relevantInterests: ["Movies"],
  },
  {
    id: "4",
    title: "Hiking Day Trip",
    description:
      "A guided hiking experience in a scenic national park with transportation included.",
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80",
    priceRange: "$50-100",
    category: "Experiences",
    relevantInterests: ["Hiking", "Travel"],
  },
  {
    id: "5",
    title: "Tech Gadget Bundle",
    description: "A curated set of the latest tech accessories and gadgets.",
    imageUrl:
      "https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=400&q=80",
    priceRange: "$100-200",
    category: "Gifts",
    relevantInterests: ["Technology"],
  },
];

const SuggestionCardList = ({
  suggestions = defaultSuggestions,
  onSelectSuggestion = () => {},
  personName = "your loved one",
}: SuggestionCardListProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<SuggestionCategory>("All");

  const filteredSuggestions =
    selectedCategory === "All"
      ? suggestions
      : suggestions.filter(
          (suggestion) => suggestion.category === selectedCategory,
        );

  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Suggestions for {personName}
        </Text>
        <TouchableOpacity className="flex-row items-center">
          <Filter size={18} color="#6B7280" />
          <Text className="text-gray-500 ml-1">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {(
          ["All", "Gifts", "Experiences", "Digital"] as SuggestionCategory[]
        ).map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`px-4 py-2 mr-2 rounded-full ${selectedCategory === category ? "bg-purple-600" : "bg-gray-200"}`}
          >
            <Text
              className={`${selectedCategory === category ? "text-white" : "text-gray-700"} font-medium`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Suggestion Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pb-2"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {filteredSuggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => onSelectSuggestion(suggestion)}
            className="w-64 mr-4 bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <Image
              source={{ uri: suggestion.imageUrl }}
              className="w-full h-32"
              contentFit="cover"
            />
            <View className="p-3">
              <Text className="text-lg font-bold text-gray-800">
                {suggestion.title}
              </Text>
              <Text className="text-gray-600 text-sm mb-2">
                {suggestion.description}
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-purple-600 font-semibold">
                  {suggestion.priceRange}
                </Text>
                <View className="flex-row">
                  <TouchableOpacity className="mr-2">
                    <Heart size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Share2 size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row flex-wrap mt-2">
                {suggestion.relevantInterests.map((interest) => (
                  <View
                    key={interest}
                    className="bg-purple-100 rounded-full px-2 py-1 mr-1 mb-1"
                  >
                    <Text className="text-xs text-purple-700">{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default SuggestionCardList;
