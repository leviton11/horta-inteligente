// src/api/telemetry.js
//
// Funções que conversam com as rotas /api/telemetry do backend.

import apiFetch from "./client";

export function getHistory(deviceId, limit = 50) {
  return apiFetch(`/api/telemetry/${deviceId}/history?limit=${limit}`);
}
