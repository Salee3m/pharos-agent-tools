const RPC = 'https://atlantic.dplabs-internal.com';

async function rpcCall(method, params = []) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
  });
  const data = await res.json();
  return data;
}

async function fetchDigest() {
  const loader = document.getElementById('loader');
  const body = document.getElementById('digest-body');
  const error = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const btn = document.getElementById('btn-refresh');

  loader.classList.remove('hidden');
  body.classList.add('hidden');
  error.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<span class="refresh-icon" style="display:inline-block;animation:spin 0.8s linear infinite">↻</span> Scanning...';

  try {
    // Get latest block
    const latestRes = await rpcCall('eth_blockNumber');
    if (!latestRes || !latestRes.result) throw new Error('RPC unreachable');
    const latestNum = parseInt(latestRes.result, 16);

    // Scan recent 25 blocks
    let totalTxns = 0;
    const senders = new Set();
    let contracts = 0;

    const batch = [];
    for (let i = 0; i < 25; i++) {
      batch.push(rpcCall('eth_getBlockByNumber', [`0x${(latestNum - i).toString(16)}`, true]));
    }
    const blocks = await Promise.all(batch);

    for (const b of blocks) {
      if (!b || !b.result) continue;
      for (const t of b.result.transactions) {
        totalTxns++;
        if (t.from) senders.add(t.from);
        if (!t.to) contracts++;
      }
    }

    // Week ago block for period
    const weekAgoBlock = Math.max(0, latestNum - 604800);
    const oldRes = await rpcCall('eth_getBlockByNumber', [`0x${weekAgoBlock.toString(16)}`, false]);
    let oldestTs = 'N/A';
    if (oldRes && oldRes.result) {
      const d = new Date(parseInt(oldRes.result.timestamp, 16) * 1000);
      oldestTs = d.toISOString().split('T')[0];
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Update DOM
    document.querySelector('.card-header h2').textContent = `Pharos Digest · ${oldestTs} → ${today}`;
    document.getElementById('period-badge').textContent = '~7 days';
    document.getElementById('latest-block').textContent = latestNum.toLocaleString();
    document.getElementById('total-txns').textContent = totalTxns;
    document.getElementById('active-addresses').textContent = senders.size;
    document.getElementById('contract-deployments').textContent = contracts;
    document.getElementById('gas-value').textContent = '10 gwei';
    document.getElementById('chain-status').textContent = 'Atlantic Testnet ✅';
    document.getElementById('timestamp').textContent = `Updated ${now.toLocaleString()}`;

    // Highlights
    const highlights = [
      `📊 ${totalTxns} txns in 25 blocks (${senders.size} unique addresses)`,
      `🏗️ ${contracts} new contracts deployed`,
      `⚡ Network actively producing blocks`,
      `🔗 Chain ID: 688689 | Gas: 10 gwei`
    ];
    const hlContainer = document.getElementById('highlights');
    hlContainer.innerHTML = highlights.map(h =>
      `<div class="highlight-item">${h}</div>`
    ).join('');

    loader.classList.add('hidden');
    body.classList.remove('hidden');
  } catch (err) {
    loader.classList.add('hidden');
    error.classList.remove('hidden');
    errorText.textContent = err.message || 'Could not reach Pharos RPC.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="refresh-icon">↻</span> Refresh';
  }
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', fetchDigest);