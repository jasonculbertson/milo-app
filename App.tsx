import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import { SeniorHomeScreen } from './src/screens/SeniorHomeScreen';
import { FamilyDashboardScreen } from './src/screens/FamilyDashboardScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { getCurrentUser } from './src/config/storage';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SeniorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray100,
          paddingTop: 8,
          paddingBottom: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={SeniorHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function FamilyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray100,
          paddingTop: 8,
          paddingBottom: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={FamilyDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userRole, setUserRole] = useState<'senior' | 'family' | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsOnboarded(true);
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    const user = await getCurrentUser();
    setIsOnboarded(true);
    setUserRole(user?.role || 'senior');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboarded ? (
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main">
              {() =>
                userRole === 'family' ? <FamilyTabs /> : <SeniorTabs />
              }
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 18,
    color: colors.gray600,
  },
});
