import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppNavigator } from "./src/navigation";
import { AnimatedToast } from "./src/components/AnimatedToast";
import { RootStackParamList } from "./src/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["/"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Explore: "",
          MyBookings: "my-bookings",
        },
      },
      RoomDetail: "room/:roomId",
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer linking={linking}>
          <StatusBar style="dark" />
          <AppNavigator />
          <AnimatedToast />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
