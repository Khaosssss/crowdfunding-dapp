const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract from:", deployer.address);

  const fundingGoalInEther = 10; // Goal: 10 ETH
  const durationInDays = 7;      // Duration: 7 days

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(fundingGoalInEther, durationInDays);

  await crowdfunding.waitForDeployment();

  const contractAddress = await crowdfunding.getAddress();
  console.log("Crowdfunding contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
