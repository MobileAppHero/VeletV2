import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Calendar,
  Heart,
  Music,
  Utensils,
  DollarSign,
  ImageIcon,
  X,
} from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadProfilePhoto } from "../../../lib/storage";

interface Profile {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  interests: string[];
  favoriteFood: string;
  favoriteArtist: string;
  splurgeOn: string;
  photoUrl?: string;
  userId?: string;
}

export default function ProfileEditScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: id as string,
    name: "",
    relationship: "",
    birthday: "",
    interests: [],
    favoriteFood: "",
    favoriteArtist: "",
    splurgeOn: "",
    photoUrl: null,
    userId: user?.id,
  });
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    // For now, we'll use mock data
    // Later this will fetch from Supabase
    const mockProfile: Profile = {
      id: id as string,
      name: "Sarah Johnson",
      relationship: "Partner",
      birthday: "2023-08-15",
      interests: ["Music", "Travel", "Cooking"],
      favoriteFood: "Italian pasta",
      favoriteArtist: "Taylor Swift",
      splurgeOn: "Vintage vinyl records",
      photoUrl: null,
      userId: user?.id,
    };
    setProfile(mockProfile);
  }, [id, user]);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraStatus.granted || !mediaLibraryStatus.granted) {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to use this feature.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      setUploadingPhoto(true);
      
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      };

      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.base64) {
          // Upload to Supabase storage
          const photoUrl = await uploadProfilePhoto(user?.id || "user", asset.base64);
          
          if (photoUrl) {
            setProfile({ ...profile, photoUrl });
            Alert.alert("Success", "Photo uploaded successfully!");
          } else {
            Alert.alert("Error", "Failed to upload photo. Please try again.");
          }
        } else if (asset.uri) {
          // If base64 is not available, use the URI directly
          setProfile({ ...profile, photoUrl: asset.uri });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose how you want to add a photo",
      [
        { text: "Take Photo", onPress: () => pickImage("camera") },
        { text: "Choose from Gallery", onPress: () => pickImage("gallery") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    const updatedInterests = profile.interests.filter((_, i) => i !== index);
    setProfile({ ...profile, interests: updatedInterests });
  };

  const handleSave = async () => {
    if (!profile.name || !profile.relationship) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // TODO: Save to Supabase
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFE1C6", "#FFCDB8", "#FFB4A2"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="p-2 bg-white/80 rounded-full"
                >
                  <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                
                <Text className="text-xl font-bold text-gray-800">
                  Edit Profile
                </Text>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading}
                  className="p-2 bg-white/80 rounded-full"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#E45B5B" />
                  ) : (
                    <Save size={24} color="#E45B5B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Photo */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={showImagePicker}
                disabled={uploadingPhoto}
                className="relative"
              >
                {profile.photoUrl ? (
                  <Image
                    source={{ uri: profile.photoUrl }}
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-30 h-30 rounded-full bg-white/80 items-center justify-center">
                    <User size={50} color="#9CA3AF" />
                  </View>
                )}
                
                <View className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full">
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Camera size={20} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <Text className="text-gray-600 mt-2">Tap to change photo</Text>
            </View>

            <View className="px-4">
              {/* Name */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-600 mb-2">Name *</Text>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  placeholder="Enter name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Relationship */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-600 mb-2">Relationship *</Text>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.relationship}
                  onChangeText={(text) =>
                    setProfile({ ...profile, relationship: text })
                  }
                  placeholder="e.g., Partner, Friend, Family"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Birthday */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Calendar size={20} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Birthday</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.birthday}
                  onChangeText={(text) =>
                    setProfile({ ...profile, birthday: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Interests */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Heart size={20} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Interests</Text>
                </View>
                
                <View className="flex-row flex-wrap mb-3">
                  {profile.interests.map((interest, index) => (
                    <View
                      key={index}
                      className="bg-pink-100 px-3 py-1 rounded-full mr-2 mb-2 flex-row items-center"
                    >
                      <Text className="text-pink-800 mr-1">{interest}</Text>
                      <TouchableOpacity onPress={() => removeInterest(index)}>
                        <X size={14} color="#9D174D" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                
                <View className="flex-row">
                  <TextInput
                    className="flex-1 text-gray-800 mr-2 border-b border-gray-300 pb-1"
                    value={newInterest}
                    onChangeText={setNewInterest}
                    placeholder="Add interest"
                    placeholderTextColor="#9CA3AF"
                    onSubmitEditing={addInterest}
                  />
                  <TouchableOpacity
                    onPress={addInterest}
                    className="bg-pink-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Favorite Food */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Utensils size={20} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Favorite Food</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.favoriteFood}
                  onChangeText={(text) =>
                    setProfile({ ...profile, favoriteFood: text })
                  }
                  placeholder="Enter favorite food"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Favorite Artist */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Music size={20} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Favorite Artist</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.favoriteArtist}
                  onChangeText={(text) =>
                    setProfile({ ...profile, favoriteArtist: text })
                  }
                  placeholder="Enter favorite artist"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Splurge On */}
              <View className="bg-white rounded-2xl p-4 mb-8">
                <View className="flex-row items-center mb-2">
                  <DollarSign size={20} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Loves to Splurge On</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.splurgeOn}
                  onChangeText={(text) =>
                    setProfile({ ...profile, splurgeOn: text })
                  }
                  placeholder="What do they love to spend on?"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}