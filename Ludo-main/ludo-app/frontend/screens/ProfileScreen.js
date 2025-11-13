import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import { firebase, storage } from '../services/firebaseConfig';

export default function ProfileScreen({ user, navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    photoURL: '',
    bio: '',
    coins: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  });

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const db = firebase.firestore();
      const doc = await db.collection('users').doc(user.id).get();
      
      if (doc.exists) {
        const data = doc.data();
        setProfileData({
          displayName: data.displayName || data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
          bio: data.bio || '',
          coins: data.coins || 0,
          gamesPlayed: data.gamesPlayed || 0,
          gamesWon: data.gamesWon || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant gallery permission to upload photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || result.cancelled) return;

      const selectedUri = result.assets?.[0]?.uri || result.uri;
      if (selectedUri) {
        await uploadProfilePhoto(selectedUri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePhoto = async (uri) => {
    try {
      setUploading(true);

      // Check if user is authenticated
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to upload a photo. Please sign in again.');
        return;
      }

      // Convert to blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to read image file');
      }
      
      const blob = await response.blob();

      // Check file size (limit to 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'Image size too large. Please use an image under 5MB.');
        setUploading(false);
        return;
      }

      const filename = `profiles/${user.id}_${Date.now()}.jpg`;
      const storageRef = storage.ref().child(filename);

      // Upload with metadata
      const uploadTask = storageRef.put(blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          userId: user.id,
          uploadedAt: new Date().toISOString(),
        }
      });

      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL
      const downloadURL = await storageRef.getDownloadURL();

      // Update Firestore
      const db = firebase.firestore();
      await db.collection('users').doc(user.id).update({
        photoURL: downloadURL,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload photo. Please try again.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Permission denied. Please check Firebase Storage rules.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'An unknown error occurred. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!profileData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    try {
      setSaving(true);
      const db = firebase.firestore();
      
      await db.collection('users').doc(user.id).update({
        displayName: profileData.displayName.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        bio: profileData.bio.trim(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const winRate = profileData.gamesPlayed > 0 
    ? ((profileData.gamesWon / profileData.gamesPlayed) * 100).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <Screen>
        <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </Screen>
    );
  }

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Header Card */}
          <Card style={styles.headerCard}>
            <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.headerGradient}>
              <View style={styles.profilePhotoContainer}>
                <TouchableOpacity onPress={pickImage} disabled={uploading}>
                  {profileData.photoURL ? (
                    <Image source={{ uri: profileData.photoURL }} style={styles.profilePhoto} />
                  ) : (
                    <Avatar.Icon size={120} icon="account" style={styles.avatarIcon} />
                  )}
                  <View style={styles.cameraButton}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="camera" size={20} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{profileData.displayName || 'Player'}</Text>
              <Text style={styles.userId}>ID: {user.id.substring(0, 8)}</Text>
            </LinearGradient>
          </Card>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="star" size={32} color="#FFD700" />
                <Text style={styles.statValue}>{profileData.coins.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="game-controller" size={32} color="#4CAF50" />
                <Text style={styles.statValue}>{profileData.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="trophy" size={32} color="#FF9800" />
                <Text style={styles.statValue}>{profileData.gamesWon}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="trending-up" size={32} color="#2196F3" />
                <Text style={styles.statValue}>{winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Edit Profile Section */}
          <Card style={styles.editCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Edit Profile</Text>

              <TextInput
                label="Display Name *"
                mode="outlined"
                value={profileData.displayName}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, displayName: text }))}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                theme={{ colors: { background: '#263238' } }}
              />

              <TextInput
                label="Email"
                mode="outlined"
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                theme={{ colors: { background: '#263238' } }}
              />

              <TextInput
                label="Phone"
                mode="outlined"
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                theme={{ colors: { background: '#263238' } }}
              />

              <TextInput
                label="Bio"
                mode="outlined"
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="text" />}
                style={styles.input}
                theme={{ colors: { background: '#263238' } }}
                placeholder="Tell us about yourself..."
              />

              <Button
                mode="contained"
                icon="content-save"
                onPress={saveProfile}
                loading={saving}
                disabled={saving}
                buttonColor="#4CAF50"
                style={styles.saveButton}
                contentStyle={{ paddingVertical: 8 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Card.Content>
          </Card>

          {/* Account Info */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Account Information</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Account Verified</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#2196F3" />
                <Text style={styles.infoText}>Member since 2025</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="lock-closed" size={20} color="#FF9800" />
                <Text style={styles.infoText}>Secure Account</Text>
              </View>
            </Card.Content>
          </Card>

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
  },
  headerCard: {
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  profilePhotoContainer: {
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#263238',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 4,
  },
  editCard: {
    backgroundColor: '#263238',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#1a2530',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: '#263238',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    color: '#B0BEC5',
    fontSize: 14,
  },
});
