// services/alerts.js
//
// Recebe uma leitura de sensores + a config resolvida do dispositivo
// (perfil de planta + overrides personalizados) e devolve uma lista de
// alertas. Cada dispositivo pode ter limites diferentes agora (por
// exemplo, tomate tolera menos umidade que alface).

export function checkAlerts(readings, config) {
  const alerts = [];

  if (readings.soilMoisture !== undefined && readings.soilMoisture < config.umidadeSoloMinima) {
    alerts.push({
      type: "umidade_baixa",
      message: `Umidade do solo abaixo do ideal: ${readings.soilMoisture}%`,
      severity: "warning",
    });
  }

  if (readings.temperature !== undefined && readings.temperature > config.temperaturaMaxima) {
    alerts.push({
      type: "temperatura_alta",
      message: `Temperatura elevada detectada: ${readings.temperature}°C`,
      severity: "warning",
    });
  }

  if (readings.waterLevel !== undefined && readings.waterLevel < config.nivelAguaMinimo) {
    alerts.push({
      type: "reservatorio_baixo",
      message: `Reservatório com nível baixo: ${readings.waterLevel}%`,
      severity: "critical",
    });
  }

  return alerts;
}
