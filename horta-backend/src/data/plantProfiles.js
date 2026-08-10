// data/plantProfiles.js
//
// Catálogo de perfis de planta. Cada perfil já vem com valores padrão
// de threshold, então o usuário não precisa descobrir sozinho "qual
// umidade ideal pra tomate" — a gente já sugere um valor sensato, e ele
// pode ajustar depois se quiser (isso vira "configOverrides" no dispositivo).

export const PLANT_PROFILES = {
  generico: {
    label: "Genérico",
    umidadeSoloMinima: 20,
    umidadeSoloIdeal: 35,
    temperaturaMaxima: 32,
    temperaturaNormal: 27,
    nivelAguaMinimo: 15,
  },
  alface: {
    label: "Alface",
    umidadeSoloMinima: 22,
    umidadeSoloIdeal: 38,
    temperaturaMaxima: 28,
    temperaturaNormal: 24,
    nivelAguaMinimo: 15,
  },
  tomate: {
    label: "Tomate",
    umidadeSoloMinima: 25,
    umidadeSoloIdeal: 45,
    temperaturaMaxima: 34,
    temperaturaNormal: 28,
    nivelAguaMinimo: 15,
  },
  cebolinha: {
    label: "Cebolinha",
    umidadeSoloMinima: 20,
    umidadeSoloIdeal: 35,
    temperaturaMaxima: 30,
    temperaturaNormal: 25,
    nivelAguaMinimo: 15,
  },
  salsinha: {
    label: "Salsinha",
    umidadeSoloMinima: 22,
    umidadeSoloIdeal: 36,
    temperaturaMaxima: 29,
    temperaturaNormal: 24,
    nivelAguaMinimo: 15,
  },
};

export function getProfileDefaults(profileKey) {
  return PLANT_PROFILES[profileKey] ?? PLANT_PROFILES.generico;
}

export function listProfiles() {
  return Object.entries(PLANT_PROFILES).map(([key, value]) => ({
    key,
    ...value,
  }));
}
