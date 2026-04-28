# Pharos Agent Tools

Tools for the Pharos Network ecosystem by Dev|Isham.

## Tools

- **Pharos SPN Configurator** — generates deployable Special Processing Network (SPN) configurations for DeFi, RWA, HFT, zkML, sidechain, and cross-chain bridge profiles. Validates against Pharos specs and includes step-by-step deploy guides.
- **Pharos RWA Tokenization Toolkit** — production-grade Solidity contracts for tokenizing Real-World Assets. Permissioned token (ERC-3643 style), yield distribution module, cross-SPN bridge wrapper. Foundry test suite included.
- **Pharos Agent Demo** — the first AI agent purpose-built for Pharos ecosystem, live on Atlantic Testnet (Chain ID 688689). Integrates the official Pharos Agent Kit (npm), monitors chain status, checks balances, and provides LangChain/Vercel AI SDK/MCP tooling. Ready for Pacific Mainnet.
- **Pharos Tx Explorer CLI** — look up any transaction hash on Pharos Pacific Mainnet and get human-readable details. Shows status, block, time, from/to, value, gas, logs. Works with live mainnet RPC.
- **Pharos Wallet Tracker Agent** — monitor a wallet address for incoming/outgoing transactions in real-time. Live-polling mode or one-shot check. Reports new txs as they happen with explorer links.

## Usage

```
python3 pharos_spn_configurator.py defi -o my-spn.json
```

For RWA contracts, see `pharos-rwa-tokenization/`.

```
python3 pharos-tx-explorer/pharos_tx_explorer.py <tx_hash>
python3 pharos-wallet-tracker/pharos_wallet_tracker.py <address> --once
python3 pharos-wallet-tracker/pharos_wallet_tracker.py <address>  # continuous
```

See `python3 pharos_spn_configurator.py` for all SPN profiles.
