// irrigacao.cpp

#include <Arduino.h>
#include "irrigacao.h"
#include "configuracoes.h"

static bool ligado = false;

void irrigacaoIniciar() {
  pinMode(PINO_RELE_BOMBA, OUTPUT);
  digitalWrite(PINO_RELE_BOMBA, LOW);
  ligado = false;
}

bool irrigacaoAtualizar(const LeiturasSensores& leitura, const ConfigHorta& config, ComandoManual comando) {
  if (comando == COMANDO_LIGAR) {
    ligado = true;
    Serial.println("[irrigacao] Comando manual: LIGAR");
  } else if (comando == COMANDO_DESLIGAR) {
    ligado = false;
    Serial.println("[irrigacao] Comando manual: DESLIGAR");
  } else {
    // Lógica autônoma - roda mesmo sem internet/backend
    if (!ligado && leitura.umidadeSolo < config.umidadeSoloMinima) {
      ligado = true;
      Serial.println("[irrigacao] Umidade baixa - LIGANDO bomba automaticamente");
    } else if (ligado && leitura.umidadeSolo >= config.umidadeSoloIdeal) {
      ligado = false;
      Serial.println("[irrigacao] Umidade ideal atingida - DESLIGANDO bomba automaticamente");
    }
  }

  digitalWrite(PINO_RELE_BOMBA, ligado ? HIGH : LOW);
  return ligado;
}

bool irrigacaoEstado() {
  return ligado;
}
