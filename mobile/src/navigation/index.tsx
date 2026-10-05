import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ExploreScreen } from "../screens/ExploreScreen";
import { RoomDetailScreen } from "../screens/RoomDetailScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import { RootStackParamList, MainTabParamList } from "../types";
import { Text } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontWeight: "700", color: "#0f172a" },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Khám phá phòng học",
          tabBarLabel: "Khám phá",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>🏫</Text>,
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: "Lịch đặt của tôi",
          tabBarLabel: "Lịch của tôi",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>📅</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#0f172a",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{
          title: "Chi tiết phòng học",
          headerBackTitle: "Quay lại",
        }}
      />
    </Stack.Navigator>
  );
};
