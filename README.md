# Horta Inteligente Conectada

Projeto de agricultura urbana inteligente com ESP32, backend Node.js e
app mobile (React Native/Expo).

## Estrutura do projeto

```
HortaInteligente/
├── README.md                  ← este arquivo
├── ROADMAP_FEIRA.md            ← o que falta pra feira (agosto-outubro)
├── ROADMAP_COMERCIAL.md        ← ideias futuras (versão comercial)
├── .gitignore
│
├── horta-backend/              ← servidor Node.js (API + banco de dados)
├── HortaFirmware/               ← firmware do ESP32 (PlatformIO)
└── horta-app/                  ← app mobile (React Native/Expo)
```

Cada sub-projeto tem seu próprio README com instruções detalhadas. Este
arquivo é só o "mapa geral" de como tudo se conecta.

## Como tudo se conversa

```
┌─────────────┐      HTTP       ┌─────────────┐      HTTP       ┌─────────────┐
│   ESP32     │ ──────────────► │   BACKEND   │ ◄────────────── │  APP MOBILE │
│ (firmware)  │ ◄────────────── │  (Node.js)  │ ──────────────► │   (Expo)    │
└─────────────┘                 └─────────────┘                 └─────────────┘
 sensores/relés                  histórico + config              controle remoto
                                  + perfis de planta
```

- O **backend** roda no seu computador (ou, no futuro, num servidor de verdade)
- O **ESP32** e o **celular** (rodando o app) precisam estar na mesma rede
  Wi-Fi que o computador rodando o backend, e apontar pro IP local dele

## Quick start (rodando pela primeira vez num computador novo)

### 1. Clonar o repositório
```
git clone <url-do-seu-repositorio>
cd HortaInteligente
```

### 2. Backend
```
cd horta-backend
npm install
npm start
```
Confirma que aparece: `🌱 Backend da Horta rodando em http://localhost:3000`

### 3. Descobrir o IP local do computador
- **Windows**: `ipconfig` (procure "Endereço IPv4")
- **Mac/Linux**: `ifconfig` ou `ip addr` (procure a interface Wi-Fi)

Esse IP precisa ser configurado em **dois lugares**:
- `HortaFirmware/include/configuracoes.h` → `BACKEND_URL`
- `horta-app/src/config.js` → `API_BASE_URL`

> Esse IP muda toda vez que você troca de rede Wi-Fi (ex: levar o notebook
> pra outro lugar) - é sempre o primeiro lugar a checar se o app/firmware
> "param de achar" o backend.

### 4. Firmware (ESP32)
Abra a pasta `HortaFirmware` no VS Code com a extensão PlatformIO.
Veja `HortaFirmware/README.md` para detalhes completos (build, upload,
teste no simulador Wokwi).

### 5. App mobile
```
cd horta-app
npm install
npx expo start
```
Escaneie o QR code com o app Expo Go (celular precisa estar na mesma
rede Wi-Fi). Veja `horta-app/README.md` para detalhes completos.

## Ideia pra evitar reconfigurar o IP toda vez (opcional, não implementado ainda)

Em vez de usar o IP numérico (que muda de rede pra rede), dá pra tentar
usar o **nome do computador na rede local** (mDNS/Bonjour), que costuma
ser mais estável. No Windows, isso geralmente aparece como
`NOME-DO-PC.local`. Se funcionar na sua rede, você poderia trocar:
```
http://192.168.0.105:3000
```
por:
```
http://NOME-DO-PC.local:3000
```
Isso não foi testado ainda - vale experimentar, mas nem toda rede/roteador
suporta mDNS igual.

## Documentação de cada parte
- [`horta-backend/README.md`](horta-backend/README.md) - API, rotas, como testar
- [`HortaFirmware/README.md`](HortaFirmware/README.md) - firmware, simulação, Wokwi
- [`horta-app/README.md`](horta-app/README.md) - app mobile, Expo
- [`ROADMAP_FEIRA.md`](ROADMAP_FEIRA.md) - o que falta pra feira
- [`ROADMAP_COMERCIAL.md`](ROADMAP_COMERCIAL.md) - ideias de expansão futura
