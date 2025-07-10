import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Contacts from 'react-native-contacts';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const Stack = createStackNavigator();

interface Contact {
  name: string;
  phoneNumbers: Array<{number: string}>;
}

interface SearchResult {
  name: string;
  frequency: number;
}

// Login Screen
const LoginScreen = ({navigation}: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({phone, password}),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.replace('MainApp', {token: data.token, user: data.user});
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GetContact Uzb</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (+998...)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Register Screen
const RegisterScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, phone, password}),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.replace('MainApp', {token: data.token, user: data.user});
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GetContact Uzb</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (+998...)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Contact Permission Screen
const ContactPermissionScreen = ({navigation, route}: any) => {
  const [loading, setLoading] = useState(false);
  const {token, user} = route.params;

  const requestContactPermission = async () => {
    setLoading(true);
    try {
      const result = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
      
      if (result === RESULTS.GRANTED) {
        Alert.alert(
          'Permission Granted',
          'Contact access granted! You can now search for contacts.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('MainApp', {token, user}),
            },
          ],
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Contact access is needed to provide the search service.',
          [
            {
              text: 'Try Again',
              onPress: requestContactPermission,
            },
            {
              text: 'Skip',
              onPress: () => navigation.replace('MainApp', {token, user}),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get contact permission');
    } finally {
      setLoading(false);
    }
  };

  const skipPermission = () => {
    Alert.alert(
      'Skip Permission',
      'You can still use the app, but contact search features will be limited.',
      [
        {
          text: 'Skip',
          onPress: () => navigation.replace('MainApp', {token, user}),
        },
        {
          text: 'Grant Permission',
          onPress: requestContactPermission,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📱</Text>
        </View>

        <Text style={styles.title}>Contact Access</Text>
        <Text style={styles.subtitle}>
          GetContact Uzb needs access to your contacts to help you find how others
          have saved phone numbers.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>Search for any phone number</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>
              See how others saved the number
            </Text>
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
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Grant Permission</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={skipPermission}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyText}>
          We only access your contacts to provide the search service. Your data is
          encrypted and never shared with third parties.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Main App Screen
const MainAppScreen = ({navigation, route}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const {token, user} = route.params;

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const allContacts = await Contacts.getAll();
      setContacts(allContacts);
    } catch (error) {
      console.log('Failed to load contacts:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({phoneNumber: searchQuery.trim()}),
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
    try {
      const contactsToUpload = contacts.map(contact => ({
        name: contact.name,
        phone: contact.phoneNumbers[0]?.number || '',
      })).filter(contact => contact.phone);

      const response = await fetch('http://10.0.2.2:5000/api/contacts/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({contacts: contactsToUpload}),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Uploaded ${contactsToUpload.length} contacts!`);
      } else {
        Alert.alert('Error', data.error || 'Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload contacts');
    }
  };

  const renderContactResult = ({item}: {item: SearchResult}) => (
    <View style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.frequency}>
          {item.frequency} {item.frequency === 1 ? 'person' : 'people'} saved this
          name
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
      ],
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

      <ScrollView style={styles.scrollView}>
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
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.uploadContainer}>
          <Text style={styles.uploadTitle}>Upload Your Contacts</Text>
          <Text style={styles.uploadSubtitle}>
            Help others by uploading your contacts (optional)
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadContacts}>
            <Text style={styles.uploadButtonText}>
              Upload {contacts.length} Contacts
            </Text>
          </TouchableOpacity>
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
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Welcome, {user?.name || 'User'}! 🔍
        </Text>
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ContactPermission" component={ContactPermissionScreen} />
        <Stack.Screen name="MainApp" component={MainAppScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
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
  scrollView: {
    flex: 1,
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
    marginBottom: 15,
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
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
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
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
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
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default App; 