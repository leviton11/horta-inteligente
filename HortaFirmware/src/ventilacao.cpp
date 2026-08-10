// ventilacao.cpp

#include <Arduino.h>
#include "ventilacao.h"
#include "configuracoes.h"

static bool ligado = false;

void ventilacaoIniciar() {
  pinMode(PINO_RELE_VENTILADOR, OUTPUT);
  digitalWrite(PINO_RELE_VENTILADOR, LOW);
  ligado = false;
}

bool ventilacaoAtualizar(const LeiturasSensores& leitura, const ConfigHorta& config, ComandoManual comando) {
  if (comando == COMANDO_LIGAR) {
    ligado = true;
    Serial.println("[ventilacao] Comando manual: LIGAR");
  } else if (comando == COMANDO_DESLIGAR) {
    ligado = false;
    Serial.println("[ventilacao] Comando manual: DESLIGAR");
  } else {
    // Lógica autônoma
    if (!ligado && leitura.temperatura > config.temperaturaMaxima) {
      ligado = true;
      Serial.println("[ventilacao] Temperatura alta - LIGANDO ventilador automaticamente");
    } else if (ligado && leitura.temperatura <= config.temperaturaNormal) {
      ligado = false;
      Serial.println("[ventilacao] Temperatura normalizada - DESLIGANDO ventilador automaticamente");
    }
  }

  digitalWrite(PINO_RELE_VENTILADOR, ligado ? HIGH : LOW);
  return ligado;
}

bool ventilacaoEstado() {
  return ligado;
}
