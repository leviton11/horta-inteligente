// routes/devices.js
//
// Rotas de gerenciamento de dispositivos (hortas).
//
// POST   /api/devices             -> registrar uma nova horta
// GET    /api/devices             -> listar todas as hortas (resumo)
// GET    /api/devices/:id         -> detalhe completo de uma horta
// PATCH  /api/devices/:id         -> atualizar nome / perfil / config
// GET    /api/devices/:id/config  -> config resolvida (o ESP32 busca isso)

import { Router } from "express";
import {
  deviceExists,
  createDevice,
  listDevicesSummary,
  getDevice,
  updateDevice,
  getDeviceConfig,
} from "../db.js";
import { PLANT_PROFILES } from "../data/plantProfiles.js";

export const devicesRouter = Router();

// App -> Backend: registrar uma nova horta
devicesRouter.post("/", (req, res) => {
  const { deviceId, name, plantProfile } = req.body;

  if (!deviceId || !name) {
    return res.status(400).json({ error: "Campos obrigatórios: deviceId e name" });
  }

  if (plantProfile && !PLANT_PROFILES[plantProfile]) {
    return res.status(400).json({
      error: `plantProfile inválido. Opções: ${Object.keys(PLANT_PROFILES).join(", ")}`,
    });
  }

  if (deviceExists(deviceId)) {
    return res.status(409).json({ error: "Já existe um dispositivo com esse deviceId" });
  }

  const device = createDevice(deviceId, { name, plantProfile });
  res.status(201).json({ deviceId, ...device });
});

// App -> Backend: listar todas as hortas
devicesRouter.get("/", (req, res) => {
  res.json(listDevicesSummary());
});

// App -> Backend: detalhe de uma horta
devicesRouter.get("/:id", (req, res) => {
  const device = getDevice(req.params.id);
  if (!device) {
    return res.status(404).json({ error: "Dispositivo não encontrado" });
  }
  res.json(device);
});

// App -> Backend: atualizar nome / perfil / overrides de config
devicesRouter.patch("/:id", (req, res) => {
  const { name, plantProfile, configOverrides } = req.body;

  if (plantProfile && !PLANT_PROFILES[plantProfile]) {
    return res.status(400).json({
      error: `plantProfile inválido. Opções: ${Object.keys(PLANT_PROFILES).join(", ")}`,
    });
  }

  const updated = updateDevice(req.params.id, { name, plantProfile, configOverrides });
  if (!updated) {
    return res.status(404).json({ error: "Dispositivo não encontrado" });
  }
  res.json(updated);
});

// ESP32 -> Backend: busca a config atual (thresholds) pra usar na lógica autônoma
devicesRouter.get("/:id/config", (req, res) => {
  const config = getDeviceConfig(req.params.id);
  if (!config) {
    return res.status(404).json({ error: "Dispositivo não encontrado" });
  }
  res.json(config);
});
