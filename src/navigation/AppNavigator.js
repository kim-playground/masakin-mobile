import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";

// Screens
import AuthNavigator from "./AuthNavigator";
import LandingScreen from "../screens/LandingScreen";
import DetailScreen from "../screens/DetailScreen";
import CreateRecipeScreen from "../screens/CreateRecipeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CookModeScreen from "../screens/CookModeScreen";

import { colors, typography } from "../utils/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tab Navigator (authenticated users)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={LandingScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateRecipeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          headerShown: true,
          headerTitle: "Recipe Details",
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name="CookMode"
        component={CookModeScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🍳</Text>
        <Text style={styles.appName}>Masakin</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RootStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});

export default AppNavigator;
