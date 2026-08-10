// src/screens/AddDeviceScreen.js
//
// Tela de cadastro de uma nova horta.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { createDevice } from "../api/devices";
import { listPlantProfiles } from "../api/plantProfiles";

export default function AddDeviceScreen({ navigation }) {
  const [deviceId, setDeviceId] = useState("");
  const [nome, setNome] = useState("");
  const [perfis, setPerfis] = useState([]);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [carregandoPerfis, setCarregandoPerfis] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listPlantProfiles()
      .then((lista) => {
        setPerfis(lista);
        if (lista.length > 0) setPerfilSelecionado(lista[0].key);
      })
      .catch((e) => Alert.alert("Erro ao carregar perfis de planta", e.message))
      .finally(() => setCarregandoPerfis(false));
  }, []);

  async function salvar() {
    if (!deviceId.trim() || !nome.trim()) {
      Alert.alert("Preencha todos os campos", "deviceId e nome são obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      await createDevice({
        deviceId: deviceId.trim(),
        name: nome.trim(),
        plantProfile: perfilSelecionado,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro ao cadastrar", e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.rotulo}>ID do dispositivo</Text>
      <Text style={styles.ajuda}>
        Precisa ser EXATAMENTE o mesmo DEVICE_ID configurado no firmware do ESP32 (arquivo configuracoes.h)
      </Text>
      <TextInput
        style={styles.input}
        placeholder="esp32-horta-01"
        value={deviceId}
        onChangeText={setDeviceId}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.rotulo}>Nome da horta</Text>
      <TextInput
        style={styles.input}
        placeholder="Horta da Varanda"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.rotulo}>Tipo de planta</Text>
      {carregandoPerfis ? (
        <ActivityIndicator color="#16a34a" style={{ marginVertical: 12 }} />
      ) : (
        <View style={styles.chips}>
          {perfis.map((perfil) => (
            <TouchableOpacity
              key={perfil.key}
              style={[
                styles.chip,
                perfilSelecionado === perfil.key && styles.chipSelecionado,
              ]}
              onPress={() => setPerfilSelecionado(perfil.key)}
            >
              <Text
                style={[
                  styles.chipTexto,
                  perfilSelecionado === perfil.key && styles.chipTextoSelecionado,
                ]}
              >
                {perfil.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.botaoSalvarTexto}>Cadastrar horta</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  conteudo: {
    padding: 20,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 4,
  },
  ajuda: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipSelecionado: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  chipTexto: {
    color: "#374151",
    fontSize: 14,
  },
  chipTextoSelecionado: {
    color: "#ffffff",
    fontWeight: "600",
  },
  botaoSalvar: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 28,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoSalvarTexto: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
