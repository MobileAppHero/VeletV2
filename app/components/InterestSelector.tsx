import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Music,
  Plane,
  ChefHat,
  Flower2,
  Camera,
  BookOpen,
  Dumbbell,
  Gamepad2,
  Scissors,
  Mountain,
  Film,
  Shirt,
  Smartphone,
  Dice5,
} from "lucide-react-native";

interface Interest {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface InterestSelectorProps {
  onInterestsChange?: (selectedInterests: string[]) => void;
  initialSelectedInterests?: string[];
  maxSelections?: number;
}

const InterestSelector = ({
  onInterestsChange = () => {},
  initialSelectedInterests = [],
  maxSelections = 5,
}: InterestSelectorProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialSelectedInterests,
  );

  const interests: Interest[] = [
    { id: "music", name: "Music", icon: <Music size={24} /> },
    { id: "travel", name: "Travel", icon: <Plane size={24} /> },
    { id: "cooking", name: "Cooking", icon: <ChefHat size={24} /> },
    { id: "gardening", name: "Gardening", icon: <Flower2 size={24} /> },
    { id: "photography", name: "Photography", icon: <Camera size={24} /> },
    { id: "reading", name: "Reading", icon: <BookOpen size={24} /> },
    { id: "fitness", name: "Fitness", icon: <Dumbbell size={24} /> },
    { id: "gaming", name: "Gaming", icon: <Gamepad2 size={24} /> },
    { id: "crafting", name: "Crafting", icon: <Scissors size={24} /> },
    { id: "hiking", name: "Hiking", icon: <Mountain size={24} /> },
    { id: "movies", name: "Movies", icon: <Film size={24} /> },
    { id: "fashion", name: "Fashion", icon: <Shirt size={24} /> },
    { id: "technology", name: "Technology", icon: <Smartphone size={24} /> },
    { id: "boardGames", name: "Board Games", icon: <Dice5 size={24} /> },
  ];

  const toggleInterest = (interestId: string) => {
    let newSelectedInterests;

    if (selectedInterests.includes(interestId)) {
      // Remove interest if already selected
      newSelectedInterests = selectedInterests.filter(
        (id) => id !== interestId,
      );
    } else {
      // Add interest if not at max selections
      if (selectedInterests.length < maxSelections) {
        newSelectedInterests = [...selectedInterests, interestId];
      } else {
        // At max selections, don't add
        return;
      }
    }

    setSelectedInterests(newSelectedInterests);
    onInterestsChange(newSelectedInterests);
  };

  return (
    <View className="bg-white p-4 rounded-xl w-full">
      <Text className="text-xl font-semibold mb-4 text-center text-gray-800">
        Select Interests
      </Text>

      {selectedInterests.length >= maxSelections && (
        <Text className="text-amber-600 text-sm mb-2 text-center">
          Maximum {maxSelections} interests selected
        </Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-center">
          {interests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => toggleInterest(interest.id)}
                className={`m-2 py-2 px-4 rounded-full flex-row items-center ${isSelected ? "bg-amber-500" : "bg-gray-100"}`}
                activeOpacity={0.7}
              >
                <View
                  className={`mr-2 ${isSelected ? "text-white" : "text-gray-700"}`}
                >
                  {interest.icon}
                </View>
                <Text
                  className={`${isSelected ? "text-white font-medium" : "text-gray-700"}`}
                >
                  {interest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Text className="text-gray-500 text-sm mt-4 text-center">
        Selected: {selectedInterests.length}/{maxSelections}
      </Text>
    </View>
  );
};

export default InterestSelector;
