
// src/api/client.js
//
// Wrapper em cima do fetch(). Centraliza a URL base e o tratamento de
// erro, pra quem usa essa função não precisar repetir isso toda hora.
import { API_BASE_URL } from "../config";

export default async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (erroDeRede) {
    throw new Error(
      "Não foi possível conectar ao backend. Verifique se ele está rodando e se o celular está na mesma rede Wi-Fi."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = data?.error || `Erro ${response.status}`;
    throw new Error(mensagem);
  }

  return data;
}

