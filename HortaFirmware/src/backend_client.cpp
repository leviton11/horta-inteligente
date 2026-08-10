// backend_client.cpp

#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "backend_client.h"
#include "configuracoes.h"
#include "wifi_manager.h"

bool backendBuscarConfig(ConfigHorta &configOut) {
  if (!wifiConectado()) return false;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/devices/" + DEVICE_ID + "/config";
  http.begin(url);
  int codigo = http.GET();

  if (codigo != 200) {
    Serial.printf("[backend] Erro ao buscar config (HTTP %d)\n", codigo);
    http.end();
    return false;
  }

  String corpo = http.getString();
  http.end();

  JsonDocument doc;
  DeserializationError erro = deserializeJson(doc, corpo);
  if (erro) {
    Serial.print("[backend] Erro ao interpretar JSON da config: ");
    Serial.println(erro.c_str());
    return false;
  }

  configOut.umidadeSoloMinima = doc["umidadeSoloMinima"] | 20.0;
  configOut.umidadeSoloIdeal  = doc["umidadeSoloIdeal"]  | 35.0;
  configOut.temperaturaMaxima = doc["temperaturaMaxima"] | 32.0;
  configOut.temperaturaNormal = doc["temperaturaNormal"] | 27.0;
  configOut.nivelAguaMinimo   = doc["nivelAguaMinimo"]   | 15.0;

  Serial.println("[backend] Config atualizada com sucesso");
  return true;
}

ComandoRecebido backendBuscarComando() {
  ComandoRecebido resultado;
  resultado.presente = false;

  if (!wifiConectado()) return resultado;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/commands/" + DEVICE_ID;
  http.begin(url);
  int codigo = http.GET();

  if (codigo != 200) {
    Serial.printf("[backend] Erro ao buscar comando (HTTP %d)\n", codigo);
    http.end();
    return resultado;
  }

  String corpo = http.getString();
  http.end();

  JsonDocument doc;
  DeserializationError erro = deserializeJson(doc, corpo);
  if (erro) {
    Serial.print("[backend] Erro ao interpretar JSON do comando: ");
    Serial.println(erro.c_str());
    return resultado;
  }

  if (doc["command"].isNull()) {
    return resultado; // nenhum comando pendente - normal, não é erro
  }

  resultado.presente = true;
  resultado.acao = doc["command"]["action"].as<String>();
  resultado.estado = doc["command"]["state"].as<String>();

  Serial.println("[backend] Comando manual recebido: " + resultado.acao + " -> " + resultado.estado);
  return resultado;
}

bool backendEnviarTelemetria(const LeiturasSensores& leitura, bool irrigacaoLigada, bool ventilacaoLigada, bool iluminacaoLigada) {
  if (!wifiConectado()) return false;

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;

  JsonObject readings = doc["readings"].to<JsonObject>();
  readings["soilMoisture"] = leitura.umidadeSolo;
  readings["temperature"] = leitura.temperatura;
  readings["airHumidity"] = leitura.umidadeAr;
  readings["lightLevel"] = leitura.luminosidade;
  readings["waterLevel"] = leitura.nivelAgua;

  JsonObject actuators = doc["actuators"].to<JsonObject>();
  actuators["irrigacao"] = irrigacaoLigada;
  actuators["ventilacao"] = ventilacaoLigada;
  actuators["iluminacao"] = iluminacaoLigada;

  String corpo;
  serializeJson(doc, corpo);

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int codigo = http.POST(corpo);
  http.end();

  if (codigo != 201) {
    Serial.printf("[backend] Erro ao enviar telemetria (HTTP %d)\n", codigo);
    return false;
  }

  return true;
}
