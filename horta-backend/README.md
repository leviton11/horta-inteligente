# Backend - Horta Inteligente Conectada

## Estrutura

```
horta-backend/
├── package.json
├── data/
│   └── db.json                  (criado automaticamente ao rodar)
└── src/
    ├── server.js                 ← ponto de entrada
    ├── config.js                 ← configs gerais do servidor (porta, etc.)
    ├── db.js                     ← "banco de dados" em arquivo JSON
    ├── data/
    │   └── plantProfiles.js      ← catálogo de perfis de planta (presets)
    ├── routes/
    │   ├── devices.js            ← registrar/listar/configurar hortas
    │   ├── telemetry.js          ← dados dos sensores + histórico
    │   └── commands.js           ← comandos manuais do app -> ESP32
    └── services/
        └── alerts.js             ← decide quando gerar um alerta
```

## Como rodar

```
npm install
npm start
```

## Fluxo de uso (ordem importa!)

Agora que existe suporte a múltiplos dispositivos, o fluxo é:

1. **Registrar uma horta** (feito pelo app, uma vez só)
2. **ESP32 busca a config** dessa horta (thresholds baseados no perfil de planta)
3. **ESP32 manda telemetria** periodicamente
4. **App consulta status/histórico**, e pode mandar comandos manuais

## Testando com PowerShell (Windows)

### 1. Ver perfis de planta disponíveis
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/plant-profiles"
```

### 2. Registrar uma nova horta
```powershell
$body = @{
    deviceId = "esp32-horta-01"
    name = "Horta da Varanda"
    plantProfile = "alface"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Method Post -Body $body -ContentType "application/json"
```

### 3. Listar todas as hortas
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices"
```

### 4. Ver a config resolvida da horta (o que o ESP32 vai buscar)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/devices/esp32-horta-01/config"
```

### 5. Simular o ESP32 enviando uma leitura de sensores
```powershell
$body = @{
    deviceId = "esp32-horta-01"
    readings = @{
        soilMoisture = 18
        temperature = 30
        airHumidity = 55
        lightLevel = 40
        waterLevel = 70
    }
    actuators = @{
        irrigacao = $false
        ventilacao = $false
        iluminacao = $false
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/telemetry" -Method Post -Body $body -ContentType "application/json"
```

### 6. Personalizar os thresholds dessa horta (override do perfil padrão)
```powershell
$body = @{
    configOverrides = @{
        umidadeSoloMinima = 25
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/devices/esp32-horta-01" -Method Patch -Body $body -ContentType "application/json"
```

### 7. Mandar um comando manual (forçar irrigação)
```powershell
$body = @{
    deviceId = "esp32-horta-01"
    action = "irrigacao"
    state = "ligar"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/commands" -Method Post -Body $body -ContentType "application/json"
```

### 8. ESP32 verificando se tem comando pendente
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/commands/esp32-horta-01"
```

## Testando com curl (Mac/Linux)
Troque `Invoke-RestMethod -Uri X -Method Post -Body Y -ContentType "application/json"`
por `curl -X POST X -H "Content-Type: application/json" -d 'Y'` (Y em formato JSON puro, não PowerShell).

## Próximos passos
- Criar o app mobile (React Native/Expo) que consome essas rotas
- Criar o firmware do ESP32 com sensores simulados, mandando dados pra cá
- Adicionar autenticação de usuário (login) — por enquanto qualquer um
  que souber a URL do backend pode controlar as hortas
- Mais pra frente: trocar o `db.json` por um banco de verdade (SQLite)
