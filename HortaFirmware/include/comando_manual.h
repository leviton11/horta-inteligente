// comando_manual.h
//
// Representa um comando manual vindo do app (via backend), que pode
// sobrepor a decisão automática do ESP32.

#ifndef COMANDO_MANUAL_H
#define COMANDO_MANUAL_H

enum ComandoManual {
  COMANDO_NENHUM,     // nenhum comando pendente - segue lógica automática
  COMANDO_LIGAR,      // usuário forçou ligar
  COMANDO_DESLIGAR,   // usuário forçou desligar
};

#endif
