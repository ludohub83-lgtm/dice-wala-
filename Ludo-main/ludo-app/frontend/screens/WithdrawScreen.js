import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Card, Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { requestWithdraw } from '../services/api';
import Screen from '../components/Screen';

export default function WithdrawScreen({ user }) {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');

  const submit = async () => {
    const amt = Number(amount || 0);
    if (!amt || amt < 1) { Alert.alert('Invalid', 'Enter a valid amount'); return; }
    try {
      await requestWithdraw({ userId: user.id, amount: amt, payoutInfo: { upi } });
      Alert.alert('Requested', 'Withdraw request submitted');
      setAmount(''); setUpi('');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed');
    }
  };

  return (
    <Screen>
      <Card>
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom:8 }}>Withdraw Coins</Text>
          <Text variant="bodyMedium" style={{ marginBottom:12 }}>Transfer coins to your bank via UPI payout.</Text>

          <TextInput
            label="Amount"
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="cash" />}
            value={amount}
            onChangeText={setAmount}
            style={{ marginBottom:6 }}
          />
          <HelperText type={amount && Number(amount) < 20 ? 'error' : 'info'} visible>
            Minimum withdraw 20 coins
          </HelperText>

          <TextInput
            label="UPI ID for payout"
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            value={upi}
            onChangeText={setUpi}
            style={{ marginBottom:8 }}
          />

          <Button
            mode="contained"
            icon="cash-refund"
            onPress={submit}
            buttonColor={theme.colors.secondary}
            textColor="#fff"
            style={{ borderRadius:12, marginTop:6 }}
            contentStyle={{ paddingVertical:6 }}
          >
            Request Withdraw
          </Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
