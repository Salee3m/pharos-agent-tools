// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DeployPharosRWA} from "./Deploy.s.sol";

/**
 * @title DeployPharosRWAOnPharos
 * @notice Deploys on Pharos testnet using the RPC + account from env
 *
 * Usage:
 *   export DEPLOYER=<private_key>
 *   forge script script/DeployPharos.s.sol \
 *     --rpc-url https://<pharos-testnet-rpc> \
 *     --broadcast --verify -vvv
 */
contract DeployPharosRWAOnPharos is DeployPharosRWA {
    // Inherits everything from DeployPharosRWA
    // Just a convenience alias for Pharos-specific deployment
}
