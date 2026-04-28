// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PharosAssetToken} from "../src/PharosAssetToken.sol";
import {DistributionModule} from "../src/DistributionModule.sol";
import {CrossChainAsset} from "../src/CrossChainAsset.sol";

contract PharosAssetTokenTest is Test {
    PharosAssetToken token;
    address issuer = address(0x1);
    address investor = address(0x2);
    address unverified = address(0x3);
    address compliance = address(0x4);

    function setUp() public {
        vm.prank(issuer);
        token = new PharosAssetToken(
            "Pharos Treasury Bill",
            "pTBILL",
            "TreasuryBill",
            "US",
            1_000_000 ether,
            "ipfs://QmExample",
            issuer,
            compliance
        );

        // Issuer must be KYC verified to transfer
        vm.prank(issuer);
        token.verifyIdentity(issuer, keccak256("issuer-kyc"));

        // Also verify investor for pause/unpause tests
        vm.prank(issuer);
        token.verifyIdentity(investor, keccak256("investor-kyc"));
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Pharos Treasury Bill");
        assertEq(token.symbol(), "pTBILL");
        assertEq(token.assetClass(), "TreasuryBill");
        assertEq(token.assetValue(), 1_000_000 ether);
        assertEq(token.totalSupply(), 1_000_000 ether);
    }

    function test_VerifyIdentity() public {
        vm.prank(compliance);
        vm.expectRevert(); // compliance role check — issuer has COMPLIANCE_ROLE
        token.verifyIdentity(investor, keccak256("investor-kyc"));

        vm.prank(issuer);
        token.verifyIdentity(unverified, keccak256("unverified-kyc"));
        assertTrue(token.isVerified(unverified));
    }

    function test_TransferRequiresKYC() public {
        // Only issuer has tokens. Transfer to another verified party.
        vm.prank(issuer);
        token.verifyIdentity(unverified, keccak256("unverified-kyc"));

        vm.prank(issuer);
        token.transfer(investor, 100 ether);

        assertEq(token.balanceOf(investor), 100 ether);
    }

    function test_TransferRevertsIfUnverified() public {
        vm.expectRevert("Not KYC verified");
        token.transfer(unverified, 1 ether);
    }

    function test_PauseAndUnpause() public {
        vm.prank(issuer);
        token.pause();
        assertTrue(token.paused());

        vm.prank(issuer);
        vm.expectRevert();
        token.transfer(investor, 1 ether);

        vm.prank(issuer);
        token.unpause();

        vm.prank(issuer);
        token.transfer(investor, 1 ether);
        assertEq(token.balanceOf(investor), 1 ether);
    }
}

contract DistributionModuleTest is Test {
    DistributionModule dist;
    PharosAssetToken token;
    address issuer = address(0x1);
    address holder = address(0x2);

    function setUp() public {
        vm.prank(issuer);
        token = new PharosAssetToken(
            "Test Token", "TEST", "Test", "US",
            1000 ether, "", issuer, address(0)
        );

        // Verify issuer + holder
        vm.prank(issuer);
        token.verifyIdentity(issuer, keccak256("issuer-kyc"));
        vm.prank(issuer);
        token.verifyIdentity(holder, keccak256("holder"));

        // Transfer 50% to holder
        vm.prank(issuer);
        token.transfer(holder, 500 ether);

        dist = new DistributionModule(address(token), 1 days);
    }

    function test_DepositAndDistribute() public {
        vm.deal(address(this), 10 ether);
        dist.depositYield{value: 10 ether}();

        vm.warp(block.timestamp + 2 days);

        dist.distribute();
        assertEq(dist.distributionCount(), 1);
    }

    receive() external payable {}
}

contract CrossChainAssetTest is Test {
    PharosAssetToken token;
    CrossChainAsset bridge;
    address issuer = address(0x1);
    address user = address(0x2);

    function setUp() public {
        vm.prank(issuer);
        token = new PharosAssetToken("Bridge", "BRG", "Test", "XX",
            1000 ether, "", issuer, address(0));

        // Verify user and give them tokens. Issuer also verified.
        vm.prank(issuer);
        token.verifyIdentity(issuer, keccak256("issuer-kyc"));
        vm.prank(issuer);
        token.verifyIdentity(user, keccak256("user-kyc"));
        vm.prank(issuer);
        token.transfer(user, 100 ether);

        bridge = new CrossChainAsset(address(token), 8081);

        // Verify bridge contract for KYC transfer compliance
        vm.prank(issuer);
        token.verifyIdentity(address(bridge), keccak256("bridge"));
    }

    function test_LockAndUnlock() public {
        vm.prank(user);
        token.approve(address(bridge), 50 ether);

        vm.prank(user);
        bytes32 msgId = bridge.lock(50 ether, 8082);

        assertEq(token.balanceOf(user), 50 ether);
        assertEq(token.balanceOf(address(bridge)), 50 ether);

        // Unlock via bridge (test contract is bridgeSPN)
        bridge.unlock(user, 50 ether, msgId);

        assertEq(token.balanceOf(user), 100 ether);
    }
}
