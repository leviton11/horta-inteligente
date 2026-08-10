// src/components/DeviceCard.js
//
// Cartão exibido na lista de hortas. Mostra nome, status online/offline
// e um resumo rápido da última leitura, se houver.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DeviceCard({ device, onPress }) {
  const readings = device.latest?.readings;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={styles.nome}>{device.name}</Text>
        <View style={[styles.badge, device.online ? styles.badgeOnline : styles.badgeOffline]}>
          <Text style={styles.badgeTexto}>{device.online ? "Online" : "Offline"}</Text>
        </View>
      </View>

      <Text style={styles.perfil}>{capitalize(device.plantProfile)}</Text>

      {readings ? (
        <View style={styles.leituras}>
          <Text style={styles.leitura}>💧 {readings.soilMoisture?.toFixed(0)}%</Text>
          <Text style={styles.leitura}>🌡️ {readings.temperature?.toFixed(1)}°C</Text>
          <Text style={styles.leitura}>🪣 {readings.waterLevel?.toFixed(0)}%</Text>
        </View>
      ) : (
        <Text style={styles.semDados}>Sem leituras ainda</Text>
      )}
    </TouchableOpacity>
  );
}

function capitalize(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1b1b1b",
  },
  perfil: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeOnline: {
    backgroundColor: "#dcfce7",
  },
  badgeOffline: {
    backgroundColor: "#f3f4f6",
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  leituras: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  leitura: {
    fontSize: 14,
    color: "#374151",
  },
  semDados: {
    marginTop: 10,
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
});
