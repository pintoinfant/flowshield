import { network } from "hardhat";
import { formatEther, parseEther } from "viem";

async function main() {
  console.log("🚀 Starting deployment to Optimism Sepolia...");
  
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();
  
  console.log("📝 Deployer address:", deployer.account.address);
  console.log("⛽ Chain ID:", await publicClient.getChainId());
  
  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 Deployer balance:", formatEther(balance), "ETH");
  
  // if (balance < parseEther("0.01")) {
  //   console.error("❌ Insufficient ETH balance for deployment. Need at least 0.01 ETH for gas fees.");
  //   console.log("Get Optimism Sepolia ETH from: https://faucet.quicknode.com/optimism/sepolia");
  //   process.exit(1);
  // }

  console.log("\n📦 Deploying USDC contract...");
  
  // Deploy USDC contract
  const usdc = await viem.deployContract("USDC", [deployer.account.address]);
  console.log("✅ USDC deployed to:", usdc.address);
  console.log("⏳ USDC deployment confirmed");

  console.log("\n📦 Deploying Flowshield contract...");
  
  try {
    // Deploy Flowshield contract with explicit gas settings
    const flowshield = await viem.deployContract("Flowshield", [usdc.address], {
      gas: 2000000n, // Set explicit gas limit
    });
    console.log("✅ Flowshield deployed to:", flowshield.address);
    console.log("⏳ Flowshield deployment confirmed");

    console.log("\n🏊 Setting up pools...");
  
  // Pool denominations in USDC (6 decimals)
  const poolDenominations = [
    { amount: 10n * 10n ** 6n, label: "10 USDC" },
    { amount: 100n * 10n ** 6n, label: "100 USDC" },
    { amount: 500n * 10n ** 6n, label: "500 USDC" },
    { amount: 2000n * 10n ** 6n, label: "2000 USDC" },
  ];

  // Add pools to Flowshield contract
  for (const pool of poolDenominations) {
    console.log(`\n➕ Adding pool: ${pool.label}`);
    
    try {
      const hash = await flowshield.write.addPool([pool.amount, pool.label]);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`✅ Pool ${pool.label} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add pool ${pool.label}:`, error);
    }
  }

  console.log("\n🎯 Minting initial USDC for testing...");
  
  // Mint some USDC to deployer for testing (10,000 USDC)
  const mintAmount = 10000n * 10n ** 6n; // 10,000 USDC
  try {
    const hash = await usdc.write.mint([deployer.account.address, mintAmount]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Minted 10,000 USDC to deployer for testing");
  } catch (error) {
    console.error("❌ Failed to mint initial USDC:", error);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("USDC:", usdc.address);
  console.log("Flowshield:", flowshield.address);
  
  console.log("\n📋 Pool Information:");
  poolDenominations.forEach((pool, index) => {
    console.log(`${index + 1}. ${pool.label}: ${pool.amount.toString()} wei`);
  });

  console.log("\n🔧 Environment Variables for .env:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${flowshield.address}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdc.address}`);
  console.log(`NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155420`);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Add the environment variables to your web/.env.local file");
  console.log("2. Update the frontend to support Optimism Sepolia");
  console.log("3. Test the deployment using the minting script");
  console.log("4. Verify contracts on Etherscan (optional)");
  
    console.log("\n🌐 Optimism Sepolia Block Explorer:");
    console.log(`USDC: https://sepolia-optimism.etherscan.io/address/${usdc.address}`);
    console.log(`Flowshield: https://sepolia-optimism.etherscan.io/address/${flowshield.address}`);

  } catch (error) {
    console.error("❌ Flowshield deployment failed:", error);
    console.log("\n💡 Trying alternative deployment approach...");
    
    // Try deploying without explicit gas limit
    try {
      const flowshield = await viem.deployContract("Flowshield", [usdc.address]);
      console.log("✅ Flowshield deployed to:", flowshield.address);
      console.log("⏳ Flowshield deployment confirmed");
      
      // Continue with pool setup...
      console.log("\n🏊 Setting up pools...");
      
      const poolDenominations = [
        { amount: 10n * 10n ** 6n, label: "10 USDC" },
        { amount: 100n * 10n ** 6n, label: "100 USDC" },
        { amount: 500n * 10n ** 6n, label: "500 USDC" },
        { amount: 2000n * 10n ** 6n, label: "2000 USDC" },
      ];

      for (const pool of poolDenominations) {
        console.log(`\n➕ Adding pool: ${pool.label}`);
        try {
          const hash = await flowshield.write.addPool([pool.amount, pool.label]);
          await publicClient.waitForTransactionReceipt({ hash });
          console.log(`✅ Pool ${pool.label} added successfully`);
        } catch (error) {
          console.error(`❌ Failed to add pool ${pool.label}:`, error);
        }
      }

      console.log("\n🎯 Minting initial USDC for testing...");
      const mintAmount = 10000n * 10n ** 6n;
      try {
        const hash = await usdc.write.mint([deployer.account.address, mintAmount]);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("✅ Minted 10,000 USDC to deployer for testing");
      } catch (error) {
        console.error("❌ Failed to mint initial USDC:", error);
      }

      console.log("\n🎉 Deployment completed successfully!");
      console.log("\n📋 Contract Addresses:");
      console.log("USDC:", usdc.address);
      console.log("Flowshield:", flowshield.address);
      
      console.log("\n🔧 Environment Variables for .env:");
      console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${flowshield.address}`);
      console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdc.address}`);
      console.log(`NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155420`);
      
      console.log("\n🌐 Optimism Sepolia Block Explorer:");
      console.log(`USDC: https://sepolia-optimism.etherscan.io/address/${usdc.address}`);
      console.log(`Flowshield: https://sepolia-optimism.etherscan.io/address/${flowshield.address}`);
      
    } catch (retryError) {
      console.error("❌ Alternative deployment also failed:", retryError);
      console.log("\n💡 Please try again or use a different RPC endpoint");
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
