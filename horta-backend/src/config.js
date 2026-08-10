// config.js
//
// Configurações gerais do servidor.
// Os limites (thresholds) NÃO ficam mais fixos aqui — agora cada
// dispositivo tem sua própria config, resolvida a partir do perfil de
// planta escolhido (veja src/data/plantProfiles.js) + overrides
// personalizados que o usuário definir pelo app.

export const SERVER_PORT = process.env.PORT || 3000;
