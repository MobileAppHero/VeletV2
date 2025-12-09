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
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Calendar,
  MapPin,
  Mail,
} from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { uploadProfilePhoto } from "../../lib/storage";
import { getUserProfile, upsertUserProfile } from "../../lib/database";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  birthday?: string;
  location?: string;
  photoUrl?: string;
}

export default function EditMyProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || "",
    email: user?.email || "",
    name: "",
    birthday: "",
    location: "",
    photoUrl: null,
  });

  useEffect(() => {
    // Load existing profile data from Supabase
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        
        setProfile({
          id: user.id,
          email: user.email || "",
          name: userProfile?.name || "",
          birthday: userProfile?.birthday || "",
          location: userProfile?.location || "",
          photoUrl: userProfile?.photo_url || null,
        });
      }
    };

    loadProfile();
  }, [user]);

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
          const photoUrl = await uploadProfilePhoto(user?.id || "user", asset.base64, 'user');
          
          if (photoUrl) {
            setProfile({ ...profile, photoUrl });
            
            // Update the database with the new photo URL
            if (user?.id) {
              await upsertUserProfile({
                user_id: user.id,
                photo_url: photoUrl,
                name: profile.name,
                birthday: profile.birthday,
                location: profile.location,
              });
            }
            
            Alert.alert("Success", "Photo uploaded successfully!");
          } else {
            Alert.alert("Error", "Failed to upload photo. Please try again.");
          }
        } else if (asset.uri) {
          // If base64 is not available, use the URI directly
          // In production, you'd convert this to base64 or upload differently
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

  const handleSave = async () => {
    if (!profile.name?.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      // Save to Supabase
      if (user?.id) {
        const result = await upsertUserProfile({
          user_id: user.id,
          name: profile.name,
          birthday: profile.birthday || null,
          location: profile.location || null,
          photo_url: profile.photoUrl || null,
        });
        
        if (result) {
          Alert.alert("Success", "Profile updated successfully!");
          router.back();
        } else {
          Alert.alert("Error", "Failed to save profile");
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
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
                
                <View className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full shadow-lg">
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Camera size={20} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={showImagePicker}>
                <Text className="text-gray-600 mt-2">Tap to change photo</Text>
              </TouchableOpacity>
            </View>

            <View className="px-4">
              {/* Name */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-600 mb-2">Name *</Text>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Email (Read-only) */}
              <View className="bg-white/70 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Mail size={16} color="#9CA3AF" />
                  <Text className="ml-2 text-gray-600">Email (cannot be changed)</Text>
                </View>
                <Text className="text-gray-500 text-lg">{profile.email}</Text>
              </View>

              {/* Birthday */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Birthday</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.birthday}
                  onChangeText={(text) => setProfile({ ...profile, birthday: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Location */}
              <View className="bg-white rounded-2xl p-4 mb-8">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#E45B5B" />
                  <Text className="ml-2 text-gray-600">Location</Text>
                </View>
                <TextInput
                  className="text-gray-800 text-lg"
                  value={profile.location}
                  onChangeText={(text) => setProfile({ ...profile, location: text })}
                  placeholder="City, State"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className="bg-pink-500 rounded-2xl py-4 mb-8 shadow-sm"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}