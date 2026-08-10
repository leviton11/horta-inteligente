// src/screens/DeviceDetailScreen.js
//
// Tela de detalhe de uma horta: leituras em tempo real (atualiza
// sozinha a cada alguns segundos), botões de controle manual dos
// atuadores, e edição da config (thresholds).

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from "react-native";
import { getDevice, updateDevice } from "../api/devices";
import { sendCommand } from "../api/commands";
import { INTERVALO_ATUALIZACAO } from "../config";

const ATUADORES = [
  { key: "irrigacao", label: "Irrigação", icone: "💧" },
  { key: "ventilacao", label: "Ventilação", icone: "🌬️" },
  { key: "iluminacao", label: "Iluminação", icone: "💡" },
];

const CAMPOS_CONFIG = [
  { key: "umidadeSoloMinima", label: "Umidade mínima do solo (%)" },
  { key: "umidadeSoloIdeal", label: "Umidade ideal do solo (%)" },
  { key: "temperaturaMaxima", label: "Temperatura máxima (°C)" },
  { key: "temperaturaNormal", label: "Temperatura normal (°C)" },
  { key: "nivelAguaMinimo", label: "Nível mínimo de água (%)" },
];

export default function DeviceDetailScreen({ route }) {
  const { deviceId } = route.params;

  const [device, setDevice] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  // Estado "otimista": quando o usuário mexe no switch, a gente já mostra
  // a mudança na hora (sem esperar o ESP32 confirmar). Assim que a
  // telemetria real confirmar o mesmo valor, removemos daqui.
  const [overrides, setOverrides] = useState({});
  const [sincronizando, setSincronizando] = useState({});
  const [configEditavel, setConfigEditavel] = useState(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  const intervaloRef = useRef(null);

  const carregar = useCallback(async (mostrarLoading = false) => {
    if (mostrarLoading) setAtualizando(true);
    try {
      const dados = await getDevice(deviceId);
      setDevice(dados);
      setErro(null);
      // só reseta os campos editáveis se o usuário não estiver editando agora
      setConfigEditavel((atual) => atual ?? converterParaTexto(dados.config));

      // Limpa os overrides otimistas que já foram confirmados pela
      // telemetria real (ou seja, o ESP32 já aplicou o comando)
      const estadoReal = dados.latest?.actuators;
      if (estadoReal) {
        setOverrides((atual) => {
          const novo = { ...atual };
          for (const chave in novo) {
            if (estadoReal[chave] === novo[chave]) {
              delete novo[chave];
              setSincronizando((s) => ({ ...s, [chave]: false }));
            }
          }
          return novo;
        });
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [deviceId]);

  useEffect(() => {
    carregar();
    intervaloRef.current = setInterval(() => carregar(false), INTERVALO_ATUALIZACAO);
    return () => clearInterval(intervaloRef.current);
  }, [carregar]);

  async function acionar(actionKey, ligar) {
    // Atualiza a tela na hora (otimista), antes mesmo da resposta do backend
    setOverrides((atual) => ({ ...atual, [actionKey]: ligar }));
    setSincronizando((atual) => ({ ...atual, [actionKey]: true }));

    try {
      await sendCommand(deviceId, actionKey, ligar ? "ligar" : "desligar");
    } catch (e) {
      // Se der erro, desfaz a mudança otimista
      setOverrides((atual) => {
        const novo = { ...atual };
        delete novo[actionKey];
        return novo;
      });
      setSincronizando((atual) => ({ ...atual, [actionKey]: false }));
      Alert.alert("Erro ao enviar comando", e.message);
    }
  }

  async function salvarConfig() {
    setSalvandoConfig(true);
    try {
      const overrides = converterParaNumero(configEditavel);
      await updateDevice(deviceId, { configOverrides: overrides });
      Alert.alert("Config salva", "Os novos limites foram salvos. O ESP32 vai buscar isso na próxima checagem de config.");
      carregar(false);
    } catch (e) {
      Alert.alert("Erro ao salvar config", e.message);
    } finally {
      setSalvandoConfig(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (erro && !device) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.erroTexto}>{erro}</Text>
      </View>
    );
  }

  const readings = device.latest?.readings;
  const actuatorsState = device.latest?.actuators;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={() => carregar(true)} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>{device.name}</Text>
        <View style={[styles.badge, device.online ? styles.badgeOnline : styles.badgeOffline]}>
          <Text style={styles.badgeTexto}>{device.online ? "Online" : "Offline"}</Text>
        </View>
      </View>
      <Text style={styles.subtitulo}>Perfil: {device.plantProfile}</Text>

      {/* ---------- Leituras ---------- */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Leituras atuais</Text>
        {readings ? (
          <View style={styles.grid}>
            <Leitura label="Umidade do solo" valor={`${readings.soilMoisture?.toFixed(0)}%`} />
            <Leitura label="Temperatura" valor={`${readings.temperature?.toFixed(1)}°C`} />
            <Leitura label="Umidade do ar" valor={`${readings.airHumidity?.toFixed(0)}%`} />
            <Leitura label="Luminosidade" valor={`${readings.lightLevel?.toFixed(0)}%`} />
            <Leitura label="Água no reservatório" valor={`${readings.waterLevel?.toFixed(0)}%`} />
          </View>
        ) : (
          <Text style={styles.semDados}>Nenhuma leitura recebida ainda.</Text>
        )}
      </View>

      {/* ---------- Controle manual ---------- */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Controle manual</Text>
        {ATUADORES.map((atuador) => {
          const estadoReal = actuatorsState?.[atuador.key] ?? false;
          const ligado = overrides[atuador.key] !== undefined ? overrides[atuador.key] : estadoReal;
          const estaSincronizando = sincronizando[atuador.key];

          return (
            <View key={atuador.key} style={styles.linhaAtuador}>
              <View style={styles.atuadorInfo}>
                <Text style={styles.atuadorLabel}>
                  {atuador.icone} {atuador.label}
                </Text>
                <View style={styles.atuadorStatusRow}>
                  <View style={[styles.statusPonto, ligado ? styles.statusPontoLigado : styles.statusPontoDesligado]} />
                  <Text style={styles.atuadorStatusTexto}>
                    {ligado ? "Ligado" : "Desligado"}
                    {estaSincronizando ? " · sincronizando..." : ""}
                  </Text>
                </View>
              </View>
              <Switch
                value={ligado}
                onValueChange={(novoValor) => acionar(atuador.key, novoValor)}
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={ligado ? "#16a34a" : "#f3f4f6"}
              />
            </View>
          );
        })}
      </View>

      {/* ---------- Config / thresholds ---------- */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Limites (config)</Text>
        {CAMPOS_CONFIG.map((campo) => (
          <View key={campo.key} style={styles.linhaConfig}>
            <Text style={styles.configLabel}>{campo.label}</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="numeric"
              value={configEditavel?.[campo.key] ?? ""}
              onChangeText={(texto) =>
                setConfigEditavel((atual) => ({ ...atual, [campo.key]: texto }))
              }
            />
          </View>
        ))}
        <TouchableOpacity
          style={[styles.botaoSalvarConfig, salvandoConfig && styles.botaoDesabilitado]}
          onPress={salvarConfig}
          disabled={salvandoConfig}
        >
          {salvandoConfig ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.botaoSalvarConfigTexto}>Salvar limites</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Leitura({ label, valor }) {
  return (
    <View style={styles.leituraItem}>
      <Text style={styles.leituraValor}>{valor}</Text>
      <Text style={styles.leituraLabel}>{label}</Text>
    </View>
  );
}

// Converte a config (números) em strings, pra poder editar em TextInput
function converterParaTexto(config) {
  const resultado = {};
  for (const chave in config) {
    if (typeof config[chave] === "number") {
      resultado[chave] = String(config[chave]);
    }
  }
  return resultado;
}

// Converte de volta pra número antes de enviar pro backend
function converterParaNumero(configTexto) {
  const resultado = {};
  for (const chave in configTexto) {
    const numero = parseFloat(configTexto[chave]);
    if (!isNaN(numero)) resultado[chave] = numero;
  }
  return resultado;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  erroTexto: {
    color: "#991b1b",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  secao: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  leituraItem: {
    width: "45%",
  },
  leituraValor: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
  leituraLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  semDados: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  linhaAtuador: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  atuadorInfo: {
    flex: 1,
  },
  atuadorLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  atuadorStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusPonto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPontoLigado: {
    backgroundColor: "#16a34a",
  },
  statusPontoDesligado: {
    backgroundColor: "#9ca3af",
  },
  atuadorStatusTexto: {
    fontSize: 13,
    color: "#6b7280",
  },
  linhaConfig: {
    marginBottom: 10,
  },
  configLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },
  configInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  botaoSalvarConfig: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  botaoSalvarConfigTexto: {
    color: "#ffffff",
    fontWeight: "600",
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});
