#!/usr/bin/env python3
"""
Pharos Wallet Tracker Agent
============================
Monitors a Pharos wallet address for incoming and outgoing transactions.
Reports new activity as it happens.

Usage:
  python3 pharos_wallet_tracker.py <address>              # Track every 12s
  python3 pharos_wallet_tracker.py <address> --interval 30  # Custom interval
  python3 pharos_wallet_tracker.py <address> --once         # One-shot check
  python3 pharos_wallet_tracker.py <address> --since 5000   # Start from block N
  python3 pharos_wallet_tracker.py --help
"""

import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

RPC_URL = "https://rpc.pharos.xyz"
EXPLORER_URL = "https://www.pharosscan.xyz"
CHAIN_NAME = "Pharos Pacific Mainnet"
SYMBOL = "PROS"
DEFAULT_INTERVAL = 12  # seconds


def rpc_call(method: str, params: list | None = None) -> dict:
    payload = json.dumps({
        "jsonrpc": "2.0", "id": 1, "method": method, "params": params or [],
    }).encode("utf-8")
    try:
        req = urllib.request.Request(RPC_URL, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e)}


def result_or_error(resp: dict):
    if "error" in resp and resp["error"]:
        return None
    return resp.get("result")


def wei_to_pros(wei_hex: str) -> str:
    wei = int(wei_hex, 16)
    return f"{wei / 1e18:.6f}"


def hex_to_int(hex_str: str) -> int:
    return int(hex_str, 16) if hex_str else 0


def get_latest_block() -> int:
    resp = rpc_call("eth_blockNumber")
    result = result_or_error(resp)
    return hex_to_int(result) if result else 0


def get_balance(address: str) -> float:
    resp = rpc_call("eth_getBalance", [address, "latest"])
    result = result_or_error(resp)
    return int(result, 16) / 1e18 if result else 0.0


def get_tx_count(address: str) -> int:
    resp = rpc_call("eth_getTransactionCount", [address, "latest"])
    result = result_or_error(resp)
    return hex_to_int(result) if result else 0


def get_block(block_num: int) -> dict:
    resp = rpc_call("eth_getBlockByNumber", [hex(block_num), True])
    return result_or_error(resp) or {}


def track_txs(address: str, start_block: int, end_block: int) -> list[dict]:
    """Find transactions involving `address` in blocks [start_block, end_block)."""
    found = []
    addr_lower = address.lower()

    for block_num in range(start_block, end_block):
        block = get_block(block_num)
        if not block:
            continue
        txs = block.get("transactions", [])
        timestamp = hex_to_int(block.get("timestamp", "0x0"))
        dt = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime("%H:%M:%S UTC")

        for tx in txs:
            tx_from = tx.get("from", "").lower()
            tx_to = tx.get("to", "").lower() if tx.get("to") else ""
            if addr_lower in (tx_from, tx_to):
                direction = "⬅️  RECEIVED" if tx_to == addr_lower else "➡️  SENT"
                value = wei_to_pros(tx.get("value", "0x0"))
                from_short = tx.get("from", "")[:10] + "..." + tx.get("from", "")[-6:]
                to_short = tx.get("to", "")[:10] + "..." + tx.get("to", "")[-6:] if tx.get("to") else "contract creation"
                found.append({
                    "block": block_num,
                    "time": dt,
                    "direction": direction,
                    "from": tx.get("from", ""),
                    "to": tx.get("to", ""),
                    "value_pros": value,
                    "hash": tx.get("hash", ""),
                    "explorer_url": f"{EXPLORER_URL}/tx/{tx.get('hash', '')}",
                })
    return found


def print_tx(tx: dict):
    print(f"  {tx['direction']}  │ Block {tx['block']:,} │ {tx['time']} │ {tx['value_pros']} {SYMBOL}")
    print(f"           │ From: {tx['from']}")
    print(f"           │ To:   {tx['to']}")
    print(f"           │ Tx:   {tx['hash'][:18]}...{tx['hash'][-6:]}")
    print(f"           │ 🔗  {tx['explorer_url']}")
    print()


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("--help", "-h"):
        print(__doc__)
        return

    address = args[0]
    interval = DEFAULT_INTERVAL
    once = "--once" in args
    since_block = None

    for i, arg in enumerate(args):
        if arg == "--interval" and i + 1 < len(args):
            interval = int(args[i + 1])
        if arg == "--since" and i + 1 < len(args):
            since_block = int(args[i + 1])

    print()
    print("=" * 62)
    print(f"  PHAROS WALLET TRACKER — {CHAIN_NAME}")
    print(f"  Address: {address}")
    print("=" * 62)

    # Initial state
    current_block = get_latest_block()
    if current_block == 0:
        print("\n  ❌  Cannot connect to RPC. Exiting.\n")
        sys.exit(1)

    if since_block:
        last_checked_block = since_block
    else:
        # Start a few blocks behind to catch recent txs
        last_checked_block = max(0, current_block - 10)

    balance = get_balance(address)
    tx_count = get_tx_count(address)
    print(f"\n  💰  Balance: {balance:.6f} {SYMBOL}")
    print(f"  📊  Tx Count: {tx_count}")
    print(f"  ⛓️   Starting from block: {last_checked_block:,}")

    # One-shot mode
    if once:
        print(f"\n  🔍  Checking blocks {last_checked_block:,} to {current_block:,}...\n")
        txs = track_txs(address, last_checked_block, current_block + 1)
        if txs:
            for tx in txs:
                print_tx(tx)
        else:
            print("  No transactions found.\n")
        return

    # Continuous mode
    print(f"\n  👀  Watching every {interval}s (Ctrl+C to stop)...\n")

    try:
        while True:
            now_block = get_latest_block()

            if now_block > last_checked_block:
                # Check new blocks
                new_txs = track_txs(address, last_checked_block, now_block)
                if new_txs:
                    now = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
                    print(f"  [{now}]  ⚡  {len(new_txs)} new transaction(s)")
                    print(f"  {'─' * 60}")
                    for tx in new_txs:
                        print_tx(tx)

                last_checked_block = now_block

            # Show heartbeat
            new_balance = get_balance(address)
            sys.stdout.write(
                f"\r  🟢  Block {now_block:,}  |  "
                f"Balance: {new_balance:.6f} {SYMBOL}  |  "
                f"Tx: {get_tx_count(address)}  |  "
                f"Polling..."
            )
            sys.stdout.flush()
            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n\n  Tracking stopped.\n")


if __name__ == "__main__":
    main()