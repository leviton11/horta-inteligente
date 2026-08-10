# Roadmap - Feira (agosto a outubro)

> O que falta para o escopo atual (vaso/canteiro simples com irrigação,
> ventilação e iluminação), sem as expansões do ROADMAP_COMERCIAL.md.

## Já pronto e validado
- [x] Backend (multi-dispositivo, perfis de planta, config dinâmica, alertas)
- [x] Firmware (sensores simulados, 3 atuadores independentes, comunicação
      com backend), compilando sem erros
- [x] App mobile (listar hortas, cadastrar, ver leituras, controle manual
      com switches, editar limites)

## Falta fazer
- [ ] **Montagem física** — fiação dos sensores/relés conforme os pinos
      definidos em `configuracoes.h`, implementar a leitura real dos
      sensores em `sensores.cpp` (hoje só simula valores fictícios), e
      calibrar o sensor de umidade do solo (valores brutos do ADC variam
      por sensor - precisa testar na terra real e ajustar a fórmula de
      conversão para porcentagem)
- [ ] **Debug** — testar o ciclo completo com Wi-Fi e backend reais (não
      foi possível validar isso no simulador Wokwi por instabilidade da
      ferramenta - ver nota abaixo), e corrigir o que aparecer
- [ ] Preparar a apresentação (explicar a arquitetura modular, decisão de
      cada componente, e o "porquê" por trás das escolhas técnicas -
      isso costuma pesar bem na avaliação)

## Nota sobre o teste no Wokwi
Tentamos validar o ciclo completo (firmware simulado ↔ backend real) usando
o simulador Wokwi, mas esbarramos em bugs conhecidos da integração com o
VS Code (terminal serial embutido, extensão de monitor serial arquivada).
Decidimos adiar esse teste para quando o ESP32 físico chegar, já que nesse
cenário o teste é mais simples (Wi-Fi real, sem simulador no meio).
