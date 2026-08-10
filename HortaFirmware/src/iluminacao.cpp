// iluminacao.cpp

#include <Arduino.h>
#include "iluminacao.h"
#include "configuracoes.h"

static bool ligado = false;

void iluminacaoIniciar() {
  pinMode(PINO_RELE_LED_GROW, OUTPUT);
  digitalWrite(PINO_RELE_LED_GROW, LOW);
  ligado = false;
}

bool iluminacaoAtualizar(const LeiturasSensores& leitura, ComandoManual comando) {
  if (comando == COMANDO_LIGAR) {
    ligado = true;
    Serial.println("[iluminacao] Comando manual: LIGAR");
  } else if (comando == COMANDO_DESLIGAR) {
    ligado = false;
    Serial.println("[iluminacao] Comando manual: DESLIGAR");
  } else {
    // Lógica autônoma
    if (!ligado && leitura.luminosidade < LUMINOSIDADE_MINIMA) {
      ligado = true;
      Serial.println("[iluminacao] Luminosidade baixa - LIGANDO LED grow automaticamente");
    } else if (ligado && leitura.luminosidade >= LUMINOSIDADE_IDEAL) {
      ligado = false;
      Serial.println("[iluminacao] Luminosidade restabelecida - DESLIGANDO LED grow automaticamente");
    }
  }

  digitalWrite(PINO_RELE_LED_GROW, ligado ? HIGH : LOW);
  return ligado;
}

bool iluminacaoEstado() {
  return ligado;
}
