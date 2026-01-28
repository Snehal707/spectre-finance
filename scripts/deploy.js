const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  console.log("🔐 Deploying SpectreVault to", networkName, "...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Error: No balance! Please fund your wallet first.");
    console.log("\nGet Sepolia ETH from a faucet:");
    console.log("  - https://sepoliafaucet.com");
    console.log("  - https://faucet.quicknode.com/ethereum/sepolia");
    process.exit(1);
  }

  // Deploy SpectreVault
  console.log("⏳ Deploying SpectreVault contract...");
  const SpectreVault = await hre.ethers.getContractFactory("SpectreVault");
  const spectreVault = await SpectreVault.deploy();
  
  await spectreVault.waitForDeployment();
  
  const contractAddress = await spectreVault.getAddress();
  console.log("✅ SpectreVault deployed to:", contractAddress);
  
  // Get block explorer URL based on network
  let explorerUrl = "";
  switch (networkName) {
    case "sepolia":
      explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
      break;
    case "arbSepolia":
      explorerUrl = `https://sepolia.arbiscan.io/address/${contractAddress}`;
      break;
    case "baseSepolia":
      explorerUrl = `https://sepolia.basescan.org/address/${contractAddress}`;
      break;
    default:
      explorerUrl = "Local network - no explorer";
  }

  // Output deployment info
  console.log("\n========================================");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("Network:", networkName);
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Explorer:", explorerUrl);
  console.log("========================================");
  
  // Output environment variable for frontend
  console.log("\n📝 Add this to your frontend .env file:");
  console.log(`VITE_SPECTRE_VAULT_ADDRESS=${contractAddress}`);
  
  // Wait for block confirmations before verifying (only on testnets)
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await spectreVault.deploymentTransaction().wait(3);
    console.log("✅ Confirmed!");
  }
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
