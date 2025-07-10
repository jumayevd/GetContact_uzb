import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Contacts from 'react-native-contacts';

interface ContactPermissionScreenProps {
  navigation: any;
  route: any;
}

const ContactPermissionScreen: React.FC<ContactPermissionScreenProps> = ({
  navigation,
  route,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const { token, user } = route.params;

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
      setPermissionStatus(result);
      
      if (result === RESULTS.GRANTED) {
        // Permission already granted, proceed to main app
        navigation.replace('MainApp', { token, user });
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestContactPermission = async () => {
    setLoading(true);
    try {
      const result = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
      setPermissionStatus(result);
      
      if (result === RESULTS.GRANTED) {
        // Permission granted, upload contacts and proceed
        await uploadUserContacts();
        Alert.alert(
          'Permission Granted',
          'Contact access granted! You can now search for contacts.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('MainApp', { token, user }),
            },
          ]
        );
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          'Permission Denied',
          'Contact access is required for full functionality. You can still use the app with limited features.',
          [
            {
              text: 'Continue Anyway',
              onPress: () => navigation.replace('MainApp', { token, user }),
            },
            {
              text: 'Try Again',
              onPress: requestContactPermission,
            },
          ]
        );
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Contact access is blocked. Please enable it in your device settings to use all features.',
          [
            {
              text: 'Continue Anyway',
              onPress: () => navigation.replace('MainApp', { token, user }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to get contact permission');
    } finally {
      setLoading(false);
    }
  };

  const uploadUserContacts = async () => {
    try {
      const contacts = await Contacts.getAll();
      const formattedContacts = contacts
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map(contact => ({
          name: contact.displayName || 'Unknown',
          phone: contact.phoneNumbers[0].number.replace(/\s/g, ''),
        }))
        .slice(0, 1000); // Limit to 1000 contacts to avoid overwhelming the server

      if (formattedContacts.length > 0) {
        const response = await fetch('http://localhost:5000/api/contacts/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ contacts: formattedContacts }),
        });

        if (response.ok) {
          console.log(`Uploaded ${formattedContacts.length} contacts`);
        } else {
          console.error('Failed to upload contacts');
        }
      }
    } catch (error) {
      console.error('Contact upload error:', error);
    }
  };

  const skipPermission = () => {
    Alert.alert(
      'Skip Permission',
      'You can still use the app, but contact search features will be limited.',
      [
        {
          text: 'Skip',
          onPress: () => navigation.replace('MainApp', { token, user }),
        },
        {
          text: 'Grant Permission',
          onPress: requestContactPermission,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📱</Text>
        </View>

        <Text style={styles.title}>Contact Access</Text>
        <Text style={styles.subtitle}>
          GetContact Uzb needs access to your contacts to help you find how others have saved phone numbers.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>Search for any phone number</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>See how others saved the number</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Your contacts are kept private</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={requestContactPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Grant Permission</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={skipPermission}
          >
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyText}>
          We only access your contacts to provide the search service. Your data is encrypted and never shared with third parties.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    lineHeight: 18,
  },
});

export default ContactPermissionScreen; 