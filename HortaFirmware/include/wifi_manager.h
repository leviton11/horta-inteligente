// wifi_manager.h
//
// Gerencia a conexão Wi-Fi do ESP32.

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

// Tenta conectar ao Wi-Fi (bloqueia até conectar ou até um tempo limite)
void wifiConectar();

// Verifica se está conectado no momento
bool wifiConectado();

#endif
