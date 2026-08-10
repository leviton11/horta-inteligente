// server.js
//
// Ponto de entrada do backend. Aqui a gente só "monta" as peças:
// configura o Express, conecta as rotas, e sobe o servidor.

import express from "express";
import cors from "cors";
import { SERVER_PORT } from "./config.js";
import { telemetryRouter } from "./routes/telemetry.js";
import { commandsRouter } from "./routes/commands.js";
import { devicesRouter } from "./routes/devices.js";
import { listDevicesSummary } from "./db.js";
import { listProfiles } from "./data/plantProfiles.js";

const app = express();

app.use(cors());          // permite o app mobile acessar o backend
app.use(express.json());  // permite receber JSON no corpo das requisições

// Rota simples só pra confirmar que o servidor está de pé
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Backend da Horta Inteligente Conectada rodando 🌱",
    devices: listDevicesSummary(),
  });
});

app.get("/api/plant-profiles", (req, res) => {
  res.json(listProfiles());
});

app.use("/api/devices", devicesRouter);
app.use("/api/telemetry", telemetryRouter);
app.use("/api/commands", commandsRouter);

app.listen(SERVER_PORT, () => {
  console.log(`🌱 Backend da Horta rodando em http://localhost:${SERVER_PORT}`);
});
