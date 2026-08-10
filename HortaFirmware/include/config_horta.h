// config_horta.h
//
// Struct que representa a config resolvida de uma horta (perfil de
// planta + overrides), buscada periodicamente do backend.
// Espelha o que o backend calcula em src/db.js -> resolveConfig().

#ifndef CONFIG_HORTA_H
#define CONFIG_HORTA_H

struct ConfigHorta {
  float umidadeSoloMinima;
  float umidadeSoloIdeal;
  float temperaturaMaxima;
  float temperaturaNormal;
  float nivelAguaMinimo;
};

#endif
