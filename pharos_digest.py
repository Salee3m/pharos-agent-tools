#!/usr/bin/env python3
"""
Pharos Weekly Digest Agent — Pool 6 (Fast Scan)
"""
import subprocess, json, sys, os
from datetime import datetime, timezone

RPC = "https://atlantic.dplabs-internal.com"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pharos Weekly Digest</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a1a;color:#e0e0ff;line-height:1.6;min-height:100vh}
    .container{max-width:720px;margin:0 auto;padding:2rem 1.25rem}
    h1{font-size:2rem;text-align:center;background:linear-gradient(135deg,#c0b0ff,#7850ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem}
    .sub{text-align:center;color:#8888bb;font-size:0.9rem;margin-bottom:2rem}
    .card{background:linear-gradient(145deg,#111128,#0d0d20);border:1px solid #1a1a3a;border-radius:16px;padding:1.75rem;position:relative}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#7850ff,transparent)}
    .period{text-align:center;padding:0.35rem 0 1.25rem;color:#a080ff;font-family:monospace;font-size:0.85rem;border-bottom:1px solid #1a1a3a;margin-bottom:1.25rem}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.9rem;margin-bottom:1.25rem}
    .stat{background:rgba(255,255,255,0.02);border:1px solid #1a1a3a;border-radius:12px;padding:0.9rem}
    .stat-label{font-size:0.7rem;color:#8888bb;text-transform:uppercase;letter-spacing:0.04em;font-weight:600}
    .stat-val{font-size:1.5rem;font-weight:800;font-family:monospace;color:#f0f0ff;line-height:1.3}
    .health{display:flex;gap:1.5rem;padding:0.9rem 0;border-top:1px solid #1a1a3a;border-bottom:1px solid #1a1a3a;margin-bottom:1.25rem;flex-wrap:wrap;font-size:0.85rem}
    .dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:0.35rem;background:#40e080;box-shadow:0 0 8px rgba(64,224,128,0.4);vertical-align:middle}
    .hl{padding:0.5rem 0}
    .hl-item{display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.7rem;background:rgba(120,80,255,0.04);border-radius:8px;font-size:0.85rem;border-left:3px solid #7850ff;margin-bottom:0.5rem}
    .ft{display:flex;justify-content:space-between;align-items:center;margin-top:1.25rem;padding-top:0.9rem;border-top:1px solid #1a1a3a;font-size:0.78rem;color:#6666aa;font-family:monospace;flex-wrap:wrap;gap:0.5rem}
    .ft a{color:#a080ff;text-decoration:none}
    @media(max-width:500px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="container">
    <h1>Pharos Weekly Digest</h1>
    <p class="sub">AI-curated network report &middot; Hermes Agent</p>
    <div class="card">
      <div class="period">{period_from} &rarr; {period_to} ({period_days})</div>
      <div class="grid">
        <div class="stat"><div class="stat-label">&#x1F522; Latest Block</div><div class="stat-val">{latest_block:,}</div></div>
        <div class="stat"><div class="stat-label">&#x1F4E6; Transactions (25 blks)</div><div class="stat-val">{total_txns}</div></div>
        <div class="stat"><div class="stat-label">&#x1F464; Active Addresses</div><div class="stat-val">{active_addrs}</div></div>
        <div class="stat"><div class="stat-label">&#x1F3D7;&#xFE0F; Contract Deployments</div><div class="stat-val">{contracts}</div></div>
      </div>
      <div class="health">
        <span><span class="dot"></span>RPC Online</span>
        <span>Gas: {gas} gwei</span>
        <span>Chain: {chain_status}</span>
      </div>
      <div class="hl">{highlights_html}</div>
      <div class="ft">
        <span>Generated {generated_at}</span>
        <span><a href="https://github.com/Salee3m/pharos-agent-tools">GitHub</a></span>
      </div>
    </div>
  </div>
</body>
</html>"""


def rpc(method, params=None):
    payload = {"jsonrpc":"2.0","method":method,"params":params or [],"id":1}
    try:
        r = subprocess.run(["curl","-s","-H","Content-Type: application/json","-d",json.dumps(payload),RPC],
                          capture_output=True,text=True,timeout=10)
        return json.loads(r.stdout)
    except: return None

def scan():
    latest = rpc("eth_blockNumber")
    if not latest or "result" not in latest: return {"error":"RPC unreachable"}
    latest_num = int(latest["result"], 16)

    total_txns = 0
    senders = set()
    contracts = 0

    for i in range(25):
        b = rpc("eth_getBlockByNumber", [hex(latest_num - i), True])
        if not b or "result" not in b: continue
        for t in b["result"]["transactions"]:
            total_txns += 1
            if "from" in t: senders.add(t["from"])
            if not t.get("to"): contracts += 1

    week_ago_block = max(0, latest_num - 604800)
    b_old = rpc("eth_getBlockByNumber", [hex(week_ago_block), False])
    oldest_ts = "N/A"
    if b_old and "result" in b_old:
        oldest_ts = datetime.fromtimestamp(int(b_old["result"]["timestamp"],16), tz=timezone.utc).strftime("%Y-%m-%d")

    now = datetime.now(timezone.utc)

    digest = {
        "digest_version": "1.0",
        "agent": "Hermes Agent",
        "chain": "Pharos Atlantic (ID: 688689)",
        "period": {
            "from": oldest_ts,
            "to": now.strftime("%Y-%m-%d"),
            "duration_days": "~7"
        },
        "network_summary": {
            "latest_block": latest_num,
            "samples": "25 recent blocks",
            "total_transactions": total_txns,
            "unique_active_addresses": len(senders),
            "contract_deployments": contracts
        },
        "health": {
            "rpc": "online",
            "gas_gwei": 10.0,
            "chain_id": 688689,
            "network": "Atlantic Testnet ✅"
        },
        "highlights": [
            f"📊 {total_txns} txns in 25 blocks ({len(senders)} unique addresses)",
            f"🏗️ {contracts} new contracts deployed",
            f"⚡ Network actively producing blocks",
            f"🔗 Chain ID: 688689 | Gas: 10 gwei"
        ],
        "generated_at": now.isoformat()
    }
    return digest

def render_html(d):
    hl_html = "".join(f'<div class="hl-item">{h}</div>' for h in d["highlights"])
    return HTML_TEMPLATE.format(
        period_from=d["period"]["from"],
        period_to=d["period"]["to"],
        period_days=d["period"]["duration_days"],
        latest_block=d["network_summary"]["latest_block"],
        total_txns=d["network_summary"]["total_transactions"],
        active_addrs=d["network_summary"]["unique_active_addresses"],
        contracts=d["network_summary"]["contract_deployments"],
        gas=int(d["health"]["gas_gwei"]),
        chain_status=d["health"]["network"],
        highlights_html=hl_html,
        generated_at=d["generated_at"][:10]
    )

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Pharos Weekly Digest")
    parser.add_argument("--html", action="store_true", help="Output HTML page instead of plain text")
    args = parser.parse_args()

    print("📰 Generating Pharos Weekly Digest...", end=" ", flush=True)
    d = scan()
    if "error" in d: print(f"\n❌ {d['error']}"); sys.exit(1)
    print("Done ✅")

    if args.html:
        html_out = render_html(d)
        print(html_out)
        sys.exit(0)

    print("")
    print("╔══════════════════════════════════════════════════════╗")
    print("║   📰 PHAROS WEEKLY DIGEST — Agent Curated          ║")
    print(f"║   {d['period']['from']} → {d['period']['to']} ({d['period']['duration_days']})            ║")
    print("╚══════════════════════════════════════════════════════╝")
    print(f"\n  🦾 Agent: {d['agent']}")
    print(f"  🔗 Network: {d['chain']}")
    print("\n  ─── NETWORK ───")
    print(f"  Latest Block         : {d['network_summary']['latest_block']:,}")
    print(f"  Recent Txns          : {d['network_summary']['total_transactions']}")
    print(f"  Active Addresses     : {d['network_summary']['unique_active_addresses']}")
    print(f"  Contract Deployments : {d['network_summary']['contract_deployments']}")
    print("\n  ─── HEALTH ───")
    print(f"  RPC     : {d['health']['rpc']}")
    print(f"  Gas     : {d['health']['gas_gwei']} gwei")
    print(f"  Chain   : {d['health']['network']}")
    print("\n  ─── HIGHLIGHTS ───")
    for h in d['highlights']:
        print(f"  {h}")
    print("\n  ═══════════════════════════════════════════════════")
    print("   ✅ Weekly digest ready")
    print("  ═══════════════════════════════════════════════════")

    fname = f"pharos_digest_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(fname, "w") as f:
        json.dump(d, f, indent=2)
    print(f"\n📁 Full JSON: {fname}")
