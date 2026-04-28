// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IComplianceModule
 * @notice Interface for ZK-KYC compliance checks on Pharos SPN
 *         Integrates with Pharos's native ZK-KYC/AML modules
 */
interface IComplianceModule {
    /// @notice Verify a transfer between two parties
    /// @return allowed true if transfer is compliant
    function verifyTransfer(address from, address to, uint256 amount) external view returns (bool);

    /// @notice Register an identity proof (from KYC provider)
    /// @return identityHash unique identifier
    function registerIdentity(bytes calldata zkProof, bytes32 identityHash) external returns (bool);

    /// @notice Check if an address has valid KYC
    function isKycPassed(address account) external view returns (bool);

    /// @notice Get jurisdiction for an address
    function getJurisdiction(address account) external view returns (string memory);

    /// @notice Daily transfer limit for non-accredited investors
    function dailyLimit(address account) external view returns (uint256);
}
