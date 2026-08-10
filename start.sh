#!/bin/bash

echo "🌱 Iniciando Horta Inteligente..."

echo "📦 Verificando dependências do backend..."
cd horta-backend
npm install

echo "📱 Verificando dependências do app..."
cd ../horta-app
npm install

echo "🚀 Iniciando backend..."
(
  cd ../horta-backend
  npm start
) &

echo "📱 Iniciando Expo..."
npx expo start --tunnel

