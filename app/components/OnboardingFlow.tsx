import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import InterestSelector from "./InterestSelector";

type OnboardingStep =
  | "welcome"
  | "relationship"
  | "preferences"
  | "interests"
  | "birthday"
  | "complete";

type Relationship =
  | "Partner"
  | "Spouse"
  | "Boo"
  | "Sibling"
  | "Child"
  | "Someone else";

interface Person {
  name: string;
  relationship: Relationship | null;
  favoriteFood: string;
  favoriteArtist: string;
  splurgeOn: string;
  interests: string[];
  birthday: Date | null;
}

interface OnboardingFlowProps {
  onComplete?: (person: Person) => void;
  initialStep?: OnboardingStep;
}

export default function OnboardingFlow({
  onComplete = () => {},
  initialStep = "welcome",
}: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [person, setPerson] = useState<Person>({
    name: "",
    relationship: null,
    favoriteFood: "",
    favoriteArtist: "",
    splurgeOn: "",
    interests: [],
    birthday: null,
  });

  const relationships: Relationship[] = [
    "Partner",
    "Spouse",
    "Boo",
    "Sibling",
    "Child",
    "Someone else",
  ];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (currentStep) {
      case "welcome":
        setCurrentStep("relationship");
        break;
      case "relationship":
        setCurrentStep("preferences");
        break;
      case "preferences":
        setCurrentStep("interests");
        break;
      case "interests":
        setCurrentStep("birthday");
        break;
      case "birthday":
        setCurrentStep("complete");
        onComplete(person);
        break;
      case "complete":
        // Handle completion, maybe navigate to home
        router.push("/");
        break;
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (currentStep) {
      case "relationship":
        setCurrentStep("welcome");
        break;
      case "preferences":
        setCurrentStep("relationship");
        break;
      case "interests":
        setCurrentStep("preferences");
        break;
      case "birthday":
        setCurrentStep("interests");
        break;
      case "complete":
        setCurrentStep("birthday");
        break;
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep === "birthday") {
      setCurrentStep("complete");
      onComplete(person);
    }
  };

  const updatePerson = (field: keyof Person, value: any) => {
    setPerson((prev) => ({ ...prev, [field]: value }));
  };

  const selectRelationship = (relationship: Relationship) => {
    updatePerson("relationship", relationship);
    handleNext();
  };

  const handleInterestsChange = (interests: string[]) => {
    updatePerson("interests", interests);
  };

  const handleDateChange = (date: Date) => {
    updatePerson("birthday", date);
  };

  const renderProgressIndicator = () => {
    const steps: OnboardingStep[] = [
      "welcome",
      "relationship",
      "preferences",
      "interests",
      "birthday",
    ];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View className="flex-row justify-center mt-6 mb-4">
        {steps.map((step, index) => (
          <View
            key={step}
            className={`h-2 w-12 mx-1 rounded-full ${index <= currentIndex ? "bg-red-400" : "bg-gray-600"}`}
          />
        ))}
      </View>
    );
  };

  const renderWelcomeScreen = () => (
    <View className="flex-1 justify-center items-center px-6 bg-black">
      {/* Lottie Animation Placeholder */}
      <View className="w-80 h-80 bg-gray-700 rounded-2xl mb-8 justify-center items-center">
        <Text className="text-white text-lg">Lottie</Text>
      </View>

      <Text className="text-white text-4xl font-bold text-center mb-4">
        valet
      </Text>

      <Text className="text-white text-2xl text-center mb-2 font-serif">
        Catch the moments that matter.
      </Text>
      <Text className="text-gray-300 text-lg text-center mb-8">
        Favorites, sizes, memories all saved in one place.
      </Text>

      {/* Page Indicators */}
      <View className="flex-row mb-8">
        <View className="w-2 h-2 bg-white rounded-full mx-1" />
        <View className="w-2 h-2 bg-gray-500 rounded-full mx-1" />
        <View className="w-2 h-2 bg-gray-500 rounded-full mx-1" />
      </View>

      <TouchableOpacity
        className="bg-red-400 py-4 px-8 rounded-2xl w-80 mb-4"
        onPress={handleNext}
      >
        <Text className="text-black text-center font-semibold text-lg">
          Get started
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-400 text-xs text-center px-4">
        By clicking Get started you agree to our terms of service and privacy
        policy
      </Text>
    </View>
  );

  const renderRelationshipScreen = () => (
    <View className="flex-1 px-6 bg-black">
      <Text className="text-2xl font-bold text-center mt-6 mb-2 text-white">
        Who do you cherish?
      </Text>
      <View className="flex-row mb-6">
        <TextInput
          className="flex-1 border-b border-gray-600 py-2 text-lg text-white"
          placeholder="Enter their name"
          placeholderTextColor="#9CA3AF"
          value={person.name}
          onChangeText={(text) => updatePerson("name", text)}
        />
      </View>

      <Text className="text-lg font-medium mb-4 text-white">
        Select your relationship:
      </Text>
      <View className="flex-row flex-wrap justify-center">
        {relationships.map((rel) => (
          <TouchableOpacity
            key={rel}
            className={`m-2 py-3 px-6 rounded-full ${person.relationship === rel ? "bg-red-400" : "bg-gray-700"}`}
            onPress={() => selectRelationship(rel)}
          >
            <Text
              className={`${person.relationship === rel ? "text-black" : "text-white"} font-medium`}
            >
              {rel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPreferencesScreen = () => (
    <ScrollView className="flex-1 px-6 bg-black">
      <Text className="text-2xl font-bold text-center mt-6 mb-6 text-white">
        Tell us about {person.name}
      </Text>

      <View className="mb-6">
        <Text className="text-lg font-medium mb-2 text-white">
          Favorite food
        </Text>
        <TextInput
          className="border-b border-gray-600 py-2 text-lg text-white"
          placeholder="Pizza, sushi, chocolate..."
          placeholderTextColor="#9CA3AF"
          value={person.favoriteFood}
          onChangeText={(text) => updatePerson("favoriteFood", text)}
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-medium mb-2 text-white">
          Favorite artist
        </Text>
        <TextInput
          className="border-b border-gray-600 py-2 text-lg text-white"
          placeholder="Band, singer, painter..."
          placeholderTextColor="#9CA3AF"
          value={person.favoriteArtist}
          onChangeText={(text) => updatePerson("favoriteArtist", text)}
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-medium mb-2 text-white">
          What do they splurge on?
        </Text>
        <TextInput
          className="border-b border-gray-600 py-2 text-lg text-white"
          placeholder="Shoes, tech gadgets, books..."
          placeholderTextColor="#9CA3AF"
          value={person.splurgeOn}
          onChangeText={(text) => updatePerson("splurgeOn", text)}
        />
      </View>
    </ScrollView>
  );

  const renderInterestsScreen = () => (
    <View className="flex-1 px-6 bg-black">
      <Text className="text-2xl font-bold text-center mt-6 mb-2 text-white">
        What interests {person.name}?
      </Text>
      <Text className="text-center text-gray-400 mb-6">
        Select all that apply
      </Text>

      <InterestSelector
        selectedInterests={person.interests}
        onChange={handleInterestsChange}
      />
    </View>
  );

  const renderBirthdayScreen = () => {
    // Simple date picker representation
    const today = new Date();
    const formattedDate = person.birthday
      ? person.birthday.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      : "Select a date";

    return (
      <View className="flex-1 px-6 bg-black">
        <Text className="text-2xl font-bold text-center mt-6 mb-2 text-white">
          When is {person.name}'s birthday?
        </Text>

        <TouchableOpacity
          className="flex-row items-center justify-center border border-gray-600 rounded-lg py-4 px-6 my-6"
          onPress={() => {
            // In a real app, this would open a date picker
            // For this scaffold, we'll just set a mock date
            handleDateChange(today);
          }}
        >
          <Calendar size={24} color="#ffffff" className="mr-2" />
          <Text className="text-lg text-white">{formattedDate}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 px-6 mt-2" onPress={handleSkip}>
          <Text className="text-center text-red-400 font-medium">
            Skip this step
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCompleteScreen = () => (
    <View className="flex-1 justify-center items-center px-6 bg-black">
      <View className="bg-gray-700 p-4 rounded-full mb-6">
        <Heart size={64} color="#ffffff" />
      </View>
      <Text className="text-3xl font-bold text-center mb-2 text-white">
        All set!
      </Text>
      <Text className="text-lg text-center text-gray-400 mb-8">
        We've saved {person.name}'s details. Now you'll never forget what
        matters to them.
      </Text>
      <TouchableOpacity
        className="bg-red-400 py-4 px-8 rounded-2xl w-64"
        onPress={() => router.push("/")}
      >
        <Text className="text-black text-center font-semibold text-lg">
          See Suggestions
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return renderWelcomeScreen();
      case "relationship":
        return renderRelationshipScreen();
      case "preferences":
        return renderPreferencesScreen();
      case "interests":
        return renderInterestsScreen();
      case "birthday":
        return renderBirthdayScreen();
      case "complete":
        return renderCompleteScreen();
      default:
        return renderWelcomeScreen();
    }
  };

  const showBackButton =
    currentStep !== "welcome" && currentStep !== "complete";
  const showNextButton =
    currentStep !== "welcome" &&
    currentStep !== "relationship" &&
    currentStep !== "complete";

  return (
    <View className="flex-1 bg-black">
      {currentStep !== "welcome" && renderProgressIndicator()}

      {renderCurrentStep()}

      {currentStep !== "welcome" && (
        <View className="flex-row justify-between items-center p-6">
          {showBackButton ? (
            <TouchableOpacity className="p-2" onPress={handleBack}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {showNextButton && (
            <TouchableOpacity
              className="bg-red-400 p-3 rounded-full"
              onPress={handleNext}
            >
              <ChevronRight size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
