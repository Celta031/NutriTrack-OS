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
2. **Montagem Mensal Dinâmica & Guia de Receitas Base:**
   - Edição completa do ciclo semanal (Segunda a Domingo) para qualquer mês (`YYYY-MM`), recalculando automaticamente a necessidade semanal (`weeklyNeed`) e mensal (`monthlyNeed`) na lista de compras.
   - Catálogo embutido de receitas base funcionais (*Patê Fit Cremoso, Hambúrguer Caseiro de Patinho, Molho de Tomate Rústico, Lasanha de Berinjela Fit, Purê Leve e Panqueca de Banana e Aveia*).
3. **Lista de Compras Inteligente (Mensal vs. Semanal):**
   - Catálogo pré-populado com *Default Balanced Meal Plan Template (Sample Seed)* contendo 39 insumos e 42 refeições semanais.
   - Checkboxes independentes e persistentes: `[ ] Tenho pro Mês` (`inStock`) e `[ ] Comprado pra Semana` (`boughtForWeek`).
   - Alerta visual em tempo real (`🚨 Falta para Amanhã!`) para qualquer ingrediente desmarcado que será exigido no cardápio de `D+1`.
4. **Lookahead Inventory Alert Engine (Cron 18:00):**
   - Agendador interno (`node-cron` via Next.js Instrumentation Hook) que cruza diariamente às `18:00` as refeições de amanhã (`D+1`) com itens fora de estoque (`!inStock && !boughtForWeek`), enviando alerta HTML via **SMTP** ou **Resend API** (além de botão de disparo e preview imediato na interface).
5. **Relatório Executivo para Nutricionista:**
   - Consolidação de KPIs mensais (% de adesão, média de hidratação, histórico de substituições justificadas e galeria de fotos auditadas com data/hora/GPS), estilizada com `@media print` para exportação direta em PDF (`window.print()`).

---

## 🏗️ 3. Arquitetura Low-Footprint (`< 50 MiB RAM`)

O sistema foi engenheirado para operar com folga em instâncias Cloud IaaS *Free Tier* de 1 GB de RAM (ex.: Azure `Standard_B1s` / `Standard_B2ats_v2`):

- **Next.js Standalone Runtime (`~35 MiB RAM`):** Compilado com `output: 'standalone'` no [`next.config.mjs`](next.config.mjs), eliminando a árvore pesada do `node_modules` em produção.
- **SQLite em Modo WAL (`0 MiB SGBD Overhead`):** Persistência embarcada via Prisma ORM com `PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;` e `PRAGMA busy_timeout=5000;` ([`src/lib/prisma.ts`](src/lib/prisma.ts)).
- **Compressão Client-Side WebP ($\le 400\text{ KB}$):** Processamento de imagem via HTML5 `<canvas>` no navegador antes do upload, preservando o disco SSD local.
- **Caddy Server Reverse Proxy (`~13 MiB RAM`):** Provisionamento e renovação automática de certificados TLS/HTTPS Let's Encrypt.

📚 **Documentação Técnica SDD Completa:**
- [**Software Design Document (`docs/SDD.md`)**](docs/SDD.md) — Especificação completa de arquitetura, diagramas Mermaid, modelo de dados (ERD), regras de negócio (`SPEC-01` a `SPEC-03`) e contratos de API.
- **Architecture Decision Records (`docs/ADR/`):**
  - [ADR-001: SQLite WAL Mode vs. SGBD Gerenciado](docs/ADR/001-sqlite-wal-over-managed-db.md)
  - [ADR-002: Next.js Standalone & Caddy Auto-HTTPS](docs/ADR/002-nextjs-standalone-and-caddy.md)
  - [ADR-003: Compressão Client-Side WebP $\le 400\text{ KB}$](docs/ADR/003-client-side-webp-compression.md)

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
