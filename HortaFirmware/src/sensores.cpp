// sensores.cpp

#include <Arduino.h>
#include "sensores.h"
#include "configuracoes.h"

#if MODO_SIMULACAO
// ---------- Estado interno da simulação ----------
// Guardamos o último valor de cada leitura para fazer os valores
// "andarem" aos poucos (random walk), em vez de pular aleatoriamente
// a cada leitura — isso imita como um sensor real se comporta.
static float simUmidadeSolo = 45.0;
static float simTemperatura = 25.0;
static float simUmidadeAr = 60.0;
static float simLuminosidade = 70.0;
static float simNivelAgua = 80.0;

// Gera um "passo" aleatório entre -variacao e +variacao
static float passoAleatorio(float variacao) {
  return random(-100, 101) / 100.0 * variacao;
}

// Mantém um valor dentro de um intervalo [min, max]
static float limitar(float valor, float minimo, float maximo) {
  if (valor < minimo) return minimo;
  if (valor > maximo) return maximo;
  return valor;
}
#endif

void sensoresIniciar() {
#if MODO_SIMULACAO
  randomSeed(analogRead(0)); // semente pra tornar a simulação menos previsível
  Serial.println("[sensores] Modo SIMULAÇÃO ativo - valores fictícios serão gerados");
#else
  pinMode(PINO_SENSOR_UMIDADE_SOLO, INPUT);
  pinMode(PINO_SENSOR_LDR, INPUT);
  pinMode(PINO_SENSOR_NIVEL_AGUA, INPUT);
  // TODO: inicializar o DHT22 aqui (biblioteca DHT sensor library),
  // por exemplo: dht.begin();
  Serial.println("[sensores] Modo HARDWARE REAL ativo");
#endif
}

LeiturasSensores sensoresLer() {
  LeiturasSensores leitura;

#if MODO_SIMULACAO
  // A umidade do solo tende a CAIR aos poucos (a planta consome água),
  // com uma pequena variação aleatória por leitura.
  simUmidadeSolo = limitar(simUmidadeSolo - 0.3 + passoAleatorio(0.8), 0, 100);
  simTemperatura = limitar(simTemperatura + passoAleatorio(0.5), 15, 40);
  simUmidadeAr = limitar(simUmidadeAr + passoAleatorio(1.0), 20, 100);
  simLuminosidade = limitar(simLuminosidade + passoAleatorio(3.0), 0, 100);
  simNivelAgua = limitar(simNivelAgua - 0.05 + passoAleatorio(0.05), 0, 100);

  leitura.umidadeSolo = simUmidadeSolo;
  leitura.temperatura = simTemperatura;
  leitura.umidadeAr = simUmidadeAr;
  leitura.luminosidade = simLuminosidade;
  leitura.nivelAgua = simNivelAgua;
#else
  // TODO: substituir pela leitura real dos sensores quando o hardware chegar.
  // Exemplo (sensor capacitivo de umidade em pino analógico):
  //   int bruto = analogRead(PINO_SENSOR_UMIDADE_SOLO);
  //   leitura.umidadeSolo = map(bruto, 4095, 1200, 0, 100); // calibrar valores!
  leitura.umidadeSolo = 0;
  leitura.temperatura = 0;
  leitura.umidadeAr = 0;
  leitura.luminosidade = 0;
  leitura.nivelAgua = 0;
#endif

  return leitura;
}
