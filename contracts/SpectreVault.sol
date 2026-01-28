// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title SpectreVault
 * @notice Privacy-preserving vault using Fully Homomorphic Encryption (FHE)
 * @dev Allows users to deposit ETH, hold encrypted balances (eETH), and transact privately
 * 
 * Key FHE Patterns Used:
 * - euint128 for encrypted balances (supports 18 decimal ETH)
 * - ENCRYPTED_ZERO constant for gas optimization
 * - FHE.select() for no-branching conditional logic
 * - Two-step async withdrawal (request -> claim)
 * - Proper access control with FHE.allowThis() and FHE.allowSender()
 */
contract SpectreVault {
    // ============ State Variables ============
    
    /// @notice Gas-optimized encrypted zero constant
    euint128 private ENCRYPTED_ZERO;
    
    /// @notice Encrypted balances for each user
    mapping(address => euint128) private balances;
    
    /// @notice Track if user has data stored
    mapping(address => bool) public hasBalance;
    
    /// @notice Withdrawal requests - stores the encrypted amount to withdraw
    mapping(address => euint128) private withdrawRequests;
    
    /// @notice Track if user has pending withdrawal
    mapping(address => bool) public withdrawRequested;
    
    /// @notice Total value locked (plaintext for transparency)
    uint256 public totalValueLocked;
    
    // ============ Events ============
    
    event Deposited(address indexed user, uint256 amount);
    event TransferInitiated(address indexed from, address indexed to);
    event WithdrawalRequested(address indexed user);
    event WithdrawalClaimed(address indexed user, uint256 amount);
    
    // ============ Constructor ============
    
    constructor() {
        // Initialize encrypted zero constant
        // This saves gas by avoiding repeated FHE.asEuint128(0) calls
        ENCRYPTED_ZERO = FHE.asEuint128(0);
        FHE.allowThis(ENCRYPTED_ZERO);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Deposit ETH and receive encrypted eETH balance
     * @dev Converts plaintext ETH to encrypted euint128 balance
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit non-zero amount");
        
        // Convert plaintext amount to encrypted
        euint128 encryptedAmount = FHE.asEuint128(msg.value);
        
        if (hasBalance[msg.sender]) {
            // Add to existing balance
            balances[msg.sender] = FHE.add(balances[msg.sender], encryptedAmount);
        } else {
            // First deposit - set initial balance
            balances[msg.sender] = encryptedAmount;
            hasBalance[msg.sender] = true;
        }
        
        // CRITICAL: Grant access permissions
        FHE.allowThis(balances[msg.sender]);   // Contract needs access for future operations
        FHE.allowSender(balances[msg.sender]); // User needs access to view/decrypt
        
        // Update TVL
        totalValueLocked += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Transfer encrypted balance to another user
     * @dev Uses FHE.select() for no-branching logic - if insufficient balance,
     *      the transfer amount becomes 0 (indistinguishable from successful tx)
     * @param to Recipient address
     * @param amount Encrypted amount to transfer (InEuint128)
     */
    function transfer(address to, InEuint128 calldata amount) external {
        require(hasBalance[msg.sender], "No balance");
        require(to != address(0), "Invalid recipient");
        require(to != msg.sender, "Cannot transfer to self");
        
        // Convert input to internal encrypted type
        euint128 encAmount = FHE.asEuint128(amount);
        
        // Check if sender has sufficient balance (returns encrypted bool)
        ebool canTransfer = FHE.gte(balances[msg.sender], encAmount);
        
        // NO-BRANCHING LOGIC: If insufficient balance, transfer 0 instead
        // This makes failed transfers indistinguishable from successful ones
        euint128 actualTransfer = FHE.select(
            canTransfer,
            encAmount,        // Transfer requested amount if sufficient
            ENCRYPTED_ZERO    // Transfer 0 if insufficient
        );
        
        // Deduct from sender
        balances[msg.sender] = FHE.sub(balances[msg.sender], actualTransfer);
        
        // Add to recipient
        if (hasBalance[to]) {
            balances[to] = FHE.add(balances[to], actualTransfer);
        } else {
            balances[to] = actualTransfer;
            hasBalance[to] = true;
        }
        
        // CRITICAL: Update access permissions for both parties
        FHE.allowThis(balances[msg.sender]);
        FHE.allowSender(balances[msg.sender]);
        FHE.allowThis(balances[to]);
        FHE.allow(balances[to], to);
        
        emit TransferInitiated(msg.sender, to);
    }
    
    /**
     * @notice Request withdrawal of encrypted balance
     * @dev Step 1 of async withdrawal - triggers decryption process
     * @param amount Encrypted amount to withdraw (InEuint128)
     */
    function requestWithdraw(InEuint128 calldata amount) external {
        require(hasBalance[msg.sender], "No balance");
        require(!withdrawRequested[msg.sender], "Withdrawal already pending");
        
        euint128 encAmount = FHE.asEuint128(amount);
        
        // Check sufficient balance
        ebool canWithdraw = FHE.gte(balances[msg.sender], encAmount);
        
        // Use select to set actual withdrawal amount (0 if insufficient)
        euint128 actualWithdraw = FHE.select(
            canWithdraw,
            encAmount,
            ENCRYPTED_ZERO
        );
        
        // Deduct from balance immediately (prevents double-spend)
        balances[msg.sender] = FHE.sub(balances[msg.sender], actualWithdraw);
        
        // Store withdrawal request
        withdrawRequests[msg.sender] = actualWithdraw;
        withdrawRequested[msg.sender] = true;
        
        // Grant permissions
        FHE.allowThis(balances[msg.sender]);
        FHE.allowSender(balances[msg.sender]);
        FHE.allowThis(withdrawRequests[msg.sender]);
        FHE.allowSender(withdrawRequests[msg.sender]);
        
        // Trigger decryption process
        FHE.decrypt(actualWithdraw);
        
        emit WithdrawalRequested(msg.sender);
    }
    
    /**
     * @notice Request withdrawal of ENTIRE balance (simplified version)
     * @dev For testing - withdraws full balance without requiring encrypted input
     */
    function requestWithdrawAll() external {
        require(hasBalance[msg.sender], "No balance");
        require(!withdrawRequested[msg.sender], "Withdrawal already pending");
        
        // Get full balance
        euint128 fullBalance = balances[msg.sender];
        
        // Set balance to zero
        balances[msg.sender] = ENCRYPTED_ZERO;
        
        // Store withdrawal request (the full balance)
        withdrawRequests[msg.sender] = fullBalance;
        withdrawRequested[msg.sender] = true;
        
        // Grant permissions
        FHE.allowThis(balances[msg.sender]);
        FHE.allowSender(balances[msg.sender]);
        FHE.allowThis(withdrawRequests[msg.sender]);
        FHE.allowSender(withdrawRequests[msg.sender]);
        
        // Trigger decryption process
        FHE.decrypt(fullBalance);
        
        emit WithdrawalRequested(msg.sender);
    }
    
    /**
     * @notice Claim pending withdrawal after decryption completes
     * @dev Step 2 of async withdrawal - retrieves decrypted amount and sends ETH
     */
    function claimWithdraw() external {
        require(withdrawRequested[msg.sender], "No withdrawal pending");
        
        euint128 encryptedAmount = withdrawRequests[msg.sender];
        
        // Try to get decrypted result (will revert if not ready)
        (uint128 decryptedAmount, bool isDecrypted) = FHE.getDecryptResultSafe(encryptedAmount);
        require(isDecrypted, "Decryption not complete");
        
        // Clear withdrawal request
        withdrawRequested[msg.sender] = false;
        withdrawRequests[msg.sender] = ENCRYPTED_ZERO;
        
        // Clear hasBalance if balance is zero
        // Note: We can't check encrypted balance directly, but after full withdrawal it's ENCRYPTED_ZERO
        
        // Only send if amount > 0
        if (decryptedAmount > 0) {
            totalValueLocked -= decryptedAmount;
            
            // Send ETH to user
            (bool success, ) = payable(msg.sender).call{value: decryptedAmount}("");
            require(success, "ETH transfer failed");
        }
        
        emit WithdrawalClaimed(msg.sender, decryptedAmount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get encrypted balance of caller
     * @dev Returns encrypted value - user needs to decrypt off-chain
     * @return Encrypted balance (euint128)
     */
    function getBalance() external view returns (euint128) {
        require(hasBalance[msg.sender], "No balance");
        return balances[msg.sender];
    }
    
    /**
     * @notice Get encrypted balance of specific user (requires permission)
     * @param user Address to check
     * @return Encrypted balance (euint128)
     */
    function getBalanceOf(address user) external view returns (euint128) {
        require(hasBalance[user], "No balance");
        return balances[user];
    }
    
    /**
     * @notice Check if caller has a pending withdrawal
     * @return True if withdrawal is pending
     */
    function hasPendingWithdrawal() external view returns (bool) {
        return withdrawRequested[msg.sender];
    }
    
    /**
     * @notice Get pending withdrawal amount (encrypted)
     * @return Encrypted withdrawal amount
     */
    function getPendingWithdrawal() external view returns (euint128) {
        require(withdrawRequested[msg.sender], "No pending withdrawal");
        return withdrawRequests[msg.sender];
    }
    
    /**
     * @notice Check if decryption is ready for withdrawal
     * @return True if decryption complete, false otherwise
     */
    function isWithdrawalReady() external view returns (bool) {
        if (!withdrawRequested[msg.sender]) return false;
        
        (, bool isDecrypted) = FHE.getDecryptResultSafe(withdrawRequests[msg.sender]);
        return isDecrypted;
    }
    
    /**
     * @notice Force claim withdrawal (TESTNET ONLY - bypasses FHE decryption check)
     * @dev Use this on testnets without real CoFHE coprocessor
     * @param amount The amount to withdraw (must match what was deposited)
     */
    function forceClaimWithdraw(uint128 amount) external {
        require(withdrawRequested[msg.sender], "No withdrawal pending");
        
        // Clear withdrawal request
        withdrawRequested[msg.sender] = false;
        withdrawRequests[msg.sender] = ENCRYPTED_ZERO;
        
        // Only send if amount > 0
        if (amount > 0) {
            require(amount <= totalValueLocked, "Amount exceeds TVL");
            totalValueLocked -= amount;
            
            // Send ETH to user
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "ETH transfer failed");
        }
        
        emit WithdrawalClaimed(msg.sender, amount);
    }
    
    // ============ Receive Function ============
    
    /// @notice Allow direct ETH deposits
    receive() external payable {
        // Convert to deposit
        euint128 encryptedAmount = FHE.asEuint128(msg.value);
        
        if (hasBalance[msg.sender]) {
            balances[msg.sender] = FHE.add(balances[msg.sender], encryptedAmount);
        } else {
            balances[msg.sender] = encryptedAmount;
            hasBalance[msg.sender] = true;
        }
        
        FHE.allowThis(balances[msg.sender]);
        FHE.allowSender(balances[msg.sender]);
        
        totalValueLocked += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }
}
