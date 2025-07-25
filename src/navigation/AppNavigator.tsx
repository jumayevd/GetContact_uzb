import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ContactPermissionScreen from '../screens/ContactPermissionScreen';
import MainAppScreen from '../screens/MainAppScreen';
import InitialPermissionLoader from '../screens/InitialPermissionLoader';
import SavedAsScreen from '../screens/SavedAsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ContactPermission: { token: string; user: any };
  MainApp: { token: string; user: any };
  SavedAs: { token: string; user: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <InitialPermissionLoader onDone={() => setIsReady(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ContactPermission" component={ContactPermissionScreen} />
        <Stack.Screen name="MainApp" component={MainAppScreen} />
        <Stack.Screen name="SavedAs" component={SavedAsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
