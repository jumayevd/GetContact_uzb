import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { API_BASE_URL } from '../services/api';

interface ContactResult {
  name: string;
  frequency: number;
}

interface MainAppScreenProps {
  navigation: any;
  route: any;
}

const MainAppScreen: React.FC<MainAppScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const [contactsUploaded, setContactsUploaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = route.params;

  useEffect(() => {
    checkContactsStatus();
  }, []);

  const checkContactsStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/my-contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContactsUploaded(data.count > 0);
      }
    } catch (error) {
      console.error('Failed to check contacts status:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(searchQuery.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: searchQuery.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
          Alert.alert('No Results', 'No contacts found for this phone number');
        }
      } else {
        Alert.alert('Error', data.error || 'Search failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadContacts = async () => {
    setUploadingContacts(true);
    try {
      // The original code used react-native-contacts, which is removed.
      // This function will now be a placeholder or need to be re-implemented
      // using a different library or native modules if contact access is required.
      // For now, we'll just show an alert.
      Alert.alert('Contacts Upload', 'Contact upload functionality is currently disabled.');
      // Example of how it might look if using a different library:
      // const contacts = await ExpoContacts.getAll();
      // const formattedContacts = contacts
      //   .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
      //   .map(contact => ({
      //     name: contact.displayName || 'Unknown',
      //     phone: contact.phoneNumbers[0].number.replace(/\s/g, ''),
      //   }))
      //   .slice(0, 1000); // Limit to 1000 contacts

      // if (formattedContacts.length === 0) {
      //   Alert.alert('No Contacts', 'No contacts found on your device');
      //   return;
      // }

      // const response = await fetch(`${API_BASE_URL}/api/contacts/upload`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ contacts: formattedContacts }),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   setContactsUploaded(true);
      //   Alert.alert(
      //     'Success',
      //     `Successfully uploaded ${formattedContacts.length} contacts!`,
      //     [{ text: 'OK' }]
      //   );
      // } else {
      //   Alert.alert('Error', data.error || 'Failed to upload contacts');
      // }
    } catch (error) {
      Alert.alert('Error', 'Failed to access contacts. Please check permissions.');
    } finally {
      setUploadingContacts(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkContactsStatus();
    setRefreshing(false);
  };

  const renderContactResult = ({ item }: { item: ContactResult }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.frequency}>
          {item.frequency} {item.frequency === 1 ? 'person' : 'people'} saved this name
        </Text>
      </View>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GetContact Uzb</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {!contactsUploaded && (
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadTitle}>Upload Your Contacts</Text>
                <Text style={styles.uploadSubtitle}>
                  Upload your contacts to help others and improve search results
                </Text>
                <TouchableOpacity
                  style={[styles.uploadButton, uploadingContacts && styles.buttonDisabled]}
                  onPress={uploadContacts}
                  disabled={uploadingContacts}
                >
                  {uploadingContacts ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.uploadButtonText}>Upload Contacts</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.searchContainer}>
              <Text style={styles.searchTitle}>Search Phone Number</Text>
              <Text style={styles.searchSubtitle}>
                Find how others have saved this number in their contacts
              </Text>

              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter phone number (+998...)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.searchButton, loading && styles.buttonDisabled]}
                  onPress={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.searchButtonText}>Search</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  Results for {searchQuery} ({searchResults.length} found)
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderContactResult}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>
            )}
          </>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Welcome, {user?.name || 'User'}! 🔍
        </Text>
        {contactsUploaded && (
          <Text style={styles.footerSubtext}>
            Your contacts are uploaded and helping others
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  frequency: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  uploadContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MainAppScreen; 