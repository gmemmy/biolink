import * as React from 'react';
import { StatusBar, useColorScheme, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SecureVaultScreen from './src/screens/SecureVault';

const Tab = createBottomTabNavigator();

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#000' : '#fff',
          }}
          edges={['top']}
        >
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: isDarkMode
                  ? 'rgba(26, 26, 26, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                borderTopWidth: 1,
                borderTopColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
                elevation: 0,
                shadowOpacity: 0,
                height: 88,
                paddingBottom: 8,
                paddingTop: 8,
              },
              tabBarActiveTintColor: isDarkMode ? '#007AFF' : '#007AFF',
              tabBarInactiveTintColor: isDarkMode ? '#999' : '#666',
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              },
              tabBarIconStyle: {
                marginBottom: 2,
              },
            }}
          >
            <Tab.Screen
              name="SecureVault"
              component={SecureVaultScreen}
              options={{
                tabBarLabel: 'Secure Vault',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ color, fontSize: size }}>🔐</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
