// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {InEuint128} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";

/**
 * @title SpectreToken (FHERC20)
 * @notice Privacy-preserving ERC20 token using Fhenix CoFHE
 * @dev All balances and transfers are encrypted - true on-chain privacy
 * 
 * FHERC20 Features:
 * - Encrypted balances (euint128)
 * - Encrypted transfers (amount never revealed on-chain)
 * - Encrypted allowances for DEX compatibility
 * - CoFHE async decryption for ETH redemption
 */
contract SpectreToken {
    // ============ Token Metadata ============
    string public constant name = "Spectre Encrypted ETH";
    string public constant symbol = "seETH";
    uint8 public constant decimals = 18;
    
    // ============ Encrypted State ============
    // All balances stored as encrypted values - no one can see holdings
    mapping(address => euint128) private _balances;
    mapping(address => bool) private _hasBalance;
    
    // Encrypted allowances for DEX/transfers
    mapping(address => mapping(address => euint128)) private _allowances;
    
    // Total supply (encrypted for full privacy)
    euint128 private _totalSupply;
    
    // Constants
    euint128 private ENCRYPTED_ZERO;
    
    // ============ Withdrawal State ============
    struct WithdrawalRequest {
        euint128 amount;
        bool pending;
    }
    mapping(address => WithdrawalRequest) private _withdrawals;
    
    // ============ Public Stats (optional - can remove for full privacy) ============
    uint256 public totalValueLocked; // Only for UI display
    
    // ============ Events ============
    // Note: Events don't reveal amounts - only that actions occurred
    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event Mint(address indexed to);
    event Burn(address indexed from);
    event WithdrawalRequested(address indexed user);
    event WithdrawalClaimed(address indexed user);
    
    // ============ Constructor ============
    constructor() {
        ENCRYPTED_ZERO = FHE.asEuint128(0);
        _totalSupply = ENCRYPTED_ZERO;
        FHE.allowThis(ENCRYPTED_ZERO);
        FHE.allowThis(_totalSupply);
    }
    
    // ============ FHERC20 Core Functions ============
    
    /**
     * @notice Get encrypted balance (only owner can decrypt)
     * @param account The address to query
     * @return Encrypted balance (euint128)
     */
    function balanceOf(address account) external view returns (euint128) {
        return _balances[account];
    }
    
    /**
     * @notice Get encrypted total supply
     * @return Encrypted total supply (euint128)
     */
    function totalSupply() external view returns (euint128) {
        return _totalSupply;
    }
    
    /**
     * @notice Transfer encrypted amount to another address
     * @dev Amount is NEVER revealed on-chain - true privacy!
     * @param to Recipient address
     * @param encryptedAmount Encrypted amount to transfer (from client-side encryption)
     */
    function transfer(address to, InEuint128 calldata encryptedAmount) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_hasBalance[msg.sender], "No balance");
        
        euint128 amount = FHE.asEuint128(encryptedAmount);
        
        // Check sufficient balance (encrypted comparison)
        ebool sufficientBalance = FHE.gte(_balances[msg.sender], amount);
        
        // Use select to prevent transfer if insufficient (without revealing)
        euint128 actualAmount = FHE.select(sufficientBalance, amount, ENCRYPTED_ZERO);
        
        // Update balances
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], actualAmount);
        
        if (_hasBalance[to]) {
            _balances[to] = FHE.add(_balances[to], actualAmount);
        } else {
            _balances[to] = actualAmount;
            _hasBalance[to] = true;
        }
        
        // Set permissions
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
        
        emit Transfer(msg.sender, to);
        return true;
    }
    
    /**
     * @notice Transfer using plaintext amount (simpler for testing)
     * @param to Recipient address
     * @param amount Plaintext amount (will be encrypted internally)
     */
    function transferPlain(address to, uint128 amount) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_hasBalance[msg.sender], "No balance");
        
        euint128 encAmount = FHE.asEuint128(amount);
        
        // Check sufficient balance (encrypted comparison)
        ebool sufficientBalance = FHE.gte(_balances[msg.sender], encAmount);
        
        // Use select to prevent transfer if insufficient (without revealing)
        euint128 actualAmount = FHE.select(sufficientBalance, encAmount, ENCRYPTED_ZERO);
        
        // Update balances
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], actualAmount);
        
        if (_hasBalance[to]) {
            _balances[to] = FHE.add(_balances[to], actualAmount);
        } else {
            _balances[to] = actualAmount;
            _hasBalance[to] = true;
        }
        
        // Set permissions
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
        
        emit Transfer(msg.sender, to);
        return true;
    }
    
    /**
     * @notice Transfer from another address (requires allowance)
     * @param from Source address
     * @param to Destination address
     * @param encryptedAmount Encrypted amount
     */
    function transferFrom(
        address from,
        address to,
        InEuint128 calldata encryptedAmount
    ) external returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_hasBalance[from], "No balance");
        
        euint128 amount = FHE.asEuint128(encryptedAmount);
        
        // Check allowance (encrypted)
        ebool hasAllowance = FHE.gte(_allowances[from][msg.sender], amount);
        // Check balance (encrypted)
        ebool sufficientBalance = FHE.gte(_balances[from], amount);
        // Both must be true
        ebool canTransfer = FHE.and(hasAllowance, sufficientBalance);
        
        // Only transfer if both conditions met
        euint128 actualAmount = FHE.select(canTransfer, amount, ENCRYPTED_ZERO);
        
        // Update allowance
        _allowances[from][msg.sender] = FHE.sub(_allowances[from][msg.sender], actualAmount);
        
        // Update balances
        _balances[from] = FHE.sub(_balances[from], actualAmount);
        
        if (_hasBalance[to]) {
            _balances[to] = FHE.add(_balances[to], actualAmount);
        } else {
            _balances[to] = actualAmount;
            _hasBalance[to] = true;
        }
        
        // Set permissions
        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
        FHE.allowThis(_allowances[from][msg.sender]);
        FHE.allow(_allowances[from][msg.sender], from);
        FHE.allowSender(_allowances[from][msg.sender]);
        
        emit Transfer(from, to);
        return true;
    }
    
    /**
     * @notice Approve spender to use encrypted amount
     * @param spender Address allowed to spend
     * @param encryptedAmount Encrypted allowance amount
     */
    function approve(address spender, InEuint128 calldata encryptedAmount) external returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        euint128 amount = FHE.asEuint128(encryptedAmount);
        _allowances[msg.sender][spender] = amount;
        
        FHE.allowThis(_allowances[msg.sender][spender]);
        FHE.allowSender(_allowances[msg.sender][spender]);
        FHE.allow(_allowances[msg.sender][spender], spender);
        
        emit Approval(msg.sender, spender);
        return true;
    }
    
    /**
     * @notice Approve using plaintext amount (simpler for testing)
     */
    function approvePlain(address spender, uint128 amount) external returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        euint128 encAmount = FHE.asEuint128(amount);
        _allowances[msg.sender][spender] = encAmount;
        
        FHE.allowThis(_allowances[msg.sender][spender]);
        FHE.allowSender(_allowances[msg.sender][spender]);
        FHE.allow(_allowances[msg.sender][spender], spender);
        
        emit Approval(msg.sender, spender);
        return true;
    }
    
    /**
     * @notice Get encrypted allowance
     */
    function allowance(address owner, address spender) external view returns (euint128) {
        return _allowances[owner][spender];
    }
    
    // ============ Mint/Burn (ETH <-> seETH) ============
    
    /**
     * @notice Deposit ETH and receive encrypted seETH
     * @dev The ETH amount IS visible, but your seETH balance remains encrypted
     * @dev After this, all transfers of seETH are fully private
     */
    function mint() external payable {
        require(msg.value > 0, "Must deposit ETH");
        
        euint128 amount = FHE.asEuint128(uint128(msg.value));
        
        if (_hasBalance[msg.sender]) {
            _balances[msg.sender] = FHE.add(_balances[msg.sender], amount);
        } else {
            _balances[msg.sender] = amount;
            _hasBalance[msg.sender] = true;
        }
        
        _totalSupply = FHE.add(_totalSupply, amount);
        totalValueLocked += msg.value;
        
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_totalSupply);
        
        emit Mint(msg.sender);
    }
    
    /**
     * @notice Request to burn seETH and receive ETH using encrypted amount
     * @dev Uses encrypted amount - withdrawal amount stays private until claim
     * @param encryptedAmount Encrypted amount to burn (from cofhejs)
     */
    function requestBurn(InEuint128 calldata encryptedAmount) external {
        require(_hasBalance[msg.sender], "No balance");
        require(!_withdrawals[msg.sender].pending, "Withdrawal pending");
        
        euint128 amount = FHE.asEuint128(encryptedAmount);
        
        // Check sufficient balance
        ebool sufficientBalance = FHE.gte(_balances[msg.sender], amount);
        euint128 actualAmount = FHE.select(sufficientBalance, amount, _balances[msg.sender]);
        
        // Store withdrawal request
        _withdrawals[msg.sender] = WithdrawalRequest({
            amount: actualAmount,
            pending: true
        });
        
        // Deduct from balance
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], actualAmount);
        _totalSupply = FHE.sub(_totalSupply, actualAmount);
        
        // Permissions
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_withdrawals[msg.sender].amount);
        FHE.allowSender(_withdrawals[msg.sender].amount);
        FHE.allowThis(_totalSupply);
        
        // Trigger CoFHE decryption
        FHE.decrypt(actualAmount);
        
        emit WithdrawalRequested(msg.sender);
        emit Burn(msg.sender);
    }
    
    /**
     * @notice Request to burn using plaintext amount (simpler)
     * @param amount Plaintext amount to burn
     */
    function requestBurnPlain(uint128 amount) external {
        require(_hasBalance[msg.sender], "No balance");
        require(!_withdrawals[msg.sender].pending, "Withdrawal pending");
        require(amount > 0, "Amount must be > 0");
        
        euint128 encAmount = FHE.asEuint128(amount);
        
        // Check sufficient balance
        ebool sufficientBalance = FHE.gte(_balances[msg.sender], encAmount);
        euint128 actualAmount = FHE.select(sufficientBalance, encAmount, _balances[msg.sender]);
        
        // Store withdrawal request
        _withdrawals[msg.sender] = WithdrawalRequest({
            amount: actualAmount,
            pending: true
        });
        
        // Deduct from balance
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], actualAmount);
        _totalSupply = FHE.sub(_totalSupply, actualAmount);
        
        // Permissions
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_withdrawals[msg.sender].amount);
        FHE.allowSender(_withdrawals[msg.sender].amount);
        FHE.allowThis(_totalSupply);
        
        // Trigger CoFHE decryption
        FHE.decrypt(actualAmount);
        
        emit WithdrawalRequested(msg.sender);
        emit Burn(msg.sender);
    }
    
    /**
     * @notice Request to burn ALL seETH balance
     */
    function requestBurnAll() external {
        require(_hasBalance[msg.sender], "No balance");
        require(!_withdrawals[msg.sender].pending, "Withdrawal pending");
        
        euint128 amount = _balances[msg.sender];
        
        _withdrawals[msg.sender] = WithdrawalRequest({
            amount: amount,
            pending: true
        });
        
        _balances[msg.sender] = ENCRYPTED_ZERO;
        _totalSupply = FHE.sub(_totalSupply, amount);
        
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.allowThis(_withdrawals[msg.sender].amount);
        FHE.allowSender(_withdrawals[msg.sender].amount);
        FHE.allowThis(_totalSupply);
        
        FHE.decrypt(amount);
        
        emit WithdrawalRequested(msg.sender);
        emit Burn(msg.sender);
    }
    
    /**
     * @notice Check if withdrawal is ready (CoFHE decryption complete)
     */
    function isWithdrawalReady() external view returns (bool) {
        if (!_withdrawals[msg.sender].pending) return false;
        (, bool decrypted) = FHE.getDecryptResultSafe(_withdrawals[msg.sender].amount);
        return decrypted;
    }
    
    /**
     * @notice Check if user has pending withdrawal
     */
    function hasPendingWithdrawal() external view returns (bool) {
        return _withdrawals[msg.sender].pending;
    }
    
    /**
     * @notice Claim ETH after CoFHE decryption completes
     */
    function claimETH() external {
        require(_withdrawals[msg.sender].pending, "No withdrawal pending");
        
        (uint256 amount, bool decrypted) = FHE.getDecryptResultSafe(_withdrawals[msg.sender].amount);
        require(decrypted, "CoFHE decryption not ready");
        
        // Clear withdrawal
        _withdrawals[msg.sender].pending = false;
        _withdrawals[msg.sender].amount = ENCRYPTED_ZERO;
        FHE.allowThis(_withdrawals[msg.sender].amount);
        
        // Transfer ETH
        if (amount > 0 && amount <= totalValueLocked) {
            totalValueLocked -= amount;
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "ETH transfer failed");
        }
        
        emit WithdrawalClaimed(msg.sender);
    }
    
    // ============ Balance Viewing (User Only) ============
    
    /**
     * @notice Request decryption of your own balance
     * @dev Only the owner can view their decrypted balance
     */
    function requestBalanceDecryption() external {
        require(_hasBalance[msg.sender], "No balance");
        // Ensure caller has permission to decrypt their own balance
        FHE.allowThis(_balances[msg.sender]);
        FHE.allowSender(_balances[msg.sender]);
        FHE.decrypt(_balances[msg.sender]);
    }
    
    /**
     * @notice Get decrypted balance (after decryption completes)
     */
    function getDecryptedBalance() external view returns (uint256 amount, bool isReady) {
        if (!_hasBalance[msg.sender]) {
            return (0, true);
        }
        return FHE.getDecryptResultSafe(_balances[msg.sender]);
    }
    
    /**
     * @notice Check if user has any balance
     */
    function userHasBalance() external view returns (bool) {
        return _hasBalance[msg.sender];
    }
    
    /**
     * @notice Check if an address has balance (view only, no amount revealed)
     */
    function addressHasBalance(address account) external view returns (bool) {
        return _hasBalance[account];
    }
    
    // ============ Receive ETH ============
    receive() external payable {
        // Direct ETH goes to TVL but doesn't mint tokens
        totalValueLocked += msg.value;
    }
}
