// ventilacao.h
//
// Controla o cooler/ventilador. Liga quando a temperatura passa do
// máximo, desliga quando volta pra faixa normal.

#ifndef VENTILACAO_H
#define VENTILACAO_H

#include "sensores.h"
#include "config_horta.h"
#include "comando_manual.h"

void ventilacaoIniciar();
bool ventilacaoAtualizar(const LeiturasSensores& leitura, const ConfigHorta& config, ComandoManual comando);
bool ventilacaoEstado();

#endif
