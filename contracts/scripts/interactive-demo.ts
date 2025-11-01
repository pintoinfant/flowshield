import { network } from "hardhat";
import { parseEther, formatEther, keccak256, toBytes } from "viem";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("🎮 FLOWSHIELD INTERACTIVE DEMO");
  console.log("==============================\n");
  console.log("Welcome to the interactive Flowshield privacy mixer demonstration!");
  console.log("You'll be guided through each step of the privacy-preserving process.\n");

  const { viem } = await network.connect();
  const [deployer, alice, bob, charlie, relayer] = await viem.getWalletClients();

  console.log("👥 Demo Characters:");
  console.log("   Alice:", alice.account.address);
  console.log("   Bob:", bob.account.address);
  console.log("   Charlie:", charlie.account.address);
  console.log("   Relayer:", relayer.account.address);
  console.log("   Operator:", deployer.account.address, "\n");

  await question("Press Enter to start deployment...");

  // Deploy contracts
  console.log("\n🚀 Deploying contracts...");
  const mockUSDC = await viem.deployContract("MockUSDC", [deployer.account.address]);
  const flowshield = await viem.deployContract("Flowshield", [mockUSDC.address]);
  
  console.log("✅ MockUSDC deployed at:", mockUSDC.address);
  console.log("✅ Flowshield deployed at:", flowshield.address);

  // Setup pools
  const pool100 = parseEther("100");
  const pool1000 = parseEther("1000");
  
  await flowshield.write.addPool([pool100, "100 mUSDC Pool"]);
  await flowshield.write.addPool([pool1000, "1000 mUSDC Pool"]);
  
  console.log("✅ Created privacy pools: 100 mUSDC and 1000 mUSDC");

  await question("\nPress Enter to mint tokens for users...");

  // Mint tokens
  const mintAmount = parseEther("5000");
  for (const user of [alice, bob, charlie]) {
    await mockUSDC.write.mint([user.account.address, mintAmount]);
    await mockUSDC.write.approve([flowshield.address, mintAmount], {
      account: user.account,
    });
  }
  
  console.log("✅ Each user now has", formatEther(mintAmount), "mUSDC");

  // Interactive deposit phase
  console.log("\n🏦 DEPOSIT PHASE");
  console.log("================");
  console.log("Users will now deposit tokens with secret commitments.");
  console.log("These commitments are the only way to withdraw the funds later!");

  const secrets: { [key: string]: string } = {};
  const commitments: { [key: string]: `0x${string}` } = {};

  // Alice deposit
  await question("\nPress Enter for Alice to make her deposit...");
  
  const aliceSecret = await question("Enter Alice's secret (or press Enter for default): ") || "alice_secret_12345";
  secrets.alice = aliceSecret;
  commitments.alice = keccak256(toBytes(aliceSecret));
  
  const aliceAmount = await question("Alice's deposit amount (100 or 1000 mUSDC): ") || "100";
  const alicePool = aliceAmount === "1000" ? pool1000 : pool100;
  
  console.log("🔐 Alice's commitment:", commitments.alice);
  console.log("📝 Remember Alice's secret:", aliceSecret);
  
  await flowshield.write.deposit([commitments.alice, alicePool], {
    account: alice.account,
  });
  
  console.log("✅ Alice deposited", aliceAmount, "mUSDC");

  // Bob deposit
  await question("\nPress Enter for Bob to make his deposit...");
  
  const bobSecret = await question("Enter Bob's secret (or press Enter for default): ") || "bob_secret_67890";
  secrets.bob = bobSecret;
  commitments.bob = keccak256(toBytes(bobSecret));
  
  const bobAmount = await question("Bob's deposit amount (100 or 1000 mUSDC): ") || "100";
  const bobPool = bobAmount === "1000" ? pool1000 : pool100;
  
  console.log("🔐 Bob's commitment:", commitments.bob);
  console.log("📝 Remember Bob's secret:", bobSecret);
  
  await flowshield.write.deposit([commitments.bob, bobPool], {
    account: bob.account,
  });
  
  console.log("✅ Bob deposited", bobAmount, "mUSDC");

  // Show anonymity set
  const pool100Balance = await flowshield.read.poolBalance([pool100]);
  const pool1000Balance = await flowshield.read.poolBalance([pool1000]);
  
  console.log("\n🎭 ANONYMITY SET CREATED!");
  console.log("========================");
  console.log("Pool balances:");
  console.log("   100 mUSDC pool:", formatEther(pool100Balance), "mUSDC");
  console.log("   1000 mUSDC pool:", formatEther(pool1000Balance), "mUSDC");
  console.log("\nFunds are now mixed! External observers cannot link deposits to withdrawals.");

  await question("\nPress Enter to start the withdrawal phase...");

  // Interactive withdrawal phase
  console.log("\n🔓 WITHDRAWAL PHASE");
  console.log("===================");
  console.log("Now users can withdraw using their secrets to any address!");

  const withdrawalType = await question("Choose withdrawal type:\n1. Direct withdrawal\n2. Relayer withdrawal\nEnter 1 or 2: ");

  if (withdrawalType === "2") {
    console.log("\n🔄 Relayer Withdrawal Selected");
    console.log("The relayer will withdraw on behalf of a user to any address.");
    console.log("Relayer fee: 5% to operator, 95% to recipient");
    
    const whoseSecret = (await question("Whose secret to use? (alice/bob): ")).toLowerCase();
    const recipient = (await question("Recipient address (alice/bob/charlie): ")).toLowerCase();
    
    let recipientAddress: `0x${string}`;
    switch (recipient) {
      case "alice": recipientAddress = alice.account.address; break;
      case "bob": recipientAddress = bob.account.address; break;
      case "charlie": recipientAddress = charlie.account.address; break;
      default: recipientAddress = alice.account.address;
    }
    
    const commitment = whoseSecret === "bob" ? commitments.bob : commitments.alice;
    const amount = whoseSecret === "bob" ? bobAmount : aliceAmount;
    const pool = amount === "1000" ? pool1000 : pool100;
    
    console.log(`\n🎯 Withdrawing ${whoseSecret}'s ${amount} mUSDC to ${recipient}'s address via relayer...`);
    
    await flowshield.write.withdrawViaRelayer([commitment, pool, recipientAddress], {
      account: relayer.account,
    });
    
    const fee = parseEther(amount) / 20n;
    const userAmount = parseEther(amount) - fee;
    
    console.log("✅ Withdrawal complete!");
    console.log("   Recipient received:", formatEther(userAmount), "mUSDC");
    console.log("   Operator fee:", formatEther(fee), "mUSDC");
    
  } else {
    console.log("\n🎯 Direct Withdrawal Selected");
    console.log("User withdraws directly to the caller's address.");
    
    const whoseSecret = (await question("Whose secret to use? (alice/bob): ")).toLowerCase();
    const caller = (await question("Who calls the withdrawal? (alice/bob/charlie): ")).toLowerCase();
    
    let callerAccount;
    switch (caller) {
      case "alice": callerAccount = alice.account; break;
      case "bob": callerAccount = bob.account; break;
      case "charlie": callerAccount = charlie.account; break;
      default: callerAccount = alice.account;
    }
    
    const commitment = whoseSecret === "bob" ? commitments.bob : commitments.alice;
    const amount = whoseSecret === "bob" ? bobAmount : aliceAmount;
    const pool = amount === "1000" ? pool1000 : pool100;
    
    console.log(`\n🎯 ${caller} withdrawing ${whoseSecret}'s ${amount} mUSDC to their own address...`);
    
    await flowshield.write.withdrawDirect([commitment, pool], {
      account: callerAccount,
    });
    
    console.log("✅ Withdrawal complete!");
    console.log(`   ${caller} received:`, amount, "mUSDC");
  }

  // Show final results
  console.log("\n📊 FINAL RESULTS");
  console.log("=================");
  
  const aliceFinal = await mockUSDC.read.balanceOf([alice.account.address]);
  const bobFinal = await mockUSDC.read.balanceOf([bob.account.address]);
  const charlieFinal = await mockUSDC.read.balanceOf([charlie.account.address]);
  const operatorFinal = await mockUSDC.read.balanceOf([deployer.account.address]);
  
  console.log("Final balances:");
  console.log("   Alice:", formatEther(aliceFinal), "mUSDC");
  console.log("   Bob:", formatEther(bobFinal), "mUSDC");
  console.log("   Charlie:", formatEther(charlieFinal), "mUSDC");
  console.log("   Operator:", formatEther(operatorFinal), "mUSDC");

  const finalPool100 = await flowshield.read.poolBalance([pool100]);
  const finalPool1000 = await flowshield.read.poolBalance([pool1000]);
  
  console.log("\nPool states:");
  console.log("   100 mUSDC pool:", formatEther(finalPool100), "mUSDC");
  console.log("   1000 mUSDC pool:", formatEther(finalPool1000), "mUSDC");

  console.log("\n🎉 PRIVACY DEMONSTRATION COMPLETE!");
  console.log("===================================");
  console.log("✅ Successfully demonstrated privacy-preserving transactions");
  console.log("✅ Broke the link between deposits and withdrawals");
  console.log("✅ Maintained security while providing anonymity");

  rl.close();
}

// Run if this is the main module
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interactive demo failed:", error);
    rl.close();
    process.exit(1);
  });

export default main;
