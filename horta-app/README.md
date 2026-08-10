# App Mobile - Horta Inteligente Conectada

## Estrutura (arquivos que eu criei)

```
horta-app/
├── App.js                          ← navegação entre as telas
└── src/
    ├── config.js                   ← URL do backend
    ├── api/
    │   ├── client.js                ← wrapper do fetch
    │   ├── devices.js
    │   ├── telemetry.js
    │   ├── commands.js
    │   └── plantProfiles.js
    ├── components/
    │   └── DeviceCard.js
    └── screens/
        ├── DeviceListScreen.js      ← tela principal (lista de hortas)
        ├── AddDeviceScreen.js       ← cadastrar nova horta
        └── DeviceDetailScreen.js    ← leituras + controle manual + config
```

## Como montar o projeto (na sua máquina, com internet)

Diferente do backend, aqui o ideal é deixar o **Expo criar o projeto do zero**
primeiro (ele já vem com as versões certas de tudo), e só depois colar
meus arquivos por cima.

### 1. Criar o projeto Expo
No terminal, na pasta geral do seu projeto (`HortaInteligente/`):
```
npx create-expo-app horta-app
```
Isso baixa e cria uma pasta `horta-app` com um app "Hello World" funcionando.

### 2. Instalar as bibliotecas de navegação
```
cd horta-app
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler
```
(Usar `npx expo install` em vez de `npm install` é importante aqui — o Expo
escolhe automaticamente as versões compatíveis com o seu SDK.)

### 3. Colar meus arquivos
- Substitua o `App.js` que o Expo criou pelo meu
- Copie a pasta `src/` inteira pra dentro do seu projeto

### 4. Ajustar a URL do backend
Abra `src/config.js` e troque `API_BASE_URL` pelo IP do seu computador
(mesmo processo do firmware - `ipconfig` no Windows, mesma rede Wi-Fi
que o celular vai estar usando).

```js
export const API_BASE_URL = "http://192.168.0.SEU_IP:3000";
```

### 5. Rodar
```
npx expo start
```
Vai aparecer um **QR code** no terminal. Abra o app **Expo Go** no celular
Android e escaneie esse QR code (o Expo Go tem uma opção de "Scan QR Code"
na tela inicial). O app deve abrir no celular.

**Importante**: o celular e o computador precisam estar na **mesma rede Wi-Fi**
pra isso funcionar (tanto pro Expo Go carregar o app quanto pro app conseguir
falar com o backend depois).

## Testando o fluxo completo

1. Deixe o backend rodando (`npm start` na pasta `horta-backend`)
2. Rode o app (`npx expo start`, escaneie o QR code)
3. Na tela principal, toque em **"+ Nova horta"**
4. Cadastre uma horta com o mesmo `deviceId` que você já usou nos testes
   (`esp32-horta-01`, por exemplo) - ou um novo, se quiser testar do zero
5. Volte pra lista - a horta deve aparecer (offline, se não tiver telemetria
   recente)
6. Toque nela pra ver a tela de detalhe - dá pra testar os botões de
   ligar/desligar mesmo sem o ESP32 rodando (o comando fica "pendente"
   no backend, esperando o dispositivo buscar)

## Próximos passos possíveis
- Gráfico de histórico (usar a rota `getHistory` que já existe, com alguma
  biblioteca de gráficos como `react-native-chart-kit` ou `victory-native`)
- Notificações push quando um alerta disparar
- Tela de login (autenticação), se decidirem adicionar isso mais pra frente
