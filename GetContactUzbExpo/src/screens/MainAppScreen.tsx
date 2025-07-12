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
  contact_name: string;
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
  const [contactsUploaded, setContactsUploaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = route.params;

  useEffect(() => {
    checkContactsStatus();
  }, []);

  const checkContactsStatus = async () => {
    try {
      console.log('Checking contacts status with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/api/contacts/my-contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Contacts status response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Contacts data:', data);
        setContactsUploaded(data.count > 0);
      } else {
        const errorData = await response.json();
        console.error('Contacts status error:', errorData);
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

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(searchQuery.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Debug token before sending
      console.log('=== TOKEN DEBUG ===');
      console.log('Token present:', token ? 'YES' : 'NO');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          console.log('Token expires:', new Date(payload.exp * 1000));
          console.log('Token expired?', payload.exp < Date.now() / 1000);
        } catch (e) {
          console.log('Token decode error:', e);
        }
      }
      console.log('===================');

      console.log('Searching with params:', {
        phoneNumber: searchQuery.trim(),
        myPhone: user.phone,
        token: token ? 'Present' : 'Missing'
      });

      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/api/contacts/search`);
      
      const response = await fetch(`${API_BASE_URL}/api/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: searchQuery.trim(),  // The person you are querying
          myPhone: user.phone,              // Your own number
        }),
      });

      console.log('Search response status:', response.status);
      console.log('Search response headers:', response.headers);
      
      // Get response as text first to see what we're getting
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        Alert.alert('Server Error', 'Server returned invalid response. Please check if the server is running.');
        return;
      }

      console.log('Parsed response data:', data);

      if (response.ok) {
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
          Alert.alert('No Results', 'No one saved your number with a name');
        }
      } else {
        console.error('Search error response:', data);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 401) {
          console.error('401 UNAUTHORIZED - Token rejected by server');
          console.error('This means the backend auth middleware is rejecting your token');
          Alert.alert('Session Expired', 'Please login again', [
            { text: 'OK', onPress: () => navigation.replace('Login') }
          ]);
        } else {
          Alert.alert('Error', data.error || 'Search failed');
        }
      }
    } catch (error) {
      console.error('Search network error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkContactsStatus();
    setRefreshing(false);
  };

  const renderContactResult = ({ item }: { item: ContactResult }) => (
    <View style={styles.resultItem}>
      <Text style={styles.contactName}>"{item.contact_name}"</Text>
      <Text style={styles.frequency}>
        {item.frequency} {item.frequency === 1 ? 'person' : 'people'} saved you as this
      </Text>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
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
            <View style={styles.searchContainer}>
              <Text style={styles.searchTitle}>Who saved me as what?</Text>
              <Text style={styles.searchSubtitle}>
                Enter someone's number to see how they saved your number
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
                  How {searchQuery} saved your number:
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
    elevation: 2,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
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
});

export default MainAppScreen;