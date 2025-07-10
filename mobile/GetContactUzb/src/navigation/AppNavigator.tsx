import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ContactPermissionScreen from '../screens/ContactPermissionScreen';
import MainAppScreen from '../screens/MainAppScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ContactPermission: { token: string; user: any };
  MainApp: { token: string; user: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ContactPermission" component={ContactPermissionScreen} />
        <Stack.Screen name="MainApp" component={MainAppScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 