import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Card, Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { createTicket } from '../services/api';
import Screen from '../components/Screen';

export default function SupportScreen({ user }) {
  const theme = useTheme();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!subject || !message) { Alert.alert('Missing', 'Please fill subject and message'); return; }
    try {
      await createTicket({ userId: user.id, subject, message });
      Alert.alert('Submitted', 'Support ticket created');
      setSubject(''); setMessage('');
    } catch (e) { Alert.alert('Error', e?.response?.data?.message || 'Failed'); }
  };

  return (
    <Screen>
      <Card>
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom:12 }}>Customer Support</Text>
          <TextInput
            label="Subject"
            mode="outlined"
            left={<TextInput.Icon icon="lifebuoy" />}
            value={subject}
            onChangeText={setSubject}
            style={{ marginBottom:8 }}
          />
          <HelperText type={subject ? 'info' : 'error'} visible>
            {subject ? `${subject.length} characters` : 'Please enter a subject'}
          </HelperText>
          <TextInput
            label="Describe your issue"
            mode="outlined"
            multiline
            numberOfLines={6}
            left={<TextInput.Icon icon="message-text-outline" />}
            value={message}
            onChangeText={setMessage}
            style={{ marginTop:4, marginBottom:8 }}
          />
          <HelperText type={message ? 'info' : 'error'} visible>
            {message ? `${message.length} characters` : 'Please describe the problem'}
          </HelperText>
          <Button
            mode="contained"
            icon="send"
            onPress={submit}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={{ borderRadius:12, marginTop:6 }}
            contentStyle={{ paddingVertical:6 }}
          >
            Submit Ticket
          </Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
