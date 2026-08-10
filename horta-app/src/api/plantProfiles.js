// src/api/plantProfiles.js
//
// Funções que conversam com a rota /api/plant-profiles do backend.

import apiFetch from "./client";

export function listPlantProfiles() {
  return apiFetch("/api/plant-profiles");
}
