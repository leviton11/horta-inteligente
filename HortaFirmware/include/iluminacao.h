// iluminacao.h
//
// Controla o LED grow light. Liga quando a luminosidade cai abaixo do
// mínimo, desliga quando volta pro nível ideal.
//
// Nota: diferente de umidade/temperatura, os limites de luminosidade
// ainda não vêm do backend (config_horta.h não tem esse campo) - por
// enquanto usa constantes fixas em configuracoes.h.

#ifndef ILUMINACAO_H
#define ILUMINACAO_H

#include "sensores.h"
#include "comando_manual.h"

void iluminacaoIniciar();
bool iluminacaoAtualizar(const LeiturasSensores& leitura, ComandoManual comando);
bool iluminacaoEstado();

#endif
