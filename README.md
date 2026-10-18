# NutriTrack-OS 🥗⚡

> **Sistema Inteligente de Gestão de Dieta, Controle de Estoque Pessoal Vivo e Acompanhamento Clínico-Nutricional**
> Arquitetura *Ultra Low-Footprint* (`< 50 MiB RAM` em produção), desenvolvida segundo a metodologia **SDD (Spec-Driven Development)**.

[![Next.js](https://img.shields.io/badge/Next.js-14_Standalone-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![SQLite WAL](https://img.shields.io/badge/SQLite-WAL_Mode-003B57)](https://www.sqlite.org/wal.html)
[![Caddy TLS](https://img.shields.io/badge/Caddy-Auto_HTTPS-10b981)](https://caddyserver.com/)

---

## 📌 1. Visão Geral do Produto

O **NutriTrack-OS** é uma plataforma web full-stack, *Mobile-First* e *PWA-ready*, projetada para eliminar a quebra de adesão a planos alimentares por falta de planejamento de compras ou acompanhamento fragmentado. O sistema conecta diretamente o **cardápio cíclico semanal/mensal** a um **catálogo de estoque vivo** e a um **motor preventivo de alertas (Lookahead Cron)** que avisa às 18:00 caso falte algum insumo para as refeições do dia seguinte.

---

## ✨ 2. Principais Funcionalidades

1. **Dashboard "Hoje & Mês Atual":**
   - Controle de hidratação diária com destaque para o protocolo de **300–600 ml de água em jejum ao acordar**.
   - Linha do tempo das refeições do dia (`Café da Manhã`, `Colação`, `Almoço`, `Lanche`, `Jantar`, `Ceia`) com check-in rápido (`Concluído`, `Substituído`, `Pulado`).
   - Registro fotográfico auditável com **compressão client-side em Canvas para WebP ($\le 400\text{ KB}$)**, captura automática de **horário exato** e **geolocalização GPS** (resolvida via *OpenStreetMap Nominatim Reverse Geocoding* ou tags rápidas) estampados como badge sobre a foto.
   - Calendário interativo de adesão mensal (Verde = Concluído, Amarelo = Parcial/Substituído, Vermelho = Fora do Plano).
2. **Montagem Mensal Dinâmica, Catálogo Oficial da Nutricionista (PDF) & Guia de Receitas Base (`SPEC-08`):**
   - Catálogo oficial completo com **48 opções originais do PDF da Nutricionista** distribuídas nas 6 refeições do dia (6 Cafés da Manhã, 3 Colações, 12 Almoços, 10 Lanches da Tarde, 9 Jantares e 8 Ceias).
   - Criação de **Pratos Customizados** com vínculo de novos ingredientes e **replicação multi-dias (`Seg` a `Dom`)**, recalculando automaticamente a necessidade semanal (`weeklyNeed`) e mensal (`monthlyNeed`) na lista de compras.
   - Catálogo embutido com as **8 Receitas Base oficiais da página 13 do PDF** (*1. Molho de Tomate Caseiro, 2. Lasanha de Berinjela, 3. Purê Saudável, 4. Patê Fit, 5. Pizza de Frigideira com Rap 10, 6. Massa de Panqueca, 7. Hambúrguer Natural e 8. Panqueca de Banana*).
3. **Lista de Compras Inteligente & Expiração Semanal Automática (`SPEC-09`):**
   - Catálogo pré-populado com *Default Balanced Meal Plan Template (Sample Seed)* contendo 39 insumos e 42 refeições semanais.
   - Checkboxes independentes e persistentes: `[ ] Tenho pro Mês` (`inStock`) e `[ ] Comprado p/ Semana` (`boughtForWeek`).
   - **Expiração Semanal Inteligente (`weekCycleKey`):** Itens marcados em `[ ] Comprado p/ Semana` recebem a chave da semana ISO corrente (ex: `2026-W42`) e são **automaticamente desmarcados na virada de segunda-feira às 00:00**, voltando a integrar os alertas preventivos da nova semana.
4. **Lookahead Inventory Alert Engine com Horário Dinâmico (`SPEC-10`):**
   - Agendador interno (`node-cron` via Next.js Instrumentation Hook) com **horário 100% configurável por usuário** (`alertTime`, ex: `18:00`, `19:30`), que cruza diariamente as refeições de amanhã (`D+1`) com itens fora de estoque (`!inStock && !boughtForWeek`), enviando alerta HTML via **SMTP** ou **Resend API**.
5. **Relatório Executivo para Nutricionista com Filtro de Período (`SPEC-11`):**
   - Seletor de período customizado (`startDate` até `endDate`) e atalhos rápidos (*Esta Semana*, *Mês Atual*, *Últimos 30 Dias*, *Todo o Período*).
   - Consolidação de KPIs (% de adesão geral, adesão por tipo de refeição, média de hidratação, histórico de substituições e galeria de fotos auditadas com data/hora/GPS), estilizada com `@media print` para exportação direta em PDF (`window.print()`).
6. **Autenticação Multi-Usuário & Isolamento Completo (`SDD-002`):**
   - Login e Cadastro instantâneo com sessão **JWT Stateless (`jose` + Cookie `HttpOnly`)** e hash de senha nativo (`crypto.scrypt`).
   - **Auto-Onboarding:** Cada nova conta criada recebe automaticamente seu próprio catálogo de 39 ingredientes e 42 refeições semanais em uma transação isolada por `userId`.

---

## 🏗️ 3. Arquitetura Low-Footprint (`< 50 MiB RAM`)

O sistema foi engenheirado para operar com folga em instâncias Cloud IaaS *Free Tier* de 1 GB de RAM (ex.: Azure `Standard_B1s` / `Standard_B2ats_v2`):

- **Next.js Standalone Runtime (`~35 MiB RAM`):** Compilado com `output: 'standalone'` no [`next.config.mjs`](next.config.mjs), eliminando a árvore pesada do `node_modules` em produção.
- **SQLite em Modo WAL (`0 MiB SGBD Overhead`):** Persistência embarcada via Prisma ORM com `PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;` e `PRAGMA busy_timeout=5000;` ([`src/lib/prisma.ts`](src/lib/prisma.ts)).
- **Compressão Client-Side WebP ($\le 400\text{ KB}$):** Processamento de imagem via HTML5 `<canvas>` no navegador antes do upload, preservando o disco SSD local.
- **Caddy Server Reverse Proxy (`~13 MiB RAM`):** Provisionamento e renovação automática de certificados TLS/HTTPS Let's Encrypt.

📚 **Documentação Técnica SDD Completa:**
- [**Software Design Document (`docs/SDD.md`)**](docs/SDD.md) — Especificação completa de arquitetura, diagramas Mermaid, modelo de dados multi-tenant (ERD), regras de negócio (`SPEC-01` a `SPEC-12`) e contratos de API.
- **Architecture Decision Records (`docs/ADR/`):**
  - [ADR-001: SQLite WAL Mode vs. SGBD Gerenciado](docs/ADR/001-sqlite-wal-over-managed-db.md)
  - [ADR-002: Next.js Standalone & Caddy Auto-HTTPS](docs/ADR/002-nextjs-standalone-and-caddy.md)
  - [ADR-003: Compressão Client-Side WebP $\le 400\text{ KB}$](docs/ADR/003-client-side-webp-compression.md)
  - [ADR-004: Sessão JWT Stateless (`jose`) & Isolamento Multi-Tenant (`userId`)](docs/ADR/004-stateless-jwt-multi-tenant-isolation.md)
  - [ADR-005: Expiração Semanal Automática (`weekCycleKey`) & Agendador Dinâmico (`alertTime`)](docs/ADR/005-weekly-inventory-expiration-and-dynamic-cron.md)

---

## 🚀 4. Guia de Execução Local e Deploy

### 4.1. Desenvolvimento Local (Node.js 20+)

```bash
# 1. Clone o repositório
git clone https://github.com/Celta031/NutriTrack-OS.git
cd NutriTrack-OS

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Instale as dependências e inicialize o banco SQLite + Seed de exemplo
npm install
npx prisma db push
npm run db:seed

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

### 4.2. Execução Containerizada em Produção (Docker Compose + Caddy HTTPS)

```bash
# Defina o domínio público para emissão automática do certificado Let's Encrypt
export DOMAIN_NAME="nutritrack-demo.eastus.cloudapp.azure.com"

# Suba a stack completa (App Standalone + Caddy Reverse Proxy)
docker compose up -d --build
```

Os dados são persistidos automaticamente no host em:
- `/var/lib/nutritrack/data` (Banco SQLite em modo WAL)
- `/var/lib/nutritrack/uploads` (Fotos WebP das refeições)

### 4.3. Provisionamento Automatizado na Microsoft Azure (`az cli`)

Os scripts em [`deploy/`](deploy/) automatizam a criação da infraestrutura IaaS e a configuração do sistema operacional (incluindo **4 GB de SWAP** para proteção contra *Out-Of-Memory* durante builds):

```powershell
# 1. Provisionar Resource Group, VM Ubuntu 24.04 LTS, Disco 64GB StandardSSD_LRS, IP Público + DNS e NSG (80/443)
$env:AZURE_RG_NAME="rg-nutritrack-prod"
$env:AZURE_LOCATION="eastus"
$env:AZURE_DNS_PREFIX="nutritrack-demo"
./deploy/provision-azure.ps1

# 2. Configurar SWAP de 4GB, diretórios /var/lib/nutritrack e runtime na VM via SSH
scp -i ~/.ssh/id_rsa deploy/setup-vm.sh azureuser@<YOUR_VM_PUBLIC_IP>:~/
ssh -i ~/.ssh/id_rsa azureuser@<YOUR_VM_PUBLIC_IP> "chmod +x ~/setup-vm.sh && ~/setup-vm.sh"
```

---

## 📄 Licença

Distribuído sob licença MIT. Veja [`docs/SDD.md`](docs/SDD.md) para especificações detalhadas de engenharia.
