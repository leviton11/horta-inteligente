// src/api/commands.js
//
// Funções que conversam com a rota /api/commands do backend.

import apiFetch from "./client";

export function sendCommand(deviceId, action, state) {
  return apiFetch("/api/commands", {
    method: "POST",
    body: JSON.stringify({ deviceId, action, state }),
  });
}
