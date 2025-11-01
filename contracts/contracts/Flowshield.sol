// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Flowshield {
    // Operator (relayer) address
    address public operator;

    // Token used by this mixer instance
    IERC20 public immutable token;

    // Reentrancy guard
    bool private locked;

    // Events
    event DepositEvent(bytes32 indexed commitment, uint256 amount);
    event WithdrawEvent(address indexed recipient, uint256 amount);
    event PoolCreatedEvent(uint256 indexed denomination, string label);

    // Pool data
    struct Pool {
        uint256 balance;
        bool exists;
        string label;
        // mapping for commitments deposited in this pool
        mapping(bytes32 => bool) deposits;
    }

    // Mapping denomination => Pool
    mapping(uint256 => Pool) private pools;

    // Mapping to track secrets/commitments already used
    mapping(bytes32 => bool) public usedSecrets;

    modifier onlyOperator() {
        require(msg.sender == operator, "NOT_OPERATOR");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "REENTRANT");
        locked = true;
        _;
        locked = false;
    }

    /// @param tokenAddress ERC20 token address (this mixer instance operates on a single token)
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "ZERO_TOKEN");
        operator = msg.sender;
        token = IERC20(tokenAddress);
    }

    /// @notice Create a pool for a specific denomination (only operator)
    /// @param denomination The fixed denomination for the pool (token units)
    /// @param label A human readable label for the pool
    function addPool(uint256 denomination, string calldata label) external onlyOperator {
        Pool storage p = pools[denomination];
        require(!p.exists, "POOL_DENOMINATION_EXISTS");
        p.exists = true;
        p.label = label;
        p.balance = 0;
        emit PoolCreatedEvent(denomination, label);
    }

    /// @notice Deposit a denomination-sized amount into the pool, registering a commitment
    /// @param commitment A commitment (secret hash). Typically bytes32.
    /// @param denomination The pool denomination to deposit (and the amount to transfer)
    /// @dev Caller must have approved this contract to transfer `denomination` tokens.
    function deposit(bytes32 commitment, uint256 denomination) external {
        Pool storage p = pools[denomination];
        require(p.exists, "POOL_NOT_FOUND");
        require(!p.deposits[commitment], "DEPOSIT_ALREADY_EXISTS");

        // Pull tokens from depositor
        require(token.transferFrom(msg.sender, address(this), denomination), "TRANSFER_FROM_FAILED");

        // Mark deposit and increase pool balance
        p.deposits[commitment] = true;
        p.balance += denomination;

        emit DepositEvent(commitment, denomination);
    }

    /// @notice User withdraws directly to their own address using their secret/commitment
    /// @param commitment The commitment proving ownership
    /// @param denomination Pool denomination to withdraw
    function withdrawDirect(bytes32 commitment, uint256 denomination) external nonReentrant {
        Pool storage p = pools[denomination];
        require(p.exists, "POOL_NOT_FOUND");
        require(!usedSecrets[commitment], "SECRET_ALREADY_USED");
        require(p.deposits[commitment], "DEPOSIT_NOT_FOUND");

        // Mark secret used and remove deposit
        usedSecrets[commitment] = true;
        p.deposits[commitment] = false;

        // Update balance before external call
        require(p.balance >= denomination, "INSUFFICIENT_POOL_BALANCE");
        p.balance -= denomination;

        // Transfer tokens to caller
        require(token.transfer(msg.sender, denomination), "TRANSFER_FAILED");

        emit WithdrawEvent(msg.sender, denomination);
    }

    /// @notice Relayer/Operator submits a withdrawal on behalf of a user.
    /// Operator (contract operator) receives 2% fee, recipient receives 98%.
    /// @param commitment Commitment proving ownership
    /// @param denomination Pool denomination to withdraw
    /// @param recipient Address to receive the user portion
    function withdrawViaRelayer(
        bytes32 commitment,
        uint256 denomination,
        address recipient
    ) external nonReentrant {
        Pool storage p = pools[denomination];
        require(p.exists, "POOL_NOT_FOUND");
        require(!usedSecrets[commitment], "SECRET_ALREADY_USED");
        require(p.deposits[commitment], "DEPOSIT_NOT_FOUND");
        require(recipient != address(0), "INVALID_RECIPIENT");

        // Mark secret used and remove deposit
        usedSecrets[commitment] = true;
        p.deposits[commitment] = false;

        require(p.balance >= denomination, "INSUFFICIENT_POOL_BALANCE");
        p.balance -= denomination;

        uint256 fee = denomination / 50; // 2%
        uint256 userAmount = denomination - fee;

        // Transfer to recipient and operator
        require(token.transfer(recipient, userAmount), "TRANSFER_TO_RECIPIENT_FAILED");
        require(token.transfer(operator, fee), "TRANSFER_TO_OPERATOR_FAILED");

        emit WithdrawEvent(recipient, userAmount);
    }

    /// @notice Query whether a pool exists for a denomination
    function poolExists(uint256 denomination) external view returns (bool) {
        return pools[denomination].exists;
    }

    /// @notice View the pool balance (internal accounting) for a denomination
    function poolBalance(uint256 denomination) external view returns (uint256) {
        return pools[denomination].balance;
    }

    /// @notice Check whether a commitment has been deposited in a pool
    function isDeposited(uint256 denomination, bytes32 commitment) external view returns (bool) {
        return pools[denomination].deposits[commitment];
    }

    /// @notice Allow operator to change operator address
    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "ZERO_OPERATOR");
        operator = newOperator;
    }
}
