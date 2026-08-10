// src/screens/DeviceListScreen.js
//
// Tela principal: lista todas as hortas cadastradas.

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listDevices } from "../api/devices";
import DeviceCard from "../components/DeviceCard";

export default function DeviceListScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarDevices = useCallback(async () => {
    try {
      setErro(null);
      const lista = await listDevices();
      setDevices(lista);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega toda vez que a tela ganha foco (ex: voltando da tela de detalhe)
  useFocusEffect(
    useCallback(() => {
      carregarDevices();
    }, [carregarDevices])
  );

  function aoPuxarParaAtualizar() {
    setAtualizando(true);
    carregarDevices();
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {erro && (
        <View style={styles.avisoErro}>
          <Text style={styles.avisoErroTexto}>{erro}</Text>
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.deviceId}
        contentContainerStyle={devices.length === 0 && styles.listaVazia}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoPuxarParaAtualizar} />
        }
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            Nenhuma horta cadastrada ainda.{"\n"}Toque em "+ Nova horta" pra começar.
          </Text>
        }
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={() => navigation.navigate("DeviceDetail", { deviceId: item.deviceId })}
          />
        )}
      />

      <TouchableOpacity
        style={styles.botaoNovo}
        onPress={() => navigation.navigate("AddDevice")}
        activeOpacity={0.8}
      >
        <Text style={styles.botaoNovoTexto}>+ Nova horta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 12,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
  },
  textoVazio: {
    textAlign: "center",
    color: "#9ca3af",
    paddingHorizontal: 32,
    fontSize: 15,
    lineHeight: 22,
  },
  avisoErro: {
    backgroundColor: "#fee2e2",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  avisoErroTexto: {
    color: "#991b1b",
    fontSize: 13,
  },
  botaoNovo: {
    backgroundColor: "#16a34a",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoNovoTexto: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
