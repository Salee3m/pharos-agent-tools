"""
PharosGuard — Risk Scoring Engine
Analyzes wallet addresses using real Pharos RPC + explorer data.
"""
import re
import time
from typing import Dict, Any, Optional, List, Set

from rpc_client import get_balance, get_nonce, is_contract, format_balance
from explorer_client import get_transactions, analyze_tx_history

EVM_ADDRESS_REGEX = re.compile(r"^0x[a-fA-F0-9]{40}$")


def validate_address(wallet: str) -> bool:
    """Validate an EVM-compatible wallet address."""
    if not wallet:
        return False
    return bool(EVM_ADDRESS_REGEX.match(wallet.strip()))


async def analyze_wallet(wallet: str) -> Dict[str, Any]:
    """
    Analyze a wallet address using real on-chain data and return a risk profile.
    This is the main entry point for the API.
    """
    wallet = wallet.strip()
    wallet_lower = wallet.lower()

    if not validate_address(wallet):
        return {
            "error": True,
            "message": f"Invalid EVM wallet address: '{wallet}'. Address must be 42 characters starting with 0x.",
            "wallet_address": wallet,
        }

    # --- Phase 1: Collect on-chain data from RPC ---
    balance_wei = get_balance(wallet_lower)
    nonce = get_nonce(wallet_lower)
    is_contract_addr = is_contract(wallet_lower)

    if balance_wei is None and nonce is None:
        return {
            "error": True,
            "message": f"Unable to reach Pharos RPC. Please check network connectivity.",
            "wallet_address": wallet,
        }

    # --- Phase 2: Fetch transaction history from explorer ---
    txns = get_transactions(wallet_lower, size=50)
    tx_history = analyze_tx_history(txns, wallet_lower) if txns else {
        "tx_count": 0, "outgoing_count": 0, "incoming_count": 0,
        "unique_to_addresses": set(), "contract_interactions": set(),
        "first_tx_timestamp": None, "last_tx_timestamp": None,
        "repetitive_patterns": [], "unique_methods": set(), "total_value": 0,
    }

    # --- Phase 3: Calculate risk score ---
    # Use max of (nonce, explorer tx count) as the real transaction count
    tx_count = max(nonce or 0, tx_history.get("tx_count", 0))
    outgoing_count = tx_history.get("outgoing_count", 0) or nonce or 0
    unique_recipients = len(tx_history.get("unique_to_addresses", set()))
    contract_interactions = len(tx_history.get("contract_interactions", set()))
    unique_methods = len(tx_history.get("unique_methods", set()))
    repetitive_patterns = tx_history.get("repetitive_patterns", [])
    tx_total_value = tx_history.get("total_value", 0)
    first_tx_ts = tx_history.get("first_tx_timestamp")
    last_tx_ts = tx_history.get("last_tx_timestamp")

    # Wallet age
    wallet_age_days = 0
    if first_tx_ts:
        wallet_age_days = (int(time.time()) - first_tx_ts) / 86400

    # Days since last activity
    days_since_last_tx = None
    if last_tx_ts:
        days_since_last_tx = (int(time.time()) - last_tx_ts) / 86400

    # Balance in PHAROS
    balance_formatted = format_balance(balance_wei) if balance_wei is not None else "0"

    # Calculate interaction diversity
    interaction_diversity = round(unique_recipients / max(tx_count, 1), 4)

    # --- Risk Scoring ---
    risk_score = 0
    risk_components = []

    # 1. High transaction velocity (>30 tx in short period)
    # If wallet has many outgoing txs but low age
    if tx_count > 30 and wallet_age_days < 30:
        risk_score += 40
        risk_components.append({"factor": "High velocity", "points": 40, "detail": f"{tx_count} tx in {wallet_age_days:.0f} days"})
    elif tx_count > 20 and wallet_age_days < 14:
        risk_score += 40
        risk_components.append({"factor": "High velocity", "points": 40, "detail": f"{tx_count} tx in {wallet_age_days:.0f} days"})
    elif tx_count > 50 and wallet_age_days < 60:
        risk_score += 30
        risk_components.append({"factor": "Moderate velocity", "points": 30, "detail": f"{tx_count} tx in {wallet_age_days:.0f} days"})
    elif tx_count > 10 and wallet_age_days < 7:
        risk_score += 35
        risk_components.append({"factor": "High velocity", "points": 35, "detail": f"{tx_count} tx in {wallet_age_days:.0f} days"})

    # 2. Low interaction diversity
    if unique_recipients <= 2 and tx_count > 5:
        risk_score += 30
        risk_components.append({"factor": "Low interaction diversity", "points": 30, "detail": f"Only {unique_recipients} unique recipients in {tx_count} tx"})
    elif unique_recipients <= 4 and tx_count > 15:
        risk_score += 20
        risk_components.append({"factor": "Limited interaction diversity", "points": 20, "detail": f"Only {unique_recipients} unique recipients in {tx_count} tx"})
    elif unique_recipients == 1 and tx_count > 0:
        risk_score += 35
        risk_components.append({"factor": "Single recipient", "points": 35, "detail": "All transactions go to one address"})

    # 3. Repetitive patterns
    if repetitive_patterns:
        risk_score += 20
        risk_components.append({"factor": "Repetitive patterns", "points": 20, "detail": repetitive_patterns[0]})

    # 4. Dormant wallet with past activity — low risk
    if days_since_last_tx is not None and days_since_last_tx > 180 and tx_count < 10:
        risk_score -= 5

    # 5. Balance-based signals
    has_balance = balance_wei is not None and balance_wei > 0

    # 6. Contract check
    if is_contract_addr:
        risk_score += 10  # Contract addresses have higher scrutiny
        risk_components.append({"factor": "Contract address", "points": 10, "detail": "Address is a smart contract"})

    # 7. Healthy wallet bonus
    if unique_recipients > 5 and tx_count > 5 and wallet_age_days > 90:
        risk_score -= 10
        risk_components.append({"factor": "Established wallet with diverse interactions", "points": -10})

    # Cap at 0-100
    risk_score = max(0, min(100, risk_score))

    # --- Determine risk level ---
    if risk_score <= 30:
        risk_level = "low"
    elif risk_score <= 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # --- Generate flags ---
    flags = _generate_flags(
        tx_count=tx_count,
        outgoing_count=outgoing_count,
        wallet_age_days=wallet_age_days,
        unique_recipients=unique_recipients,
        repetitive_patterns=repetitive_patterns,
        is_contract=is_contract_addr or False,
        has_balance=has_balance,
        days_since_last_tx=days_since_last_tx,
        interaction_diversity=interaction_diversity,
        risk_score=risk_score,
        tx_total_value=tx_total_value,
    )

    # --- Generate summary ---
    summary = _generate_summary(risk_score, risk_level, tx_count, flags)

    return {
        "wallet_address": wallet,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "data_source": "live" if txns else "rpc_only",
        "metrics": {
            "transaction_count": tx_count,
            "outgoing_transactions": outgoing_count,
            "unique_recipients": unique_recipients,
            "interaction_diversity": interaction_diversity,
            "unique_methods": unique_methods,
            "contract_interactions": contract_interactions,
            "wallet_age_days": round(wallet_age_days, 1),
            "days_since_last_tx": round(days_since_last_tx, 1) if days_since_last_tx is not None else None,
            "balance_pharos": balance_formatted,
            "balance_wei": balance_wei or 0,
            "is_contract": is_contract_addr or False,
            "total_value_transferred": tx_total_value,
        },
        "risk_components": risk_components,
        "flags": flags,
        "summary": summary,
    }


def _generate_flags(
    tx_count: int,
    outgoing_count: int,
    wallet_age_days: float,
    unique_recipients: int,
    repetitive_patterns: list,
    is_contract: bool,
    has_balance: bool,
    days_since_last_tx: Optional[float],
    interaction_diversity: float,
    risk_score: int,
    tx_total_value: int,
) -> List[Dict[str, str]]:
    """Generate flags/alerts based on wallet analysis."""
    flags = []

    if tx_count == 0:
        flags.append({
            "type": "info",
            "label": "No Activity",
            "description": "This wallet has no recorded transactions on Pharos."
        })
        if has_balance:
            flags.append({
                "type": "info",
                "label": "Funded but Inactive",
                "description": "Wallet has a balance but no transaction history. May be a new or dormant account."
            })
        return flags

    # Activity level
    if outgoing_count > 100:
        flags.append({
            "type": "info",
            "label": "High Activity Wallet",
            "description": f"This wallet has sent {outgoing_count} transactions — high overall activity level."
        })
    elif outgoing_count > 50:
        flags.append({
            "type": "info",
            "label": "Active Wallet",
            "description": f"This wallet has sent {outgoing_count} transactions — moderate activity level."
        })

    # Velocity flags
    if tx_count > 30 and wallet_age_days < 30:
        flags.append({
            "type": "critical",
            "label": "Extreme Transaction Velocity",
            "description": f"Over {tx_count} transactions in less than 30 days — highly indicative of automated or bot-like behavior."
        })
    elif tx_count > 20 and wallet_age_days < 7:
        flags.append({
            "type": "critical",
            "label": "Extreme Transaction Velocity",
            "description": f"Over {tx_count} transactions within 7 days of first activity — highly indicative of automated behavior."
        })
    elif tx_count > 10 and wallet_age_days < 7:
        flags.append({
            "type": "warning",
            "label": "High Transaction Velocity",
            "description": f"Over {tx_count} transactions in less than 7 days — unusually high activity for a new wallet."
        })

    # Low diversity flags
    if unique_recipients <= 2 and tx_count > 5:
        flags.append({
            "type": "warning",
            "label": "Low Interaction Diversity",
            "description": f"Wallet only interacts with {unique_recipients} unique address(es) across {tx_count} transactions. May indicate farming or repetitive behavior."
        })

    # Repetitive patterns
    for pattern in repetitive_patterns:
        flags.append({
            "type": "warning",
            "label": "Repetitive Pattern Detected",
            "description": pattern
        })

    # Dormant wallet
    if days_since_last_tx is not None and days_since_last_tx > 180 and tx_count > 0:
        flags.append({
            "type": "info",
            "label": "Dormant Wallet",
            "description": f"Last activity was {days_since_last_tx:.0f} days ago. Wallet has been inactive for over 6 months."
        })

    # Very new wallet
    if wallet_age_days < 1 and tx_count > 0:
        flags.append({
            "type": "info",
            "label": "Newly Active Wallet",
            "description": "This wallet started transacting less than a day ago. Limited historical data available."
        })

    # Unfunded active wallet (suspicious)
    if not has_balance and tx_count > 5:
        flags.append({
            "type": "info",
            "label": "Drained Wallet",
            "description": "Wallet has transaction history but zero balance. May have been drained or is a disposable address."
        })

    # Healthy diversity
    if unique_recipients > 5 and tx_count > 5:
        flags.append({
            "type": "positive",
            "label": "Diverse Interactions",
            "description": f"Wallet interacts with {unique_recipients} unique addresses — healthy interaction diversity."
        })

    # Established wallet
    if wallet_age_days > 180 and tx_count > 5:
        flags.append({
            "type": "positive",
            "label": "Established Wallet",
            "description": f"Wallet has been active for {wallet_age_days:.0f} days with consistent transaction history."
        })

    # Contract flag
    if is_contract:
        flags.append({
            "type": "info",
            "label": "Contract Address",
            "description": "This address is a smart contract, not an individual wallet. Additional scrutiny recommended."
        })

    # Ensure at least one flag for healthy wallets
    if len(flags) == 0 and tx_count > 0:
        flags.append({
            "type": "positive",
            "label": "Normal Activity Pattern",
            "description": f"Wallet shows typical usage with {tx_count} transactions. No suspicious patterns detected."
        })

    return flags


def _generate_summary(score: int, level: str, tx_count: int, flags: list) -> str:
    """Generate a human-readable summary."""
    if tx_count == 0:
        return "No on-chain activity detected for this wallet. Risk score is neutral."

    critical_flags = [f for f in flags if f["type"] == "critical"]
    warning_flags = [f for f in flags if f["type"] == "warning"]
    positive_flags = [f for f in flags if f["type"] == "positive"]

    if level == "low":
        positives = len(positive_flags)
        base = f"Low risk wallet. {tx_count} transactions with healthy interaction patterns."
        if positives:
            base += f" {positives} positive signal(s) detected."
        return base
    elif level == "medium":
        w = len(warning_flags)
        return f"Medium risk wallet. {tx_count} transactions with {w} warning flag(s). Further investigation recommended before interacting."
    else:
        c = len(critical_flags)
        w = len(warning_flags)
        return f"High risk wallet. {tx_count} transactions with {c} critical and {w} warning flag(s). Exercise extreme caution — likely automated or suspicious patterns."


def get_risk_level(score: int) -> str:
    """Convert a numeric risk score to a level string."""
    if score <= 30:
        return "low"
    elif score <= 60:
        return "medium"
    else:
        return "high"
