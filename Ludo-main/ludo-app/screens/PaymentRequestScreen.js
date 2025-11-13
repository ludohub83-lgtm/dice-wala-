import React, { useState } from 'react';
import { View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput, Button, Card, Text, Snackbar } from 'react-native-paper';
import { supabase } from '../services/supabaseClient';
import Screen from '../components/Screen';

export default function PaymentRequestScreen({ user, navigation }) {
  const [amount, setAmount] = useState('');
  const [txn, setTxn] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required', 'Allow access to photos to upload screenshot.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const uploadAndSubmit = async () => {
    if (!user?.id) return Alert.alert('Not logged in');
    if (!amount || !txn) return Alert.alert('Enter amount and transaction id');
    setSubmitting(true);
    try {
      let screenshot_url = null;
      if (image?.uri) {
        const file = await fetch(image.uri);
        const blob = await file.blob();
        const ext = image.uri.split('.').pop() || 'jpg';
        const path = `screenshots/${user.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('payment_screenshots').upload(path, blob, { contentType: blob.type || 'image/jpeg' });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('payment_screenshots').getPublicUrl(path);
        screenshot_url = pub.publicUrl;
      }
      const { error: insErr } = await supabase.from('payment_requests').insert({
        user_id: user.id,
        transaction_id: txn,
        amount: Number(amount),
        screenshot_url,
        status: 'pending',
      });
      if (insErr) throw insErr;
      setSnack('Submitted successfully');
      setAmount(''); setTxn(''); setImage(null);
    } catch (e) {
      Alert.alert('Error', e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Add Coins - Manual Payment</Text>
          <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ marginTop:12 }} />
          <TextInput label="Transaction ID" value={txn} onChangeText={setTxn} style={{ marginTop:12 }} />
          {image ? (
            <Image source={{ uri: image.uri }} style={{ width:'100%', height:220, borderRadius:8, marginTop:12 }} />
          ) : null}
          <View style={{ height:12 }} />
          <Button mode="outlined" onPress={pickImage}>Pick Screenshot</Button>
          <View style={{ height:8 }} />
          <Button mode="contained" loading={submitting} disabled={submitting} onPress={uploadAndSubmit}>Submit</Button>
        </Card.Content>
      </Card>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2200}>{snack}</Snackbar>
    </Screen>
  );
}
