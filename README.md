# AgentGrid — Autonomous AI Infrastructure Marketplace & Orchestrator

[![Algorand](https://img.shields.io/badge/Network-Algorand%20TestNet-00DC82?style=flat&logo=algorand)](https://testnet.explorer.perawallet.app/)
[![Protocol](https://img.shields.io/badge/Protocol-RFC%207235%20%2F%20x402-black?style=flat)](https://github.com/Zaidnaz/x402_hackathon)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat)](LICENSE)

**AgentGrid** is an autonomous AI infrastructure marketplace and router. When an AI agent receives a task, budget, deadline, and quality requirement, it dynamically benchmarks models and GPU compute providers, selects the Pareto-optimal combination, negotiates machine-to-machine HTTP 402 paywalls, and settles payments in real time on the **Algorand TestNet** via `@perawallet/connect` and `algosdk`.

---

## ⚡ Key Highlights

- **Multi-Objective Pareto Router**: Deterministic scoring across Latency ($L$), Cost ($C$), Quality ($Q$), and Availability ($A$).
- **RFC 7235 / x402 Micropayment Protocol**: Zero-friction HTTP 402 Paywall challenges settled atomically on Algorand.
- **Algorand TestNet & Pera Wallet**: Full micro-settlement with on-chain signing via Pera Mobile/Web, queryable block rounds, and a 1.5% protocol routing fee.
- **Zero-Downtime Dynamic Failover**: In-flight rerouting with 0 dropped tokens upon node degradation.
- **Luxury Green/Black/White UI**: High-impact minimalist interface featuring WebGL Three.js `PixelSnow` and interactive hover `ScrambledText`.

---

## 🏗️ Architecture

```
                                  [ AI Agent Task ]
                                          │
                                          ▼
                       [ Natural Language Analyzer & Constraints ]
                                          │
                                          ▼
                         [ Deterministic Pareto Router ]
                   (DeepSeek / Claude / Llama  x  H100 / A100 / Serverless)
                                          │
                                          ▼
                         [ HTTP 402 Paywall Challenge ]
                         (X-402-Payment-Address, X-402-Amount)
                                          │
                                          ▼
                   [ Algorand Atomic Micro-Settlement (TestNet) ]
                       (algosdk v3.1 / Pera Wallet Connect)
                                          │
                                          ▼
                       [ Live GPU Workload Stream via SSE ]
                      (In-Flight Dynamic Failover Watcher)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** or **pnpm**

### 2. Install Dependencies
```bash
# Workspace root
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
cd ..
```

### 3. Run Locally (Concurrent Backend + Frontend)
```bash
npm run dev
```

- **Frontend Console**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Algorand Public Node**: `https://testnet-api.algonode.cloud`

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Three.js, GSAP, `@perawallet/connect`, `algosdk`.
- **Backend**: Node.js, TypeScript, Hono, `@hono/node-server`, `algosdk`.
- **Blockchain**: Algorand TestNet (Chain ID: 416002).
- **Standard**: RFC 7235 `HTTP 402 Payment Required`.

---

## 📄 License
MIT © 2026 AgentGrid Team
