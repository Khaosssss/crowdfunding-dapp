import { useState, useEffect } from "react";
import { connectWallet } from "./utils/connectWallet";
import { getCrowdfundingContract } from "./utils/contract";
import { fundsRaised } from "./utils/fundsRaised";
import { ethers } from "ethers";
import CountdownTimer from "./utils/countdownTimer";

import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function App() {
  const [account, setAccount] = useState("");
  const [campaignEnded, setCampaignEnded] = useState(false);
  const [raised, setRaised] = useState("0");
  const [customAmount, setCustomAmount] = useState("0.01");


  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      if (!acc) throw new Error("Wallet connection failed.");
      setAccount(acc);
      toast.success("Wallet connected!");
      await updateFundsRaised();
    } catch (error) {
      toast.error("Failed to connect wallet.");
    }
  };

  const checkDeadlineAndContribute = async () => {
  const contract = await getCrowdfundingContract();
  const deadline = Number(await contract.deadline());
  const now = Math.floor(Date.now() / 1000);

  if (now >= deadline) {
    toast.error("Campaign ended. No more contributions.");
    return;
  }

  try {
    const tx = await contract.contribute({
      value: ethers.parseEther(customAmount),
    });

    toast.promise(tx.wait(), {
      loading: "Transaction pending...",
      success: "Thanks for contributing!",
      error: "Transaction failed",
    });

    await tx.wait();

    // ✅ Re-fetch totalRaised from contract
    await updateFundsRaised();
    } catch (err) {
    console.error("Contribute error:", err);
    toast.error("Failed to contribute.");
    }
  };



  const updateFundsRaised = async () => {
    try {
      const contract = await getCrowdfundingContract();
      if (!contract) throw new Error("Failed to get contract instance.");
      const value = await fundsRaised(contract);
      setRaised(value);
    } catch (error) {
      toast.error("Could not fetch the total funds raised.");
      setRaised("0");
    }
  };

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      handleConnect();
    }
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://tse1.mm.bing.net/th/id/OIP.lSGhp-H1KujrWh67K5SbvAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3')",
      }}
    >
      <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Crowdfunding DApp</h1>

        <button
          onClick={handleConnect}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </button>

        <CountdownTimer onCampaignEnd={setCampaignEnded} />

        <input
          type="number"
          step="0.001"
          min="0"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Enter ETH amount"
          className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {campaignEnded ? (
          <p className="text-lg font-semibold text-gray-500">Campaign ended</p>
        ) : (
          <button
            onClick={checkDeadlineAndContribute}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Contribute {customAmount || "0"} ETH
          </button>
          )}


        <p className="text-lg font-medium text-gray-700">
          Total Raised: <span className="font-bold">{raised}</span> ETH
        </p>
      </div>

      {/* Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-50"
      />
    </div>
  );
}
