// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DistributionModule
 * @notice Manages yield/income distribution for RWA tokens on Pharos
 *
 * Supports:
 *   - Periodic yield payout (daily, weekly, monthly)
 *   - Proportional distribution based on token holdings
 *   - Dividend accrual for off-cycle claims
 */
contract DistributionModule is AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IYieldToken public assetToken;
    uint256 public distributionInterval;
    uint256 public lastDistribution;
    uint256 public totalAccruedYield;

    mapping(address => uint256) public pendingClaims;
    mapping(uint256 => Distribution) public distributions;

    struct Distribution {
        uint256 amount;
        uint256 timestamp;
        uint256 totalSupply;
        uint256 claimed;
    }

    uint256 public distributionCount;

    event Distributed(uint256 indexed id, uint256 amount, uint256 timestamp);
    event Claimed(address indexed account, uint256 amount, uint256 distributionId);
    event YieldDeposited(uint256 amount);

    constructor(address _assetToken, uint256 _interval) {
        assetToken = IYieldToken(_assetToken);
        distributionInterval = _interval;
        lastDistribution = block.timestamp;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /// @notice Deposit yield to be distributed
    function depositYield() external payable {
        totalAccruedYield += msg.value;
        emit YieldDeposited(msg.value);
    }

    /// @notice Trigger distribution to all token holders
    function distribute() external onlyRole(DISTRIBUTOR_ROLE) {
        require(block.timestamp >= lastDistribution + distributionInterval, "Too early");
        require(totalAccruedYield > 0, "No yield");

        uint256 totalSupply = assetToken.totalSupply();
        require(totalSupply > 0, "No holders");

        distributionCount++;
        distributions[distributionCount] = Distribution({
            amount: totalAccruedYield,
            timestamp: block.timestamp,
            totalSupply: totalSupply,
            claimed: 0
        });

        emit Distributed(distributionCount, totalAccruedYield, block.timestamp);

        totalAccruedYield = 0;
        lastDistribution = block.timestamp;
    }

    /// @notice Claim yield for a specific distribution
    function claim(uint256 distributionId) external {
        Distribution storage dist = distributions[distributionId];
        require(dist.amount > 0, "No distribution");

        uint256 balance = assetToken.balanceOf(msg.sender);
        require(balance > 0, "No tokens");

        uint256 share = (dist.amount * balance) / dist.totalSupply;
        require(share > 0, "Nothing to claim");

        dist.claimed += share;
        (bool ok, ) = payable(msg.sender).call{value: share}("");
        require(ok, "Transfer failed");

        emit Claimed(msg.sender, share, distributionId);
    }

    /// @notice Batch claim all unclaimed distributions
    function claimAll() external {
        uint256 total;
        for (uint256 i = 1; i <= distributionCount; i++) {
            Distribution storage dist = distributions[i];
            if (dist.claimed >= dist.amount) continue;

            uint256 balance = assetToken.balanceOf(msg.sender);
            uint256 share = (dist.amount * balance) / dist.totalSupply;
            if (share > 0) {
                dist.claimed += share;
                total += share;
                emit Claimed(msg.sender, share, i);
            }
        }
        require(total > 0, "Nothing to claim");
        (bool ok, ) = payable(msg.sender).call{value: total}("");
        require(ok, "Transfer failed");
    }
}

interface IYieldToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
}
