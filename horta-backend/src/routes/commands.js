// routes/commands.js
//
// Rotas relacionadas aos comandos manuais (o usuário forçando uma ação
// pelo app, por exemplo "iniciar irrigação" mesmo sem estar no limite).
//
// POST /api/commands       -> o app envia um comando novo
// GET  /api/commands/:id   -> o ESP32 pergunta se tem comando pendente

import { Router } from "express";
import { setCommand, consumeCommand, deviceExists } from "../db.js";

export const commandsRouter = Router();

const ACOES_VALIDAS = ["irrigacao", "ventilacao", "iluminacao"];
const ESTADOS_VALIDOS = ["ligar", "desligar"];

// App -> Backend
commandsRouter.post("/", (req, res) => {
  const { deviceId, action, state } = req.body;

  if (!deviceId || !ACOES_VALIDAS.includes(action) || !ESTADOS_VALIDOS.includes(state)) {
    return res.status(400).json({
      error: `Campos esperados: deviceId, action (${ACOES_VALIDAS.join("/")}), state (${ESTADOS_VALIDOS.join("/")})`,
    });
  }

  if (!deviceExists(deviceId)) {
    return res.status(404).json({ error: "Dispositivo não registrado" });
  }

  const command = setCommand(deviceId, action, state);
  res.status(201).json({ saved: true, command });
});

// ESP32 -> Backend (pergunta se tem algo pendente)
commandsRouter.get("/:deviceId", (req, res) => {
  const command = consumeCommand(req.params.deviceId);

  if (command === undefined) {
    return res.status(404).json({ error: "Dispositivo não registrado" });
  }

  res.json({ command }); // command pode ser null (registrado, mas sem comando pendente)
});
