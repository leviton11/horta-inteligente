// backend_client.h
//
// Toda comunicação HTTP com o backend Node.js fica isolada aqui.
// O resto do firmware não sabe (nem precisa saber) que estamos usando
// HTTP/JSON por baixo - só chama essas funções.

#ifndef BACKEND_CLIENT_H
#define BACKEND_CLIENT_H

#include <Arduino.h>
#include "sensores.h"
#include "config_horta.h"

struct ComandoRecebido {
  bool presente;   // true se havia um comando pendente
  String acao;     // "irrigacao" | "ventilacao" | "iluminacao"
  String estado;   // "ligar" | "desligar"
};

// Busca a config atual da horta no backend (perfil de planta + overrides).
// Retorna true se conseguiu buscar e preencheu configOut.
bool backendBuscarConfig(ConfigHorta &configOut);

// Pergunta ao backend se existe algum comando manual pendente.
ComandoRecebido backendBuscarComando();

// Envia uma leitura de sensores + estado atual dos atuadores.
bool backendEnviarTelemetria(const LeiturasSensores& leitura, bool irrigacaoLigada, bool ventilacaoLigada, bool iluminacaoLigada);

#endif
