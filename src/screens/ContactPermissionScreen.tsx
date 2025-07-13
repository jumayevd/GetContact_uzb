import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { API_BASE_URL } from '../services/api';

interface ContactPermissionScreenProps {
  navigation: any;
  route: any;
}

const ContactPermissionScreen: React.FC<ContactPermissionScreenProps> = ({
  navigation,
  route,
}) => {
  const { token, user } = route.params || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      requestAndUploadContacts();
    } else {
      Alert.alert('Missing Info', 'Token or user data missing');
      navigation.goBack();
    }
  }, []);

  const requestAndUploadContacts = async () => {
    try {
      console.log('[Permission] Checking existing permissions...');
      const { status: existingStatus } = await Contacts.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('[Permission] Requesting permission...');
        const { status: requestedStatus } = await Contacts.requestPermissionsAsync();
        finalStatus = requestedStatus;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Permission] Permission not granted.');
        Alert.alert(
          'Permission Required',
          'We need access to your contacts to continue.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      console.log('[Contacts] Fetching contacts...');
      const { data: contacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const formattedContacts = (contacts || [])
        .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map(c => {
          const phone = c.phoneNumbers![0].number?.replace(/\s/g, '') || '';
          const name = c.name?.trim() || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
          return { name, phone };
        })
        .filter(c => c.phone.length > 0)
        .slice(0, 1000);

      console.log(`[Upload] Found ${formattedContacts.length} contacts to upload`);

      if (formattedContacts.length > 0) {
        const response = await fetch(`${API_BASE_URL}/api/contacts/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contacts: formattedContacts }),
        });

        const result = await response.json();
        console.log('[Upload] Response:', result);
      }

      console.log('[Navigation] Navigating to MainApp...');
      navigation.replace('MainApp', { token, user });

    } catch (error) {
      console.error('[Error] Contact permission or upload error:', error);
      Alert.alert('Error', 'Something went wrong while accessing contacts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Uploading contacts...</Text>
        </>
      ) : (
        <Text style={styles.loadingText}>Done</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ContactPermissionScreen;
