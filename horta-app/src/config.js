// src/config.js
//
// Configuração central do app. Assim como no backend e no firmware,
// os valores que podem mudar ficam num lugar só.

// IMPORTANTE: "localhost" não funciona aqui, porque localhost do celular
// seria o próprio celular, não o seu computador. Use o IP do computador
// que está rodando o backend, na mesma rede Wi-Fi (o celular e o PC
// PRECISAM estar na mesma rede Wi-Fi pra isso funcionar).
// Descubra esse IP no Windows com "ipconfig" (procure "Endereço IPv4").
export const API_BASE_URL = "https://organic-palm-tree-wrgxrrxp6j5j3gvw4-3000.app.github.dev";
// Intervalo de atualização automática na tela de detalhes (milissegundos)
export const INTERVALO_ATUALIZACAO = 8000;
