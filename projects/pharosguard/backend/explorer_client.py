"""
PharosGuard — Pharosscan Explorer Client
Fetches transaction history from the Pharosscan block explorer API.
"""
import json
import time
from typing import Optional, Dict, Any, List, Set
from urllib.request import Request, urlopen
from urllib.error import URLError
from datetime import datetime

EXPLORER_API = "https://api.socialscan.io/pharos-mainnet/v1/explorer"


def _explorer_get(path: str) -> Optional[Dict[str, Any]]:
    """Make a GET request to the SocialScan explorer API."""
    url = f"{EXPLORER_API}{path}"
    try:
        req = Request(url, headers={"Accept": "application/json"})
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except (URLError, json.JSONDecodeError, OSError):
        return None


def get_transactions(address: str, size: int = 50) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch recent transactions for a wallet address from the Pharos explorer.
    Returns a list of transactions or None on error.
    """
    data = _explorer_get(f"/transactions?address={address.lower()}&size={size}")
    if not data:
        return None
    
    if isinstance(data, dict):
        for key in ("data", "transactions", "items", "results"):
            if key in data and isinstance(data[key], list):
                return data[key]
        return None
    
    if isinstance(data, list):
        return data
    
    return None


def _parse_timestamp(ts) -> Optional[int]:
    """Parse various timestamp formats to unix timestamp."""
    if ts is None:
        return None
    if isinstance(ts, (int, float)):
        return int(ts)
    if isinstance(ts, str):
        # Try ISO format: "2026-05-03T13:38:58+00:00"
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return int(dt.timestamp())
        except (ValueError, TypeError):
            pass
        # Try just numeric string
        try:
            return int(ts)
        except (ValueError, TypeError):
            pass
    return None


def analyze_tx_history(txns: List[Dict[str, Any]], address: str = "") -> Dict[str, Any]:
    """
    Analyze a list of transactions to extract behavioral metrics.
    Uses real field names from the SocialScan Pharos API.
    """
    if not txns:
        return {
            "tx_count": 0,
            "outgoing_count": 0,
            "incoming_count": 0,
            "unique_to_addresses": set(),
            "contract_interactions": set(),
            "first_tx_timestamp": None,
            "last_tx_timestamp": None,
            "repetitive_patterns": [],
            "unique_methods": set(),
            "total_value": 0,
        }
    
    addr_lower = address.lower()
    to_addresses: Set[str] = set()
    methods: Set[str] = set()
    timestamps: List[int] = []
    total_value = 0
    outgoing_count = 0
    incoming_count = 0
    failed_txs = 0
    
    for tx in txns:
        _from = (tx.get("from_address", "") or "").lower()
        _to = (tx.get("to_address", "") or "").lower()
        
        # Track unique recipients
        if _to and _to != "0x0000000000000000000000000000000000000000":
            to_addresses.add(_to)
        
        # Count out vs in
        if _from == addr_lower:
            outgoing_count += 1
        else:
            incoming_count += 1
        
        # Track method
        method = tx.get("method", "")
        if method and method != "0x" and method != "":
            methods.add(method[:20])
        
        # Track value
        value_str = tx.get("value", "0")
        if value_str:
            try:
                val = int(value_str) if not value_str.startswith("0x") else int(value_str, 16)
                total_value += val
            except (ValueError, TypeError):
                pass
        
        # Track timestamp
        ts_raw = tx.get("block_timestamp")
        ts = _parse_timestamp(ts_raw)
        if ts:
            timestamps.append(ts)
        
        # Track failed txs
        status = tx.get("receipt_status")
        if status is not None and str(status) == "0":
            failed_txs += 1
        
        # Track contract interactions via receipt_contract_address
        contract_addr = tx.get("receipt_contract_address")
        if contract_addr and contract_addr != "0x0000000000000000000000000000000000000000":
            to_addresses.add(contract_addr.lower())
    
    # Calculate derived metrics
    first_tx = min(timestamps) if timestamps else None
    last_tx = max(timestamps) if timestamps else None
    
    # Detect repetitive patterns: many txs to few unique addresses
    repetitive_patterns = []
    if outgoing_count > 10 and len(to_addresses) <= 3:
        repetitive_patterns.append(
            f"Wallet has {outgoing_count} outgoing transactions but only interacts with {len(to_addresses)} unique address(es)"
        )
    
    # High failure rate
    total_count = len(txns)
    if total_count > 5 and failed_txs > total_count * 0.5:
        repetitive_patterns.append(
            f"High transaction failure rate: {failed_txs}/{total_count} transactions failed"
        )
    
    return {
        "tx_count": len(txns),
        "outgoing_count": outgoing_count,
        "incoming_count": incoming_count,
        "unique_to_addresses": to_addresses,
        "contract_interactions": set(),
        "first_tx_timestamp": first_tx,
        "last_tx_timestamp": last_tx,
        "repetitive_patterns": repetitive_patterns,
        "unique_methods": methods,
        "total_value": total_value,
        "failed_transactions": failed_txs,
    }


if __name__ == "__main__":
    addr = "0x33aD3000126D3257110fa8B4Db038059cF684614"
    print(f"Fetching transactions for {addr}...")
    txns = get_transactions(addr, size=50)
    if txns:
        print(f"Found {len(txns)} transactions")
        analysis = analyze_tx_history(txns, addr)
        print(f"\nAnalysis:")
        print(f"  Total: {analysis['tx_count']}")
        print(f"  Outgoing: {analysis['outgoing_count']}")
        print(f"  Incoming: {analysis['incoming_count']}")
        print(f"  Unique recipients: {len(analysis['unique_to_addresses'])}")
        print(f"  First tx: {analysis['first_tx_timestamp']} ({datetime.fromtimestamp(analysis['first_tx_timestamp']).isoformat() if analysis['first_tx_timestamp'] else 'N/A'})")
        print(f"  Last tx: {analysis['last_tx_timestamp']}")
        print(f"  Failed: {analysis['failed_transactions']}")
        print(f"  Patterns: {analysis['repetitive_patterns']}")
        print(f"  Methods: {len(analysis['unique_methods'])}")
    else:
        print("No transactions found or API error")
