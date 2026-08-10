# Roadmap Comercial - Horta Inteligente Conectada

> Este documento registra ideias de expansão do projeto para uma eventual
> versão comercial, além do escopo da feira de ciências (agosto-outubro).
> Nada aqui precisa ser implementado agora - é um registro do raciocínio
> técnico já discutido, para não se perder e não precisar repetir a
> discussão do zero no futuro.

---

## 1. Mudança de escopo: de vaso único para cama de cultivo + cúpula

**Ideia:** em vez de um vaso simples, usar uma **cama de cultivo elevada e
móvel** (mais área de plantio, rodinhas para mobilidade), coberta por uma
**cúpula de climatização** que isola o ambiente termicamente.

**Por que muda tudo:** um vaso aberto não retém calor/frio o suficiente
para qualquer sistema de climatização ativa funcionar bem - o ar troca
livremente com o ambiente externo. A cúpula fechada é o que torna possível
controlar temperatura de forma significativa.

### Variantes por tipo de planta (pensando em produto, não em protótipo único)

| Variante | Formato da cúpula | Exemplos de planta |
|---|---|---|
| Vaso comum (sem cúpula) | N/A | Cebolinha, salsinha, ervas baixas |
| Cúpula alta e estreita, com parreira | Alta, estreita, treliça interna | Feijão de vara, trepadeiras |
| Cúpula alta, sem parreira | Alta, mais larga | Gengibre, girassol, citronela, cana-limão |

Isso significa que, comercialmente, o produto provavelmente precisaria de
**3 SKUs/modelos físicos diferentes**, todos compartilhando a mesma
eletrônica/firmware/backend - só muda a estrutura física e talvez a
potência do sistema de climatização (volume de ar maior = mais potência
necessária).

---

## 2. Sistema de irrigação por "chuva simulada"

**Ideia:** em vez de um único ponto de gotejamento no vaso, distribuir a
água por meio de saídas no **teto da cúpula**, simulando chuva - melhor
cobertura numa cama de cultivo maior, e permite reaproveitar o mesmo
hardware para resfriamento evaporativo (ver seção 4).

**Implementação:** rede de mangueiras/tubos no teto da cúpula, com bicos
de saída espalhados pela área. A mesma bomba já usada para irrigação
alimenta esse sistema; a diferença entre "modo irrigação" (gotas maiores,
foco na terra) e "modo resfriamento" (névoa fina) pode ser o tipo de bico
usado, ou a pressão aplicada.

**Vantagens:** melhor distribuição de água, reaproveita bomba/reservatório
já existentes, permite o resfriamento evaporativo sem hardware adicional.

**Desvantagens:** mais complexo de projetar mecanicamente que um
gotejador simples; bicos de névoa entopem mais fácil que gotejadores
(precisam de manutenção/filtro de água).

---

## 3. Sistema de aquecimento: água aquecida em tubos de cobre (root-zone heating)

### O problema que isso resolve
Peltier (efeito termoelétrico) foi cogitado inicialmente, mas **descartado**
por escalar mal para volumes grandes (cúpula) e por ser pontual - um
resistor cerâmico simples também foi descartado pelo mesmo motivo:
aqueceria de forma desigual, concentrando calor perto da fonte e deixando
as bordas da cama de cultivo frias.

### A solução
Uma rede de **tubos de cobre** no fundo da caixa de plantio, com **água
aquecida circulando em circuito fechado** (não se mistura com a água de
irrigação). Aquecimento de raiz ("root-zone heating") é uma técnica real
usada em viveiros/estufas comerciais, e mais relevante agronomicamente
que aquecer só o ar - a temperatura da raiz importa mais para a
sobrevivência da planta no frio.

### Componentes
- Pequeno reservatório isolado termicamente
- Resistência de aquecimento (tipo resistência de aquário, pronta e barata)
- Bomba para circular a água pelos tubos (circuito fechado, separado do
  reservatório de irrigação)
- Tubulação de cobre no fundo da caixa de plantio (cobre por conduzir
  calor rapidamente e de forma mais uniforme que PEX/silicone)
- Sensor de temperatura **DS18B20** (digital, à prova d'água), instalado
  na terra próximo à raiz ou no próprio circuito de água - é o valor que
  o controle usa como referência
- **SSR (Relé de Estado Sólido)** no lugar de um relé mecânico comum,
  porque o controle PID liga/desliga rápido demais para um relé mecânico
  aguentar sem desgaste

### Lógica de controle: PID
Um controle liga/desliga simples ("bang-bang") causaria oscilação (esquenta
demais, desliga, esfria demais, liga de novo). Um controle **PID**
(Proporcional-Integral-Derivativo) ajusta a intensidade do aquecimento
em tempo real baseado em quão longe a temperatura está do alvo - o mesmo
tipo de controle usado em impressoras 3D para manter a temperatura do
bico estável.

### Vantagens
- Distribuição de calor uniforme pela área toda (resolve o problema do
  resistor pontual)
- Água tem capacidade térmica maior que aquecimento elétrico direto -
  mais estável
- Reaproveita conceitos que o projeto já usa (bomba, controle por relé)
- Controle preciso via PID + DS18B20

### Desvantagens
- Sistema mais complexo mecanicamente (reservatório extra, tubulação de
  cobre, bomba extra ou compartilhada)
- Existe atraso térmico: a água precisa esquentar antes do calor chegar
  na terra (mais lento que um cabo elétrico direto - geralmente aceitável,
  já que o frio chega de forma gradual, não instantânea)
- Cobre é mais caro que outros materiais de tubulação
- Precisa de mais um circuito elétrico (SSR) e programação de PID
  (mais complexo que liga/desliga simples)

---

## 4. Sistema de resfriamento: free cooling + evaporativo

### Por que não é simétrico ao aquecimento
Tirar calor de um ambiente é fisicamente mais simples que adicionar calor -
mover ar para fora já ajuda muito (não existe "vento frio contrário" para
combater frio da mesma forma simples). Por isso o resfriamento não precisa
da mesma sofisticação do sistema de aquecimento.

### Componentes e lógica
- **2 fans (coolers) em lados opostos da cúpula**: um empurrando ar pra
  dentro (intake), outro puxando ar pra fora (exhaust) - cria fluxo
  cruzado de verdade, não só circulação parada
- **Venezianas motorizadas** (servo motor simples, tipo SG90) em cada
  abertura - ficam **fechadas por padrão** (preservando o isolamento da
  estufa) e **abrem só durante resfriamento ativo**. Um cooler sozinho
  não veda a abertura quando desligado, por isso a veneziana é necessária
- **Sensor de temperatura externo** (além do interno) - permite decidir
  se vale a pena puxar ar de fora ("free cooling") ou não

### Lógica de decisão (árvore de prioridade)
```
Temperatura interna > alvo?
│
├─ SIM → Temperatura externa < interna?
│         │
│         ├─ SIM → abre venezianas + liga os 2 coolers (free cooling,
│         │         sem gastar água - prioridade por ser mais barato)
│         │
│         └─ NÃO → fecha venezianas + liga névoa evaporativa (ar de fora
│                   não ajudaria, pois está mais quente que o interno -
│                   comum em tardes quentes no Brasil)
│
└─ NÃO (dentro da zona morta, ver seção 5) → tudo desligado ou aquecimento
    conforme necessário
```

### Resfriamento evaporativo (plano B)
Quando o ar externo não ajuda, borrifar uma névoa fina de água (reaproveitando
o sistema de "chuva simulada" da seção 2, com bicos de névoa em vez de
gotas) resfria por evaporação - o mesmo princípio de por que suar refresca
o corpo. Técnica real usada em estufas comerciais ("fog cooling").

### Vantagens
- Reaproveita hardware já planejado (coolers, sistema de irrigação/névoa)
- Free cooling é essencialmente "de graça" energeticamente quando
  disponível
- Resfriamento evaporativo como respaldo cobre os casos em que o ar
  externo não ajuda

### Desvantagens
- Depende de mais um sensor (temperatura externa) e mais atuadores
  (2 servos motorizados para as venezianas)
- Névoa fina precisa de bicos que entopem mais fácil (manutenção)
- Resfriamento evaporativo aumenta a umidade do ar interno, o que pode
  não ser desejável para todas as plantas - vale considerar sensor de
  umidade do ar como parte da decisão no futuro

---

## 5. Evitando conflito entre aquecimento e resfriamento

Dois sistemas ativos ao mesmo tempo (ligando um contra o outro) desperdiça
energia e pode danificar componentes. Soluções (técnicas padrão de HVAC):

- **Zona morta (deadband):** definir uma faixa entre os dois limites onde
  nenhum sistema roda. Exemplo: aquece se temp < 18°C, resfria se temp >
  26°C, nada acontece entre 18-26°C.
- **Intertravamento por software:** regra explícita no firmware - se
  aquecimento está ativo, ignora qualquer tentativa de ativar
  resfriamento (e vice-versa), como trava de segurança extra além da
  zona morta.
- **Tempo mínimo entre trocas de modo (anti-ciclo curto):** evita alternar
  rápido demais entre estados se a temperatura oscilar bem na borda da
  faixa.

---

## 6. Por que o Peltier foi descartado (registro da decisão)

Peltier (TEC) foi a ideia inicial, mas descartada por:
- Escalar mal para volumes grandes (cúpula) - eficiente só em espaços
  pequenos e bem isolados
- Puxar muita corrente (uma TEC1-12706 comum consome ~5-6A em 12V),
  exigindo fonte de alimentação maior
- Precisar de dissipador + cooler dos dois lados (quente e frio) para
  funcionar bem - mais peças, mais espaço
- Ineficiência termodinâmica inerente ao efeito termoelétrico, comparado
  a soluções dedicadas (água quente para aquecer, ventilação/evaporação
  para resfriar)
- Precisar de ponte H (para reverter polaridade) ou duas pastilhas
  dedicadas, adicionando complexidade elétrica

**Conclusão:** vale a pena revisitar Peltier apenas para uma variante de
produto muito pequena e bem isolada (ex: um "vaso fechado" individual),
não para a cúpula de uma cama de cultivo inteira.

---

## 7. Impacto estimado no software (quando for implementar)

- **Firmware:** novos módulos `aquecimento.cpp/h` (com lógica PID) e
  `resfriamento.cpp/h` (free cooling + evaporativo + controle das
  venezianas), além de um sensor DS18B20 (biblioteca `OneWire` +
  `DallasTemperature`) e leitura de sensor de temperatura externo
- **Backend:** novos campos de config por perfil de planta (temperatura
  mínima, além da máxima que já existe hoje; zona morta configurável)
- **App:** nova seção na tela de detalhe mostrando modo atual
  (aquecendo/resfriando/neutro), temperatura da raiz vs. temperatura do
  ar, e histórico de qual sistema esteve ativo ao longo do tempo

---

## 8. Outras ideias já registradas (fora do escopo de climatização)

Essas foram mencionadas em conversas anteriores sobre funcionalidades de
produto, e continuam válidas como itens futuros:

- Autenticação de usuário (login) - hoje qualquer um com a URL do backend
  controla as hortas
- Notificações push de verdade (Expo Notifications), em vez do app só
  checar de tempos em tempos
- Gráficos históricos no app (usando a rota de histórico que já existe
  no backend)
- Modo "férias/viagem" com agendamento
- Contador de consumo de água (litros totais usados)
- Exportar histórico em CSV
- Múltiplas zonas de irrigação num único dispositivo
- Provisionamento de Wi-Fi sem hardcodar a senha no firmware (biblioteca
  `WiFiManager`)
- Mover o threshold de luminosidade (hoje fixo no firmware) para o
  catálogo de perfis de planta no backend, junto com os outros thresholds
