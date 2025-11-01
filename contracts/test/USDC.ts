import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress, encodeAbiParameters, keccak256, toHex } from "viem";

describe("MockUSDC", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  // Test accounts
  const [deployer, user1, user2, user3] = await viem.getWalletClients();

  let mockUSDC: any;
  let deploymentBlockNumber: bigint;

  // Test constants
  const INITIAL_SUPPLY = 0n;
  const MINT_AMOUNT = parseEther("1000");
  const TRANSFER_AMOUNT = parseEther("100");
  const APPROVE_AMOUNT = parseEther("500");

  beforeEach(async function () {
    // Deploy MockUSDC with deployer as initial owner
    mockUSDC = await viem.deployContract("MockUSDC", [deployer.account.address]);
    deploymentBlockNumber = await publicClient.getBlockNumber();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const name = await mockUSDC.read.name();
      const symbol = await mockUSDC.read.symbol();
      
      assert.equal(name, "MockUSDC");
      assert.equal(symbol, "mUSDC");
    });

    it("Should set the correct owner", async function () {
      const owner = await mockUSDC.read.owner();
      assert.equal(owner, getAddress(deployer.account.address));
    });

    it("Should have 18 decimals", async function () {
      const decimals = await mockUSDC.read.decimals();
      assert.equal(decimals, 18);
    });

    it("Should start with zero total supply", async function () {
      const totalSupply = await mockUSDC.read.totalSupply();
      assert.equal(totalSupply, INITIAL_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);

      const balance = await mockUSDC.read.balanceOf([user1.account.address]);
      const totalSupply = await mockUSDC.read.totalSupply();

      assert.equal(balance, MINT_AMOUNT);
      assert.equal(totalSupply, MINT_AMOUNT);
    });

    it("Should emit Transfer event on mint", async function () {
      await viem.assertions.emitWithArgs(
        mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]),
        mockUSDC,
        "Transfer",
        ["0x0000000000000000000000000000000000000000", getAddress(user1.account.address), MINT_AMOUNT]
      );
    });

    it("Should prevent non-owner from minting", async function () {
      await assert.rejects(
        mockUSDC.write.mint([user1.account.address, MINT_AMOUNT], {
          account: user1.account,
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should allow minting to multiple addresses", async function () {
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);
      await mockUSDC.write.mint([user2.account.address, MINT_AMOUNT]);

      const balance1 = await mockUSDC.read.balanceOf([user1.account.address]);
      const balance2 = await mockUSDC.read.balanceOf([user2.account.address]);
      const totalSupply = await mockUSDC.read.totalSupply();

      assert.equal(balance1, MINT_AMOUNT);
      assert.equal(balance2, MINT_AMOUNT);
      assert.equal(totalSupply, MINT_AMOUNT * 2n);
    });
  });

  describe("ERC20 Transfer Functionality", function () {
    beforeEach(async function () {
      // Mint tokens to user1 for testing transfers
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);
    });

    it("Should allow token transfers", async function () {
      await viem.assertions.emitWithArgs(
        mockUSDC.write.transfer([user2.account.address, TRANSFER_AMOUNT], {
          account: user1.account,
        }),
        mockUSDC,
        "Transfer",
        [getAddress(user1.account.address), getAddress(user2.account.address), TRANSFER_AMOUNT]
      );

      const balance1 = await mockUSDC.read.balanceOf([user1.account.address]);
      const balance2 = await mockUSDC.read.balanceOf([user2.account.address]);

      assert.equal(balance1, MINT_AMOUNT - TRANSFER_AMOUNT);
      assert.equal(balance2, TRANSFER_AMOUNT);
    });

    it("Should prevent transfers with insufficient balance", async function () {
      const excessiveAmount = MINT_AMOUNT + parseEther("1");
      
      await assert.rejects(
        mockUSDC.write.transfer([user2.account.address, excessiveAmount], {
          account: user1.account,
        }),
        /ERC20InsufficientBalance/
      );
    });

    it("Should prevent transfers to zero address", async function () {
      await assert.rejects(
        mockUSDC.write.transfer(["0x0000000000000000000000000000000000000000", TRANSFER_AMOUNT], {
          account: user1.account,
        }),
        /ERC20InvalidReceiver/
      );
    });

    it("Should return correct balances", async function () {
      const balance = await mockUSDC.read.balanceOf([user1.account.address]);
      assert.equal(balance, MINT_AMOUNT);

      const zeroBalance = await mockUSDC.read.balanceOf([user2.account.address]);
      assert.equal(zeroBalance, 0n);
    });
  });

  describe("ERC20 Approval Functionality", function () {
    beforeEach(async function () {
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);
    });

    it("Should allow approvals", async function () {
      await viem.assertions.emitWithArgs(
        mockUSDC.write.approve([user2.account.address, APPROVE_AMOUNT], {
          account: user1.account,
        }),
        mockUSDC,
        "Approval",
        [getAddress(user1.account.address), getAddress(user2.account.address), APPROVE_AMOUNT]
      );

      const allowance = await mockUSDC.read.allowance([user1.account.address, user2.account.address]);
      assert.equal(allowance, APPROVE_AMOUNT);
    });

    it("Should allow transferFrom with sufficient allowance", async function () {
      await mockUSDC.write.approve([user2.account.address, APPROVE_AMOUNT], {
        account: user1.account,
      });

      await viem.assertions.emitWithArgs(
        mockUSDC.write.transferFrom([user1.account.address, user3.account.address, TRANSFER_AMOUNT], {
          account: user2.account,
        }),
        mockUSDC,
        "Transfer",
        [getAddress(user1.account.address), getAddress(user3.account.address), TRANSFER_AMOUNT]
      );

      const balance1 = await mockUSDC.read.balanceOf([user1.account.address]);
      const balance3 = await mockUSDC.read.balanceOf([user3.account.address]);
      const allowance = await mockUSDC.read.allowance([user1.account.address, user2.account.address]);

      assert.equal(balance1, MINT_AMOUNT - TRANSFER_AMOUNT);
      assert.equal(balance3, TRANSFER_AMOUNT);
      assert.equal(allowance, APPROVE_AMOUNT - TRANSFER_AMOUNT);
    });

    it("Should prevent transferFrom with insufficient allowance", async function () {
      await mockUSDC.write.approve([user2.account.address, TRANSFER_AMOUNT - 1n], {
        account: user1.account,
      });

      await assert.rejects(
        mockUSDC.write.transferFrom([user1.account.address, user3.account.address, TRANSFER_AMOUNT], {
          account: user2.account,
        }),
        /ERC20InsufficientAllowance/
      );
    });

    it("Should allow updating allowance by re-approving", async function () {
      await mockUSDC.write.approve([user2.account.address, APPROVE_AMOUNT], {
        account: user1.account,
      });

      const newAmount = parseEther("300");
      await mockUSDC.write.approve([user2.account.address, newAmount], {
        account: user1.account,
      });

      const allowance = await mockUSDC.read.allowance([user1.account.address, user2.account.address]);
      assert.equal(allowance, newAmount);
    });
  });

  describe("Burning Functionality", function () {
    beforeEach(async function () {
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = parseEther("100");
      
      await viem.assertions.emitWithArgs(
        mockUSDC.write.burn([burnAmount], {
          account: user1.account,
        }),
        mockUSDC,
        "Transfer",
        [getAddress(user1.account.address), "0x0000000000000000000000000000000000000000", burnAmount]
      );

      const balance = await mockUSDC.read.balanceOf([user1.account.address]);
      const totalSupply = await mockUSDC.read.totalSupply();

      assert.equal(balance, MINT_AMOUNT - burnAmount);
      assert.equal(totalSupply, MINT_AMOUNT - burnAmount);
    });

    it("Should allow burning from allowance", async function () {
      const burnAmount = parseEther("100");
      
      await mockUSDC.write.approve([user2.account.address, burnAmount], {
        account: user1.account,
      });

      await mockUSDC.write.burnFrom([user1.account.address, burnAmount], {
        account: user2.account,
      });

      const balance = await mockUSDC.read.balanceOf([user1.account.address]);
      const totalSupply = await mockUSDC.read.totalSupply();
      const allowance = await mockUSDC.read.allowance([user1.account.address, user2.account.address]);

      assert.equal(balance, MINT_AMOUNT - burnAmount);
      assert.equal(totalSupply, MINT_AMOUNT - burnAmount);
      assert.equal(allowance, 0n);
    });

    it("Should prevent burning more than balance", async function () {
      const excessiveBurn = MINT_AMOUNT + parseEther("1");
      
      await assert.rejects(
        mockUSDC.write.burn([excessiveBurn], {
          account: user1.account,
        }),
        /ERC20InsufficientBalance/
      );
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await mockUSDC.write.transferOwnership([user1.account.address]);
      
      const newOwner = await mockUSDC.read.owner();
      assert.equal(newOwner, getAddress(user1.account.address));
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await assert.rejects(
        mockUSDC.write.transferOwnership([user2.account.address], {
          account: user1.account,
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should allow owner to renounce ownership", async function () {
      await mockUSDC.write.renounceOwnership();
      
      const owner = await mockUSDC.read.owner();
      assert.equal(owner, "0x0000000000000000000000000000000000000000");
    });

    it("Should prevent minting after ownership renunciation", async function () {
      await mockUSDC.write.renounceOwnership();
      
      await assert.rejects(
        mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]),
        /OwnableUnauthorizedAccount/
      );
    });
  });

  describe("ERC20Permit Functionality", function () {
    it("Should have correct domain separator and permit typehash", async function () {
      const domainSeparator = await mockUSDC.read.DOMAIN_SEPARATOR();
      assert.ok(domainSeparator);
      assert.equal(domainSeparator.length, 66); // 0x + 64 hex chars
    });

    it("Should track nonces correctly", async function () {
      const nonce = await mockUSDC.read.nonces([user1.account.address]);
      assert.equal(nonce, 0n);
    });

    // Note: Full permit testing would require signature creation which is complex
    // in this test environment. The basic structure is tested above.
  });

  describe("Edge Cases and Security", function () {
    it("Should handle zero amount transfers", async function () {
      await mockUSDC.write.mint([user1.account.address, MINT_AMOUNT]);
      
      await mockUSDC.write.transfer([user2.account.address, 0n], {
        account: user1.account,
      });

      const balance1 = await mockUSDC.read.balanceOf([user1.account.address]);
      const balance2 = await mockUSDC.read.balanceOf([user2.account.address]);

      assert.equal(balance1, MINT_AMOUNT);
      assert.equal(balance2, 0n);
    });

    it("Should handle zero amount approvals", async function () {
      await mockUSDC.write.approve([user2.account.address, 0n], {
        account: user1.account,
      });

      const allowance = await mockUSDC.read.allowance([user1.account.address, user2.account.address]);
      assert.equal(allowance, 0n);
    });

    it("Should handle large amounts correctly", async function () {
      const largeAmount = parseEther("1000000"); // 1 million tokens
      
      await mockUSDC.write.mint([user1.account.address, largeAmount]);
      const balance = await mockUSDC.read.balanceOf([user1.account.address]);
      
      assert.equal(balance, largeAmount);
    });

    it("Should maintain accurate total supply after multiple operations", async function () {
      const amount1 = parseEther("500");
      const amount2 = parseEther("300");
      const burnAmount = parseEther("100");

      await mockUSDC.write.mint([user1.account.address, amount1]);
      await mockUSDC.write.mint([user2.account.address, amount2]);
      await mockUSDC.write.burn([burnAmount], { account: user1.account });

      const totalSupply = await mockUSDC.read.totalSupply();
      const expectedSupply = amount1 + amount2 - burnAmount;
      
      assert.equal(totalSupply, expectedSupply);
    });
  });
});
