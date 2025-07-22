import { ethers } from "ethers";

export const fundsRaised = async (contract) => {
  try {
    const totalRaised = await contract.totalRaised(); // Failing here?
    return ethers.formatEther(totalRaised);
  } catch (error) {
    console.error("Error fetching funds raised:", error);
    console.error("Possible reasons: wrong address, ABI mismatch, reverted logic.");
    return "0";
  }
}
