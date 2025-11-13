import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LuckyDiceSelector({ visible, onSelect, onCancel }) {
  const [selectedNumber, setSelectedNumber] = useState(null);

  const diceNumbers = [1, 2, 3, 4, 5, 6];

  const handleSelect = () => {
    if (selectedNumber) {
      onSelect(selectedNumber);
      setSelectedNumber(null);
    }
  };

  const handleCancel = () => {
    setSelectedNumber(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="dice" size={32} color="#FFF" />
              <Text style={styles.title}>Lucky Dice</Text>
              <Text style={styles.subtitle}>Choose your lucky number!</Text>
            </View>

            {/* Dice Grid */}
            <View style={styles.diceGrid}>
              {diceNumbers.map((number) => (
                <TouchableOpacity
                  key={number}
                  style={[
                    styles.diceButton,
                    selectedNumber === number && styles.diceButtonSelected,
                  ]}
                  onPress={() => setSelectedNumber(number)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      selectedNumber === number
                        ? ['#4CAF50', '#388E3C']
                        : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
                    }
                    style={styles.diceGradient}
                  >
                    <Text style={styles.diceNumber}>{number}</Text>
                    {selectedNumber === number && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#FFD700" />
              <Text style={styles.infoText}>
                Select a number and your dice will roll that exact number!
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedNumber && styles.confirmButtonDisabled,
                ]}
                onPress={handleSelect}
                disabled={!selectedNumber}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedNumber
                      ? ['#4CAF50', '#388E3C']
                      : ['#666', '#555']
                  }
                  style={styles.confirmGradient}
                >
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Use Lucky Dice</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Usage Note */}
            <Text style={styles.usageNote}>
              ⚠️ Can only be used once per game
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  diceButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  diceButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  diceGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diceNumber: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#FFF',
    fontSize: 13,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  usageNote: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
