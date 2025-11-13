import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Share } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { listHistory } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

export default function SocialScreen({ navigation, user }) {
  const [tab, setTab] = useState('chats');
  const [recent, setRecent] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      if (isFocused && user?.id) {
        try {
          const items = await listHistory(user.id);
          setRecent(items || []);
        } catch {
          setRecent([]);
        }
      }
    })();
  }, [isFocused, user?.id]);

  const invite = () => {
    const msg = encodeURIComponent('Join me to play Ludo! 1₹ = 1 coin.');
    const url = `https://wa.me/?text=${msg}`;
    Linking.openURL(url).catch(() => {});
  };

  const shareInvite = async () => {
    try {
      await Share.share({
        message: 'Join me to play Ludo Hub! 1₹ = 1 coin. Download the app and invite me to a match.',
      });
    } catch {}
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Social</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[
                { value: 'chats', label: 'CHATS' },
                { value: 'friends', label: 'FRIENDS' },
              ]}
              style={styles.tabs}
            />
          </View>

          {/* Content */}
          {tab === 'last' ? (
            <View style={styles.section}>
              {recent.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Card.Content style={styles.emptyContent}>
                    <Ionicons name="game-controller-outline" size={64} color="#B0BEC5" />
                    <Text style={styles.emptyTitle}>No Games Played Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Join a match to find players and start playing
                    </Text>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => navigation.navigate('Lobby')}
                    >
                      <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.playGradient}>
                        <Ionicons name="play" size={24} color="#FFF" />
                        <Text style={styles.playText}>PLAY NOW</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Card.Content>
                </Card>
              ) : (
                <View style={styles.historyList}>
                  {recent.map((m, idx) => (
                    <TouchableOpacity
                      key={`${m.roomId}-${idx}`}
                      style={styles.historyCard}
                      onPress={() => navigation.navigate('HistoryDetail', m)}
                    >
                      <LinearGradient colors={['#263238', '#37474F']} style={styles.historyGradient}>
                        <View style={styles.historyIcon}>
                          <Ionicons name="game-controller" size={24} color="#FFF" />
                        </View>
                        <View style={styles.historyContent}>
                          <Text style={styles.historyTitle}>Room {m.roomId}</Text>
                          <Text style={styles.historySubtitle}>Entry: {m.fee} coins</Text>
                        </View>
                        <View
                          style={[
                            styles.resultBadge,
                            { backgroundColor: m.won ? '#4CAF50' : '#F44336' },
                          ]}
                        >
                          <Text style={styles.resultText}>{m.won ? 'Won' : 'Lost'}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Card style={styles.inviteCard}>
                <Card.Content style={styles.inviteContent}>
                  <Ionicons name="people-outline" size={64} color="#B0BEC5" />
                  <Text style={styles.inviteTitle}>
                    {tab === 'chats' ? 'No Chat Messages' : 'No Friends Yet'}
                  </Text>
                  <Text style={styles.inviteSubtitle}>
                    Invite friends to chat, talk & play together
                  </Text>

                  <View style={styles.inviteButtons}>
                    <TouchableOpacity style={styles.inviteButton} onPress={invite}>
                      <LinearGradient colors={['#25D366', '#128C7E']} style={styles.inviteGradient}>
                        <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                        <Text style={styles.inviteButtonText}>Invite via WhatsApp</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.inviteButton} onPress={shareInvite}>
                      <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.inviteGradient}>
                        <Ionicons name="share-social" size={24} color="#FFF" />
                        <Text style={styles.inviteButtonText}>Share Invite</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    padding: 16,
  },
  tabs: {
    backgroundColor: '#263238',
  },
  section: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: '#263238',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  playButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  playText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  historyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historySubtitle: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resultText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inviteCard: {
    backgroundColor: '#263238',
  },
  inviteContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  inviteTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  inviteSubtitle: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  inviteButtons: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  inviteButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  inviteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  inviteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
