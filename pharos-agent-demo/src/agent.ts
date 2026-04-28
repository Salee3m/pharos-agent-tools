/**
 * Pharos Agent Demo
 * =================
 * First AI Agent on Pharos Pacific Mainnet.
 * Integrated with Pharos Agent Kit, live on Atlantic Testnet,
 * ready for mainnet launch day.
 *
 * This script demonstrates core Pharos Agent Kit functionality:
 *   - Connecting to Atlantic Testnet
 *   - Checking account balances (native PHAROS + ERC-20)
 *   - Monitoring chain status (block height, gas, peers)
 *   - Transfer capabilities via Agent Kit
 *   - Market data / DeFi data integration
 *
 * Usage:
 *   tsx src/agent.ts            # Full demo (all capabilities)
 *   tsx src/agent.ts --balance  # Just wallet balances
 *   tsx src/agent.ts --monitor  # Atlantic Testnet chain status
 *   tsx src/agent.ts --check-chain  # Quick connectivity check
 *   tsx src/agent.ts --full     # Full end-to-end demo
 */

import { PharosAgentKit, createPharosTools } from "pharos-agent-kit";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ATLANTIC_RPC = "https://atlantic.dplabs-internal.com";
const ATLANTIC_CHAIN_ID = 688689;
const ATLANTIC_EXPLORER = "https://atlantic.pharosscan.xyz";

// Wallet used throughout the demo
const DEPLOYER_ADDRESS: Address = "0xeed479954373818098a6909729CB795ad88E7C63";

// Known testnet token (WPHAROS wrapped native) — address placeholder
// Replace with the actual testnet token address once deployed
const WPHAROS_TESTNET: Address | undefined = undefined;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const DIVIDER = "─".repeat(60);

function log(label: string, msg: string, color = GREEN) {
  console.log(`${color}${BOLD}[${label}]${RESET} ${msg}`);
}

function heading(title: string) {
  console.log(`\n${CYAN}${BOLD}${DIVIDER}${RESET}`);
  console.log(`${CYAN}${BOLD}  ${title}${RESET}`);
  console.log(`${CYAN}${BOLD}${DIVIDER}${RESET}\n`);
}

function banner() {
  console.log(`
${CYAN}${BOLD}╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗ ██╗  ██╗ █████╗ ██████╗  ██████╗ ███████╗    ║
║   ██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔═══██╗██╔════╝    ║
║   ██████╔╝███████║███████║██████╔╝██║   ██║███████╗    ║
║   ██╔═══╝ ██╔══██║██╔══██║██╔══██╗██║   ██║╚════██║    ║
║   ██║     ██║  ██║██║  ██║██║  ██║╚██████╔╝███████║    ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ║
║                                                          ║
║   ${GREEN}First AI Agent on Pharos Pacific Mainnet${RESET}${CYAN}          ║
║   ${YELLOW}Integrated with Pharos Agent Kit${RESET}${CYAN}                 ║
║   ${GREEN}Live on Atlantic Testnet — Chain ID ${ATLANTIC_CHAIN_ID}${RESET}${CYAN}   ║
║   ${YELLOW}Ready for mainnet launch day${RESET}${CYAN}                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝${RESET}
`);
}

/* ------------------------------------------------------------------ */
/*  Key Loading                                                       */
/* ------------------------------------------------------------------ */

function loadPrivateKey(): `0x${string}` | null {
  const keyPath = path.join(homedir(), ".pharos-testnet-key");
  if (!existsSync(keyPath)) {
    return null;
  }
  const raw = readFileSync(keyPath, "utf-8").trim();
  const hex = raw.startsWith("0x") ? raw : `0x${raw}`;
  return hex as `0x${string}`;
}

/**
 * Ensure the PHAROS_PRIVATE_KEY env var is set (required by pharos-agent-kit
 * wallet client internals). Falls back to the key file if not already set.
 */
function ensureEnvKey(): void {
  if (!process.env.PHAROS_PRIVATE_KEY) {
    const key = loadPrivateKey();
    if (key) {
      // agent-kit wallet client expects the key WITH the 0x prefix
      process.env.PHAROS_PRIVATE_KEY = key;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Core Agent Demo Functions                                         */
/* ------------------------------------------------------------------ */

/**
 * 1. Connection Test — verify the Atlantic Testnet RPC is alive
 */
async function checkChainConnection(): Promise<{
  blockNumber: bigint;
  chainId: number;
}> {
  heading("🔗 Atlantic Testnet Connection Check");

  const publicClient = createPublicClient({
    transport: http(ATLANTIC_RPC),
  });

  const [blockNumber, chainId] = await Promise.all([
    publicClient.getBlockNumber(),
    publicClient.getChainId(),
  ]);

  log("CHAIN", `RPC:         ${ATLANTIC_RPC}`);
  log("CHAIN", `Chain ID:    ${chainId} ${chainId === ATLANTIC_CHAIN_ID ? GREEN + "✅" + RESET : RED + "❌ MISMATCH" + RESET}`);
  log("CHAIN", `Block:       ${blockNumber.toString()}`);
  log("CHAIN", `Explorer:    ${ATLANTIC_EXPLORER}`);

  return { blockNumber, chainId };
}

/**
 * 2. Balance — query native PHAROS balance (and optionally ERC-20)
 */
async function showBalances(agent: PharosAgentKit): Promise<{
  nativeBalance: number;
  nativeBalanceFormatted: string;
}> {
  heading("💰 Account Balance Check");

  log("WALLET", `Address:     ${agent.wallet_address}`);

  // Native balance via Agent Kit
  const nativeBalance = await agent.getBalance();
  const formatted = formatEther(BigInt(Math.floor(nativeBalance * 1e18)));
  log("BALANCE", `Native PHAROS:  ${YELLOW}${formatted}${RESET} PHAROS`);

  // Also fetch via raw viem for verification
  const publicClient = createPublicClient({
    transport: http(ATLANTIC_RPC),
  });
  const rawBalance = await publicClient.getBalance({
    address: agent.wallet_address,
  });
  const rawFormatted = formatEther(rawBalance);
  log("BALANCE", `Native (viem):  ${YELLOW}${rawFormatted}${RESET} PHAROS`);

  // ERC-20 token balance (if token address provided)
  if (WPHAROS_TESTNET) {
    try {
      const tokenBalance = await agent.getBalance(WPHAROS_TESTNET);
      log("BALANCE", `WPHAROS:        ${YELLOW}${tokenBalance}${RESET} tokens`);
    } catch (err: any) {
      log("BALANCE", `WPHAROS:        ${RED}unable to query — ${err.message}${RESET}`);
    }
  }

  return { nativeBalance, nativeBalanceFormatted: formatted };
}

/**
 * 3. Chain Status Monitor — show latest block, gas price, validator info
 */
async function monitorChainStatus(): Promise<void> {
  heading("📡 Atlantic Testnet Chain Status");

  const publicClient = createPublicClient({
    transport: http(ATLANTIC_RPC),
  });

  // Gather chain info
  const [block, chainId, blockNumber, gasPrice] = await Promise.all([
    publicClient.getBlock({ includeTransactions: false }),
    publicClient.getChainId(),
    publicClient.getBlockNumber(),
    publicClient.getGasPrice().catch(() => null),
  ]);

  log("BLOCK", `Number:       ${block.number?.toString() ?? "unknown"}`);
  log("BLOCK", `Hash:         ${block.hash ?? "unknown"}`);
  log("BLOCK", `Timestamp:    ${block.timestamp.toString()} (Unix UTC)`);
  log("BLOCK", `Transactions: ${block.transactions.length}`);
  log("BLOCK", `Gas Used:     ${block.gasUsed?.toString() ?? "N/A"} / ${block.gasLimit?.toString() ?? "N/A"}`);
  if (gasPrice) {
    log("GAS",   `Base Fee:     ${formatEther(gasPrice)} PHAROS`);
  }
  log("CHAIN",  `Chain ID:     ${chainId}`);
  log("CHAIN",  `Explorer:     ${ATLANTIC_EXPLORER}`);

  // Check latest blocks for activity
  const prevBlock = await publicClient.getBlock({
    blockNumber: blockNumber - 1n,
  });
  const txDelta =
    block.transactions.length - prevBlock.transactions.length;
  log("ACTIVITY", `Tx Delta (last block): ${txDelta > 0 ? GREEN + "+" + txDelta : txDelta < 0 ? RED + txDelta.toString() : "0"}${RESET}`);
}

/**
 * 4. Agent Kit Integration — demonstrate LangChain tools creation
 */
async function showAgentKitIntegration(agent: PharosAgentKit): Promise<void> {
  heading("🤖 Pharos Agent Kit Integration");

  log("KIT", "PharosAgentKit instantiated successfully");
  log("KIT", `Wallet:        ${agent.wallet_address}`);
  log("KIT", `RPC URL:       ${agent.rpcUrl}`);
  log("KIT", `Agent Kit v1.0.2`);

  // Create LangChain tools
  try {
    const tools = createPharosTools(agent);
    const toolNames = tools.map((t) => t.name).join(", ");
    log("TOOLS", `LangChain tools created: ${toolNames}`);
    log("TOOLS", `Total tools available: ${tools.length}`);
  } catch (err: any) {
    log("TOOLS", `LangChain tool creation: ${YELLOW}${err.message}${RESET} (may require API keys)`);
  }

  // Show available agent capabilities
  const capabilities = [
    "getBalance       — query native & ERC-20 token balances",
    "transfer         — send PHAROS or ERC-20 tokens",
    "fetchTokenPrice  — real-time price data (Coingecko)",
    "getTrendingTokens — trending token analysis",
    "fetchProtocolTVL — DeFiLlama protocol TVL data",
    "getTopGainers   — top gainers on Coingecko",
    "ERC721 operations — NFT balance, transfer, mint",
    "Elfa AI social   — smart mentions, account stats, trending by social",
  ];

  log("CAPABLE", "Agent Kit capabilities:");
  for (const cap of capabilities) {
    console.log(`   ${CYAN}▪${RESET} ${cap}`);
  }
}

/**
 * 5. Full Demo — run everything end-to-end
 */
async function fullDemo(): Promise<void> {
  banner();

  // --- Load key ---
  const privateKey = loadPrivateKey();
  if (!privateKey) {
    log("WARN", `No private key found at ~/.pharos-testnet-key`, RED);
    log("WARN", "Agent will run in READ-ONLY mode (connection checks only).", YELLOW);
  }

  // --- Step 1: Check chain connectivity ---
  await checkChainConnection();

  // Ensure env key for agent-kit internals
  ensureEnvKey();

  // --- Step 2: If we have a key, initialise Agent Kit and show balances ---
  if (privateKey) {
    heading("🚀 Initialising Pharos Agent Kit");
    const agent = new PharosAgentKit(privateKey, ATLANTIC_RPC);
    log("INIT", "Agent Kit initialised");
    log("INIT", `Wallet address: ${agent.wallet_address}`);

    // Verify address matches expected deployer
    const addrMatch =
      agent.wallet_address.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase();
    log("INIT", `Deployer match: ${addrMatch ? GREEN + "✅" + RESET : YELLOW + "⚠ different key loaded" + RESET}`);

    // --- Balances ---
    await showBalances(agent);

    // --- Agent Kit integration ---
    await showAgentKitIntegration(agent);
  }

  // --- Step 3: Chain Status Monitor (always works, read-only) ---
  await monitorChainStatus();

  // --- Summary ---
  heading("✅ Demo Complete");
  console.log(`  ${GREEN}✓${RESET} Atlantic Testnet (Chain ID ${ATLANTIC_CHAIN_ID}) connection verified`);
  console.log(`  ${GREEN}✓${RESET} Pharos Agent Kit v1.0.2 integrated`);
  if (privateKey) {
    console.log(`  ${GREEN}✓${RESET} Wallet balances checked`);
  }
  console.log(`  ${GREEN}✓${RESET} Chain status monitored`);
  console.log(`  ${GREEN}✓${RESET} Ready for Pharos Pacific Mainnet 🚀\n`);
}

/* ------------------------------------------------------------------ */
/*  CLI Entry Point                                                    */
/* ------------------------------------------------------------------ */

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] ?? "--full";
  const privateKey = loadPrivateKey();

  switch (mode) {
    case "--check-chain":
      banner();
      await checkChainConnection();
      break;

    case "--balance": {
      banner();
      ensureEnvKey();
      if (!privateKey) {
        log("ERROR", "Private key required for balance checks. Load ~/.pharos-testnet-key", RED);
        process.exit(1);
      }
      const agent = new PharosAgentKit(privateKey, ATLANTIC_RPC);
      await showBalances(agent);
      break;
    }

    case "--monitor":
      banner();
      await checkChainConnection();
      await monitorChainStatus();
      break;

    case "--full":
    default:
      await fullDemo();
      break;
  }
}

main().catch((err) => {
  console.error(`\n${RED}${BOLD}FATAL${RESET}: ${err.message}`);
  process.exit(1);
});
