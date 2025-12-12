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
  FlatList,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Calendar,
  Heart,
  Music,
  MapPin,
  Shirt,
  ShoppingBag,
  Plus,
  X,
  Check,
  FileText,
  MoreHorizontal,
} from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadProfilePhoto } from "../../../lib/storage";
import { getLovedOneProfile, updateLovedOneProfile } from "../../../lib/database";

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
  anniversary?: string;
  firstDate?: string;
  notes?: Array<{ title: string; content: string }>;
  places?: Array<{ name: string; note: string; image?: string }>;
  sizes?: {
    shoes?: string;
    tops?: string;
    bottoms?: string;
    dresses?: string;
  };
  dates?: Array<{ name: string; date: string; recurring: boolean }>;
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
    notes: [],
    places: [],
    sizes: {},
    dates: [],
  });

  // Modal states
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal form states
  const [newInterest, setNewInterest] = useState("");
  const [newPlace, setNewPlace] = useState({ name: "", note: "" });
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newDate, setNewDate] = useState({ name: "", date: new Date(), recurring: false });
  const [newSize, setNewSize] = useState({ type: "", size: "" });
  const [selectedClothingType, setSelectedClothingType] = useState("");

  useEffect(() => {
    loadProfile();
  }, [id, user]);

  const loadProfile = async () => {
    if (user && id && typeof id === 'string') {
      const lovedOneProfile = await getLovedOneProfile(id, user.id);
      
      if (lovedOneProfile) {
        setProfile({
          id: lovedOneProfile.id || id,
          name: lovedOneProfile.name,
          relationship: lovedOneProfile.relationship || "",
          birthday: lovedOneProfile.birthday || "",
          interests: lovedOneProfile.interests || [],
          favoriteFood: lovedOneProfile.favorite_food || "",
          favoriteArtist: lovedOneProfile.favorite_artist || "",
          splurgeOn: lovedOneProfile.splurge_on || "",
          photoUrl: lovedOneProfile.photo_url || null,
          userId: lovedOneProfile.user_id,
          notes: [],
          places: [],
          sizes: {},
          dates: [],
        });
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
          const photoUrl = await uploadProfilePhoto(user?.id || "user", asset.base64, 'loved_one');
          
          if (photoUrl) {
            setProfile({ ...profile, photoUrl });
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
    if (!profile.interests.includes(interest)) {
      setProfile({ ...profile, interests: [...profile.interests, interest] });
    }
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
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

  const handleSave = async () => {
    if (!profile.name || !profile.relationship) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (user && id && typeof id === 'string') {
        await updateLovedOneProfile(id, user.id, {
          name: profile.name,
          relationship: profile.relationship,
          birthday: profile.birthday || null,
          interests: profile.interests,
          favorite_food: profile.favoriteFood || null,
          favorite_artist: profile.favoriteArtist || null,
          splurge_on: profile.splurgeOn || null,
          photo_url: profile.photoUrl || null,
        });
        
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
      }
    } catch (error) {
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
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
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
                  placeholder="Enter name"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View className="bg-gray-900/60 rounded-2xl p-4 mb-4">
                <Text className="text-gray-400 mb-2">Relationship *</Text>
                <TextInput
                  className="text-white text-lg bg-gray-800 rounded-lg px-3 py-2"
                  value={profile.relationship}
                  onChangeText={(text) => setProfile({ ...profile, relationship: text })}
                  placeholder="e.g., Partner, Friend, Family"
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Interests Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-400 text-sm uppercase tracking-wide">
                    Interests
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
                    {profile.interests.map((interest, index) => (
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
                    Notes
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
                    Sizes
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
                {PRESET_INTERESTS.filter(i => !profile.interests.includes(i)).map((interest) => (
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
        <View className="flex-1 justify-end bg-black/50">
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
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Notes about this place..."
              placeholderTextColor="#6B7280"
              value={newPlace.note}
              onChangeText={(text) => setNewPlace({ ...newPlace, note: text })}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity
              onPress={addPlace}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Place</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
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
            />
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Note content..."
              placeholderTextColor="#6B7280"
              value={newNote.content}
              onChangeText={(text) => setNewNote({ ...newNote, content: text })}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              onPress={addNote}
              className="bg-pink-500 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Add Important Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
              placeholder="Event name (e.g., Birthday, Anniversary)..."
              placeholderTextColor="#6B7280"
              value={newDate.name}
              onChangeText={(text) => setNewDate({ ...newDate, name: text })}
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
        </View>
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
    </View>
  );
}