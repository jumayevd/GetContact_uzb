import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { API_BASE_URL } from '../services/api';

interface Props {
  navigation: any;
  route: {
    params: {
      token: string;
      user: any;
    };
  };
}

const SavedAsScreen: React.FC<Props> = ({ route }) => {
  const { token } = route.params;
  const [targetPhone, setTargetPhone] = useState('');
  const [savedAs, setSavedAs] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!targetPhone.trim()) {
      Alert.alert('Input Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSavedAs(data.savedAs);
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>See How Others Saved You</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter a phone number"
        placeholderTextColor="#999"
        value={targetPhone}
        onChangeText={setTargetPhone}
        keyboardType="phone-pad"
        selectionColor="#007AFF"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSearch} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Search</Text>
        )}
      </TouchableOpacity>

      {savedAs !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>
            {savedAs ? `They saved you as: ${savedAs}` : 'No match found in their contacts'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#f8f9fa' 
  },
  title: { 
    fontSize: 22, 
    marginBottom: 30, 
    textAlign: 'center', 
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8,
    padding: 15, 
    marginBottom: 20, 
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }, 
  button: {
    backgroundColor: '#007AFF', 
    padding: 15,
    borderRadius: 8, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  result: { 
    fontSize: 20, 
    textAlign: 'center',
    color: '#000000',
    fontWeight: 'bold',
    lineHeight: 26,
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    overflow: 'visible',
  },
});

export default SavedAsScreen;