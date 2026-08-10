// App.js
//
// Ponto de entrada do app. Configura a navegação entre as 3 telas:
// lista de hortas -> detalhe de uma horta / cadastrar nova horta.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DeviceListScreen from "./src/screens/DeviceListScreen";
import AddDeviceScreen from "./src/screens/AddDeviceScreen";
import DeviceDetailScreen from "./src/screens/DeviceDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#16a34a" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="DeviceList"
          component={DeviceListScreen}
          options={{ title: "Minhas Hortas 🌱" }}
        />
        <Stack.Screen
          name="AddDevice"
          component={AddDeviceScreen}
          options={{ title: "Nova Horta" }}
        />
        <Stack.Screen
          name="DeviceDetail"
          component={DeviceDetailScreen}
          options={{ title: "Detalhes da Horta" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
