import { network } from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
  console.log("🚀 Starting Flowshield deployment and setup...\n");
  
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user1, user2] = await viem.getWalletClients();

  console.log("📍 Network: Local Hardhat");
  console.log("👤 Deployer:", deployer.account.address);
  console.log("⛽ Chain ID:", await publicClient.getChainId());
  console.log();

  // Deploy USDC
  console.log("🪙 Deploying USDC...");
  const usdc = await viem.deployContract("USDC", [deployer.account.address]);
  console.log("✅ USDC deployed at:", usdc.address);

  // Deploy Flowshield
  console.log("\n🛡️  Deploying Flowshield...");
  const flowshield = await viem.deployContract("Flowshield", [usdc.address]);
  console.log("✅ Flowshield deployed at:", flowshield.address);

  // Setup initial configuration
  console.log("\n⚙️  Setting up initial configuration...");
  
  // Create pools
  const pool100 = parseEther("100");
  const pool1000 = parseEther("1000");
  
  console.log("📦 Creating 100 mUSDC pool...");
  await flowshield.write.addPool([pool100, "100 mUSDC Privacy Pool"]);
  
  console.log("📦 Creating 1000 mUSDC pool...");
  await flowshield.write.addPool([pool1000, "1000 mUSDC Privacy Pool"]);

  // Mint initial tokens for demo users
  const mintAmount = parseEther("10000");
  
  console.log("\n💰 Minting demo tokens...");
  console.log("🪙 Minting", formatEther(mintAmount), "USDC to user1:", user1.account.address);
  await usdc.write.mint([user1.account.address, mintAmount]);
  
  console.log("🪙 Minting", formatEther(mintAmount), "USDC to user2:", user2.account.address);
  await usdc.write.mint([user2.account.address, mintAmount]);

  // Setup approvals for demo
  console.log("\n✅ Setting up token approvals...");
  await usdc.write.approve([flowshield.address, mintAmount], {
    account: user1.account,
  });
  await usdc.write.approve([flowshield.address, mintAmount], {
    account: user2.account,
  });

  // Display final summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📋 Contract Addresses:");
  console.log("   USDC:       ", usdc.address);
  console.log("   Flowshield: ", flowshield.address);
  console.log();
  console.log("📊 Initial State:");
  console.log("   Pool 100 USDC:  ✅ Created");
  console.log("   Pool 1000 USDC: ✅ Created");
  console.log("   User1 Balance:   ", formatEther(mintAmount), "USDC");
  console.log("   User2 Balance:   ", formatEther(mintAmount), "USDC");
  console.log();
  console.log("🔗 Ready for privacy mixing!");
  console.log("Run 'npx hardhat run scripts/demo-privacy-flow.ts' for a full demonstration");
  console.log("=".repeat(60));

  return {
    usdc: usdc.address,
    flowshield: flowshield.address,
    deployer: deployer.account.address,
    user1: user1.account.address,
    user2: user2.account.address
  };
}

// Run if this is the main module
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

export default main;
