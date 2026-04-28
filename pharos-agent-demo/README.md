# Pharos Agent Demo

> **First AI Agent on Pharos Pacific Mainnet**  
> Integrated with [Pharos Agent Kit](https://www.npmjs.com/package/pharos-agent-kit),  
> live on **Atlantic Testnet** (Chain ID 688689),  
> ready for mainnet launch day.

---

## Overview

The **Pharos Agent Demo** showcases the very first AI agent purpose-built for the
Pharos ecosystem. It demonstrates:

- **Pharos Agent Kit** integration — balance checks, transfers, market data, DeFi
  data, and LangChain tool creation, all via the official `pharos-agent-kit` npm
  package.
- **Atlantic Testnet** connectivity — live JSON-RPC monitoring, block exploration,
  gas tracking, and wallet activity.
- **Foundry deployment** — a complete `foundry.toml` configured for Atlantic
  Testnet, ready for smart contract deployment.
- **Python monitoring companion** — an independent Python script that watches the
  chain, tracks agent wallets, and generates rich reports.
- **Future-proof mainnet readiness** — the same codebase targets Pharos Pacific
  Mainnet (launched **April 28, 2026**). Swap the RPC URL and you're live.

---

## Quick Start

### Prerequisites

| Tool    | Version   | Purpose                   |
|---------|-----------|---------------------------|
| Node.js | ≥ 20.x    | Run the TypeScript agent  |
| npm     | ≥ 8.x     | Package management        |
| Python  | ≥ 3.10    | Python monitoring script  |
| Foundry | ≥ 1.0     | Smart contract deployment |

### 1. Install Dependencies

```bash
cd pharos-agent-demo/
npm install
```

### 2. Set Up Your Private Key

Save your Atlantic Testnet deployer key:

```bash
# Already saved at ~/.pharos-testnet-key
# Deployer address: 0xeed479954373818098a6909729CB795ad88E7C63
```

> ⚠️ **Security**: The `~/.pharos-testnet-key` file is auto-detected by the
> agent script. On mainnet, use environment variables or a secure key manager.

### 3. Run the TypeScript Agent

```bash
# Full demo — connection check, balances, chain status, agent kit integration
npm run full

# Just check the chain connection
npm run check-chain

# Check wallet balances
npm run balance

# Monitor chain status
npm run monitor

# Dev mode (hot reload with tsx)
npm run dev
```

### 4. Run the Python Monitor

```bash
# One-shot chain + wallet report
python3 pharos_agent.py report

# Live monitoring (updates every 6 seconds)
python3 pharos_agent.py monitor

# Track a specific address
python3 pharos_agent.py track 0xeed479954373818098a6909729CB795ad88E7C63

# Full mode — initial report then live monitoring
python3 pharos_agent.py all
```

---

## File Structure

```
pharos-agent-demo/
├── src/
│   └── agent.ts              # TypeScript agent — Pharos Agent Kit demo
├── pharos_agent.py           # Python companion — JSON-RPC monitor & reporter
├── foundry.toml              # Foundry deployment config for Atlantic Testnet
├── package.json              # Node.js project manifest
├── tsconfig.json             # TypeScript compiler configuration
├── .gitignore
└── README.md                 # This file
```

---

## Atlantic Testnet Details

| Property          | Value                                           |
|-------------------|-------------------------------------------------|
| Network Name      | Atlantic Testnet                                |
| Chain ID          | `688689`                                        |
| RPC Endpoint      | `https://atlantic.dplabs-internal.com`          |
| Explorer          | `https://atlantic.pharosscan.xyz`               |
| Currency          | PHAROS (testnet)                                |
| Deployer Address  | `0xeed479954373818098a6909729CB795ad88E7C63`    |

---

## Pharos Ecosystem Integration

### Pharos Agent Kit (`pharos-agent-kit`)

The demo uses the official [pharos-agent-kit](https://www.npmjs.com/package/pharos-agent-kit)
npm package (`v1.0.2`) to connect AI agents to Pharos protocols. Capabilities demonstrated:

| Capability                | Method                              | Description                           |
|---------------------------|-------------------------------------|---------------------------------------|
| Native balance            | `agent.getBalance()`                | Check PHAROS native token balance     |
| ERC-20 balance            | `agent.getBalance(tokenAddr)`       | Check any ERC-20 token balance        |
| Transfer                  | `agent.transfer(to, amount, mint?)` | Send PHAROS or ERC-20 tokens          |
| Token prices              | `agent.fetchTokenPriceByChainId()`  | Real-time Coingecko price data        |
| Trending tokens           | `agent.getTrendingTokens()`         | Top trending tokens on Coingecko      |
| Protocol TVL              | `agent.fetchProtocolTvl()`          | DeFiLlama TVL data                    |
| Top gainers               | `agent.getTopGainersOnCoingecko()`  | Gainers over custom durations         |
| ERC-721 balance           | `agent.getERC721Balance()`          | NFT balance queries                   |
| Social data (Elfa AI)     | `agent.getSmartMentions()`          | Smart mentions and account stats      |
| LangChain tools           | `createPharosTools(agent)`          | Drop-in LangChain tool integration    |

### Foundry Deployment

The `foundry.toml` includes:

- `[rpc_endpoints]` section with `atlantic` pointing to the testnet RPC
- `[chain_atlantic]` with Chain ID 688689 and explorer URL
- `[etherscan]` Atlantic block explorer integration
- Deploy command example using `~/.pharos-testnet-key`

### Python Companion

`pharos_agent.py` provides a lightweight, zero-dependency JSON-RPC monitor:

- Pure Python — no pip install required, uses only `urllib` from stdlib
- Monitors block height, gas prices, wallet balances in real time
- Generates structured JSON reports
- Tracks transaction activity for any address

---

## Deploying to Atlantic Testnet

### Smart Contracts (Foundry)

```bash
cd pharos-agent-demo/

# Compile
forge build

# Deploy with Atlantic Testnet key
forge create src/MyContract.sol:MyContract \
  --rpc-url atlantic \
  --private-key $(cat ~/.pharos-testnet-key)

# Or use a deploy script
forge script script/Deploy.s.sol \
  --rpc-url atlantic \
  --broadcast \
  --private-key $(cat ~/.pharos-testnet-key)
```

### Agent on Mainnet

To point the agent at **Pharos Pacific Mainnet**:

1. Set `ATLANTIC_RPC` to the Pacific Mainnet RPC URL in `src/agent.ts`
2. Update the chain ID constant to the Pacific Mainnet chain ID
3. Use your mainnet deployer key
4. Run `npm run full`

---

## Roadmap

- [x] **Atlantic Testnet**: Live agent integration with Pharos Agent Kit
- [x] **Python Monitor**: Zero-dependency JSON-RPC chain monitoring
- [x] **Foundry Config**: Atlantic Testnet deployment ready
- [x] **Pacific Mainnet**: Codebase ready — swap RPC and deploy
- [ ] **Mainnet Agent**: Full mainnet launch with autonomous agent workflows
- [ ] **MCP Server**: Model Context Protocol server for CLI/IDE integration
- [ ] **Multi-agent orchestration**: LangGraph-based agent swarms on Pharos

---

## License

Apache-2.0 — see root repository license.

---

## Author

**Isah Muhammad** (GitHub: [@Salee3m](https://github.com/Salee3m))

Built for the Pharos ecosystem. Pacific Mainnet launched April 28, 2026. 🚀
