// wifi_manager.cpp

#include <Arduino.h>
#include <WiFi.h>
#include "wifi_manager.h"
#include "configuracoes.h"

void wifiConectar() {
  Serial.print("[wifi] Conectando em ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long inicio = millis();
  const unsigned long TIMEOUT_MS = 15000; // 15 segundos de tentativa

  while (WiFi.status() != WL_CONNECTED && (millis() - inicio) < TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[wifi] Conectado! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("[wifi] Não foi possível conectar (vai continuar tentando em background)");
  }
}

bool wifiConectado() {
  return WiFi.status() == WL_CONNECTED;
}
