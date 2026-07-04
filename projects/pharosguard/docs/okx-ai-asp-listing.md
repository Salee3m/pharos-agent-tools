# OKX.AI ASP Listing Package — PharosGuard

Prepared: 2026-07-02  
Status: review-ready draft; do not submit/create a new ASP without explicit user approval.

## 1. Recommended positioning

PharosGuard should be listed as an **A2MCP** service, not A2A.

Reason: the product is deterministic and API-shaped:

```text
one public 0x address in → structured wallet-risk JSON out
```

A2A is better for multi-turn agents, negotiations, custom task delivery, and dispute-heavy work. PharosGuard is a clean callable security tool, so A2MCP is the lower-risk listing path.

## 2. Agent identity copy

### Agent name

```text
PharosGuard
```

### Agent description

```text
Security intelligence for Pharos and EVM wallets. PharosGuard scans one public 0x address and returns a clear risk score, risk level, behavioral metrics, flags, and JSON summary. It never asks for private keys, seed phrases, signatures, or personal data.
```

Why this is stronger:

- says exactly what the agent does
- avoids vague “AI-powered” claims
- states safety boundary clearly
- makes reviewer risk lower

## 3. Primary service listing

### Service name

```text
PharosGuard Wallet Risk Scan
```

### Service type

```text
A2MCP
```

### Suggested initial fee

```text
0.25 USDT per call
```

Reason: OKX.AI marketplace is still early; visible service prices were around 0.5–1 USDT, but this is a single deterministic API call. Lower pricing should reduce friction and help first usage/reviews. If OKX enforces a minimum, use the lowest allowed value.

### Endpoint

```text
https://www.pharosguard.xyz/analyze/{wallet_address}
```

Use the `www` endpoint. The bare domain redirects to `www`, and direct non-redirecting URLs are safer for automated marketplace review and agent clients.

## 4. OKX.AI-safe service description

Use this exact sectioned version. The previous rejection said the service description was missing required sections, so do not remove the headings.

```text
Summary: Analyzes one public Pharos/EVM wallet or contract address and returns risk score, risk level, behavior metrics, flags, and a concise security summary.
Input requirements: Provide exactly one 42-character 0x EVM address. Do not provide private keys, seed phrases, signatures, passwords, API keys, or personal data.
Output: JSON with wallet_address, risk_score, risk_level, data_source, metrics, risk_components, flags, and summary.
```

## 5. API contract

### Request

```http
GET https://www.pharosguard.xyz/analyze/{wallet_address}
```

### Input schema

```json
{
  "type": "object",
  "required": ["wallet_address"],
  "properties": {
    "wallet_address": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "A single public EVM wallet or contract address."
    }
  },
  "additionalProperties": false
}
```

### Output schema

```json
{
  "wallet_address": "string",
  "risk_score": "number, 0-100",
  "risk_level": "low | medium | high",
  "data_source": "string",
  "metrics": "object",
  "risk_components": "array",
  "flags": "array",
  "summary": "string"
}
```

## 6. Verified live evidence

### OpenAPI

```text
https://www.pharosguard.xyz/openapi.json
```

Verified result:

- HTTP status: `200`
- Content type: `application/json`
- API title: `PharosGuard API`
- API version: `1.0.0`
- Relevant paths:
  - `/analyze/{wallet_address}`
  - `/analyze/`
  - `/api`

### Valid wallet test

Test URL:

```text
https://www.pharosguard.xyz/analyze/0x33aD3000126D3257110fa8B4Db038059cF684614
```

Verified result:

- HTTP status: `200`
- Content type: `application/json`
- Risk score: `0`
- Risk level: `low`
- Data source: `live`
- Transaction count: `15`

Response shape observed:

```json
{
  "wallet_address": "0x33aD3000126D3257110fa8B4Db038059cF684614",
  "risk_score": 0,
  "risk_level": "low",
  "data_source": "live",
  "metrics": {
    "transaction_count": 15,
    "outgoing_transactions": 14,
    "unique_recipients": 9,
    "interaction_diversity": 0.6,
    "unique_methods": 7,
    "contract_interactions": 0,
    "wallet_age_days": 63.1,
    "days_since_last_tx": 60.2,
    "balance_pharos": "0.000881",
    "balance_wei": 881462612312600,
    "is_contract": false,
    "total_value_transferred": 0
  },
  "risk_components": [],
  "flags": [
    {
      "type": "positive",
      "label": "Diverse Interactions",
      "description": "Wallet interacts with 9 unique addresses — healthy interaction diversity."
    }
  ],
  "summary": "Low risk wallet. 15 transactions with healthy interaction patterns. 1 positive signal(s) detected."
}
```

### Invalid input test

Test URL:

```text
https://www.pharosguard.xyz/analyze/not-a-wallet
```

Verified result:

- HTTP status: `400`
- Content type: `application/json`
- Behavior: invalid input is rejected cleanly

Observed error:

```json
{
  "detail": "Invalid EVM wallet address: 'not-a-wallet'. Address must be 42 characters starting with 0x."
}
```

## 7. Submission JSON

Use the companion JSON file:

```text
/home/muhammadisah125/pharos-agent-tools/projects/pharosguard/docs/okx-ai-asp-listing.json
```

Core values:

```json
{
  "role": "asp",
  "agent": {
    "name": "PharosGuard",
    "description": "Security intelligence for Pharos and EVM wallets. PharosGuard scans one public 0x address and returns a clear risk score, risk level, behavioral metrics, flags, and JSON summary. It never asks for private keys, seed phrases, signatures, or personal data."
  },
  "services": [
    {
      "serviceName": "PharosGuard Wallet Risk Scan",
      "serviceType": "A2MCP",
      "fee": "0.25",
      "endpoint": "https://www.pharosguard.xyz/analyze/{wallet_address}"
    }
  ]
}
```

## 8. Review-risk controls

Before any submission, keep these unchanged unless there is a strong reason:

- Keep `Summary`, `Input requirements`, and `Output` headings in the service description.
- Use `https://www.pharosguard.xyz/...`, not the redirecting bare domain.
- Do not mention private-key scanning, seed phrase recovery, wallet access, or transaction signing.
- Do not claim “guaranteed scam detection”; say wallet-risk analysis.
- Keep one service only. Do not add website security or unrelated features to the OKX listing yet.
- Keep one input only: `wallet_address`.
- Use a low initial price until the listing is accepted and tested.

## 9. Submission blockers / approval boundary

Do not run onchain registration or create a replacement ASP unless the user explicitly approves.

Current known blocker/history:

- Existing Agent `3294` was created earlier, rejected, and later appeared blocked/unavailable.
- Random retrying against that agent is not recommended.
- If resubmission is possible through the OKX.AI interface, prefer fixing that listing first.
- If creating a fresh ASP is required, use this package and ask for explicit approval before creating it.

## 10. Final registration readiness checklist

- [x] Public HTTPS endpoint exists.
- [x] OpenAPI endpoint returns HTTP 200.
- [x] Valid wallet analysis returns HTTP 200 JSON.
- [x] Invalid wallet input returns HTTP 400 JSON.
- [x] Service description includes required review sections.
- [x] Listing uses non-redirecting `www` endpoint.
- [x] Safety boundary says no private keys, seed phrases, signatures, passwords, API keys, or personal data.
- [x] A2MCP selected as correct service type.
- [x] Companion JSON file updated.
- [ ] User explicitly approves any new onchain ASP creation.
- [ ] OnchainOS wallet login succeeds in active session.
- [ ] Avatar upload is completed if required by registration flow.
- [ ] Final OKX validation is run immediately before submission.
