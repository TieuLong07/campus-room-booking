import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ExploreScreen } from "../screens/ExploreScreen";
import { RoomDetailScreen } from "../screens/RoomDetailScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import { RootStackParamList, MainTabParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f4f4f5",
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 16,
          color: "#09090b",
        },
        tabBarActiveTintColor: "#09090b",
        tabBarInactiveTintColor: "#a1a1aa",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: -0.2,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f4f4f5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Không gian học & Lab",
          tabBarLabel: "Khám phá",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: "Lịch đặt phòng",
          tabBarLabel: "Lịch của tôi",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#09090b",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 16,
        },
        headerShadowVisible: false,
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
          title: "Chi tiết không gian",
          headerBackTitle: "Quay lại",
        }}
      />
    </Stack.Navigator>
  );
};
