import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, Button, useTheme, Divider, Chip, ActivityIndicator, SegmentedButtons, IconButton } from 'react-native-paper';
import { api, fetchPendingPayments, rejectPayment, approvePayment, fetchPaymentRequests, verifyPaymentRequest } from '../services/api';
import AdminDashboard from './AdminDashboard';
import Screen from '../components/Screen';

export default function AdminScreen({ user, route, navigation }) {
  const [pending, setPending] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [starPackages, setStarPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(route?.params?.tab || 'payments');
  const [showDashboard, setShowDashboard] = useState(!route?.params?.showDetails);
  const theme = useTheme();

  const load = async () => {
    try {
      setLoading(true);
      const allPayments = await fetchPendingPayments();
      
      // Separate regular payments and star packages
      const regularPayments = allPayments.filter(p => !p.isStarPackage);
      const packages = allPayments.filter(p => p.isStarPackage);
      
      setPending(regularPayments || []);
      setStarPackages(packages || []);
      
      const w = await api.get('/withdraw/pending');
      setWithdraws(w.data || []);
    } catch (e) { 
      Alert.alert('Error', 'Failed to load data'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await approvePayment(id);
      Alert.alert('Success', 'Payment approved and coins added to user wallet');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id, markAsFake = false) => {
    try {
      await rejectPayment(id, markAsFake);
      Alert.alert('Success', markAsFake ? 'Payment marked as fake' : 'Payment rejected');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to reject');
    }
  };

  const approveW = async (id) => {
    try {
      await api.post(`/withdraw/approve/${id}`);
      Alert.alert('Success', 'Withdrawal approved');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to approve');
    }
  };

  const rejectW = async (id) => {
    try {
      await api.post(`/withdraw/reject/${id}`);
      Alert.alert('Success', 'Withdrawal rejected and coins refunded');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to reject');
    }
  };

  const handleVerifyManualPayment = async (id, verified) => {
    try {
      const result = await verifyPaymentRequest(id, verified);
      Alert.alert(
        'Success',
        verified 
          ? 'Payment verified and coins added to user wallet' 
          : 'Payment marked as fake'
      );
      await load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to verify payment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show dashboard by default, or show detailed view if specific tab requested
  if (showDashboard && !route?.params?.showDetails) {
    return <AdminDashboard navigation={navigation} user={user} onNavigateToDetails={(tab) => {
      setShowDashboard(false);
      setActiveTab(tab);
    }} />;
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop:12 }}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:8 }}>
        <IconButton icon="arrow-left" onPress={() => setShowDashboard(true)} />
        <Text variant="titleLarge" style={{ flex:1, fontWeight:'bold' }}>Admin Panel</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom:20 }}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'payments', label: 'Payments', icon: 'cash' },
            { value: 'packages', label: 'Star Packages', icon: 'star' },
            { value: 'withdraws', label: 'Withdrawals', icon: 'cash-refund' }
          ]}
          style={{ marginBottom:16 }}
        />

        {activeTab === 'payments' && (
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom:8, fontWeight:'bold' }}>
                Pending Payment Requests
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:16 }}>
                {pending.length} pending request{pending.length !== 1 ? 's' : ''}
              </Text>

              {pending.length === 0 ? (
                <View style={{ padding:20, alignItems:'center' }}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    No pending payments
                  </Text>
                </View>
              ) : (
                pending.map((item, index) => (
                  <View key={item.id || item._id || index}>
                    <Card mode="outlined" style={{ marginBottom:12 }}>
                      <Card.Content>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                          <Text variant="titleMedium" style={{ fontWeight:'bold' }}>
                            User: {item.user_id || item.userId}
                          </Text>
                          <Chip mode="outlined" textStyle={{ fontSize:12 }}>
                            ₹{item.amount || 0}
                          </Chip>
                        </View>

                        <Text variant="bodyMedium" style={{ marginBottom:4 }}>
                          <Text style={{ fontWeight:'bold' }}>Txn ID:</Text> {item.transaction_id || item.transactionId}
                        </Text>

                        {item.notes && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:4 }}>
                            Notes: {item.notes}
                          </Text>
                        )}

                        {item.screenshot_url && (
                          <View style={{ marginVertical:8 }}>
                            <Image 
                              source={{ uri: item.screenshot_url }} 
                              style={{ width: '100%', height: 150, borderRadius:8 }} 
                              resizeMode="contain"
                            />
                          </View>
                        )}

                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:12 }}>
                          Submitted: {formatDate(item.created_at || item.createdAt)}
                        </Text>

                        <Divider style={{ marginVertical:8 }} />

                        <View style={{ flexDirection:'row', gap:8 }}>
                          <Button
                            mode="contained"
                            icon="check-circle"
                            onPress={() => handleApprove(item.id || item._id)}
                            buttonColor={theme.colors.secondary}
                            textColor="#fff"
                            style={{ flex:1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            mode="outlined"
                            icon="close-circle"
                            onPress={() => handleReject(item.id || item._id, false)}
                            textColor={theme.colors.error}
                            style={{ flex:1 }}
                          >
                            Reject
                          </Button>
                          <Button
                            mode="outlined"
                            icon="alert-circle"
                            onPress={() => {
                              Alert.alert(
                                'Mark as Fake',
                                'Are you sure you want to mark this payment as fake?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Mark Fake', style: 'destructive', onPress: () => handleReject(item.id || item._id, true) }
                                ]
                              );
                            }}
                            textColor={theme.colors.tertiary}
                            style={{ flex:1 }}
                          >
                            Fake
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        )}

        {activeTab === 'packages' && (
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom:8, fontWeight:'bold' }}>
                Star Package Purchases
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:16 }}>
                {starPackages.length} pending star package{starPackages.length !== 1 ? 's' : ''}
              </Text>

              {starPackages.length === 0 ? (
                <View style={{ padding:20, alignItems:'center' }}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    No pending star package purchases
                  </Text>
                </View>
              ) : (
                starPackages.map((item, index) => (
                  <View key={item.id || item._id || index}>
                    <Card mode="outlined" style={{ marginBottom:12, borderLeftWidth:4, borderLeftColor: '#FFD700' }}>
                      <Card.Content>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                          <Text variant="titleMedium" style={{ fontWeight:'bold' }}>
                            User: {item.user_id || item.userId}
                          </Text>
                          <Chip 
                            mode="flat" 
                            textStyle={{ fontSize:12, fontWeight:'bold' }}
                            style={{ backgroundColor: '#FFD700' + '30' }}
                            icon="star"
                          >
                            {item.packageInfo?.coins || item.amount} Stars
                          </Chip>
                        </View>

                        {item.packageInfo && (
                          <View style={{ backgroundColor: theme.colors.surfaceVariant, padding:12, borderRadius:8, marginBottom:8 }}>
                            <Text variant="bodyMedium" style={{ fontWeight:'bold', marginBottom:4 }}>
                              Package Details:
                            </Text>
                            <Text variant="bodySmall">
                              • Base Stars: {item.packageInfo.coins}
                            </Text>
                            {item.packageInfo.bonus && item.packageInfo.bonus !== '0%' && (
                              <Text variant="bodySmall" style={{ color:'#4CAF50' }}>
                                • Bonus: +{item.packageInfo.bonus}
                              </Text>
                            )}
                            <Text variant="bodySmall">
                              • Amount Paid: ₹{item.amount}
                            </Text>
                          </View>
                        )}

                        <Text variant="bodyMedium" style={{ marginBottom:4 }}>
                          <Text style={{ fontWeight:'bold' }}>Transaction ID:</Text> {item.transaction_id || item.transactionId}
                        </Text>

                        {item.screenshot_url && (
                          <TouchableOpacity 
                            style={{ marginVertical:8 }}
                            onPress={() => {
                              Alert.alert('Payment Screenshot', 'View full image in details', [
                                { text: 'OK' }
                              ]);
                            }}
                          >
                            <Image 
                              source={{ uri: item.screenshot_url }} 
                              style={{ width: '100%', height: 200, borderRadius:8, backgroundColor: theme.colors.surfaceVariant }} 
                              resizeMode="contain"
                            />
                            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop:4, textAlign:'center' }}>
                              Tap to view full screenshot
                            </Text>
                          </TouchableOpacity>
                        )}

                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:12 }}>
                          Submitted: {formatDate(item.created_at || item.createdAt)}
                        </Text>

                        <Divider style={{ marginVertical:8 }} />

                        <View style={{ flexDirection:'row', gap:8 }}>
                          <Button
                            mode="contained"
                            icon="check-circle"
                            onPress={() => handleApprove(item.id || item._id)}
                            buttonColor={theme.colors.secondary}
                            textColor="#fff"
                            style={{ flex:1 }}
                          >
                            ✅ Approve & Add Stars
                          </Button>
                          <Button
                            mode="outlined"
                            icon="close-circle"
                            onPress={() => handleReject(item.id || item._id, false)}
                            textColor={theme.colors.error}
                            style={{ flex:1 }}
                          >
                            Reject
                          </Button>
                          <Button
                            mode="outlined"
                            icon="alert-circle"
                            onPress={() => {
                              Alert.alert(
                                'Mark as Fake',
                                'Are you sure you want to mark this payment as fake?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Mark Fake', style: 'destructive', onPress: () => handleReject(item.id || item._id, true) }
                                ]
                              );
                            }}
                            textColor={theme.colors.tertiary}
                            style={{ flex:1 }}
                          >
                            Fake
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        )}

        {activeTab === 'manual' && (
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom:8, fontWeight:'bold' }}>
                Manual Payment Requests
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:16 }}>
                {manualPayments.length} pending request{manualPayments.length !== 1 ? 's' : ''}
              </Text>

              {manualPayments.length === 0 ? (
                <View style={{ padding:20, alignItems:'center' }}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    No pending manual payment requests
                  </Text>
                </View>
              ) : (
                manualPayments.map((item, index) => (
                  <View key={item.id || item._id || index}>
                    <Card mode="outlined" style={{ marginBottom:12, borderLeftWidth:4, borderLeftColor: theme.colors.primary }}>
                      <Card.Content>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                          <Text variant="titleMedium" style={{ fontWeight:'bold' }}>
                            User: {item.user_id || item.userId}
                          </Text>
                          <Chip 
                            mode="outlined" 
                            textStyle={{ fontSize:12 }}
                            style={{ backgroundColor: theme.colors.surfaceVariant }}
                          >
                            ₹{item.amount || 0}
                          </Chip>
                        </View>

                        <Text variant="bodyMedium" style={{ marginBottom:4 }}>
                          <Text style={{ fontWeight:'bold' }}>Transaction ID:</Text> {item.transaction_id || item.transactionId}
                        </Text>

                        {item.screenshot_url && (
                          <TouchableOpacity 
                            style={{ marginVertical:8 }}
                            onPress={() => {
                              Alert.alert('Payment Screenshot', 'View full image in details', [
                                { text: 'OK' }
                              ]);
                            }}
                          >
                            <Image 
                              source={{ uri: item.screenshot_url }} 
                              style={{ width: '100%', height: 200, borderRadius:8, backgroundColor: theme.colors.surfaceVariant }} 
                              resizeMode="contain"
                            />
                            <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop:4, textAlign:'center' }}>
                              Tap to view full screenshot
                            </Text>
                          </TouchableOpacity>
                        )}

                        <View style={{ flexDirection:'row', alignItems:'center', marginTop:8, marginBottom:12 }}>
                          <Chip 
                            mode="flat" 
                            textStyle={{ fontSize:11, fontWeight:'bold' }}
                            style={{ backgroundColor: theme.colors.warning + '20' }}
                          >
                            Status: {item.status || 'Pending'}
                          </Chip>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft:12 }}>
                            {formatDate(item.created_at || item.createdAt)}
                          </Text>
                        </View>

                        <Divider style={{ marginVertical:8 }} />

                        <View style={{ flexDirection:'row', gap:8 }}>
                          <Button
                            mode="contained"
                            icon="check-circle"
                            onPress={() => handleVerifyManualPayment(item.id || item._id, true)}
                            buttonColor={theme.colors.secondary}
                            textColor="#fff"
                            style={{ flex:1 }}
                          >
                            ✅ Mark as True
                          </Button>
                          <Button
                            mode="outlined"
                            icon="alert-circle"
                            onPress={() => {
                              Alert.alert(
                                'Mark as Fake',
                                'Are you sure you want to mark this payment as fake? No coins will be added.',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Mark Fake', style: 'destructive', onPress: () => handleVerifyManualPayment(item.id || item._id, false) }
                                ]
                              );
                            }}
                            textColor={theme.colors.tertiary}
                            style={{ flex:1 }}
                          >
                            ❌ Mark as Fake
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        )}

        {activeTab === 'withdraws' && (
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom:8, fontWeight:'bold' }}>
                Pending Withdrawal Requests
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:16 }}>
                {withdraws.length} pending request{withdraws.length !== 1 ? 's' : ''}
              </Text>

              {withdraws.length === 0 ? (
                <View style={{ padding:20, alignItems:'center' }}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    No pending withdrawals
                  </Text>
                </View>
              ) : (
                withdraws.map((item, index) => (
                  <View key={item.id || item._id || index}>
                    <Card mode="outlined" style={{ marginBottom:12 }}>
                      <Card.Content>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                          <Text variant="titleMedium" style={{ fontWeight:'bold' }}>
                            User: {item.user_id || item.userId}
                          </Text>
                          <Chip mode="outlined" textStyle={{ fontSize:12 }}>
                            ₹{item.amount || 0}
                          </Chip>
                        </View>

                        {item.payout_info && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:4 }}>
                            Payout: {JSON.stringify(item.payout_info)}
                          </Text>
                        )}

                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom:12 }}>
                          Requested: {formatDate(item.created_at || item.createdAt)}
                        </Text>

                        <Divider style={{ marginVertical:8 }} />

                        <View style={{ flexDirection:'row', gap:8 }}>
                          <Button
                            mode="contained"
                            icon="check-circle"
                            onPress={() => approveW(item.id || item._id)}
                            buttonColor={theme.colors.secondary}
                            textColor="#fff"
                            style={{ flex:1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            mode="outlined"
                            icon="close-circle"
                            onPress={() => rejectW(item.id || item._id)}
                            textColor={theme.colors.error}
                            style={{ flex:1 }}
                          >
                            Reject
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
