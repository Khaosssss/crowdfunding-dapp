import { ethers } from "ethers";

export const fundsRaised = async (contract) => {
  try {
    const totalRaised = await contract.totalRaised();
    console.log("Raw totalRaised (wei):", totalRaised.toString());
    console.log("Formatted ETH:", ethers.formatEther(totalRaised));
    return ethers.formatEther(totalRaised);
  } catch (error) {
    console.error("Error fetching funds raised:", error);
    return "0";
  }
};
