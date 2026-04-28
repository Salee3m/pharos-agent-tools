// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PharosAssetToken} from "../src/PharosAssetToken.sol";
import {DistributionModule} from "../src/DistributionModule.sol";
import {CrossChainAsset} from "../src/CrossChainAsset.sol";

/**
 * @title DeployPharosRWA
 * @notice Deploy complete RWA stack on Pharos (any EVM chain)
 *
 * Usage:
 *   forge script script/Deploy.s.sol --rpc-url <rpc> --broadcast -vvv
 *
 * Environment variables:
 *   DEPLOYER     — deployer private key
 *   ASSET_NAME   — token name (default: Pharos Treasury Bill)
 *   ASSET_SYMBOL — token symbol (default: pTBILL)
 *   ASSET_CLASS  — e.g. TreasuryBill, RealEstate, Commodity
 *   JURISDICTION — ISO country code (default: US)
 *   ASSET_VALUE  — total token supply (default: 1000000 ether)
 *   TOKEN_URI    — off-chain metadata URI
 *   COMPLIANCE   — compliance module address (optional)
 *   DIST_INTERVAL — yield distribution interval in seconds (default: 86400 = daily)
 *   SPN_CHAIN_ID — local SPN chain ID (default: 8081)
 */
contract DeployPharosRWA is Script {
    function run() external {
        // ── Read config from env ──────────────────────────────────
        address deployer = vm.addr(vm.envUint("DEPLOYER"));

        string memory name = vm.envOr("ASSET_NAME", string("Pharos Treasury Bill"));
        string memory symbol = vm.envOr("ASSET_SYMBOL", string("pTBILL"));
        string memory assetClass = vm.envOr("ASSET_CLASS", string("TreasuryBill"));
        string memory jurisdiction = vm.envOr("JURISDICTION", string("US"));
        uint256 assetValue = vm.envOr("ASSET_VALUE", uint256(1_000_000 ether));
        string memory tokenURI = vm.envOr("TOKEN_URI", string(""));
        address compliance = vm.envOr("COMPLIANCE", address(0));
        uint256 distInterval = vm.envOr("DIST_INTERVAL", uint256(86400)); // daily
        uint256 spnChainId = vm.envOr("SPN_CHAIN_ID", uint256(8081));

        // ── Start broadcast ───────────────────────────────────────
        vm.startBroadcast(deployer);

        // 1. Deploy asset token
        PharosAssetToken token = new PharosAssetToken(
            name, symbol, assetClass, jurisdiction,
            assetValue, tokenURI, deployer, compliance
        );
        console.log("PharosAssetToken deployed at:", address(token));

        // 2. Deploy distribution module
        DistributionModule dist = new DistributionModule(address(token), distInterval);
        console.log("DistributionModule deployed at:", address(dist));

        // 3. Grant distributor role to deployer
        dist.grantRole(dist.DISTRIBUTOR_ROLE(), deployer);
        console.log("Distributor role granted to deployer");

        // 4. Deploy cross-chain bridge
        CrossChainAsset bridge = new CrossChainAsset(address(token), spnChainId);
        console.log("CrossChainAsset deployed at:", address(bridge));

        // 5. Verify deployer identity (self-issue KYC)
        token.verifyIdentity(deployer, keccak256(abi.encodePacked(deployer, "kyc")));
        console.log("Deployer identity verified");

        vm.stopBroadcast();

        // ── Summary ───────────────────────────────────────────────
        console.log("=== Deployment Complete ===");
        console.log("Token:", address(token));
        console.log("Distribution:", address(dist));
        console.log("Bridge:", address(bridge));
        console.log("Total Supply:", assetValue);
        console.log("Chain ID:", spnChainId);
    }
}
