// src/api/devices.js
//
// Funções que conversam com as rotas /api/devices do backend.

import apiFetch from "./client";

export function listDevices() {
  return apiFetch("/api/devices");
}

export function getDevice(deviceId) {
  return apiFetch(`/api/devices/${deviceId}`);
}

export function createDevice({ deviceId, name, plantProfile }) {
  return apiFetch("/api/devices", {
    method: "POST",
    body: JSON.stringify({ deviceId, name, plantProfile }),
  });
}

export function updateDevice(deviceId, patch) {
  return apiFetch(`/api/devices/${deviceId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
