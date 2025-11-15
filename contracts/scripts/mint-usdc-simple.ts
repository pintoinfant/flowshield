import { network } from "hardhat";
import { formatUnits, parseUnits } from "viem";

async function main() {
  console.log("🪙 USDC Minting Script");
  console.log("=".repeat(50));
  
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();
  
  // Configuration - you can modify these values
  const recipientAddress = "0x16083d9586A7818D827836E8AAe5F1138d394b80" as `0x${string}`;
  const amount = 1000; // Amount in USDC
  
  console.log("📝 Deployer address:", deployer.account.address);
  console.log("🎯 Recipient address:", recipientAddress);
  console.log("💰 Amount to mint:", amount, "USDC");
  console.log("⛽ Chain ID:", await publicClient.getChainId());

  // Get USDC contract address from environment
  const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS;
  
  if (!USDC_ADDRESS) {
    console.error("❌ USDC_CONTRACT_ADDRESS environment variable not set");
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
  console.log("\n📝 To mint different amounts, edit the 'amount' variable in this script");
  console.log("📝 To mint to different addresses, edit the 'recipientAddress' variable in this script");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
