#!/usr/bin/env python3
"""
Pharos Agent — Python Companion
================================
Monitors Atlantic Testnet via JSON-RPC, tracks agent on-chain activity,
and generates human-readable reports.

First AI Agent on Pharos Pacific Mainnet — integrated with Pharos Agent Kit,
live on Atlantic Testnet, ready for mainnet launch day.

Usage:
  python3 pharos_agent.py monitor          # Stream chain status
  python3 pharos_agent.py report           # One-shot report
  python3 pharos_agent.py track <address>  # Track activity for an address
  python3 pharos_agent.py all              # Full monitor + report
"""

import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone
from typing import Any

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ATLANTIC_RPC = "https://atlantic.dplabs-internal.com"
ATLANTIC_CHAIN_ID = 688689
ATLANTIC_EXPLORER = "https://atlantic.pharosscan.xyz"
DEFAULT_WALLET = "0xeed479954373818098a6909729CB795ad88E7C63"
POLL_INTERVAL = 6  # seconds between polls when monitoring

# ---------------------------------------------------------------------------
# JSON-RPC helpers
# ---------------------------------------------------------------------------


def rpc_call(method: str, params: list[Any] | None = None) -> dict[str, Any]:
    """Execute a JSON-RPC call against the Atlantic Testnet endpoint."""
    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or [],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        ATLANTIC_RPC,
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return {"error": str(e.reason)}
    except Exception as e:
        return {"error": str(e)}


def result_or_error(resp: dict[str, Any]) -> Any:
    """Extract result or raise on RPC error."""
    if "error" in resp and resp["error"]:
        raise RuntimeError(f"RPC error: {resp['error']}")
    if "result" not in resp:
        raise RuntimeError(f"Unexpected response: {resp}")
    return resp["result"]


# ---------------------------------------------------------------------------
# Core monitoring functions
# ---------------------------------------------------------------------------


def check_connection() -> dict[str, Any]:
    """Verify RPC endpoint is reachable and returns expected chain ID."""
    print("\n" + "=" * 60)
    print("  PHAROS AGENT — Atlantic Testnet Connection Check")
    print("=" * 60)

    # Block number
    blk_resp = rpc_call("eth_blockNumber")
    if "error" in blk_resp and blk_resp["error"]:
        print(f"  \u274c RPC unreachable: {blk_resp['error']}")
        return {"connected": False}

    block_number = int(result_or_error(blk_resp), 16)

    # Chain ID
    cid_resp = rpc_call("eth_chainId")
    chain_id = int(result_or_error(cid_resp), 16)

    # Client version
    ver_resp = rpc_call("web3_clientVersion")
    client_version = result_or_error(ver_resp) if "error" not in ver_resp else "unknown"

    connected = chain_id == ATLANTIC_CHAIN_ID

    print(f"  \u2705  RPC:           {ATLANTIC_RPC}")
    connected_str = "\u2705" if connected else "\u274c MISMATCH"
    print(f"  \u2705  Chain ID:      {chain_id} {connected_str}")
    print(f"  \u2705  Block:         {block_number:,}")
    print(f"  \u2705  Client:        {client_version}")
    print(f"  \u2705  Explorer:      {ATLANTIC_EXPLORER}")

    return {
        "connected": connected,
        "chain_id": chain_id,
        "block_number": block_number,
        "client_version": client_version,
    }


def get_balance(address: str) -> tuple[int, float]:
    """
    Return (wei_balance, ether_balance) for an address.
    """
    resp = rpc_call("eth_getBalance", [address, "latest"])
    wei = int(result_or_error(resp), 16)
    ether = wei / 1e18
    return wei, ether


def get_block(block_tag: str = "latest") -> dict[str, Any]:
    """Get block details."""
    resp = rpc_call("eth_getBlockByNumber", [block_tag, False])
    return result_or_error(resp)


def get_transaction_count(address: str) -> int:
    """Get nonce / transaction count for address."""
    resp = rpc_call("eth_getTransactionCount", [address, "latest"])
    return int(result_or_error(resp), 16)


def get_gas_price() -> tuple[int, float]:
    """Get current gas price in wei and gwei."""
    resp = rpc_call("eth_gasPrice")
    wei = int(result_or_error(resp), 16)
    gwei = wei / 1e9
    return wei, gwei


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------


def generate_report(wallet: str = DEFAULT_WALLET) -> dict[str, Any]:
    """Generate a comprehensive one-shot report of chain status and wallet activity."""
    print("\n" + "=" * 60)
    print("  PHAROS AGENT — Atlantic Testnet Report")
    print(f"  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 60)

    # Chain info
    connection = check_connection()
    if not connection["connected"]:
        print("\n  \u274c  Cannot generate report — RPC not connected to Atlantic Testnet.")
        return {"error": "not connected"}

    latest_block = get_block("latest")
    block_num = int(latest_block["number"], 16)
    block_hash = latest_block["hash"]
    tx_count = len(latest_block["transactions"])
    timestamp = int(latest_block["timestamp"], 16)
    dt = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime(
        "%Y-%m-%d %H:%M:%S UTC"
    )

    # Gas
    _, gas_gwei = get_gas_price()

    # Wallet
    wei, ether = get_balance(wallet)
    tx_nonce = get_transaction_count(wallet)

    print(f"\n  \U0001f4e1  Chain Status")
    print(f"     Block:        {block_num:,}")
    print(f"     Hash:         {block_hash}")
    print(f"     Time:         {dt}")
    print(f"     Txs in block: {tx_count}")
    print(f"     Gas Price:    {gas_gwei:.2f} gwei")

    print(f"\n  \U0001f4b0  Wallet Activity")
    print(f"     Address:      {wallet}")
    print(f"     Balance:      {ether:.6f} PHAROS ({wei} wei)")
    print(f"     Tx Count:     {tx_nonce}")

    # Recent blocks activity summary
    print(f"\n  \U0001f4ca  Recent Activity (last 5 blocks)")
    recent_block = block_num
    total_txs_recent = 0
    for i in range(5):
        b = get_block(hex(recent_block - i))
        if "error" not in b:
            recent_txs = len(b["transactions"])
            total_txs_recent += recent_txs
            b_time = int(b["timestamp"], 16)
            b_dt = datetime.fromtimestamp(b_time, tz=timezone.utc).strftime(
                "%H:%M:%S"
            )
            print(f"     Block {recent_block - i:,}  |  {b_dt}  |  {recent_txs} txs")
    print(f"     ─────────────────────────────────────")
    print(f"     Total (5 blocks): {total_txs_recent} transactions")

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "chain": {
            "rpc": ATLANTIC_RPC,
            "chain_id": ATLANTIC_CHAIN_ID,
            "latest_block": block_num,
            "block_hash": block_hash,
            "block_timestamp_utc": dt,
            "gas_price_gwei": round(gas_gwei, 2),
        },
        "wallet": {
            "address": wallet,
            "balance_pharos": round(ether, 6),
            "balance_wei": wei,
            "transaction_count": tx_nonce,
        },
        "recent_activity": {
            "blocks_checked": 5,
            "total_transactions": total_txs_recent,
        },
    }
    return report


def monitor_loop(wallet: str = DEFAULT_WALLET, interval: int = POLL_INTERVAL):
    """Continuously monitor chain status in a loop."""
    print(f"\n  \U0001f6a8  PHAROS AGENT — Monitoring Atlantic Testnet every {interval}s")
    print(f"  Wallet: {wallet}")
    print(f"  Press Ctrl+C to stop.\n")

    try:
        while True:
            now = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
            # Block
            blk_resp = rpc_call("eth_blockNumber")
            bn = int(result_or_error(blk_resp), 16) if "error" not in blk_resp else "?"

            # Wallet balance
            _, ether = get_balance(wallet)

            # Gas
            _, gas_gwei = get_gas_price()

            # Tx count
            tx_count = get_transaction_count(wallet)

            sys.stdout.write(
                f"\r  [{now}]  Block {bn:,}  |  "
                f"Balance: {ether:.4f} PHAROS  |  "
                f"Gas: {gas_gwei:.1f} gwei  |  "
                f"Tx: {tx_count}"
            )
            sys.stdout.flush()
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n\n  Monitoring stopped.")


def track_address(address: str):
    """Track specific address activity — print txs from recent blocks."""
    print(f"\n  \U0001f50d  Tracking address: {address}")
    print(f"  Checking last 10 blocks for transactions...\n")

    blk_resp = rpc_call("eth_blockNumber")
    latest = int(result_or_error(blk_resp), 16)

    found_any = False
    for offset in range(10):
        block_num = hex(latest - offset)
        block = get_block(block_num)
        if "error" in block:
            continue
        txs = block.get("transactions", [])
        for tx_hash in txs:
            tx_resp = rpc_call("eth_getTransactionByHash", [tx_hash])
            tx = result_or_error(tx_resp) if "error" not in tx_resp else None
            if tx is None:
                continue
            tx_from = tx.get("from", "").lower()
            tx_to = tx.get("to", "").lower() if tx.get("to") else ""
            if address.lower() in (tx_from, tx_to):
                found_any = True
                val_wei = int(tx.get("value", "0x0"), 16)
                val_eth = val_wei / 1e18
                direction = "SENT" if tx_from == address.lower() else "RECEIVED"
                print(
                    f"  {direction}  "
                    f"Block {int(block_num, 16):,}  |  "
                    f"Tx: {tx_hash[:10]}...{tx_hash[-6:]}  |  "
                    f"Value: {val_eth:.6f} PHAROS"
                )

    if not found_any:
        print("  No recent transactions found for this address.")

    # Show current balance
    _, ether = get_balance(address)
    tx_count = get_transaction_count(address)
    print(f"\n  Current balance: {ether:.6f} PHAROS")
    print(f"  Total tx count: {tx_count}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

HELP_TEXT = """
Pharos Agent — Python Companion
================================
Usage:
  python3 pharos_agent.py monitor              Stream chain status live
  python3 pharos_agent.py report               One-shot chain + wallet report
  python3 pharos_agent.py track <address>      Track txs for an address
  python3 pharos_agent.py all                  Monitor + initial report
  python3 pharos_agent.py help                 Show this help
"""


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("help", "--help", "-h"):
        print(HELP_TEXT)
        return

    command = args[0]

    if command == "report":
        wallet = args[1] if len(args) > 1 else DEFAULT_WALLET
        report = generate_report(wallet)
        print(f"\n  JSON report saved below:\n")
        print(json.dumps(report, indent=2))
        print()

    elif command == "monitor":
        wallet = args[1] if len(args) > 1 else DEFAULT_WALLET
        # Print an initial report first, then start the live loop
        generate_report(wallet)
        print()
        monitor_loop(wallet, POLL_INTERVAL)

    elif command == "track":
        if len(args) < 2:
            print("  Usage: python3 pharos_agent.py track <address>")
            sys.exit(1)
        track_address(args[1])

    elif command == "all":
        wallet = args[1] if len(args) > 1 else DEFAULT_WALLET
        generate_report(wallet)
        print()
        monitor_loop(wallet, POLL_INTERVAL)

    else:
        print(f"  Unknown command: {command}")
        print(HELP_TEXT)
        sys.exit(1)


if __name__ == "__main__":
    main()
