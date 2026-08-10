// routes/telemetry.js
//
// Rotas relacionadas aos dados dos sensores (telemetria).
//
// POST /api/telemetry        -> o ESP32 envia uma nova leitura
// GET  /api/telemetry/:id    -> o app pede a leitura mais recente
// GET  /api/telemetry/:id/history -> o app pede o histórico

import { Router } from "express";
import { saveTelemetry, getLatest, getHistory, getDeviceConfig, deviceExists } from "../db.js";
import { checkAlerts } from "../services/alerts.js";

export const telemetryRouter = Router();

// ESP32 -> Backend
telemetryRouter.post("/", (req, res) => {
  const { deviceId, readings, actuators } = req.body;

  if (!deviceId || !readings) {
    return res.status(400).json({
      error: "Campos obrigatórios: deviceId e readings",
    });
  }

  if (!deviceExists(deviceId)) {
    return res.status(404).json({
      error: "Dispositivo não registrado. Cadastre-o em POST /api/devices antes de enviar telemetria.",
    });
  }

  const entry = saveTelemetry(deviceId, { readings, actuators });
  const config = getDeviceConfig(deviceId);
  const alerts = checkAlerts(readings, config);

  res.status(201).json({
    saved: true,
    alerts,
  });
});

// App -> Backend (leitura mais recente)
telemetryRouter.get("/:deviceId", (req, res) => {
  const latest = getLatest(req.params.deviceId);

  if (!latest) {
    return res.status(404).json({ error: "Nenhuma leitura encontrada para este dispositivo" });
  }

  res.json(latest);
});

// App -> Backend (histórico)
telemetryRouter.get("/:deviceId/history", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const history = getHistory(req.params.deviceId, limit);
  res.json(history);
});
