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

const ContactPermissionScreen: React.FC<ContactPermissionScreenProps> = ({ navigation, route }) => {
  const { token, user } = route.params;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAndUploadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestAndUploadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data: contacts } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        const formattedContacts = (contacts || [])
          .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0)
          .map(c => ({
            name: c.name || 'Unknown',
            phone: c.phoneNumbers[0].number.replace(/\s/g, ''),
          }))
          .slice(0, 1000);
        if (formattedContacts.length > 0) {
          await fetch(`${API_BASE_URL}/api/contacts/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ contacts: formattedContacts }),
          });
        }
        navigation.replace('MainApp', { token, user });
      } else {
        Alert.alert('Permission required', 'Contact access is needed for full functionality.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload contacts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Uploading contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Preparing to upload contacts...</Text>
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
  },
});

export default ContactPermissionScreen; 