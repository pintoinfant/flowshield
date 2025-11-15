import { network } from "hardhat";
import { formatUnits, parseUnits } from "viem";

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("❌ Usage: npx hardhat run scripts/mint-usdc.ts --network optimismSepolia -- <recipient_address> <amount>");
    console.error("Example: npx hardhat run scripts/mint-usdc.ts --network optimismSepolia -- 0x123...abc 1000");
    process.exit(1);
  }

  const recipientAddress = args[0] as `0x${string}`;
  const amount = parseFloat(args[1]);

  if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error("❌ Invalid recipient address format");
    process.exit(1);
  }

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Invalid amount. Must be a positive number");
    process.exit(1);
  }

  console.log("🪙 USDC Minting Script");
  console.log("=".repeat(50));
  
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();
  
  console.log("📝 Deployer address:", deployer.account.address);
  console.log("🎯 Recipient address:", recipientAddress);
  console.log("💰 Amount to mint:", amount, "USDC");
  console.log("⛽ Chain ID:", await publicClient.getChainId());

  // You'll need to set this environment variable with your deployed USDC contract address
  const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS;
  
  if (!USDC_ADDRESS) {
    console.error("❌ USDC_CONTRACT_ADDRESS environment variable not set");
    console.error("Set it with: export USDC_CONTRACT_ADDRESS=0x...");
    process.exit(1);
  }

  console.log("📋 USDC Contract:", USDC_ADDRESS);

  try {
    // Get contract instance
    const usdc = await viem.getContractAt("USDC", USDC_ADDRESS as `0x${string}`);
    
    // Check current balance before minting
    const balanceBefore = await usdc.read.balanceOf([recipientAddress]);
    console.log("💳 Balance before minting:", formatUnits(balanceBefore, 6), "USDC");

    // Mint USDC (remember USDC has 6 decimals)
    const mintAmount = parseUnits(amount.toString(), 6);
    
    console.log("\n🔄 Minting USDC...");
    const hash = await usdc.write.mint([recipientAddress, mintAmount]);
    
    console.log("📤 Transaction submitted:", hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      // Check balance after minting
      const balanceAfter = await usdc.read.balanceOf([recipientAddress]);
      console.log("\n✅ Minting successful!");
      console.log("💳 Balance after minting:", formatUnits(balanceAfter, 6), "USDC");
      console.log("📊 Amount minted:", formatUnits(mintAmount, 6), "USDC");
      console.log("🔗 Transaction hash:", hash);
      console.log("🌐 View on explorer: https://sepolia-optimism.etherscan.io/tx/" + hash);
    } else {
      console.error("❌ Transaction failed");
      process.exit(1);
    }

  } catch (error: any) {
    console.error("❌ Minting failed:", error.message || error);
    
    if (error.message?.includes("Ownable: caller is not the owner")) {
      console.error("💡 Note: Only the contract owner can mint USDC tokens");
    }
    
    process.exit(1);
  }

  console.log("\n🎉 USDC minting completed successfully!");
  console.log("\n📝 Quick commands for common amounts:");
  console.log(`• Mint 100 USDC: npx hardhat run scripts/mint-usdc.ts --network optimismSepolia -- ${recipientAddress} 100`);
  console.log(`• Mint 1000 USDC: npx hardhat run scripts/mint-usdc.ts --network optimismSepolia -- ${recipientAddress} 1000`);
  console.log(`• Mint 5000 USDC: npx hardhat run scripts/mint-usdc.ts --network optimismSepolia -- ${recipientAddress} 5000`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
