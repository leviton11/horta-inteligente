// irrigacao.h
//
// Controla a bomba de irrigação. Segue a mesma regra descrita no
// documento do projeto: liga quando a umidade cai abaixo do mínimo,
// desliga quando atinge o nível ideal. Um comando manual pode
// sobrepor essa decisão a qualquer momento.

#ifndef IRRIGACAO_H
#define IRRIGACAO_H

#include "sensores.h"
#include "config_horta.h"
#include "comando_manual.h"

void irrigacaoIniciar();

// Atualiza o estado da bomba com base na leitura atual, na config da
// horta, e em um possível comando manual. Retorna o estado atual
// (true = ligada) para ser reportado ao backend.
bool irrigacaoAtualizar(const LeiturasSensores& leitura, const ConfigHorta& config, ComandoManual comando);

// Estado atual sem recalcular (útil pra reportar ao backend)
bool irrigacaoEstado();

#endif
