# PharosGuard

Wallet risk analysis tool for the Pharos ecosystem. Enter any EVM address and get instant trust signals — risk score, behavioral metrics, and suspicious pattern flags.

**Demo:** [Add Netlify URL]

## How to Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Connect your GitHub repo: `Salee3m/pharos-agent-tools`
3. Branch: `pharosguard`
4. Publish directory: `projects/pharosguard/frontend/`
   *(or select the root and use netlify.toml which sets publish = "frontend/")*
5. Deploy

The frontend auto-detects Netlify and uses same-origin API paths.

## How to Run Locally

```bash
bash start.sh
```

Opens at `http://localhost:8000` — serves both frontend + API.

## Architecture

```
frontend/     → Static HTML/CSS/JS (deploy on Netlify)
backend/      → FastAPI (Python, needs a server)
  main.py        → API endpoints
  analyzer.py    → Risk scoring engine
  rpc_client.py  → Pharos RPC interaction
  explorer_client.py → Pharosscan API
```

## API

- `GET /analyze/{wallet_address}` — Full risk profile
- `GET /api` — Health check

## Data Sources

- **RPC:** `https://rpc.pharos.xyz` (chainID 1672)
- **Explorer:** `https://api.socialscan.io/pharos-mainnet/v1/`
- **Block Explorer:** `https://www.pharosscan.xyz`
