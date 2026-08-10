// main.cpp
//
// Ponto de entrada do firmware. Aqui só "orquestramos" os módulos:
// cada um cuida da sua responsabilidade (sensores, atuadores, wifi,
// backend), e o main.cpp decide QUANDO cada coisa acontece.
//
// Importante: usamos millis() em vez de delay() para os intervalos,
// assim o loop nunca fica "travado" esperando - isso é essencial
// porque vários processos (ler sensor, mandar telemetria, checar
// comando) precisam rodar em paralelo, em intervalos diferentes.

#include <Arduino.h>
#include "configuracoes.h"
#include "sensores.h"
#include "config_horta.h"
#include "comando_manual.h"
#include "irrigacao.h"
#include "ventilacao.h"
#include "iluminacao.h"
#include "wifi_manager.h"
#include "backend_client.h"

// Config atual da horta (começa com valores padrão "genéricos" até
// conseguir buscar a config de verdade do backend)
static ConfigHorta configAtual = { 20.0, 35.0, 32.0, 27.0, 15.0 };

// Última leitura conhecida dos sensores
static LeiturasSensores ultimaLeitura;

// Controle de tempo de cada tarefa (substituindo delay() por millis())
static unsigned long ultimaLeituraSensores = 0;
static unsigned long ultimoEnvioTelemetria = 0;
static unsigned long ultimaBuscaConfig = 0;
static unsigned long ultimaBuscaComando = 0;

void setup() {
  Serial.begin(115200);
  delay(500); // só pra dar tempo do monitor serial conectar
  Serial.println("\n=== Horta Inteligente Conectada - Firmware iniciando ===");

  sensoresIniciar();
  irrigacaoIniciar();
  ventilacaoIniciar();
  iluminacaoIniciar();

  // Tenta conectar no Wi-Fi sempre (mesmo com sensores simulados) - isso
  // permite testar a comunicação com o backend antes do hardware físico
  // chegar (ex: usando o simulador Wokwi). Se não conseguir conectar,
  // o firmware continua funcionando de forma autônoma (ver item 4 do loop).
  wifiConectar();

  Serial.println("=== Setup concluído ===\n");
}

void loop() {
  unsigned long agora = millis();

  // ---------- 1. Ler sensores ----------
  if (agora - ultimaLeituraSensores >= INTERVALO_LEITURA_SENSORES) {
    ultimaLeituraSensores = agora;
    ultimaLeitura = sensoresLer();

    Serial.printf(
      "[sensores] Solo: %.1f%% | Temp: %.1f°C | Ar: %.1f%% | Luz: %.1f%% | Água: %.1f%%\n",
      ultimaLeitura.umidadeSolo, ultimaLeitura.temperatura,
      ultimaLeitura.umidadeAr, ultimaLeitura.luminosidade, ultimaLeitura.nivelAgua
    );
  }

  // ---------- 2. Buscar config atualizada do backend ----------
  if (agora - ultimaBuscaConfig >= INTERVALO_BUSCA_CONFIG) {
    ultimaBuscaConfig = agora;
    backendBuscarConfig(configAtual); // se falhar, mantém a config anterior
  }

  // ---------- 3. Buscar comando manual pendente ----------
  ComandoManual comandoIrrigacao = COMANDO_NENHUM;
  ComandoManual comandoVentilacao = COMANDO_NENHUM;
  ComandoManual comandoIluminacao = COMANDO_NENHUM;

  if (agora - ultimaBuscaComando >= INTERVALO_BUSCA_COMANDO) {
    ultimaBuscaComando = agora;
    ComandoRecebido recebido = backendBuscarComando();

    if (recebido.presente) {
      ComandoManual comando = (recebido.estado == "ligar") ? COMANDO_LIGAR : COMANDO_DESLIGAR;

      if (recebido.acao == "irrigacao") comandoIrrigacao = comando;
      else if (recebido.acao == "ventilacao") comandoVentilacao = comando;
      else if (recebido.acao == "iluminacao") comandoIluminacao = comando;
    }
  }

  // ---------- 4. Atualizar atuadores (SEMPRE roda, com ou sem rede) ----------
  // Isso é o que torna o sistema autônomo de verdade: mesmo se o Wi-Fi
  // cair, a lógica de irrigação/ventilação/iluminação continua funcionando
  // com a última config conhecida.
  bool irrigacaoLigada = irrigacaoAtualizar(ultimaLeitura, configAtual, comandoIrrigacao);
  bool ventilacaoLigada = ventilacaoAtualizar(ultimaLeitura, configAtual, comandoVentilacao);
  bool iluminacaoLigada = iluminacaoAtualizar(ultimaLeitura, comandoIluminacao);

  // ---------- 5. Enviar telemetria pro backend ----------
  if (agora - ultimoEnvioTelemetria >= INTERVALO_ENVIO_TELEMETRIA) {
    ultimoEnvioTelemetria = agora;
    backendEnviarTelemetria(ultimaLeitura, irrigacaoLigada, ventilacaoLigada, iluminacaoLigada);
  }
}
