import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { firebase } from '../services/firebaseConfig';

export default function TransactionsScreen({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [user.id]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const db = firebase.firestore();
      
      // Get payment transactions
      const paymentsSnapshot = await db
        .collection('payments')
        .where('userId', '==', user.id)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'payment',
        ...doc.data()
      }));

      // Get withdrawal transactions
      const withdrawalsSnapshot = await db
        .collection('withdrawals')
        .where('userId', '==', user.id)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      const withdrawals = withdrawalsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'withdrawal',
        ...doc.data()
      }));

      // Combine and sort by date
      const allTransactions = [...payments, ...withdrawals].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Screen>
      <LinearGradient colors={['#1a4d8f', '#0d2847']} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="receipt" size={32} color="#FFD700" />
            <Text style={styles.headerTitle}>Transaction History</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="document-text-outline" size={64} color="#B0BEC5" />
                <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                <Text style={styles.emptyText}>
                  Your payment and withdrawal history will appear here
                </Text>
              </Card.Content>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <Card.Content>
                  <View style={styles.transactionRow}>
                    <View style={[styles.iconContainer, { backgroundColor: transaction.type === 'payment' ? '#4CAF5020' : '#F4433620' }]}>
                      <Ionicons
                        name={transaction.type === 'payment' ? 'arrow-down' : 'arrow-up'}
                        size={24}
                        color={transaction.type === 'payment' ? '#4CAF50' : '#F44336'}
                      />
                    </View>

                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionType}>
                        {transaction.type === 'payment' ? 'Payment' : 'Withdrawal'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                      {transaction.transactionId && (
                        <Text style={styles.transactionId}>
                          ID: {transaction.transactionId}
                        </Text>
                      )}
                    </View>

                    <View style={styles.transactionRight}>
                      <Text style={[styles.transactionAmount, { color: transaction.type === 'payment' ? '#4CAF50' : '#F44336' }]}>
                        {transaction.type === 'payment' ? '+' : '-'}{transaction.amount || 0} ⭐
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                        <Ionicons
                          name={getStatusIcon(transaction.status)}
                          size={14}
                          color={getStatusColor(transaction.status)}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                          {transaction.status || 'pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
  },
  emptyCard: {
    backgroundColor: '#263238',
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionCard: {
    backgroundColor: '#263238',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
    color: '#B0BEC5',
    fontSize: 12,
  },
  transactionId: {
    color: '#90A4AE',
    fontSize: 11,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
