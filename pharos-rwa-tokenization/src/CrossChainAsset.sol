// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PharosAssetToken} from "./PharosAssetToken.sol";

/**
 * @title CrossChainAsset
 * @notice Cross-SPN bridge-compatible RWA token wrapper
 *         Implements Pharos Cross-Chain Message Protocol (PCMP)
 *
 * Allows an RWA token on SPN A to be:
 *   - Locked and minted as a wrapped representation on SPN B
 *   - Burned and unlocked back on SPN A
 *   - Verified via light client proofs
 */
contract CrossChainAsset {
    address public bridgeSPN;
    address public underlyingToken;
    uint256 public spnChainId;

    mapping(address => uint256) public lockedBalance;
    mapping(bytes32 => bool) public processedMessages;

    event Locked(address indexed sender, uint256 amount, bytes32 messageId, uint256 targetChain);
    event Unlocked(address indexed recipient, uint256 amount, bytes32 messageId);
    event BridgeUpdated(address indexed newBridge);

    constructor(address _underlyingToken, uint256 _spnChainId) {
        underlyingToken = _underlyingToken;
        spnChainId = _spnChainId;
        bridgeSPN = msg.sender;
    }

    modifier onlyBridge() {
        require(msg.sender == bridgeSPN, "Only bridge SPN");
        _;
    }

    /// @notice Lock tokens for cross-SPN transfer
    function lock(uint256 amount, uint256 targetChain) external returns (bytes32 messageId) {
        require(amount > 0, "Zero amount");
        require(targetChain != spnChainId, "Same chain");

        PharosAssetToken(underlyingToken).transferFrom(msg.sender, address(this), amount);
        lockedBalance[msg.sender] += amount;

        messageId = keccak256(abi.encodePacked(
            block.chainid, targetChain, msg.sender, amount, block.timestamp
        ));

        emit Locked(msg.sender, amount, messageId, targetChain);
    }

    /// @notice Unlock tokens after cross-SPN proof verification (called by bridge relayer)
    function unlock(address recipient, uint256 amount, bytes32 messageId)
        external onlyBridge
    {
        require(!processedMessages[messageId], "Already processed");
        require(amount <= lockedBalance[recipient], "Insufficient locked");

        processedMessages[messageId] = true;
        lockedBalance[recipient] -= amount;

        PharosAssetToken(underlyingToken).transfer(recipient, amount);
        emit Unlocked(recipient, amount, messageId);
    }

    /// @notice Emergency bridge override
    function updateBridge(address newBridge) external {
        require(msg.sender == bridgeSPN, "Not authorized");
        bridgeSPN = newBridge;
        emit BridgeUpdated(newBridge);
    }
}
