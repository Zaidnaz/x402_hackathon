# AgentGrid — Autonomous AI Infrastructure Marketplace & Orchestrator

### 👥 Developed by **Team LENA**

[![Algorand](https://img.shields.io/badge/Network-Algorand%20TestNet-00DC82?style=flat&logo=algorand)](https://testnet.explorer.perawallet.app/)
[![Lora](https://img.shields.io/badge/Lora%20Explorer-AlgoKit%20TestNet-00DC82?style=flat)](https://lora.algokit.io/testnet)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible%20x402-white?style=flat)](https://facilitator.goplausible.xyz)
[![Team](https://img.shields.io/badge/Team-LENA-00DC82?style=flat)](https://github.com/Zaidnaz/x402_hackathon)
[![Protocol](https://img.shields.io/badge/Protocol-RFC%207235%20%2F%20x402%20AVM-040605?style=flat)](https://github.com/Zaidnaz/x402_hackathon)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat)](LICENSE)

**AgentGrid** (by **Team LENA**) is an autonomous AI infrastructure marketplace and router. When an AI agent receives a task, budget, deadline, and quality requirement, it dynamically benchmarks models and GPU compute providers, selects the Pareto-optimal combination, negotiates machine-to-machine HTTP 402 paywalls, and settles payments in real time on the **Algorand TestNet** via `@x402/avm`, the **GoPlausible Facilitator**, `@perawallet/connect`, and `algosdk`.

---

## ⚡ Hackathon & Evaluation Criteria Checklist

- [x] **Live on Algorand TestNet**: Live atomic micro-settlements and smart escrow payouts on Algorand TestNet (Chain ID: 416002).
- [x] **Lora Explorer Integration**: Direct 1-click on-chain inspection via [AlgoKit Lora Explorer](https://lora.algokit.io/testnet).
- [x] **GoPlausible Facilitator**: Integrated with GoPlausible Facilitator (`https://facilitator.goplausible.xyz`) under standard `avm:exact` scheme.
- [x] **Official `@x402` AVM Dependencies**: Native `@x402/core`, `@x402/avm`, `@x402/fetch`, `@x402/hono` integrated into `package.json`.
- [x] **Pera Wallet Connect**: Real on-chain mobile/web transaction signing and balance queries.
- [x] **Zero-Downtime Dynamic Failover**: In-flight rerouting with 0 dropped tokens upon node degradation.

---

## 🏗️ Architecture & Payment Flow

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
                    (X-402-Facilitator: https://facilitator.goplausible.xyz)
                    (X-402-Scheme: avm:exact, X-402-Amount: µALGO)
                                          │
                                          ▼
                   [ Algorand Atomic Micro-Settlement (TestNet) ]
                       (algosdk v3.1 / Pera Wallet Connect)
                                          │
                                          ▼
                      [ On-Chain Verification via Lora ]
                       (https://lora.algokit.io/testnet)
                                          │
                                          ▼
                       [ Live GPU Workload Stream via SSE ]
                      (In-Flight Dynamic Failover Watcher)
```

---

## 🔍 How to Verify On-Chain via Lora & Pera

1. Open **AgentGrid Console** (`http://localhost:5173`) or **x402 Testbed**.
2. Connect your **Pera Wallet** (ensure Pera app is set to **TestNet** in Developer Settings) or execute with the autonomous session agent.
3. Dispatch any task (e.g. *CUDA Kernel Optimization* or *Deep Math & Logic*).
4. Inspect the **Algorand Ledger** tab in the pipeline inspector:
   - Click **"Open in Lora"** to inspect the live block round, transaction ID, note payload, and fees on [AlgoKit Lora TestNet](https://lora.algokit.io/testnet).
   - Click **"Pera Explorer"** to view the wallet account history.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** or **pnpm**

### 2. Install Dependencies
```bash
# Workspace root
npm install

# Backend (includes @x402/core, @x402/avm, @x402/hono, algosdk)
cd server && npm install

# Frontend (includes @x402/core, @x402/avm, @perawallet/connect, three, gsap)
cd ../client && npm install
cd ..
```

### 3. Run Locally (Concurrent Backend + Frontend)
```bash
npm run dev
```

- **Frontend Console**: `http://localhost:5173` (Accessible from mobile on local Wi-Fi via `host: true`)
- **Backend API**: `http://localhost:3001`
- **Algorand Public Node**: `https://testnet-api.algonode.cloud`
- **GoPlausible Facilitator**: `https://facilitator.goplausible.xyz`
- **AlgoKit Lora Explorer**: `https://lora.algokit.io/testnet`

---

## 🛠️ Tech Stack & Standards

- **Team**: **Team LENA**
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Three.js, GSAP, `@x402/core`, `@x402/avm`, `@perawallet/connect`, `algosdk`.
- **Backend**: Node.js, TypeScript, Hono, `@x402/core`, `@x402/avm`, `@x402/hono`, `@hono/node-server`, `algosdk`, `@google/genai`.
- **Blockchain**: Algorand TestNet (Chain ID: 416002).
- **Facilitator**: GoPlausible (`facilitator.goplausible.xyz`) AVM Exact Scheme.
- **Standard**: RFC 7235 `HTTP 402 Payment Required`.

---

## 📄 License
MIT © 2026 Team LENA
