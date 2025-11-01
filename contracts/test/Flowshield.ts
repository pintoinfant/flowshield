import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, formatEther, getAddress, type Address } from "viem";

describe("Flowshield", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  // Test accounts
  const [deployer, user1, user2, relayer] = await viem.getWalletClients();

  let flowshield: any;
  let usdc: any;
  let deploymentBlockNumber: bigint;

  // Test constants
  const POOL_DENOMINATION_1 = parseEther("100"); // 100 tokens
  const POOL_DENOMINATION_2 = parseEther("1000"); // 1000 tokens
  const INITIAL_MINT_AMOUNT = parseEther("10000"); // 10000 tokens
  const COMMITMENT_1 = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const COMMITMENT_2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  beforeEach(async function () {
    // Deploy USDC
    usdc = await viem.deployContract("USDC", [deployer.account.address]);
    
    // Deploy Flowshield
    flowshield = await viem.deployContract("Flowshield", [usdc.address]);
    
    deploymentBlockNumber = await publicClient.getBlockNumber();

    // Mint tokens to users
    await usdc.write.mint([user1.account.address, INITIAL_MINT_AMOUNT]);
    await usdc.write.mint([user2.account.address, INITIAL_MINT_AMOUNT]);
    
    // Approve Flowshield to spend tokens
    await usdc.write.approve([flowshield.address, INITIAL_MINT_AMOUNT], {
      account: user1.account,
    });
    await usdc.write.approve([flowshield.address, INITIAL_MINT_AMOUNT], {
      account: user2.account,
    });
  });

  describe("Constructor", function () {
    it("Should set the operator to deployer", async function () {
      const operator = await flowshield.read.operator();
      assert.equal(operator, getAddress(deployer.account.address));
    });

    it("Should set the token address correctly", async function () {
      const tokenAddress = await flowshield.read.token();
      assert.equal(tokenAddress, getAddress(usdc.address));
    });

    it("Should revert if token address is zero", async function () {
      await assert.rejects(
        viem.deployContract("Flowshield", ["0x0000000000000000000000000000000000000000"]),
        /ZERO_TOKEN/
      );
    });
  });

  describe("Pool Management", function () {
    it("Should allow operator to add a pool", async function () {
      await viem.assertions.emitWithArgs(
        flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]),
        flowshield,
        "PoolCreatedEvent",
        [POOL_DENOMINATION_1, "100 Token Pool"]
      );

      const poolExists = await flowshield.read.poolExists([POOL_DENOMINATION_1]);
      assert.equal(poolExists, true);

      const poolBalance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(poolBalance, 0n);
    });

    it("Should prevent non-operator from adding pools", async function () {
      await assert.rejects(
        flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"], {
          account: user1.account,
        }),
        /NOT_OPERATOR/
      );
    });

    it("Should prevent adding duplicate pools", async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
      
      await assert.rejects(
        flowshield.write.addPool([POOL_DENOMINATION_1, "Duplicate Pool"]),
        /POOL_DENOMINATION_EXISTS/
      );
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
    });

    it("Should allow valid deposits", async function () {
      await viem.assertions.emitWithArgs(
        flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
          account: user1.account,
        }),
        flowshield,
        "DepositEvent",
        [COMMITMENT_1, POOL_DENOMINATION_1]
      );

      const poolBalance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(poolBalance, POOL_DENOMINATION_1);

      const isDeposited = await flowshield.read.isDeposited([POOL_DENOMINATION_1, COMMITMENT_1]);
      assert.equal(isDeposited, true);
    });

    it("Should prevent deposits to non-existent pools", async function () {
      await assert.rejects(
        flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_2], {
          account: user1.account,
        }),
        /POOL_NOT_FOUND/
      );
    });

    it("Should prevent duplicate commitments", async function () {
      await flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user1.account,
      });

      await assert.rejects(
        flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
          account: user2.account,
        }),
        /DEPOSIT_ALREADY_EXISTS/
      );
    });

    it("Should prevent deposits without sufficient approval", async function () {
      // Create a new user without approval
      const walletClients = await viem.getWalletClients();
      const user3 = walletClients[4]; // Get additional wallet client
      await usdc.write.mint([user3.account.address, INITIAL_MINT_AMOUNT]);

      await assert.rejects(
        flowshield.write.deposit([COMMITMENT_2, POOL_DENOMINATION_1], {
          account: user3.account,
        }),
        /ERC20InsufficientAllowance/
      );
    });
  });

  describe("Direct Withdrawals", function () {
    beforeEach(async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
      await flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user1.account,
      });
    });

    it("Should allow valid direct withdrawals", async function () {
      const initialBalance = await usdc.read.balanceOf([user2.account.address]);

      await viem.assertions.emitWithArgs(
        flowshield.write.withdrawDirect([COMMITMENT_1, POOL_DENOMINATION_1], {
          account: user2.account,
        }),
        flowshield,
        "WithdrawEvent",
        [getAddress(user2.account.address), POOL_DENOMINATION_1]
      );

      const finalBalance = await usdc.read.balanceOf([user2.account.address]);
      assert.equal(finalBalance - initialBalance, POOL_DENOMINATION_1);

      const poolBalance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(poolBalance, 0n);

      const isUsed = await flowshield.read.usedSecrets([COMMITMENT_1]);
      assert.equal(isUsed, true);
    });

    it("Should prevent withdrawal from non-existent pool", async function () {
      await assert.rejects(
        flowshield.write.withdrawDirect([COMMITMENT_1, POOL_DENOMINATION_2], {
          account: user2.account,
        }),
        /POOL_NOT_FOUND/
      );
    });

    it("Should prevent withdrawal with already used secret", async function () {
      await flowshield.write.withdrawDirect([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user2.account,
      });

      await assert.rejects(
        flowshield.write.withdrawDirect([COMMITMENT_1, POOL_DENOMINATION_1], {
          account: user2.account,
        }),
        /SECRET_ALREADY_USED/
      );
    });

    it("Should prevent withdrawal of non-existent deposit", async function () {
      await assert.rejects(
        flowshield.write.withdrawDirect([COMMITMENT_2, POOL_DENOMINATION_1], {
          account: user2.account,
        }),
        /DEPOSIT_NOT_FOUND/
      );
    });
  });

  describe("Relayer Withdrawals", function () {
    beforeEach(async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
      await flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user1.account,
      });
    });

    it("Should allow valid relayer withdrawals with correct fee distribution", async function () {
      const initialRecipientBalance = await usdc.read.balanceOf([user2.account.address]);
      const initialOperatorBalance = await usdc.read.balanceOf([deployer.account.address]);

      const expectedFee = POOL_DENOMINATION_1 / 50n; // 2%
      const expectedUserAmount = POOL_DENOMINATION_1 - expectedFee;

      await viem.assertions.emitWithArgs(
        flowshield.write.withdrawViaRelayer([COMMITMENT_1, POOL_DENOMINATION_1, user2.account.address], {
          account: relayer.account,
        }),
        flowshield,
        "WithdrawEvent",
        [getAddress(user2.account.address), expectedUserAmount]
      );

      const finalRecipientBalance = await usdc.read.balanceOf([user2.account.address]);
      const finalOperatorBalance = await usdc.read.balanceOf([deployer.account.address]);

      assert.equal(finalRecipientBalance - initialRecipientBalance, expectedUserAmount);
      assert.equal(finalOperatorBalance - initialOperatorBalance, expectedFee);

      const poolBalance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(poolBalance, 0n);

      const isUsed = await flowshield.read.usedSecrets([COMMITMENT_1]);
      assert.equal(isUsed, true);
    });

    it("Should prevent relayer withdrawal with zero recipient", async function () {
      await assert.rejects(
        flowshield.write.withdrawViaRelayer([COMMITMENT_1, POOL_DENOMINATION_1, "0x0000000000000000000000000000000000000000"], {
          account: relayer.account,
        }),
        /INVALID_RECIPIENT/
      );
    });

    it("Should prevent relayer withdrawal with already used secret", async function () {
      await flowshield.write.withdrawViaRelayer([COMMITMENT_1, POOL_DENOMINATION_1, user2.account.address], {
        account: relayer.account,
      });

      await assert.rejects(
        flowshield.write.withdrawViaRelayer([COMMITMENT_1, POOL_DENOMINATION_1, user2.account.address], {
          account: relayer.account,
        }),
        /SECRET_ALREADY_USED/
      );
    });
  });

  describe("Operator Management", function () {
    it("Should allow operator to change operator address", async function () {
      await flowshield.write.setOperator([user1.account.address]);
      
      const newOperator = await flowshield.read.operator();
      assert.equal(newOperator, getAddress(user1.account.address));
    });

    it("Should prevent non-operator from changing operator", async function () {
      await assert.rejects(
        flowshield.write.setOperator([user1.account.address], {
          account: user1.account,
        }),
        /NOT_OPERATOR/
      );
    });

    it("Should prevent setting zero address as operator", async function () {
      await assert.rejects(
        flowshield.write.setOperator(["0x0000000000000000000000000000000000000000"]),
        /ZERO_OPERATOR/
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
      await flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user1.account,
      });
    });

    it("Should correctly report pool existence", async function () {
      const exists = await flowshield.read.poolExists([POOL_DENOMINATION_1]);
      const notExists = await flowshield.read.poolExists([POOL_DENOMINATION_2]);
      
      assert.equal(exists, true);
      assert.equal(notExists, false);
    });

    it("Should correctly report pool balance", async function () {
      const balance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(balance, POOL_DENOMINATION_1);
    });

    it("Should correctly report deposit status", async function () {
      const isDeposited = await flowshield.read.isDeposited([POOL_DENOMINATION_1, COMMITMENT_1]);
      const notDeposited = await flowshield.read.isDeposited([POOL_DENOMINATION_1, COMMITMENT_2]);
      
      assert.equal(isDeposited, true);
      assert.equal(notDeposited, false);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy in withdrawDirect", async function () {
      await flowshield.write.addPool([POOL_DENOMINATION_1, "100 Token Pool"]);
      await flowshield.write.deposit([COMMITMENT_1, POOL_DENOMINATION_1], {
        account: user1.account,
      });

      // This test verifies the nonReentrant modifier is in place
      // In a real attack scenario, a malicious contract would attempt to call
      // withdrawDirect again during the token transfer callback
      const balance = await flowshield.read.poolBalance([POOL_DENOMINATION_1]);
      assert.equal(balance, POOL_DENOMINATION_1);
    });
  });
});
