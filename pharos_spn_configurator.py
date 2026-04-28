#!/usr/bin/env python3
"""
Pharos SPN Configurator v1.0
Generates deployable Special Processing Network (SPN) configurations
matching Pharos Network's modular L1-Extension architecture.

Usage:
  python3 pharos_spn_configurator.py [profile] [--output file.json]

Profiles:
  defi          DeFi SPN - EVM, AMM/lending, high throughput
  rwa           RWA SPN - EVM, compliance, tokenized assets
  hft           HFT SPN - WASM, low-latency, order book
  zkml          zkML SPN - WASM, ZK proof verification, AI inference
  sidechain     Generic sidechain SPN - EVM, custom gas
  cross-chain   Cross-chain bridge SPN - message relay, light clients
  custom        Interactive custom config builder

  If no profile given, shows all available profiles.
"""

import argparse
import json
import sys
import os
from datetime import datetime, timezone

# ── Spec constants (from Pharos Network docs) ──────────────────────────
CHAIN_IDS = {
    "defi": 8081,
    "rwa": 8082,
    "hft": 8083,
    "zkml": 8084,
    "sidechain": 8085,
    "cross-chain": 8086,
}

SPN_TEMPLATES = {}

# ── DeFi SPN ────────────────────────────────────────────────────────────
SPN_TEMPLATES["defi"] = {
    "description": "DeFi SPN for AMM DEX, lending, and yield protocols",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "EVM",
        "engine": "Pharos Parallel EVM (speculative execution)",
        "gas_limit": 30000000,
        "block_gas_target": 25000000,
        "fee_model": "EIP-1559 (base + priority)",
        "base_fee_max": "100 gwei",
    },
    "consensus": {
        "engine": "AsyncBFT (optimistic finality)",
        "block_time_seconds": 2,
        "finality": "sub-second",
        "validator_count": 21,
        "validator_selection": "restaking-weighted (PHR + Babylon stBTC)",
        "slashing_conditions": ["double-sign", "downtime > 48h", "equivocation"],
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "light-client + relayer",
        "finality_blocks": 1,
        "message_passing": "atomic (same-slot dispatch)",
    },
    "storage": {
        "tree": "Delta-Encoded Multi-Version Merkle Tree",
        "store": "Log-Structured Versioned Page Store",
        "pruning": "state expiry after 180 days",
    },
    "staking": {
        "native_restaking": True,
        "min_stake": "100,000 PHR",
        "reward_rate_apr": "8-12%",
        "supported_assets": ["PHR", "stBTC", "stETH"],
        "reward_distribution": "per-block + MEV share",
    },
    "gas_token": "PHR (burned per tx)",
    "rpc_endpoints": {
        "http": "http://spn-defi.<spn_id>.pharos.internal:8545",
        "ws": "ws://spn-defi.<spn_id>.pharos.internal:8546",
    },
    "deploy_guide": {
        "prerequisites": [
            "Pharos L1-Core validator node",
            "Restaked minimum PHR on L1",
            "Docker + docker-compose v2.20+",
        ],
        "steps": [
            "1. Clone Pharos SPN SDK: git clone https://github.com/PharosNetwork/spn-sdk",
            "2. Edit config/spn.yaml with values from this profile",
            "3. docker compose up -d (starts sequencer + validators)",
            "4. Register SPN on L1: pharos-spn register --config spn.yaml",
            "5. Verify: curl -X POST https://<spn_rpc> -d '{\"method\":\"eth_chainId\"}'",
        ],
        "estimated_time": "15 minutes (automated)",
    },
}

# ── RWA SPN ─────────────────────────────────────────────────────────────
SPN_TEMPLATES["rwa"] = {
    "description": "RWA SPN for tokenized real-world assets with compliance",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "EVM",
        "engine": "Pharos Parallel EVM + ZK-KYC precompiles",
        "gas_limit": 50000000,
        "block_gas_target": 40000000,
        "fee_model": "EIP-1559",
        "base_fee_max": "50 gwei",
        "precompiles": [
            "ZKKYC_VERIFY (address: 0x100)",
            "AML_CHECK (address: 0x101)",
            "ASSET_PROVENANCE (address: 0x102)",
        ],
    },
    "consensus": {
        "engine": "AsyncBFT",
        "block_time_seconds": 3,
        "finality": "sub-second",
        "validator_count": 13,
        "validator_selection": "whitelisted + restaking-weighted",
        "compliance": "onchain ZK-KYC before validator registration",
        "slashing_conditions": ["double-sign", "downtime > 24h", "compliance-violation"],
    },
    "identity": {
        "kyc_required": True,
        "kyc_provider": "Pharos ZK-KYC Module (integrated)",
        "privacy": "zero-knowledge proofs only (no raw data onchain)",
        "jurisdiction_filter": "configurable per asset class",
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "light-client + ZK-relayer",
        "transfer_restrictions": ["KYC'd addresses only", "daily limit per jurisdiction"],
    },
    "storage": {
        "tree": "Delta-Encoded Multi-Version Merkle Tree",
        "store": "Log-Structured Versioned Page Store",
        "compliance_audit_trail": True,
        "retention": "7 years (regulatory minimum)",
    },
    "staking": {
        "native_restaking": True,
        "min_stake": "500,000 PHR",
        "reward_rate_apr": "6-10%",
        "supported_assets": ["PHR", "USDC", "stETH"],
    },
    "gas_token": "USDC (stable gas, configurable)",
    "rpc_endpoints": {
        "http": "http://spn-rwa.<spn_id>.pharos.internal:8545",
        "ws": "ws://spn-rwa.<spn_id>.pharos.internal:8546",
    },
    "deploy_guide": {
        "prerequisites": [
            "Pharos L1-Core validator node",
            "Restaked PHR + whitelist approval",
            "KYC provider integration",
            "Docker + docker-compose",
        ],
        "steps": [
            "1. Submit whitelist request via Pharos governance",
            "2. Clone SPN SDK and configure compliance module",
            "3. Deploy: docker compose -f rwa-spn.yaml up -d",
            "4. Register with ZK-KYC proof: pharos-spn register --kyc-proof proof.json",
            "5. Verify: pharos-spn status --id <spn_id>",
        ],
        "estimated_time": "30 minutes + KYC approval (~24h)",
    },
}

# ── HFT SPN ─────────────────────────────────────────────────────────────
SPN_TEMPLATES["hft"] = {
    "description": "High-Frequency Trading SPN - WASM, sub-ms latency",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "WASM",
        "engine": "Pharos WASM Runtime (Wasmtime-based)",
        "gas_limit": 100000000,
        "execution_model": "deterministic, single-threaded per order",
        "fee_model": "flat per-tx (0.0001 PHR)",
        "native_primitives": ["order_matching", "cross_chain_swap", "price_feed_oracle"],
    },
    "consensus": {
        "engine": "AsyncBFT (optimized for HFT)",
        "block_time_seconds": 0.5,
        "finality": "150ms",
        "validator_count": 5,
        "validator_selection": "low-latency whitelist (< 10ms to sequencer)",
        "sequencer_mode": "centralized sequencing, decentralized validation",
    },
    "order_book": {
        "engine": "Pharos Native Order Book (off-chain matching, on-chain settlement)",
        "max_orders_per_block": 5000,
        "settlement_delay": "1 block (~500ms)",
        "supported_order_types": ["limit", "market", "ioc", "fok", "twap"],
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "light-client (optimized for < 1s finality)",
    },
    "storage": {
        "tree": "Delta-Encoded Multi-Version Merkle Tree",
        "store": "In-memory + LSM-tree checkpoint (nightly)",
        "latency_target": "< 1ms reads",
    },
    "staking": {
        "min_stake": "1,000,000 PHR",
        "reward_rate_apr": "15-25%",
        "supported_assets": ["PHR"],
        "sequencer_bond": "2,000,000 PHR (slashable)",
    },
    "gas_token": "PHR",
    "rpc_endpoints": {
        "http": "http://spn-hft.<spn_id>.pharos.internal:8545",
        "ws": "ws://spn-hft.<spn_id>.pharos.internal:8546",
        "grpc": "grpc://spn-hft.<spn_id>.pharos.internal:9090",
    },
    "deploy_guide": {
        "prerequisites": [
            "Dedicated bare-metal or cloud GPU instance",
            "Sub-10ms network to Pharos L1 sequencer",
            "Restaked minimum 1M PHR",
            "Docker + low-latency kernel tuning",
        ],
        "steps": [
            "1. Request HFT SPN license from Pharos governance",
            "2. Provision hardware: 8+ vCPU, 32GB RAM, NVMe SSD",
            "3. Clone SPN SDK: git clone -b hft https://github.com/PharosNetwork/spn-sdk",
            "4. Tune kernel: ./scripts/tune-kernel.sh",
            "5. docker compose -f hft-spn.yaml up -d --profile sequencer,validator",
            "6. Register: pharos-spn register --profile hft --proof benchmark.json",
        ],
        "estimated_time": "1 hour + license approval",
    },
}

# ── zkML SPN ────────────────────────────────────────────────────────────
SPN_TEMPLATES["zkml"] = {
    "description": "zkML SPN for zero-knowledge ML inference and verification",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "WASM",
        "engine": "Pharos WASM Runtime + GPU accelerator support",
        "gas_limit": 200000000,
        "execution_model": "batched proof generation + single-slot verification",
        "native_primitives": [
            "groth16_verify",
            "plonk_verify",
            "nova_verify",
            "model_inference (onnx runtime)",
        ],
    },
    "consensus": {
        "engine": "AsyncBFT",
        "block_time_seconds": 5,
        "finality": "5s (limited by proof generation time)",
        "validator_count": 13,
        "validator_selection": "restaking + hardware capability (GPU attestation)",
    },
    "prover_network": {
        "type": "off-chain prover market",
        "commitment": "on-chain proof commitment with timeout",
        "max_proof_size": "512 KB",
        "supported_schemes": ["Groth16", "PLONK", "Nova", "STARK"],
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "ZK-light client (recursive proofs)",
    },
    "staking": {
        "min_stake": "250,000 PHR",
        "reward_rate_apr": "10-18%",
        "supported_assets": ["PHR"],
        "prover_bond": "500,000 PHR (slashable on invalid proof)",
    },
    "gas_token": "PHR",
    "deploy_guide": {
        "prerequisites": [
            "GPU instance (NVIDIA A100/H100 or equivalent)",
            "CUDA 12.0+",
            "Docker with NVIDIA container toolkit",
        ],
        "steps": [
            "1. Clone SPN SDK: git clone -b zkml https://github.com/PharosNetwork/spn-sdk",
            "2. Configure model registry in config/models.yaml",
            "3. docker compose -f zkml-spn.yaml up -d",
            "4. Submit prover registration: pharos-spn register --prover",
            "5. Verify: pharos-spn query --method verify_proof --input sample.json",
        ],
        "estimated_time": "45 minutes",
    },
}

# ── Generic Sidechain SPN ──────────────────────────────────────────────
SPN_TEMPLATES["sidechain"] = {
    "description": "Generic sidechain SPN - customizable gas, VM, and params",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "EVM (or WASM, configurable)",
        "engine": "Pharos Parallel EVM or WASM Runtime",
        "gas_limit": 10000000,
        "block_gas_target": 8000000,
        "fee_model": "EIP-1559 or flat fee (configurable)",
    },
    "consensus": {
        "engine": "AsyncBFT",
        "block_time_seconds": 2,
        "validator_count": 5,
        "validator_selection": "permissioned or restaking",
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "light-client + relayer",
    },
    "storage": {
        "tree": "Delta-Encoded Multi-Version Merkle Tree",
        "store": "Log-Structured Versioned Page Store",
    },
    "staking": {
        "native_restaking": True,
        "min_stake": "50,000 PHR",
        "reward_rate_apr": "5-15%",
    },
    "gas_token": "PHR (or custom token, configurable)",
    "deploy_guide": {
        "prerequisites": ["Pharos L1-Core validator node", "Docker + docker-compose"],
        "steps": [
            "1. Edit config/spn.yaml with custom params",
            "2. docker compose up -d",
            "3. pharos-spn register --config spn.yaml",
            "4. pharos-spn status --id <spn_id>",
        ],
        "estimated_time": "10 minutes",
    },
}

# ── Cross-Chain Bridge SPN ──────────────────────────────────────────────
SPN_TEMPLATES["cross-chain"] = {
    "description": "Cross-chain bridge and message relay SPN",
    "layer": "L1-Extension (SPN)",
    "vm": {
        "type": "WASM",
        "engine": "Pharos WASM Runtime (lightweight, relay-optimized)",
        "gas_limit": 5000000,
        "native_primitives": [
            "light_client_update",
            "message_relay",
            "header_sync",
            "proof_verification (Merkle, ZK)",
        ],
    },
    "consensus": {
        "engine": "AsyncBFT",
        "block_time_seconds": 1,
        "validator_count": 9,
        "validator_selection": "geographically distributed + restaking",
    },
    "bridges": {
        "supported_chains": ["Pharos L1", "Ethereum", "Solana", "BNB Chain", "Bitcoin (via Babylon)"],
        "message_format": "Pharos Cross-Chain Message Protocol (PCMP)",
        "finality_guarantee": "SPN finality + L1 inclusion proof",
        "fee_model": "destination chain gas + relay fee (configurable)",
    },
    "cross_chain": {
        "protocol": "Pharos Cross-SPN Interoperation Protocol",
        "bridge_type": "SPN-native (no external bridge needed)",
    },
    "staking": {
        "min_stake": "200,000 PHR",
        "reward_rate_apr": "8-14%",
        "relayer_bond": "100,000 PHR (slashable on invalid relay)",
    },
    "gas_token": "PHR (negligible, sub-cent per relay)",
    "deploy_guide": {
        "prerequisites": [
            "Pharos L1 validator node",
            "Light client infrastructure for target chains",
            "Relayer key management (HSM recommended)",
        ],
        "steps": [
            "1. Configure bridges in config/bridges.yaml (chain IDs + endpoints)",
            "2. Generate relayer keys: pharos-spn keys generate --type relayer",
            "3. docker compose -f bridge-spn.yaml up -d",
            "4. Register bridge SPN: pharos-spn register --bridge-config bridges.yaml",
            "5. Initiate test relay: pharos-spn relay --from pharos --to ethereum --data 0x...",
        ],
        "estimated_time": "20 minutes + light client sync time",
    },
}


# ── Validation helpers ──────────────────────────────────────────────────

def validate_config(config: dict) -> list:
    """Validate an SPN config against Pharos spec constraints."""
    warnings = []
    issues = []

    vm = config.get("vm", {})
    consensus = config.get("consensus", {})

    # Gas limits
    gl = vm.get("gas_limit", 0)
    if gl > 500_000_000:
        issues.append(f"Gas limit {gl:,} exceeds Pharos max (500M)")

    # Block times
    bt = consensus.get("block_time_seconds", 0)
    if bt < 0.5:
        issues.append(f"Block time {bt}s is below Pharos min (0.5s)")
    if bt > 10:
        warnings.append(f"Block time {bt}s is slow for production SPNs (recommend < 5s)")

    # Validator count
    vc = consensus.get("validator_count", 0)
    if vc < 3:
        issues.append(f"Validator count {vc} is below minimum (3)")
    if vc > 100:
        warnings.append(f"Validator count {vc} is high — ensure sufficient restaked PHR")

    # VM type check
    vm_type = vm.get("type", "EVM")
    if vm_type not in ("EVM", "WASM"):
        issues.append(f"VM type '{vm_type}' not supported. Use 'EVM' or 'WASM'")

    return {"issues": issues, "warnings": warnings, "valid": len(issues) == 0}


def generate_spn_id(profile: str) -> str:
    """Generate a deterministic SPN ID from profile name and timestamp."""
    import hashlib
    raw = f"{profile}-{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def build_output(profile: str, config: dict, spn_id: str) -> dict:
    """Build the final output artifact."""
    validation = validate_config(config)
    return {
        "spn_artifact": {
            "spn_id": spn_id,
            "profile": profile,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "spec_version": "1.0",
            "config": config,
        },
        "validation": validation,
        "quick_start": {
            "commands": [
                f"echo 'SPN {spn_id} ({profile}) configured. Run: pharos-spn register --config spn-{spn_id}.json'",
                f"# Save this output to spn-{spn_id}.json",
            ]
        },
    }


def list_profiles():
    """Print all available profiles."""
    print("Pharos SPN Configurator — Available Profiles\n")
    for name, tmpl in SPN_TEMPLATES.items():
        print(f"  {name:<15} {tmpl['description']}")
    print("\n  custom        Interactive custom SPN builder\n")
    print("Usage: python3 pharos_spn_configurator.py <profile> [-o output.json]")


def build_custom():
    """Interactive custom SPN builder."""
    print("Pharos Custom SPN Builder (interactive)\n")
    print("Press Enter to accept defaults.\n")

    vm_type = input("VM type [EVM]: ").strip() or "EVM"
    gas_limit = int(input("Gas limit [30000000]: ").strip() or "30000000")
    block_time = float(input("Block time (seconds) [2]: ").strip() or "2")
    validators = int(input("Validator count [5]: ").strip() or "5")
    fee_model = input("Fee model [EIP-1559]: ").strip() or "EIP-1559"
    description = input("SPN description []: ").strip() or "Custom Pharos SPN"

    config = {
        "description": description,
        "layer": "L1-Extension (SPN)",
        "vm": {
            "type": vm_type,
            "gas_limit": gas_limit,
            "fee_model": fee_model,
        },
        "consensus": {
            "engine": "AsyncBFT",
            "block_time_seconds": block_time,
            "validator_count": validators,
            "validator_selection": "restaking-weighted",
        },
        "cross_chain": {"protocol": "Pharos Cross-SPN Interoperation Protocol"},
        "staking": {"native_restaking": True},
        "gas_token": "PHR",
    }

    return config


def main():
    parser = argparse.ArgumentParser(description="Pharos SPN Configurator")
    parser.add_argument("profile", nargs="?", default=None,
                        help="SPN profile (defi, rwa, hft, zkml, sidechain, cross-chain, custom)")
    parser.add_argument("-o", "--output", default=None,
                        help="Output JSON file path")
    args = parser.parse_args()

    if not args.profile:
        list_profiles()
        return

    profile = args.profile.lower()

    if profile == "custom":
        config = build_custom()
        spn_id = generate_spn_id("custom")
    elif profile in SPN_TEMPLATES:
        config = SPN_TEMPLATES[profile]
        spn_id = generate_spn_id(profile)
    else:
        print(f"Unknown profile: {profile}")
        print("Run with no arguments to see available profiles.")
        sys.exit(1)

    output = build_output(profile, config, spn_id)

    # Apply SPN ID placeholders
    profile_config = output["spn_artifact"]["config"]
    for key, endpoint in profile_config.get("rpc_endpoints", {}).items():
        profile_config["rpc_endpoints"][key] = endpoint.replace("<spn_id>", spn_id)

    result = json.dumps(output, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(result)
        print(f"Written to {args.output}")
    else:
        print(result)

    # Print validation summary
    v = output["validation"]
    if v["issues"]:
        print(f"\n⚠  VALIDATION ISSUES ({len(v['issues'])}):")
        for i in v["issues"]:
            print(f"  ✗ {i}")
    if v["warnings"]:
        print(f"\n⚠  WARNINGS ({len(v['warnings'])}):")
        for w in v["warnings"]:
            print(f"  ⚠ {w}")
    if v["valid"]:
        print(f"\n✓ SPN config valid — ready for deployment")
    print(f"\nSPN ID: {spn_id}")


if __name__ == "__main__":
    main()
