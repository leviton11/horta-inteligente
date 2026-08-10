// configuracoes.h
//
// Configuração central do firmware. Assim como no backend, todo valor
// que pode precisar mudar fica aqui, num lugar só.

#ifndef CONFIGURACOES_H
#define CONFIGURACOES_H

// ---------- MODO DE SIMULAÇÃO ----------
// Enquanto não temos o hardware físico, os sensores geram valores
// fictícios (mas realistas). Quando o ESP32 e os sensores chegarem,
// mude isso para 0 e implemente a leitura real em sensores.cpp.
#define MODO_SIMULACAO 1

// ---------- WI-FI ----------
// Preencha com a rede Wi-Fi de verdade quando o ESP32 físico chegar.
#define WIFI_SSID "NOME_DA_SUA_REDE"
#define WIFI_PASSWORD "SENHA_DA_SUA_REDE"

// Se um dia quiser testar no simulador Wokwi de novo, troque pelos valores
// abaixo (rede virtual gratuita do simulador, com internet real):
// #define WIFI_SSID "Wokwi-GUEST"
// #define WIFI_PASSWORD ""

// ---------- BACKEND ----------
// IMPORTANTE: "localhost" não funciona aqui, porque localhost do ESP32
// seria o próprio ESP32, não o seu computador. Você precisa usar o IP
// do computador que está rodando o backend, na mesma rede Wi-Fi.
// Pra descobrir esse IP no Windows: abra o cmd e digite "ipconfig",
// procure por "Endereço IPv4" (geralmente algo como 192.168.0.X).
#define BACKEND_URL "http://192.168.0.100:3000"

// Se um dia quiser testar no simulador Wokwi de novo, troque por:
// #define BACKEND_URL "http://host.wokwi.internal:3000"

// Precisa ser EXATAMENTE o mesmo deviceId que você registrou no backend
// (via POST /api/devices)
#define DEVICE_ID "esp32-horta-01"

// ---------- PINOS ----------
// TODO: ajustar quando o hardware chegar, conforme a fiação real.
#define PINO_SENSOR_UMIDADE_SOLO   34  // entrada analógica
#define PINO_SENSOR_DHT            4   // dados do DHT22
#define PINO_SENSOR_LDR            35  // entrada analógica
#define PINO_SENSOR_NIVEL_AGUA     32  // entrada analógica

#define PINO_RELE_BOMBA            25
#define PINO_RELE_VENTILADOR       26
#define PINO_RELE_LED_GROW         27

// ---------- INTERVALOS DE TEMPO (em milissegundos) ----------
#define INTERVALO_LEITURA_SENSORES     5000    // ler sensores a cada 5s
#define INTERVALO_ENVIO_TELEMETRIA     15000   // enviar pro backend a cada 15s
#define INTERVALO_BUSCA_CONFIG         60000   // buscar config nova a cada 1 min
#define INTERVALO_BUSCA_COMANDO        10000   // checar comando manual a cada 10s

// ---------- LUMINOSIDADE ----------
// TODO: por enquanto o backend não tem threshold de luminosidade por
// perfil de planta (só umidade/temperatura/água). Fica fixo aqui local
// até a gente adicionar isso ao catálogo de perfis no backend.
#define LUMINOSIDADE_MINIMA  30   // abaixo disso, liga o LED grow
#define LUMINOSIDADE_IDEAL   50   // acima disso, desliga o LED grow

#endif
