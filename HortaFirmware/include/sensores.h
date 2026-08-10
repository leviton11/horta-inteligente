// sensores.h
//
// Struct com as leituras dos sensores, e função para lê-los.
// Em MODO_SIMULACAO, os valores são gerados de forma fictícia (mas
// realista). Quando o hardware chegar, a implementação real entra em
// sensores.cpp, sem precisar mudar quem usa essa função.

#ifndef SENSORES_H
#define SENSORES_H

struct LeiturasSensores {
  float umidadeSolo;     // 0-100 (%)
  float temperatura;     // °C
  float umidadeAr;       // 0-100 (%) - vem do DHT22
  float luminosidade;    // 0-100 (%, normalizado)
  float nivelAgua;       // 0-100 (%)
};

// Inicializa os pinos/sensores (chamar uma vez no setup())
void sensoresIniciar();

// Faz uma nova leitura de todos os sensores
LeiturasSensores sensoresLer();

#endif
