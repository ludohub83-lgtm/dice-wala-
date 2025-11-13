import React, { useState, useEffect } from 'react';
import { View, Image, Alert, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, HelperText, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadPayment, getPaymentQRCode } from '../services/api';
import Screen from '../components/Screen';

export default function UploadPayment({ user }) {
  const [image, setImage] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState({ upiId: 'vishesh@upi', qrImageUrl: null });
  const [loadingQR, setLoadingQR] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => { loadQRCode(); }, []);

  const loadQRCode = async () => {
    try {
      setLoadingQR(true);
      const data = await getPaymentQRCode();
      if (data) setQrData(data);
    } catch (e) {
      console.warn('Failed to load QR code:', e);
    } finally {
      setLoadingQR(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow photo access to upload screenshot.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (res.canceled || res.cancelled) return;
      const uri = res.assets ? res.assets[0].uri : res.uri;
      if (uri) setImage(uri);
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const submit = async () => {
    if (!image || !transactionId.trim()) {
      Alert.alert('Missing', 'Please upload screenshot and enter transaction ID');
      return;
    }

    try {
      setSubmitting(true);
      await uploadPayment({
        userId: user.id,
        uri: image,
        transactionId: transactionId.trim(),
        notes,
        amount: Number(amount) || undefined,
      });

      Alert.alert('Success', 'Payment submitted successfully! Awaiting admin approval.');
      setImage(null);
      setTransactionId('');
      setNotes('');
      setAmount('');
    } catch (e) {
      console.error('uploadPayment error:', e);
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to upload payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Card>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 8, fontWeight: 'bold' }}>Add Stars</Text>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              Scan the QR code or use UPI ID to make payment
            </Text>

            <Card mode="outlined" style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
              <Card.Content style={{ alignItems: 'center', padding: 20 }}>
                {loadingQR ? (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : qrData.qrImageUrl ? (
                  <Image source={{ uri: qrData.qrImageUrl }} style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 12 }} resizeMode="contain" />
                ) : (
                  <View style={{ width: 200, height: 200, borderWidth: 2, borderColor: theme.colors.outline, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceVariant, marginBottom: 12 }}>
                    <Text variant="bodySmall" style={{ textAlign: 'center', padding: 8 }}>QR Code Image{'\n'}(Admin can upload)</Text>
                  </View>
                )}
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 }}>
                  {qrData.upiId}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  UPI ID for payment
                </Text>
              </Card.Content>
            </Card>

            {image && (
              <Card mode="outlined" style={{ marginBottom: 12 }}>
                <Image source={{ uri: image }} style={{ width: '100%', height: 200, borderRadius: 12 }} />
              </Card>
            )}

            <Button mode="outlined" icon="image" onPress={pickImage} style={{ borderRadius: 12 }}>
              Pick Screenshot
            </Button>

            <Divider style={{ marginVertical: 12, opacity: 0.7 }} />

            <TextInput
              label="Amount (optional)"
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="cash" />}
              value={amount}
              onChangeText={setAmount}
              style={{ marginBottom: 8 }}
            />
            <HelperText type="info" visible>1₹ = 1 Star ⭐</HelperText>

            <TextInput
              label="Transaction ID"
              mode="outlined"
              left={<TextInput.Icon icon="pound" />}
              value={transactionId}
              onChangeText={setTransactionId}
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="Notes (optional)"
              mode="outlined"
              left={<TextInput.Icon icon="note-text" />}
              value={notes}
              onChangeText={setNotes}
              style={{ marginBottom: 8 }}
            />

            <Button
              mode="contained"
              icon="upload"
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              buttonColor={theme.colors.secondary}
              textColor="#fff"
              style={{ borderRadius: 12, marginTop: 6 }}
              contentStyle={{ paddingVertical: 6 }}
            >
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </Button>

            <HelperText type="info" visible style={{ marginTop: 8, textAlign: 'center' }}>
              After payment, upload screenshot and enter transaction ID. Admin will verify and add stars to your wallet.
            </HelperText>
          </Card.Content>
        </Card>
      </ScrollView>
    </Screen>
  );
}
