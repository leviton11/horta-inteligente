# Firmware - Horta Inteligente Conectada (ESP32)

## Estrutura

```
HortaFirmware/
├── platformio.ini
├── include/                    (headers .h)
│   ├── configuracoes.h         ← config central (pinos, Wi-Fi, backend, intervalos)
│   ├── config_horta.h          ← struct da config vinda do backend
│   ├── comando_manual.h        ← enum de comando manual
│   ├── sensores.h
│   ├── irrigacao.h
│   ├── ventilacao.h
│   ├── iluminacao.h
│   ├── wifi_manager.h
│   └── backend_client.h
└── src/                        (implementações .cpp)
    ├── main.cpp                ← orquestra tudo
    ├── sensores.cpp
    ├── irrigacao.cpp
    ├── ventilacao.cpp
    ├── iluminacao.cpp
    ├── wifi_manager.cpp
    └── backend_client.cpp
```

## Onde colocar

Se você já criou um projeto no PlatformIO (PIO Home -> New Project, board
"ESP32 Dev Module", framework "Arduino"), ele já tem essa mesma estrutura
de pastas (`src/`, `include/`, `platformio.ini`). Você pode:

1. Apagar o `main.cpp` de exemplo que o PlatformIO criou
2. Copiar todos os arquivos daqui pras pastas correspondentes do seu projeto
3. Copiar o `platformio.ini` também (ou só adicionar a linha `lib_deps` no seu, se já tiver outras configs)

## Como testar AGORA (sem hardware nenhum)

O firmware já vem com `MODO_SIMULACAO` ativado (veja `configuracoes.h`).
Isso significa que os sensores geram valores fictícios (que mudam aos
poucos, de forma realista). O Wi-Fi e a comunicação com o backend
continuam ativos mesmo em modo simulação — dá pra testar isso com o
Wokwi (veja a seção abaixo) mesmo sem o ESP32 físico.

Pra só confirmar que compila:

1. Abra o projeto no VS Code com a extensão PlatformIO
2. Clique no ícone da "formiguinha" 🐜 na barra lateral
3. Em **PROJECT TASKS -> esp32dev -> General**, clique em **Build** (ou o ✓ na barra de baixo)
   - Isso baixa o toolchain do ESP32 e a biblioteca ArduinoJson (precisa de internet)
   - Se der erro aqui, me manda a mensagem completa
4. Como você ainda não tem o ESP32 físico, não dá pra fazer **Upload** ainda —
   mas o **Build** já confirma que o código compila sem erros

## Testando o ciclo completo com Wokwi (sem hardware, com backend real)

Isso testa o fluxo inteiro: firmware (rodando no simulador) conversando
de verdade com o seu backend Node.js rodando no seu PC.

### 1. Instalar a extensão
No VS Code, vá em Extensões, busque **"Wokwi Simulator"** (publicada
pela Wokwi), instale.

### 2. Pegar a licença gratuita
- Aperte `F1`, digite e selecione **"Wokwi: Request a new License"**
- Vai abrir o navegador → faça login/crie conta na Wokwi (gratuito) → clique em **"GET YOUR LICENSE"**
- Volta pro VS Code, a licença é ativada automaticamente

### 3. Já deixei os arquivos prontos
Os arquivos `diagram.json` e `wokwi.toml` já vêm configurados:
- `diagram.json` — só um ESP32 "solto" (sem sensores físicos, porque eles são simulados dentro do próprio código)
- `wokwi.toml` — aponta pro firmware que o PlatformIO já compilou (`.pio/build/esp32dev/firmware.bin`)

E já ajustei `configuracoes.h` pra usar:
- **Wi-Fi**: rede `Wokwi-GUEST` (a rede virtual gratuita do simulador, com internet de verdade)
- **Backend URL**: `http://host.wokwi.internal:3000` (endereço mágico que o Wokwi entende como "o seu computador")

### 4. Deixar o backend rodando
No terminal, dentro da pasta `horta-backend`:
```
npm start
```
Deixe essa janela aberta.

### 5. Compilar o firmware (se ainda não tiver feito depois das últimas mudanças)
No PlatformIO, clique em **Build** ✓.

### 6. Iniciar a simulação
Aperte `F1` → selecione **"Wokwi: Start Simulator"**.

Deve abrir um painel com o ESP32 "piscando" e um monitor serial embutido.
No monitor serial, você deve ver algo tipo:

```
[wifi] Conectando em Wokwi-GUEST
[wifi] Conectado! IP: 10.10.0.2
[sensores] Modo SIMULAÇÃO ativo - valores fictícios serão gerados
[sensores] Solo: 44.7% | Temp: 25.2°C | Ar: 60.4% | Luz: 70.1% | Água: 79.9%
[backend] Config atualizada com sucesso
```

E, depois de alguns segundos, o envio de telemetria pro backend.

### 7. Confirmar do lado do backend
Enquanto a simulação roda, no PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices"
```
O campo `online` deve virar `True`, e `latest` deve mostrar os dados que o ESP32 simulado está mandando.

### Se der erro de conexão
- Confirme que o backend está rodando (`npm start` sem erros)
- Confirme que não tem firewall do Windows bloqueando a porta 3000 (às vezes aparece um popup pedindo permissão na primeira vez - aceite)
- Me manda a mensagem de erro exata do monitor serial que a gente resolve

## Quando o ESP32 físico chegar

1. Em `configuracoes.h`, mude `MODO_SIMULACAO` de `1` para `0`
2. Troque `WIFI_SSID`/`WIFI_PASSWORD` pela rede real (tem o exemplo comentado no arquivo)
3. Troque `BACKEND_URL` pelo IP real do computador (tem o exemplo comentado no arquivo)
4. Implemente a leitura real dos sensores em `sensores.cpp` (tem um `TODO`
   marcado no código mostrando onde)
5. Ajuste os pinos em `configuracoes.h` conforme a fiação real
6. Conecte o ESP32 via USB e clique em **Upload** no PlatformIO

## Fluxo de decisão (resumo)

Cada atuador (irrigação, ventilação, iluminação) roda sua PRÓPRIA lógica
de liga/desliga, de forma independente - podem estar ativos ao mesmo
tempo (ex: irrigando E ventilando simultaneamente num dia quente):

- **Irrigação**: liga quando `umidadeSolo < umidadeSoloMinima`, desliga quando `umidadeSolo >= umidadeSoloIdeal`
- **Ventilação**: liga quando `temperatura > temperaturaMaxima`, desliga quando `temperatura <= temperaturaNormal`
- **Iluminação**: liga quando `luminosidade < LUMINOSIDADE_MINIMA`, desliga quando `luminosidade >= LUMINOSIDADE_IDEAL`

Um comando manual do app sobrepõe essa lógica a qualquer momento (mas a
lógica automática volta a valer na leitura seguinte, se não vier outro comando).

## Limitação conhecida

Os limites de luminosidade (`LUMINOSIDADE_MINIMA`/`LUMINOSIDADE_IDEAL`)
ainda são fixos no firmware, não vêm do backend/perfil de planta como os
outros. Fica como próxima melhoria: adicionar isso ao catálogo de perfis
no backend (`plantProfiles.js`) e no `config_horta.h`.
