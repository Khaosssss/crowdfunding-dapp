import { ethers } from "ethers";
import CrowdfundingABI from "../../../artifacts/contracts/crowdfunding.sol/Crowdfunding.json"; // adjust path

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;


export async function getCrowdfundingContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, CrowdfundingABI.abi, signer);
}
