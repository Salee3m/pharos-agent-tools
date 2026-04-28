# Pharos RWA Tokenization Toolkit

Production-grade Solidity contracts for tokenizing Real-World Assets on Pharos Network, by Isah Muhammad.

## Contracts

| Contract | Description |
|----------|-------------|
| `PharosAssetToken` | ERC-3643-style permissioned token — KYC-gated transfers, role-based mint/burn, pausable |
| `IComplianceModule` | ZK-KYC compliance interface — verifyTransfer, registerIdentity, jurisdiction checks |
| `DistributionModule` | Yield/income distribution — proportional payouts per token holding, batch claiming |
| `CrossChainAsset` | Cross-SPN bridge wrapper — lock/unlock via PCMP (Pharos Cross-Chain Message Protocol) |

## Quick Start

```bash
# Install dependencies
forge install

# Compile
forge build

# Run tests
forge test -vvv

# Deploy (Pharos testnet)
export DEPLOYER=<private_key>
forge script script/Deploy.s.sol --rpc-url <rpc> --broadcast -vvv
```

## Deploy Config (env vars)

| Variable | Default | Description |
|----------|---------|-------------|
| `ASSET_NAME` | Pharos Treasury Bill | Token name |
| `ASSET_SYMBOL` | pTBILL | Token symbol |
| `ASSET_CLASS` | TreasuryBill | RWA type (RealEstate, Commodity, etc.) |
| `JURISDICTION` | US | ISO country code |
| `ASSET_VALUE` | 1000000 ether | Total supply |
| `COMPLIANCE` | address(0) | Compliance module contract |
| `DIST_INTERVAL` | 86400 | Yield distribution interval (seconds) |
| `SPN_CHAIN_ID` | 8081 | Local SPN chain ID |

## Architecture

```
┌─────────────────────────────────────────────┐
│             PharosAssetToken                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Identity  │  │ Pausable │  │ Role-based │ │
│  │ Registry  │  │  Module  │  │  Mint/Burn │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │             │               │       │
│  ┌────▼─────────────▼───────────────▼─────┐ │
│  │     ERC20 + AccessControl               │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
               │                  │
    ┌──────────▼──┐       ┌──────▼──────────┐
    │Distribution │       │ CrossChainAsset │
    │   Module    │       │   (Bridge SPN)  │
    └─────────────┘       └─────────────────┘
```