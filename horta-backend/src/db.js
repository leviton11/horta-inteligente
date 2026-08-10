// db.js
//
// "Banco de dados" simples baseado em arquivo JSON.
// Agora cada dispositivo tem: nome, perfil de planta, overrides de
// config, leituras e comandos pendentes.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProfileDefaults } from "./data/plantProfiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "..", "data", "db.json");

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
cat .devcontainer/devcontainer.json
const MAX_HISTORY_PER_DEVICE = 500;
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutos sem dados = offline

function loadRaw() {
  if (!fs.existsSync(DB_FILE)) {
    return { devices: {} };
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return raw ? JSON.parse(raw) : { devices: {} };
}

function saveRaw(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Calcula a config "resolvida" de um dispositivo: valores do perfil de
// planta escolhido, sobrescritos pelos overrides personalizados (se houver).
function resolveConfig(device) {
  const defaults = getProfileDefaults(device.plantProfile);
  return { ...defaults, ...device.configOverrides };
}

function isOnline(device) {
  if (!device.latest) return false;
  const elapsed = Date.now() - new Date(device.latest.receivedAt).getTime();
  return elapsed < ONLINE_THRESHOLD_MS;
}

// ---------- Dispositivos ----------

export function deviceExists(deviceId) {
  const data = loadRaw();
  return Boolean(data.devices[deviceId]);
}

// Cria um novo dispositivo. Retorna null se já existir (evita duplicar).
export function createDevice(deviceId, { name, plantProfile }) {
  const data = loadRaw();

  if (data.devices[deviceId]) {
    return null; // já existe
  }

  data.devices[deviceId] = {
    name,
    plantProfile: plantProfile || "generico",
    configOverrides: {},
    latest: null,
    history: [],
    pendingCommand: null,
    createdAt: new Date().toISOString(),
  };

  saveRaw(data);
  return data.devices[deviceId];
}

// Lista todos os dispositivos com um resumo (pra tela de "minhas hortas")
export function listDevicesSummary() {
  const data = loadRaw();
  return Object.entries(data.devices).map(([deviceId, device]) => ({
    deviceId,
    name: device.name,
    plantProfile: device.plantProfile,
    online: isOnline(device),
    latest: device.latest,
  }));
}

// Detalhe completo de um dispositivo (inclui config resolvida)
export function getDevice(deviceId) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return null;

  return {
    deviceId,
    name: device.name,
    plantProfile: device.plantProfile,
    configOverrides: device.configOverrides,
    config: resolveConfig(device),
    online: isOnline(device),
    latest: device.latest,
    createdAt: device.createdAt,
  };
}

// Atualiza nome / perfil / overrides de um dispositivo
export function updateDevice(deviceId, { name, plantProfile, configOverrides }) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return null;

  if (name !== undefined) device.name = name;
  if (plantProfile !== undefined) device.plantProfile = plantProfile;
  if (configOverrides !== undefined) {
    device.configOverrides = { ...device.configOverrides, ...configOverrides };
  }

  saveRaw(data);
  return getDevice(deviceId);
}

// Config resolvida (o que o ESP32 busca periodicamente)
export function getDeviceConfig(deviceId) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return null;
  return resolveConfig(device);
}

// ---------- Telemetria ----------

export function saveTelemetry(deviceId, telemetry) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return null; // dispositivo precisa existir antes

  const entry = {
    ...telemetry,
    receivedAt: new Date().toISOString(),
  };

  device.latest = entry;
  device.history.push(entry);

  if (device.history.length > MAX_HISTORY_PER_DEVICE) {
    device.history = device.history.slice(-MAX_HISTORY_PER_DEVICE);
  }

  saveRaw(data);
  return entry;
}

export function getLatest(deviceId) {
  const data = loadRaw();
  return data.devices[deviceId]?.latest ?? null;
}

export function getHistory(deviceId, limit = 100) {
  const data = loadRaw();
  const history = data.devices[deviceId]?.history ?? [];
  return history.slice(-limit);
}

// ---------- Comandos manuais ----------

export function setCommand(deviceId, action, state) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return null;

  device.pendingCommand = {
    action,
    state,
    createdAt: new Date().toISOString(),
  };

  saveRaw(data);
  return device.pendingCommand;
}

export function consumeCommand(deviceId) {
  const data = loadRaw();
  const device = data.devices[deviceId];
  if (!device) return undefined; // dispositivo não existe

  const command = device.pendingCommand;
  device.pendingCommand = null;

  saveRaw(data);
  return command; // null = existe mas não tem comando pendente
}
