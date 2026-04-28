#!/usr/bin/env python3
"""
Pharos Tx Explorer CLI
======================
Look up any transaction hash on Pharos Pacific Mainnet
and get human-readable details.

Usage:
  python3 pharos_tx_explorer.py <tx_hash>
  python3 pharos_tx_explorer.py <tx_hash> --raw      # Raw JSON
  python3 pharos_tx_explorer.py --help
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

RPC_URL = "https://rpc.pharos.xyz"
EXPLORER_URL = "https://www.pharosscan.xyz"
CHAIN_NAME = "Pharos Pacific Mainnet"
CHAIN_ID = 1672
SYMBOL = "PROS"


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
        raise RuntimeError(f"RPC error: {resp['error']}")
    if "result" not in resp:
        raise RuntimeError(f"Unexpected response: {resp}")
    return resp["result"]


def wei_to_pros(wei_hex: str) -> str:
    wei = int(wei_hex, 16)
    return f"{wei / 1e18:.6f} {SYMBOL}"


def hex_to_int(hex_str: str) -> int:
    return int(hex_str, 16)


def hex_to_str(hex_str: str) -> str | None:
    if hex_str and hex_str.startswith("0x"):
        try:
            decoded = bytes.fromhex(hex_str[2:]).decode("utf-8", errors="replace")
            if decoded.strip():
                return decoded
        except:
            pass
    return None


def analyze_tx(tx_hash: str) -> dict:
    # 1. Get transaction
    tx_resp = rpc_call("eth_getTransactionByHash", [tx_hash])
    tx = result_or_error(tx_resp)
    if tx is None:
        raise RuntimeError(f"Transaction not found: {tx_hash}")

    # 2. Get receipt
    receipt_resp = rpc_call("eth_getTransactionReceipt", [tx_hash])
    receipt = result_or_error(receipt_resp)

    # 3. Get block for timestamp
    block_num = tx.get("blockNumber", "0x0")
    block_resp = rpc_call("eth_getBlockByNumber", [block_num, False])
    block = result_or_error(block_resp)
    timestamp = hex_to_int(block.get("timestamp", "0x0")) if block else 0
    dt = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC") if timestamp else "unknown"

    # Parse basics
    tx_from = tx.get("from", "0x0")
    tx_to = tx.get("to", "") or "(contract creation)"
    value = wei_to_pros(tx.get("value", "0x0"))
    gas_limit = hex_to_int(tx.get("gas", "0x0"))
    gas_used = hex_to_int(receipt.get("gasUsed", "0x0")) if receipt else 0
    gas_price_wei = hex_to_int(tx.get("gasPrice", "0x0"))
    gas_price_gwei = gas_price_wei / 1e9
    tx_fee_pros = (gas_used * gas_price_wei) / 1e18
    nonce = hex_to_int(tx.get("nonce", "0x0"))
    status = "SUCCESS" if receipt and hex_to_int(receipt.get("status", "0x0")) == 1 else "FAILED"
    input_data = tx.get("input", "0x")
    has_data = input_data and input_data != "0x"

    result = {
        "hash": tx_hash,
        "block": hex_to_int(block_num),
        "timestamp": dt,
        "from": tx_from,
        "to": tx_to if tx_to else "(contract creation)",
        "value": value,
        "nonce": nonce,
        "gas_limit": gas_limit,
        "gas_used": gas_used,
        "gas_price_gwei": round(gas_price_gwei, 4),
        "tx_fee_pros": round(tx_fee_pros, 8),
        "status": status,
        "has_input_data": has_data,
        "log_count": len(receipt.get("logs", [])) if receipt else 0,
        "explorer_url": f"{EXPLORER_URL}/tx/{tx_hash}",
        "type": "Contract Creation" if not tx_to else "Transfer" if not has_data else "Contract Interaction",
    }
    return result


def print_report(r: dict):
    print()
    print("=" * 62)
    print(f"  PHAROS TX EXPLORER — {CHAIN_NAME}")
    print(f"  {r['hash']}")
    print("=" * 62)
    print(f"  Status:    {'✅  ' + r['status'] if r['status'] == 'SUCCESS' else '❌  ' + r['status']}")
    print(f"  Block:     {r['block']:,}")
    print(f"  Time:      {r['timestamp']}")
    print(f"  Type:      {r['type']}")
    print(f"  From:      {r['from']}")
    print(f"  To:        {r['to']}")
    print(f"  Value:     {r['value']}")
    print(f"  Nonce:     {r['nonce']}")
    print()
    print(f"  📦  Gas")
    print(f"     Limit:   {r['gas_limit']:,}")
    print(f"     Used:    {r['gas_used']:,}")
    print(f"     Price:   {r['gas_price_gwei']} gwei")
    print(f"     Fee:     {r['tx_fee_pros']} {SYMBOL}")
    print()
    print(f"  📝  Logs:     {r['log_count']}")
    if r["has_input_data"]:
        print(f"  💡  Input data present (contract interaction)")
    print()
    print(f"  🔗  Explorer: {r['explorer_url']}")
    print()


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("--help", "-h"):
        print(__doc__)
        return

    tx_hash = args[0]
    if not tx_hash.startswith("0x"):
        tx_hash = "0x" + tx_hash

    raw = "--raw" in args

    try:
        result = analyze_tx(tx_hash)
    except RuntimeError as e:
        print(f"\n  ❌  {e}\n")
        sys.exit(1)

    if raw:
        print(json.dumps(result, indent=2))
    else:
        print_report(result)

    # Print explorer link again at the end for easy click
    print(f"  Explorer: {result['explorer_url']}")


if __name__ == "__main__":
    main()