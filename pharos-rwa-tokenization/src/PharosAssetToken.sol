// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PharosAssetToken
 * @notice ERC-3643-style permissioned token for Pharos RWA
 *         Compatible with Pharos compliance module (ZK-KYC)
 *
 * Features:
 *   - Permissioned transfers (whitelist via ZK-KYC)
 *   - Role-based mint/burn (issuer, redeemer)
 *   - Pausable for regulatory holds
 *   - Identity registry integration
 */
contract PharosAssetToken is ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REDEEMER_ROLE = keccak256("REDEEMER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    /// @notice Asset metadata — onchain RWA representation
    string public assetClass;       // e.g. "RealEstate", "TreasuryBill", "Commodity"
    string public jurisdiction;     // ISO country code
    uint256 public assetValue;      // Total underlying value in USD (wei equivalent)
    string public tokenURI;         // Off-chain document hash / IPFS URI

    /// @notice Compliance contract address (ZK-KYC module)
    address public complianceModule;

    /// @notice Identity registry — maps address => verified identity hash
    mapping(address => bytes32) public identityRegistry;

    // ── Events ─────────────────────────────────────────────────────
    event IdentityVerified(address indexed account, bytes32 identityHash);
    event ComplianceUpdated(address indexed newModule);
    event AssetValueUpdated(uint256 newValue);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory assetClass_,
        string memory jurisdiction_,
        uint256 assetValue_,
        string memory tokenURI_,
        address issuer_,
        address complianceModule_
    ) ERC20(name_, symbol_) {
        assetClass = assetClass_;
        jurisdiction = jurisdiction_;
        assetValue = assetValue_;
        tokenURI = tokenURI_;
        complianceModule = complianceModule_;

        _grantRole(DEFAULT_ADMIN_ROLE, issuer_);
        _grantRole(ISSUER_ROLE, issuer_);
        _grantRole(COMPLIANCE_ROLE, issuer_);

        // Issuer gets initial supply (equal to asset value)
        _mint(issuer_, assetValue_);
    }

    // ── Compliance / Identity ──────────────────────────────────────

    function verifyIdentity(address account, bytes32 identityHash)
        external onlyRole(COMPLIANCE_ROLE)
    {
        require(identityRegistry[account] == bytes32(0), "Already verified");
        identityRegistry[account] = identityHash;
        emit IdentityVerified(account, identityHash);
    }

    function revokeIdentity(address account)
        external onlyRole(COMPLIANCE_ROLE)
    {
        require(identityRegistry[account] != bytes32(0), "Not verified");
        delete identityRegistry[account];
    }

    function isVerified(address account) public view returns (bool) {
        return identityRegistry[account] != bytes32(0);
    }

    // ── Override transfers with compliance check ───────────────────

    function _update(address from, address to, uint256 amount)
        internal override whenNotPaused
    {
        // Mint/burn skip checks
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        // Both parties must be verified
        require(isVerified(from) && isVerified(to), "Not KYC verified");

        // Forward to compliance module if configured
        if (complianceModule != address(0)) {
            (bool ok, ) = complianceModule.staticcall(
                abi.encodeWithSignature("verifyTransfer(address,address,uint256)", from, to, amount)
            );
            require(ok, "Compliance rejected");
        }

        super._update(from, to, amount);
    }

    // ── Admin ──────────────────────────────────────────────────────

    function setComplianceModule(address module)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        complianceModule = module;
        emit ComplianceUpdated(module);
    }

    function updateAssetValue(uint256 newValue)
        external onlyRole(ISSUER_ROLE)
    {
        assetValue = newValue;
        emit AssetValueUpdated(newValue);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ── Fund flow ──────────────────────────────────────────────────

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public virtual override onlyRole(REDEEMER_ROLE) {
        _burn(account, amount);
    }

    // ── ERC-165 / Interface support ───────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override returns (bool)
    {
        return interfaceId == type(IAccessControl).interfaceId ||
               super.supportsInterface(interfaceId);
    }
}
