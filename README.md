# Pharos Agent Tools

Tools for the Pharos Network ecosystem by Isah Muhammad.

## Tools

- **Pharos SPN Configurator** — generates deployable Special Processing Network (SPN) configurations for DeFi, RWA, HFT, zkML, sidechain, and cross-chain bridge profiles. Validates against Pharos specs and includes step-by-step deploy guides.
- **Pharos RWA Tokenization Toolkit** — production-grade Solidity contracts for tokenizing Real-World Assets. Permissioned token (ERC-3643 style), yield distribution module, cross-SPN bridge wrapper. Foundry test suite included.

## Usage

```
python3 pharos_spn_configurator.py defi -o my-spn.json
```

For RWA contracts, see `pharos-rwa-tokenization/`.

See `python3 pharos_spn_configurator.py` for all SPN profiles.
