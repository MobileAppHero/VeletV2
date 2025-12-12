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
  Modal,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Calendar,
  MapPin,
  Mail,
  Plus,
  X,
  Check,
  Music,
  FileText,
  Shirt,
  Gift,
  DollarSign,
  Link,
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
  interests?: string[];
  notes?: Array<{ title: string; content: string }>;
  places?: Array<{ name: string; note: string }>;
  sizes?: {
    shoes?: string;
    tops?: string;
    bottoms?: string;
    dresses?: string;
  };
  dates?: Array<{ name: string; date: string; recurring: boolean }>;
  giftIdeas?: Array<{ title: string; description?: string; link?: string; price?: string }>;
}

const CLOTHING_TYPES = ['Shoes', 'Tops', 'Bottoms', 'Dresses', 'Hats', 'Accessories'];
const CLOTHING_SIZES = {
  Shoes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  Tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  Bottoms: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40'],
  Dresses: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'],
  Hats: ['S', 'M', 'L', 'XL', 'One Size'],
  Accessories: ['XS', 'S', 'M', 'L', 'XL', 'One Size'],
};

const PRESET_INTERESTS = [
  'Music', 'Travel', 'Cooking', 'Reading', 'Sports', 'Art', 'Photography',
  'Gaming', 'Fashion', 'Fitness', 'Movies', 'Technology', 'Nature', 'Dancing',
  'Writing', 'Yoga', 'Meditation', 'Wine', 'Coffee', 'Tea', 'Gardening',
  'DIY', 'Crafts', 'Hiking', 'Swimming', 'Running', 'Cycling', 'Skiing'
];

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
    interests: [],
    notes: [],
    places: [],
    sizes: {},
    dates: [],
    giftIdeas: [],
  });

  // Modal states
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  // Modal form states
  const [newInterest, setNewInterest] = useState("");
  const [newPlace, setNewPlace] = useState({ name: "", note: "" });
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newDate, setNewDate] = useState({ name: "", date: new Date(), recurring: false });
  const [newSize, setNewSize] = useState({ type: "", size: "" });
  const [newGift, setNewGift] = useState({ title: "", description: "", link: "", price: "" });
  const [selectedClothingType, setSelectedClothingType] = useState("");
  const [birthdayDate, setBirthdayDate] = useState(new Date());

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id);
      
      if (userProfile) {
        setProfile({
          id: user.id,
          email: user.email || "",
          name: userProfile.name || "",
          birthday: userProfile.birthday || "",
          location: userProfile.location || "",
          photoUrl: userProfile.photo_url || null,
          interests: userProfile.interests || [],
          notes: userProfile.notes || [],
          places: userProfile.places || [],
          sizes: userProfile.sizes || {},
          dates: userProfile.dates || [],
          giftIdeas: userProfile.gift_ideas || [],
        });
        
        if (userProfile.birthday) {
          setBirthdayDate(new Date(userProfile.birthday));
        }
      }
    }
  };

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
          const photoUrl = await uploadProfilePhoto(user?.id || "user", asset.base64, 'user');
          
          if (photoUrl) {
            setProfile({ ...profile, photoUrl });
            
            // Update database immediately
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

  const addInterest = (interest: string) => {
    if (!profile.interests?.includes(interest)) {
      setProfile({ ...profile, interests: [...(profile.interests || []), interest] });
    }
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests?.filter(i => i !== interest) || []
    });
  };

  const addPlace = () => {
    if (newPlace.name.trim()) {
      setProfile({
        ...profile,
        places: [...(profile.places || []), newPlace]
      });
      setNewPlace({ name: "", note: "" });
      setShowPlaceModal(false);
    }
  };

  const addNote = () => {
    if (newNote.title.trim()) {
      setProfile({
        ...profile,
        notes: [...(profile.notes || []), newNote]
      });
      setNewNote({ title: "", content: "" });
      setShowNoteModal(false);
    }
  };

  const addDate = () => {
    if (newDate.name.trim()) {
      setProfile({
        ...profile,
        dates: [...(profile.dates || []), {
          ...newDate,
          date: newDate.date.toISOString()
        }]
      });
      setNewDate({ name: "", date: new Date(), recurring: false });
      setShowDateModal(false);
    }
  };

  const addSize = () => {
    if (selectedClothingType && newSize.size) {
      setProfile({
        ...profile,
        sizes: {
          ...profile.sizes,
          [selectedClothingType.toLowerCase()]: newSize.size
        }
      });
      setSelectedClothingType("");
      setNewSize({ type: "", size: "" });
      setShowSizeModal(false);
    }
  };

  const addGiftIdea = () => {
    if (newGift.title.trim()) {
      setProfile({
        ...profile,
        giftIdeas: [...(profile.giftIdeas || []), newGift]
      });
      setNewGift({ title: "", description: "", link: "", price: "" });
      setShowGiftModal(false);
    }
  };

  const removeGiftIdea = (index: number) => {
    setProfile({
      ...profile,
      giftIdeas: profile.giftIdeas?.filter((_, i) => i !== index) || []
    });
  };

  const handleSave = async () => {
    if (!profile.name?.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (user?.id) {
        const result = await upsertUserProfile({
          user_id: user.id,
          name: profile.name,
          birthday: profile.birthday || null,
          location: profile.location || null,
          photo_url: profile.photoUrl || null,
          interests: profile.interests || [],
          places: profile.places || [],
          notes: profile.notes || [],
          dates: profile.dates || [],
          sizes: profile.sizes || {},
          gift_ideas: profile.giftIdeas || [],
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView 
            className="flex-1" 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardDismissMode="on-drag">
            {/* Header */}
            <View className="px-4 py-4">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                
                <Text className="text-xl font-bold text-white">
                  Edit Profile
                </Text>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading}
                  className="p-2"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Save size={24} color="white" />
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
                  <View className="w-30 h-30 rounded-full bg-gray-700 items-center justify-center">
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
              <Text className="text-gray-400 mt-2">Tap to change photo</Text>
            </View>

            <View className="px-4">
              {/* Basic Info */}
              <View className="bg-gray-900/60 rounded-2xl p-4 mb-4">
                <Text className="text-gray-400 mb-2">Name *</Text>
                <TextInput
                  className="text-white text-lg bg-gray-800 rounded-lg px-3 py-2"
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor="#6B7280"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              {/* Email (Read-only) */}
              <View className="bg-gray-900/60 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Mail size={16} color="#9CA3AF" />
                  <Text className="ml-2 text-gray-400">Email (cannot be changed)</Text>
                </View>
                <Text className="text-gray-300 text-lg">{profile.email}</Text>
              </View>

              {/* Birthday */}
              <View className="bg-gray-900/60 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="white" />
                  <Text className="ml-2 text-gray-400">Birthday</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowBirthdayPicker(true)}
                  className="bg-gray-800 rounded-lg px-3 py-2"
                >
                  <Text className="text-white">
                    {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : "Select birthday"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showBirthdayPicker && (
                <DateTimePicker
                  value={birthdayDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowBirthdayPicker(false);
                    if (selectedDate) {
                      setBirthdayDate(selectedDate);
                      setProfile({ ...profile, birthday: selectedDate.toISOString().split('T')[0] });
                    }
                  }}
                />
              )}

              {/* Location */}
              <View className="bg-gray-900/60 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="white" />
                  <Text className="ml-2 text-gray-400">Location</Text>
                </View>
                <TextInput
                  className="text-white text-lg bg-gray-800 rounded-lg px-3 py-2"
                  value={profile.location}
                  onChangeText={(text) => setProfile({ ...profile, location: text })}
                  placeholder="City, State"
                  placeholderTextColor="#6B7280"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              {/* Interests Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    My Interests
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowInterestModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="max-h-20"
                >
                  <View className="flex-row flex-wrap" style={{ width: 'auto' }}>
                    {profile.interests?.map((interest, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => removeInterest(interest)}
                        className="bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center"
                      >
                        <Music size={14} color="white" className="mr-1" />
                        <Text className="text-white text-sm ml-1">{interest}</Text>
                        <X size={14} color="white" className="ml-2" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Places Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Favorite Places
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPlaceModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                {profile.places?.map((place, index) => (
                  <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2">
                    <Text className="text-white font-medium">{place.name}</Text>
                    {place.note && (
                      <Text className="text-gray-400 text-sm mt-1">{place.note}</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Notes Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Personal Notes
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowNoteModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                {profile.notes?.map((note, index) => (
                  <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2">
                    <Text className="text-white font-medium">{note.title}</Text>
                    {note.content && (
                      <Text className="text-gray-400 text-sm mt-1">{note.content}</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Important Dates Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Important Dates
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDateModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                {profile.dates?.map((date, index) => (
                  <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Calendar size={20} color="white" className="mr-3" />
                      <View>
                        <Text className="text-white">{date.name}</Text>
                        <Text className="text-gray-400 text-sm">
                          {new Date(date.date).toLocaleDateString()}
                          {date.recurring && " (Recurring)"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Sizes Section */}
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    My Sizes
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSizeModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                {Object.entries(profile.sizes || {}).map(([type, size], index) => (
                  <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Shirt size={20} color="white" className="mr-3" />
                      <Text className="text-white capitalize">{type}</Text>
                    </View>
                    <View className="bg-gray-800 px-4 py-1 rounded">
                      <Text className="text-white font-medium">{size}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Gift Ideas Section */}
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Gift Ideas
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowGiftModal(true)}
                    className="bg-gray-800 rounded-full p-2"
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                {profile.giftIdeas?.map((gift, index) => (
                  <View key={index} className="bg-gray-900/60 rounded-xl p-4 mb-2">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Gift size={16} color="white" className="mr-2" />
                          <Text className="text-white font-medium">{gift.title}</Text>
                        </View>
                        {gift.description && (
                          <Text className="text-gray-400 text-sm mb-1">{gift.description}</Text>
                        )}
                        <View className="flex-row items-center mt-1">
                          {gift.price && (
                            <View className="flex-row items-center mr-3">
                              <DollarSign size={12} color="#9CA3AF" />
                              <Text className="text-gray-400 text-sm">{gift.price}</Text>
                            </View>
                          )}
                          {gift.link && (
                            <View className="flex-row items-center">
                              <Link size={12} color="#9CA3AF" className="mr-1" />
                              <Text className="text-blue-400 text-sm" numberOfLines={1}>Link</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeGiftIdea(index)}
                        className="ml-2"
                      >
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
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

      {/* Interest Modal */}
      <Modal
        visible={showInterestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInterestModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Interests</Text>
              <TouchableOpacity onPress={() => setShowInterestModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Add custom interest..."
              placeholderTextColor="#6B7280"
              value={newInterest}
              onChangeText={setNewInterest}
              onSubmitEditing={() => {
                if (newInterest.trim()) {
                  addInterest(newInterest.trim());
                }
              }}
            />
            
            <ScrollView className="max-h-48">
              <View className="flex-row flex-wrap">
                {PRESET_INTERESTS.filter(i => !profile.interests?.includes(i)).map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => addInterest(interest)}
                    className="bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-white">{interest}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Place Modal */}
      <Modal
        visible={showPlaceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlaceModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Place</Text>
              <TouchableOpacity onPress={() => setShowPlaceModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Place name..."
              placeholderTextColor="#6B7280"
              value={newPlace.name}
              onChangeText={(text) => setNewPlace({ ...newPlace, name: text })}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Notes about this place..."
              placeholderTextColor="#6B7280"
              value={newPlace.note}
              onChangeText={(text) => setNewPlace({ ...newPlace, note: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              onPress={addPlace}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Place</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Note</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Note title..."
              placeholderTextColor="#6B7280"
              value={newNote.title}
              onChangeText={(text) => setNewNote({ ...newNote, title: text })}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Note content..."
              placeholderTextColor="#6B7280"
              value={newNote.content}
              onChangeText={(text) => setNewNote({ ...newNote, content: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              onPress={addNote}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Note</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Important Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Event name (e.g., Anniversary)..."
              placeholderTextColor="#6B7280"
              value={newDate.name}
              onChangeText={(text) => setNewDate({ ...newDate, name: text })}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-800 rounded-lg px-4 py-3 mb-4"
            >
              <Text className="text-white">
                {newDate.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={newDate.date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewDate({ ...newDate, date: selectedDate });
                  }
                }}
              />
            )}
            
            <TouchableOpacity
              onPress={() => setNewDate({ ...newDate, recurring: !newDate.recurring })}
              className="flex-row items-center mb-4"
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                newDate.recurring ? 'bg-pink-500 border-pink-500' : 'border-gray-500'
              }`}>
                {newDate.recurring && <Check size={16} color="white" />}
              </View>
              <Text className="text-white">Recurring annually</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={addDate}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Date</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Size Modal */}
      <Modal
        visible={showSizeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSizeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Size</Text>
              <TouchableOpacity onPress={() => setShowSizeModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-400 mb-2">Select clothing type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {CLOTHING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedClothingType(type)}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    selectedClothingType === type ? 'bg-pink-500' : 'bg-gray-800'
                  }`}
                >
                  <Text className="text-white">{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {selectedClothingType && (
              <>
                <Text className="text-gray-400 mb-2">Select size:</Text>
                <ScrollView className="max-h-32 mb-4">
                  <View className="flex-row flex-wrap">
                    {CLOTHING_SIZES[selectedClothingType as keyof typeof CLOTHING_SIZES]?.map((size) => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setNewSize({ ...newSize, size })}
                        className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                          newSize.size === size ? 'bg-pink-500' : 'bg-gray-800'
                        }`}
                      >
                        <Text className="text-white">{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
            
            <TouchableOpacity
              onPress={addSize}
              disabled={!selectedClothingType || !newSize.size}
              className={`rounded-lg py-3 ${
                selectedClothingType && newSize.size ? 'bg-pink-500' : 'bg-gray-700'
              }`}
            >
              <Text className="text-white text-center font-semibold">Add Size</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gift Ideas Modal */}
      <Modal
        visible={showGiftModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGiftModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Gift Idea</Text>
              <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Gift name..."
              placeholderTextColor="#6B7280"
              value={newGift.title}
              onChangeText={(text) => setNewGift({ ...newGift, title: text })}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Description (optional)..."
              placeholderTextColor="#6B7280"
              value={newGift.description}
              onChangeText={(text) => setNewGift({ ...newGift, description: text })}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Price (optional)..."
              placeholderTextColor="#6B7280"
              value={newGift.price}
              onChangeText={(text) => setNewGift({ ...newGift, price: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Link (optional)..."
              placeholderTextColor="#6B7280"
              value={newGift.link}
              onChangeText={(text) => setNewGift({ ...newGift, link: text })}
              keyboardType="url"
              autoCapitalize="none"
              returnKeyType="done"
            />
            
            <TouchableOpacity
              onPress={addGiftIdea}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Gift Idea</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}