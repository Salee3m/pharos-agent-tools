"""
PharosGuard — Pharos RPC Client
Interacts with the Pharos blockchain RPC endpoint (chainID 1672).
"""
import json
from typing import Optional, Dict, Any
from urllib.request import Request, urlopen
from urllib.error import URLError

RPC_URL = "https://rpc.pharos.xyz"


def _rpc_call(method: str, params: list, request_id: int = 1) -> Optional[Dict[str, Any]]:
    """Make a JSON-RPC call to the Pharos node."""
    payload = json.dumps({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": request_id,
    }).encode()
    
    req = Request(RPC_URL, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            if "error" in result:
                return None
            return result
    except (URLError, json.JSONDecodeError, OSError):
        return None


def get_balance(address: str) -> Optional[int]:
    """Get wallet balance in wei."""
    result = _rpc_call("eth_getBalance", [address, "latest"], 1)
    if result and "result" in result:
        return int(result["result"], 16)
    return None


def get_nonce(address: str) -> Optional[int]:
    """Get outgoing transaction count (nonce) for a wallet."""
    result = _rpc_call("eth_getTransactionCount", [address, "latest"], 2)
    if result and "result" in result:
        return int(result["result"], 16)
    return None


def get_code(address: str) -> Optional[str]:
    """Get contract bytecode. Returns '0x' if EOA (not a contract)."""
    result = _rpc_call("eth_getCode", [address, "latest"], 3)
    if result and "result" in result:
        return result["result"]
    return None


def is_contract(address: str) -> Optional[bool]:
    """Check if an address is a smart contract."""
    code = get_code(address)
    if code is None:
        return None
    return code != "0x" and code != "0x0"


def get_block_number() -> Optional[int]:
    """Get the latest block number."""
    result = _rpc_call("eth_blockNumber", [], 4)
    if result and "result" in result:
        return int(result["result"], 16)
    return None


def get_gas_price() -> Optional[int]:
    """Get current gas price in wei."""
    result = _rpc_call("eth_gasPrice", [], 5)
    if result and "result" in result:
        return int(result["result"], 16)
    return None


def format_balance(wei: int) -> str:
    """Format wei to human-readable PHAROS."""
    return f"{wei / 10**18:.6f}"


if __name__ == "__main__":
    addr = "0x33aD3000126D3257110fa8B4Db038059cF684614"
    print(f"Address: {addr}")
    bal = get_balance(addr)
    print(f"Balance: {format_balance(bal) if bal else 'N/A'} PHAROS ({bal} wei)")
    nonce = get_nonce(addr)
    print(f"Nonce (outgoing txs): {nonce}")
    contract = is_contract(addr)
    print(f"Is Contract: {contract}")
    bn = get_block_number()
    print(f"Latest Block: {bn}")
    gp = get_gas_price()
    print(f"Gas Price: {gp} wei ({gp / 10**9:.2f} gwei)" if gp else "N/A")
