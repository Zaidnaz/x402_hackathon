# AgentGrid Frontend Workflow Handoff

This document describes the current production workflow and the implementation contract for extending the frontend.

## 1. System Boundaries

### Frontend

Location: `client/`

- React 18 + TypeScript.
- Vite dev server on port `5173`.
- Tailwind CSS for styling.
- `App.tsx` owns tab navigation and task execution state.
- `WalletContext.tsx` owns Pera Wallet connection, balance refresh, and user-signed payments.
- `utils/api.ts` owns HTTP and SSE communication.

### Backend

Location: `server/`

- Hono + Node.js + TypeScript.
- Default port `3001`.
- Supabase/Postgres persistence when configured.
- Algorand TestNet settlement.
- GoPlausible x402 facilitator.

The Vite dev server proxies `/api` to `http://localhost:3001`.

## 2. Local Development

From the repository root:

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run dev
```

Or run independently:

```bash
npm run dev:server
npm run dev:client
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- API health check: `http://localhost:3001/`

If a port is occupied, Vite chooses the next available port. The API remains on its configured `PORT`.

Production validation:

```bash
npm run build
npm run build:client
npm run build:server
```

## 3. Application State Model

`App.tsx` tracks:

- Active tab.
- Marketplace models and compute providers.
- Ledger accounts.
- Current execution stage.
- SSE execution events.
- Streamed output by step.
- Completed plan.
- Error message.
- Approval-required information.
- The last task dispatch, used to retry after approval.

A task must transition through these frontend states:

```text
idle
  -> planning
  -> analyzing_intent
  -> discovering_grid
  -> optimizing_pareto
  -> x402_challenging
  -> settling_algorand
  -> executing_workload
  -> verifying_telemetry
  -> completed / plan_completed
```

Alternative transitions:

```text
settling_algorand -> awaiting_approval -> settling_algorand
executing_workload -> rerouting_failover -> executing_workload
any active state -> failed
```

When starting a new task:

1. Unsubscribe the previous SSE stream.
2. Clear events, output, completed plan, approval, and error.
3. Set stage to `planning` and streaming to `true`.
4. Subscribe to the plan stream.

When the stream completes:

1. Store the completed plan.
2. Stop streaming.
3. Set stage to `plan_completed`.
4. Refresh ledger accounts.

When the stream fails:

1. Stop streaming.
2. Set stage to `failed`.
3. Keep the error visible.
4. Allow the user to start a new task.

## 4. Task Submission Workflow

Component path: `client/src/components/CommandCenter.tsx`

### Input

The user enters a prompt and optionally selects:

- Priority: `balanced`, `cost`, `speed`, or `quality`.
- Failover simulation.
- Future budget, deadline, modality, and quality constraints.

Pressing Enter submits. `Shift+Enter` inserts a newline.

### Request

`App.tsx` calls:

```ts
subscribeTaskPlanStream(
  prompt,
  overrides,
  simulateFailover,
  humanApproved,
  onEvent,
  onTokenChunk,
  onComplete,
  onError,
  onApprovalRequired
)
```

The frontend sends an `EventSource` request to:

```text
GET /api/tasks/plan-stream
```

Query parameters:

- `prompt`
- `simulateFailover`
- `humanApproved`
- `priority`
- `maxBudgetAlgo` when present
- `deadlineMs` when present
- `minQualityScore` when present

### Events

SSE event types:

- `pipeline_event`: execution stage and optional data.
- `token_chunk`: streamed output and optional step context.
- `error`: terminal stream error.

A successful plan sends a `pipeline_event` with:

```ts
{
  stage: 'plan_completed',
  data: { completedPlan }
}
```

Approval sends a `pipeline_event` with:

```ts
{
  stage: 'awaiting_approval',
  data: {
    estimatedCostAlgo,
    thresholdAlgo,
    modelName,
    computeName,
    prompt
  }
}
```

The client must close the `EventSource` after completion or approval. Do not treat the normal server close after completion as a failure.

## 5. Payment and Wallet Workflow

Component path: `client/src/context/WalletContext.tsx`

Pera Wallet uses Algorand TestNet chain ID `416002`.

Wallet actions:

1. `connectWallet()` opens the Pera connection flow.
2. On success, store the selected address and fetch the live balance.
3. `disconnectWallet()` clears the session and displayed balance.
4. `refreshBalance()` queries Algod for the current balance.
5. `executePeraPayment()` builds, signs, submits, and confirms a payment.

Payment implementation path: `client/src/utils/peraWallet.ts`

- Algod: `https://testnet-api.algonode.cloud`
- Indexer: `https://testnet-idx.algonode.cloud`
- Faucet: `https://bank.testnet.algorand.network/`
- Lora: `https://lora.algokit.io/testnet`
- Facilitator: `https://facilitator.goplausible.xyz`

A real payment flow must expose:

- Amount in ALGO.
- Destination address.
- Signing/loading state.
- User rejection or network failure.
- Transaction ID.
- Confirmed round.
- Lora and Pera Explorer links.

Never create a fake token or display a successful settlement without a signed and submitted transaction.

## 6. Direct x402 Testbed Workflow

Component path: `client/src/components/DirectX402Demo.tsx`

Backend endpoint:

```text
GET /api/x402/inference/direct-endpoint
```

### Phase 1: Challenge

Call the endpoint without authorization.

Expected response:

- HTTP `402`.
- `WWW-Authenticate`.
- `X-402-Payment-Address`.
- `X-402-Amount`.
- `X-402-Currency`.
- `X-402-Network`.
- `X-402-Facilitator`.
- `X-402-Scheme`.

The frontend stores response status, headers, and JSON body for inspection.

### Phase 2: Settlement

The user connects Pera Wallet and signs the requested TestNet payment. The frontend stores the confirmed transaction and creates the payment token from the returned transaction result.

If the wallet is not connected, show an actionable error asking the user to connect it. Do not simulate settlement.

### Phase 3: Authorized request

Call the same endpoint with:

```http
Authorization: x402 <payment-token>
```

Expected response: HTTP `200` with the authorized inference payload.

Display raw status, headers, body, transaction details, and explorer links.

## 7. Marketplace Workflow

Component path: `client/src/components/MarketplaceGrid.tsx`

Initial data comes from:

```text
GET /api/marketplace/catalog
```

The client keeps deterministic fallback data for offline demos, but the UI should make offline/fallback behavior clear when productionizing the system.

Provider registration endpoints:

```text
POST /api/marketplace/register-model
POST /api/marketplace/register-compute
```

Compute status endpoint:

```text
POST /api/marketplace/toggle-status
```

Mutation rules:

1. Disable the control while the request is in flight.
2. Validate the HTTP response and `success` field.
3. Refresh the catalog only after success.
4. Keep the modal open on failure.
5. Show the backend error inline.

## 8. Spending Policy Workflow

Component path: `client/src/components/SpendingPolicyModal.tsx`

Endpoints:

```text
GET /api/policy
PUT /api/policy
```

Policy fields:

- `dailyBudgetAlgo`: positive daily cap.
- `autoApproveThresholdAlgo`: nonnegative threshold no greater than the daily cap.

On open:

1. Fetch the policy.
2. Show loading state.
3. Populate current spend and remaining budget.
4. Show load errors without silently closing.

On save:

1. Parse numeric fields.
2. Reject invalid or NaN values.
3. Reject threshold greater than daily budget.
4. Disable save while pending.
5. Show saved confirmation only after backend success.
6. Keep the dialog open and show the error on failure.

## 9. Ledger and Analytics Workflow

Ledger component: `AlgorandLedger.tsx`

Endpoints:

```text
GET /api/ledger/accounts
GET /api/ledger/transactions?limit=50
```

Analytics component: `AnalyticsHUD.tsx`

Endpoints:

```text
GET /api/ledger/stats
GET /api/tasks/history
```

Both screens need:

- Initial loading state.
- Refresh action with spinner.
- Error state with retry.
- Empty state for valid empty results.
- Safe rendering when optional receipt fields are absent.

Receipt exports should be JSON and include enough information to identify the task, route, amount, transaction ID, and explorer URL.

## 10. Implementation Rules for New Work

- Reuse `utils/api.ts`; do not scatter raw `fetch` calls through presentation components.
- Validate `response.ok` and response shape before treating a request as successful.
- Keep network errors visible and retryable.
- Keep payment language precise: requested, signing, submitted, confirmed, rejected, or failed.
- Keep all API-backed mutations idempotent from the UI perspective by disabling duplicate submissions.
- Keep types in `client/src/types/index.ts` synchronized with backend response shapes.
- Use Lucide icons for actions and provide accessible labels for icon-only buttons.
- Prefer focused component edits over broad rewrites.
- Run `npm run build:client` after frontend changes.

## 11. Definition of Done

A frontend feature is ready when:

- The happy path works against the local API.
- Loading, empty, approval, success, rejection, and network failure states are represented.
- The screen works at mobile and desktop widths.
- Keyboard navigation and accessible names are present.
- No action reports success before the server or blockchain confirms it.
- The production build passes.
- The changed workflow has been smoke-tested in the browser.
