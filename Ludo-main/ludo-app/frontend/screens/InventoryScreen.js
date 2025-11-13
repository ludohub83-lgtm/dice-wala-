import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Portal, Dialog, Button, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { getWallet, buyDice, listOwnedDice, getEquippedDice, equipDice } from '../services/api';

export default function InventoryScreen({ navigation, user }) {
  const [coins, setCoins] = useState(0);
  const [snack, setSnack] = useState({ visible: false, msg: '' });
  const [buying, setBuying] = useState(null);
  const [dice, setDice] = useState([
    { key: 'default', name: 'Default', price: 0, locked: false, color: ['#607D8B', '#455A64'] },
    { key: 'halloween', name: 'Halloween', price: 249, locked: true, color: ['#FF9800', '#F57C00'] },
    { key: 'football', name: 'Football', price: 249, locked: true, color: ['#4CAF50', '#388E3C'] },
    { key: 'newyear', name: 'New Year', price: 249, locked: true, color: ['#2196F3', '#1976D2'] },
    { key: 'tricolour', name: 'Tri-colour', price: 249, locked: true, color: ['#FF9800', '#4CAF50'] },
    { key: 'heart', name: 'Heart', price: 249, locked: true, color: ['#E91E63', '#C2185B'] },
    { key: 'colors', name: 'Colors', price: 249, locked: true, color: ['#9C27B0', '#7B1FA2'] },
    { key: 'summer', name: 'Summer', price: 249, locked: true, color: ['#FFD700', '#FFA000'] },
    { key: 'sixer', name: 'Sixer', price: 249, locked: true, color: ['#F44336', '#D32F2F'] },
    { key: 'cricket', name: 'Cricket King', price: 249, locked: true, color: ['#00BCD4', '#0097A7'] },
    { key: 'diya', name: 'Diya', price: 249, locked: true, color: ['#FF5722', '#E64A19'] },
    { key: 'pumpkin', name: 'Pumpkin', price: 75, locked: true, color: ['#FF6F00', '#E65100'] },
  ]);
  const [equipped, setEquipped] = useState('default');

  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const w = await getWallet(user.id);
          setCoins(w?.coins || 0);
          const owned = await listOwnedDice(user.id);
          if (owned && owned.length) {
            setDice((prev) =>
              prev.map((x) => (owned.includes(x.key) ? { ...x, locked: false, price: 0 } : x))
            );
            let eq = 'default';
            try {
              eq = await getEquippedDice(user.id);
            } catch {}
            if (!owned.includes(eq)) eq = owned.includes('default') ? 'default' : owned[0];
            setEquipped(eq || 'default');
          } else {
            setEquipped('default');
          }
        }
      } catch {}
    })();
  }, [user?.id]);

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inventory</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <View style={styles.coinsBox}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.coinsText}>{coins}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Dice Collection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dice Collection</Text>
            <View style={styles.diceGrid}>
              {dice.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={styles.diceCard}
                  onPress={async () => {
                    if (d.locked) {
                      setBuying(d);
                    } else {
                      try {
                        await equipDice({ userId: user.id, key: d.key });
                        setEquipped(d.key);
                        setSnack({ visible: true, msg: `Equipped ${d.name}` });
                      } catch (e) {
                        setSnack({
                          visible: true,
                          msg: e?.response?.data?.message || 'Failed to equip',
                        });
                      }
                    }
                  }}
                >
                  <LinearGradient colors={d.color} style={styles.diceGradient}>
                    {d.locked && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={16} color="#FFF" />
                      </View>
                    )}
                    {equipped === d.key && !d.locked && (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      </View>
                    )}
                    <View style={styles.diceIcon}>
                      <Text style={styles.diceNumber}>6</Text>
                    </View>
                    <Text style={styles.diceName}>{d.name}</Text>
                    {d.locked ? (
                      <View style={styles.priceTag}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.priceText}>{d.price}</Text>
                      </View>
                    ) : equipped === d.key ? (
                      <View style={styles.equippedTag}>
                        <Text style={styles.equippedText}>Equipped</Text>
                      </View>
                    ) : (
                      <View style={styles.ownedTag}>
                        <Text style={styles.ownedText}>Owned</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Purchase Dialog */}
        <Portal>
          <Dialog visible={!!buying} onDismiss={() => setBuying(null)}>
            <Dialog.Title>Unlock Dice</Dialog.Title>
            <Dialog.Content>
              <Text>Theme: {buying?.name}</Text>
              <Text style={{ marginTop: 6 }}>Price: {buying?.price} coins</Text>
              <Text style={{ marginTop: 6 }}>Your coins: {coins}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setBuying(null)}>Cancel</Button>
              <Button
                mode="contained"
                onPress={async () => {
                  if (!buying) return;
                  if (coins < buying.price) {
                    setSnack({
                      visible: true,
                      msg: 'Insufficient balance. Please add coins first.',
                    });
                    setBuying(null);
                    navigation.navigate('UploadPayment');
                    return;
                  }
                  try {
                    const res = await buyDice({
                      userId: user.id,
                      key: buying.key,
                      price: buying.price,
                    });
                    setCoins(res?.balance ?? coins - buying.price);
                    setDice((prev) =>
                      prev.map((x) =>
                        x.key === buying.key ? { ...x, locked: false, price: 0 } : x
                      )
                    );
                    setSnack({ visible: true, msg: `Unlocked ${buying.name}` });
                  } catch (e) {
                    setSnack({
                      visible: true,
                      msg: e?.response?.data?.message || 'Purchase failed',
                    });
                  } finally {
                    setBuying(null);
                  }
                }}
              >
                Buy
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Snackbar
          visible={snack.visible}
          onDismiss={() => setSnack({ visible: false, msg: '' })}
          duration={2500}
          action={{ label: 'OK', onPress: () => setSnack({ visible: false, msg: '' }) }}
        >
          {snack.msg}
        </Snackbar>
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
  coinsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  coinsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  diceCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  diceGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  equippedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  diceIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceNumber: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  diceName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  equippedTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  equippedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownedTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ownedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
