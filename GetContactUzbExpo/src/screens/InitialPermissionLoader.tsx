// components/InitialPermissionLoader.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, View, Text } from 'react-native';
import * as Contacts from 'expo-contacts';

interface Props {
  onDone: () => void;
}

const InitialPermissionLoader: React.FC<Props> = ({ onDone }) => {
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Contacts.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            Alert.alert('Contacts Permission Denied', 'You can enable it later in settings.');
          }
        }
      } catch (e) {
        console.error('Permission error:', e);
      } finally {
        onDone();
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Preparing the app...</Text>
    </View>
  );
};

export default InitialPermissionLoader;
