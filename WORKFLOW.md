# AgentGrid Workflow & Payment Architecture

## Overview

AgentGrid is an autonomous AI infrastructure marketplace that enables AI agents to dynamically discover, route, pay for, and execute workloads across a decentralized network of model APIs and GPU compute providers. The system implements the **x402 HTTP Payment Standard** (RFC 7235) for trustless, on-chain settlement on **Algorand TestNet**.

---

## Core Roles

| Role | Entity | Responsibilities |
|------|--------|------------------|
| **Client** | AI Agent / User Dashboard / Autonomous Orchestrator | Initiates workload requests, holds funded Algorand wallet, signs payment transactions cryptographically |
| **Merchant** | Model API Provider / P2P GPU Node Operator | Hosts execution endpoints, issues HTTP 402 challenges, verifies signatures, settles on-chain, returns results |
| **Orchestrator** | AgentGrid Platform | Matches clients to optimal merchants via Pareto routing, manages catalog, provides facilitator services, takes 1.5% protocol fee |

---

## End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTGRID WORKFLOW LOOP                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. INTENT    │────►│ 2. ROUTING   │────►│ 3. PAYMENT   │────►│ 4. EXECUTION │
│  ANALYSIS    │     │  & MATCHING  │     │  (x402)      │     │  & SETTLEMENT│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Parse prompt + SLAs      │  • Score all Model×GPU combos               │
│  • Estimate tokens/cost     │  • Pareto frontier (cost/latency/quality)   │
│  • Classify modality        │  • Select optimal + fallback provider       │
│  • Set budget/deadline      │  • Generate x402 challenge                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. VERIFICATION & FAILOVER                                                 │
│  • Validate on-chain confirmation                                           │
│  • Stream execution tokens via SSE                                          │
│  • Monitor telemetry for SLA adherence                                      │
│  • Auto-reroute to fallback on degradation (0 token loss)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Intent Analysis

**Input**: User prompt + optional overrides (budget, deadline, quality, priority)

**Process**:
1. **Prompt Classification** — Gemini/Local analyzer extracts:
   - `modality`: `code` | `reasoning` | `general` | `fast-chat` | `batch-summary` | `vision` | `embeddings`
   - `estimatedInputTokens`, `estimatedOutputTokens`
   - `maxBudgetAlgo`, `maxBudgetUsd`
   - `deadlineMs`, `minQualityScore`
   - `priority`: `cost` | `speed` | `quality` | `balanced`

2. **Requirement Object** — Structured `TaskRequirement` fed to router

---

## Stage 2: Routing & Matching (Pareto Engine)

**Algorithm**: Deterministic multi-objective optimization across all active `ModelProvider × ComputeProvider` permutations

**Scoring Dimensions**:
| Dimension | Weight (Balanced) | Weight (Cost) | Weight (Speed) | Weight (Quality) |
|-----------|-------------------|---------------|----------------|------------------|
| Cost      | 30%               | 55%           | 15%            | 15%              |
| Latency   | 30%               | 15%           | 55%            | 15%              |
| Quality   | 30%               | 20%           | 20%            | 60%              |
| Reliability| 10%              | 10%           | 10%            | 10%              |

**Steps**:
1. Filter by modality support + online status
2. Calculate per-combination:
   - `estimatedLatencyMs` = `compute.latencyBaseMs` + `outputTokens / (model.tps × gpuBoost)`
   - `estimatedCostAlgo` = `tokenCostUsd + computeCostUsd` / `ALGO_USD_RATE`
   - `projectedQuality` = `model.qualityBenchmark` - `loadPenalty`
3. Apply hard constraints: `slaAdherent`, `budgetAdherent`
4. Normalize + weighted composite score
5. **Pareto frontier**: Non-dominated combinations (no other is better in all 3: cost, latency, quality)
6. Select #1 composite score, fallback = different compute provider

**Output**: `RoutingDecision` with selected candidate, fallback, reasoning, full pareto frontier

---

## Stage 3: x402 Payment Flow

### Protocol Overview (RFC 7235 / x402)

```
CLIENT (Buyer)                                    MERCHANT (Seller)
    │                                                  │
    ├────── 1. POST /workload ──────────────────────►│
    │         (No payment headers)                   │
    │                                                  │
    │◄───── 2. HTTP 402 Payment Required ────────────┤
    │         Headers:                               │
    │         PAYMENT-REQUIRED: base64({             │
    │           scheme: "exact",                     │
    │           network: "algorand-testnet",         │
    │           price: 500000,        // µALGO       │
    │           payee: "MERCHANT_ADDR",              │
    │           memo: "x402:task:123"                │
    │         })                                     │
    │         WWW-Authenticate: x402-algorand ...    │
    │                                                  │
    │    [Client signs transaction offline]          │
    │         using Pera Wallet or Agent key         │
    │                                                  │
    ├────── 3. POST /workload ──────────────────────►│
    │         Header: PAYMENT-SIGNATURE: base64(signed_txn)    │
    │                                                  │
    │         [Merchant verifies on Algorand]        │
    │         1. Decode signed transaction           │
    │         2. Check receiver = payee              │
    │         3. Check amount = price                │
    │         4. Check network = testnet-v1.0        │
    │         5. Broadcast + wait for confirmation   │
    │                                                  │
    │◄───── 4. 200 OK + PAYMENT-RESPONSE ────────────┤
    │         Header: PAYMENT-RESPONSE: base64({     │
    │           status: "CONFIRMED",                 │
    │           txId: "ABC123...",                   │
    │           round: 44192082                      │
    │         })                                     │
    │         Body: { result: "...", tokens: 450 }   │
    │                                                  │
```

### Header Definitions

| Header | Direction | Format | Purpose |
|--------|-----------|--------|---------|
| `PAYMENT-REQUIRED` | Merchant → Client | Base64(JSON) | Invoice: price, payee, network, scheme, memo |
| `WWW-Authenticate` | Merchant → Client | String | Standard RFC 7235 challenge with facilitator URL |
| `PAYMENT-SIGNATURE` | Client → Merchant | Base64(bytes) | Signed Algorand payment transaction |
| `PAYMENT-RESPONSE` | Merchant → Client | Base64(JSON) | Settlement proof: txId, round, status |

### Payment Terms Schema

```typescript
interface PaymentTerms {
  scheme: 'exact';                    // Fixed-amount payment
  network: 'algorand-testnet' | 'algorand-mainnet';
  price: number;                      // MicroALGO (1 ALGO = 1,000,000 µALGO)
  payee: string;                      // 58-char Algorand address
  memo?: string;                      // "x402:task:{taskId}:{providerId}"
}
```

### Settlement Mechanics

**Atomic Transaction Group** (2 transactions):
1. **Provider Payout** — 98.5% of amount to merchant's `algorandPayoutAddress`
2. **Protocol Fee** — 1.5% to AgentGrid treasury

**Verification** (Merchant-side):
```typescript
const verification = await verifyAlgorandPayment(signature, terms, merchantConfig);
// 1. decodeSignedTransaction(base64)
// 2. txn.type === 'pay'
// 3. txn.receiver === terms.payee
// 4. txn.amount === terms.price
// 5. txn.genesisID === 'testnet-v1.0'
// 6. sendRawTransaction + waitForConfirmation(4 rounds)
```

---

## Stage 4: Execution & Streaming

**Transport**: Server-Sent Events (SSE) via `/api/tasks/stream`

**Event Types**:
| Event | Data | Purpose |
|-------|------|---------|
| `pipeline_event` | `{stage, message, timestamp, data?}` | Stage transitions: analyzing → discovering → optimizing → x402_challenging → settling → executing → verifying |
| `token_chunk` | `{chunk: string}` | Streaming model output tokens |
| `heartbeat` | `{timestamp}` | Keep-alive every 3s |
| `error` | `{error: string}` | Terminal failure |

**Failover Trigger**: If `simulateFailover=true` or real telemetry degradation:
1. Emit `rerouting_failover` event
2. Switch to `routing.fallbackCandidate`
3. Resume token stream from new provider
4. Record `failoverDetails` in receipt

---

## Stage 5: Receipt & Audit Trail

**CompletedTask** record includes:
- Full `RoutingDecision` with pareto frontier
- `X402PaymentChallenge` + `X402PaymentProof`
- `AlgorandTransactionRecord` (txId, round, amount, fee, explorer URLs)
- `executionOutput`, `actualDurationMs`, `actualCostAlgo`
- `failoverOccurred` + `failoverDetails` if applicable

**Export**: Downloadable JSON receipt (`x402-algorand-audit-v1`) with:
- Blockchain settlement proof (Lora Explorer + Pera Explorer links)
- Routing rationale
- Cost breakdown
- SLA adherence verification

---

## x402 Role in AgentGrid

| Aspect | Implementation |
|--------|----------------|
| **Standard** | RFC 7235 `402 Payment Required` + x402 extensions |
| **Scheme** | `avm:exact` (fixed amount, exact payment) |
| **Facilitator** | GoPlausible (`https://facilitator.goplausible.xyz`) |
| **Network** | Algorand TestNet (Chain ID: 416002) |
| **Currency** | ALGO (microALGO units in headers) |
| **Fee Model** | 1.5% protocol fee → treasury, 98.5% → provider |
| **Wallet** | Autonomous agent wallet (server) + optional Pera Wallet (user) |
| **Verification** | On-chain by merchant + facilitator cross-check |
| **Replay Protection** | Challenge nonce + 5-min TTL + consumed tracking |

---

## Manual Marketplace Flow (Human-in-the-Loop)

```
Marketplace UI → Select Model + Compute → PurchaseConfirmModal
                                                    │
                                                    ▼
                              ┌─────────────────────────────────┐
                              │  Itemized Cost Breakdown          │
                              │  • Token cost (input/output)      │
                              │  • Compute cost (time × rate)     │
                              │  • Protocol fee (1.5%)            │
                              │  • Provider payout                │
                              │  • Est. latency / quality / uptime│
                              └─────────────────────────────────┘
                                                    │
                                                    ▼
                              Confirm → TaskContext.lock(selection)
                                                    │
                                                    ▼
                              CommandCenter with sticky summary bar
                              (Model + Compute + Cost + Latency badges)
                                                    │
                                                    ▼
                              User enters prompt → Run → Standard x402 flow
```

---

## Community P2P Node Onboarding

1. User clicks **"List Your GPU"** in Marketplace
2. `RegisterGpuModal`: name, specs, category (COMPUTE_GPU/MODEL_API), unit (HOUR/1M_TOKENS), rate
3. `POST /api/warehouse/providers/register` → Added to registry as `COMMUNITY_P2P`
4. Appears instantly in marketplace grid with `isRealEndpoint: false`
5. Other users can select it → Routes to merchant endpoint (user must run x402 middleware)

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tasks/analyze` | POST | Classify prompt → TaskRequirement |
| `/api/tasks/evaluate-route` | POST | Run Pareto router → RoutingDecision |
| `/api/tasks/stream` | GET | SSE execution stream |
| `/api/tasks/execute` | POST | Sync execution |
| `/api/warehouse/providers` | GET | List all providers (filterable) |
| `/api/warehouse/providers/register` | POST | Register community GPU |
| `/api/warehouse/route` | POST | Deterministic router query |
| `/api/merchant/compute/terms` | GET | Get x402 payment terms |
| `/api/merchant/compute/run` | POST | x402-protected execution endpoint |
| `/api/ledger/accounts` | GET | Wallet balances |
| `/api/ledger/transactions` | GET | Settlement history |
| `/api/ledger/stats` | GET | Network analytics |

---

## Failure Modes & Handling

| Failure Point | Detection | Recovery |
|---------------|-----------|----------|
| Agent wallet unfunded | Pre-flight balance check | Prompt to fund via TestNet faucet |
| Routing: no candidates | Pareto returns empty | Return "No feasible route" error |
| x402: signature invalid | Merchant verification fails | Return 400, client can retry |
| x402: broadcast fails | Algorand timeout/error | Server generates cryptographic receipt (demo fallback) |
| Execution: provider down | SSE error / timeout | Auto-failover to fallback candidate |
| Stream disconnect | SSE `error` event | Client can resume via task ID (planned) |

---

## Security Considerations

- **Private keys never leave client** — Pera Wallet signs in-browser; agent key is server-only
- **Payment signed, not sent** — Client signs, merchant broadcasts (merchant can't alter amount/payee)
- **Challenge TTL** — 5-minute expiry prevents replay
- **Nonce binding** — Each challenge has unique nonce tied to task
- **Rate limiting** — 20 req/min on `/execute` and `/stream` endpoints
- **CORS** — Explicit allowlist + localhost/Vercel/Render auto-allow