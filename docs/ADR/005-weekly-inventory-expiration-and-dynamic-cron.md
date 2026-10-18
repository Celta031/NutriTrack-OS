# ADR-005: Expiração Semanal Automática por Chave ISO-8601 (`weekCycleKey`) e Agendador Dinâmico por Minuto (`alertTime`)

- **Status:** Accepted
- **Date:** 2026-10-18
- **Spec Reference:** `SDD-003-DYNAMIC-MENU-INVENTORY-LIFECYCLE` (`SPEC-08`, `SPEC-09`, `SPEC-10`, `SPEC-11`, `SPEC-12`)

---

## 1. Context & Problem Statement

Em um sistema de gestão de dieta e compras pessoais multi-usuário rodando em uma VM `Standard_B1s` (1 vCPU, 1 GiB RAM), surgiram dois desafios arquiteturais centrais:

1. **Ciclo de Vida do Estoque Semanal (`[ ] Comprado p/ Semana`):**
   - Ingredientes perecíveis de reposição semanal (frutas, verduras, pães, proteínas frescas) marcados como `boughtForWeek = true` na semana $W$ não podem permanecer marcados indefinidamente na semana $W+1$, caso contrário o motor de alerta preventivo (*Lookahead D+1*) deixará de avisar o usuário sobre itens que já acabaram na virada da semana.
   - Depender exclusivamente de um cron job à meia-noite de domingo para segunda-feira pode falhar se o container estiver reiniciando exatamente às `00:00`.

2. **Horário de Alerta Configurável por Usuário (`alertTime`):**
   - Diferentes usuários possuem rotinas distintas de compras (ex.: `18:00`, `19:30`, `20:15`). Um cron job estático fixado em `0 18 * * *` impede a personalização por conta (`AppConfig.alertTime`).
   - Ao mesmo tempo, criar e destruir instâncias de `ScheduledTask` em memória para cada usuário adiciona complexidade de sincronização.

---

## 2. Decision

### 2.1. Expiração Semanal Determinística e Idempotente via `weekCycleKey` (ISO-8601 Week)
- Adicionamos os campos `boughtForWeekAt: DateTime?` e `weekCycleKey: String?` (formato ISO-8601 `"YYYY-Www"`, ex: `"2026-W42"`, calculado no fuso `America/Sao_Paulo` com início na segunda-feira às `00:00`) na tabela `Ingredient`.
- Quando o usuário marca `boughtForWeek = true`, o backend grava `weekCycleKey = getCurrentIsoWeek()`.
- A função `syncWeeklyInventoryExpiration(userId)` executa uma query determinística e ultra-rápida:
  ```sql
  UPDATE Ingredient
  SET boughtForWeek = 0, boughtForWeekAt = NULL, weekCycleKey = NULL
  WHERE userId = ? AND boughtForWeek = 1 AND (weekCycleKey IS NULL OR weekCycleKey <> ?);
  ```
- Essa sincronização é acionada de forma **híbrida**:
  1. **Lazy / On-Read:** Em toda chamada a `GET /api/state`.
  2. **Proactive / Pre-Alert:** Imediatamente antes da verificação de itens faltantes para $D_{+1}$ em `runLookaheadCheck(userId)` e no agendador de background.
- Assim, mesmo que o servidor esteja desligado à meia-noite de domingo, o estoque semanal expira com 100% de precisão na primeira leitura ou verificação da nova semana.

### 2.2. Agendador Dinâmico Multi-Tenant por Minuto (`* * * * *`) com Guarda de Idempotência (`lastAlertRunDate`)
- Substituímos o cron fixo por um único *ticker* leve (`cron.schedule("* * * * *", ...)`) em `src/instrumentation.ts`.
- A cada minuto, o agendador obtém `currentHHmm` (`"HH:mm"`) e `currentYYYYMMDD` (`"YYYY-MM-DD"`) no fuso `America/Sao_Paulo`.
- Na virada de segunda-feira (`00:00`), executa `syncWeeklyInventoryExpiration()` para todos os usuários.
- Em seguida, filtra em memória/SQL apenas os `AppConfig` onde:
  $$\text{alertEnabled} = \text{true} \land \text{alertTime} = \text{currentHHmm} \land \text{lastAlertRunDate} \neq \text{currentYYYYMMDD}$$
- Antes de disparar `runLookaheadCheck(userId)`, atualiza `lastAlertRunDate = currentYYYYMMDD`, garantindo **idempotência estrita** (no máximo 1 disparo automático por dia por usuário, sem risco de duplicidade).

---

## 3. Consequences

### Positive
- **Zero Overhead de Memória:** Apenas 1 timer `node-cron` em execução para todos os usuários da instância (~0 MiB de overhead adicional).
- **Resiliência Total a Reinicializações:** A expiração semanal baseada em comparação de `weekCycleKey` funciona mesmo após *restarts* ou *deploys* do container.
- **Experiência Personalizada:** Cada usuário escolhe livremente seu horário de alerta (`alertTime`) na interface web e vê o horário refletido em tempo real nos rótulos do sistema.
