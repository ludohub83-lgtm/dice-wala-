import React, { useState, useEffect } from 'react';
import { View, Image, Alert, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, HelperText, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadPayment as submitPaymentRequest, getPaymentQRCode } from '../services/api';
import Screen from '../components/Screen';

const DEFAULT_UPI_ID = 'vishesh@upi'; // Default UPI ID

export default function ManualPaymentScreen({ user, route }) {
  const packageData = route?.params?.package;
  const isStarPackage = route?.params?.isStarPackage || false;
  
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(packageData ? packageData.price.replace('₹', '') : '');
  const [qrCode, setQrCode] = useState(null);
  const [upiId, setUpiId] = useState(DEFAULT_UPI_ID);
  const [loadingQR, setLoadingQR] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      setLoadingQR(true);
      const data = await getPaymentQRCode();
      if (data) {
        setUpiId(data.upiId || DEFAULT_UPI_ID);
        if (data.qrImageUrl) setQrCode(data.qrImageUrl);
      }
    } catch (e) {
      console.warn('Failed to load QR code, using default:', e);
    } finally {
      setLoadingQR(false);
    }
  };

  const pickScreenshot = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant gallery permission to upload screenshot');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || result.cancelled) return;

      const selectedUri = result.assets?.[0]?.uri || result.uri;
      if (selectedUri) {
        setScreenshot(selectedUri);
      } else {
        Alert.alert('Error', 'Could not read image URI.');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSubmit = async () => {
    if (!user || !user.id) {
      Alert.alert('Authentication Error', 'Please sign in again to submit payment');
      return;
    }
    
    if (!screenshot) {
      Alert.alert('Missing Screenshot', 'Please upload a payment screenshot');
      return;
    }
    if (!transactionId.trim()) {
      Alert.alert('Missing Transaction ID', 'Please enter UTR / Transaction ID');
      return;
    }
    const paymentAmount = Number(amount);
    if (!amount || paymentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    // Show confirmation dialog with warning
    Alert.alert(
      '⚠️ Confirm Submission',
      'I confirm that:\n\n• This is a REAL payment screenshot\n• The screenshot is not edited or fake\n• I understand fake payments will result in account ban\n\nDo you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Submit',
          style: 'default',
          onPress: async () => {
            try {
              setSubmitting(true);
              console.log('Submitting payment request...');
              
              await submitPaymentRequest({
                userId: user.id,
                uri: screenshot,
                transactionId: transactionId.trim(),
                notes: isStarPackage ? `Star Package: ${packageData?.coins} Stars` : 'Manual Payment Upload',
                amount: paymentAmount,
                packageInfo: isStarPackage ? {
                  coins: packageData?.coins,
                  bonus: packageData?.bonus,
                  packageId: packageData?.id
                } : null,
                isStarPackage: isStarPackage,
              });

              Alert.alert(
                'Success!',
                'Your payment request has been sent for verification. It may take 1–3 days.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setScreenshot(null);
                      setTransactionId('');
                      setAmount('');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Submit payment error:', error);
              Alert.alert(
                'Submission Failed',
                error?.message || 'Failed to submit payment request. Please try again.'
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Card>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              {isStarPackage ? 'Buy Star Package' : 'Add Coins (Manual Payment)'}
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              Scan the QR code or use UPI ID to make payment, then upload proof below.
            </Text>

            {/* Selected Package Display */}
            {isStarPackage && packageData && (
              <Card mode="outlined" style={{ marginBottom: 16, borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: theme.colors.primaryContainer }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary }}>
                        Selected Package
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
                        {packageData.coins} ⭐ Stars
                      </Text>
                      {packageData.bonus !== '0%' && (
                        <Text style={{ fontSize: 12, color: '#4CAF50', marginTop: 2 }}>
                          +{packageData.bonus} Bonus
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
                        Amount to Pay
                      </Text>
                      <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.primary }}>
                        {packageData.price}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* QR Code Section */}
            <Card mode="outlined" style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 20 }}>
                {loadingQR ? (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : qrCode ? (
                  <Image
                    source={{ uri: qrCode }}
                    style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 12 }}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={{
                      width: 200,
                      height: 200,
                      borderWidth: 2,
                      borderColor: theme.colors.outline,
                      borderStyle: 'dashed',
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.surfaceVariant,
                      marginBottom: 12,
                    }}
                  >
                    <Text variant="bodySmall" style={{ textAlign: 'center', padding: 8 }}>
                      QR Code{'\n'}(Admin can upload)
                    </Text>
                  </View>
                )}
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 }}>
                  {upiId}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  UPI ID for payment
                </Text>
              </Card.Content>
            </Card>

            <Divider style={{ marginVertical: 12 }} />

            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
              Payment Details
            </Text>

            {/* Warning Card */}
            <Card mode="outlined" style={{ marginBottom: 16, borderColor: '#FF9800', borderWidth: 2, backgroundColor: '#FFF3E0' }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Text style={{ fontSize: 24 }}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#E65100', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                      Important Notice
                    </Text>
                    <Text style={{ color: '#E65100', fontSize: 13, lineHeight: 18 }}>
                      • Only upload REAL-TIME payment screenshots{'\n'}
                      • Screenshots must show transaction date & time{'\n'}
                      • Fake or edited screenshots will be rejected{'\n'}
                      • Your account may be banned for fake payments{'\n'}
                      • Verification takes 1-3 business days
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Screenshot Upload */}
            {screenshot ? (
              <Card mode="outlined" style={{ marginBottom: 12 }}>
                <Image source={{ uri: screenshot }} style={{ width: '100%', height: 200, borderRadius: 12 }} resizeMode="contain" />
                <Button mode="text" icon="close" onPress={() => setScreenshot(null)} textColor={theme.colors.error} style={{ marginTop: 8 }}>
                  Remove Screenshot
                </Button>
              </Card>
            ) : (
              <Button mode="outlined" icon="camera" onPress={pickScreenshot} style={{ marginBottom: 12, borderRadius: 12 }}>
                Upload Payment Screenshot
              </Button>
            )}

            <HelperText type="info" visible style={{ marginBottom: 12 }}>
              Upload a screenshot of your payment confirmation (UPI receipt, bank statement, etc.)
            </HelperText>

            {/* Transaction ID Input */}
            <TextInput
              label="UTR / Transaction ID *"
              mode="outlined"
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Enter your transaction ID or UTR number"
              left={<TextInput.Icon icon="pound" />}
              style={{ marginBottom: 8 }}
            />
            <HelperText type="info" visible>
              Enter the unique transaction ID or UTR number from your payment receipt
            </HelperText>

            {/* Amount Input */}
            <TextInput
              label="Amount Paid (₹) *"
              mode="outlined"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount in rupees"
              left={<TextInput.Icon icon="cash" />}
              style={{ marginBottom: 8, marginTop: 8 }}
            />
            <HelperText type="info" visible>
              1₹ = 1 Star ⭐. The exact amount will be added to your wallet after verification.
            </HelperText>

            {/* Submit Button */}
            <Button
              mode="contained"
              icon="send"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting || !screenshot || !transactionId || !amount}
              buttonColor={theme.colors.secondary}
              textColor="#fff"
              style={{ borderRadius: 12, marginTop: 16 }}
              contentStyle={{ paddingVertical: 6 }}
            >
              {submitting ? 'Submitting...' : 'Submit Payment Request'}
            </Button>

            <HelperText type="info" visible style={{ marginTop: 12, textAlign: 'center' }}>
              Your payment request will be verified by admin within 1–3 days.
            </HelperText>
          </Card.Content>
        </Card>
      </ScrollView>
    </Screen>
  );
}
