import { useState, useEffect } from "react";
import { connectWallet } from "./utils/connectWallet";
import { getCrowdfundingContract } from "./utils/contract";
import { fundsRaised } from "./utils/fundsRaised";
import { ethers } from "ethers";
import CountdownTimer from "./utils/countdownTimer";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

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
      await updateFundsRaised();
    } catch (err) {
      console.error("Contribute error:", err);
      toast.error("Failed to contribute.");
    }
  };

  const updateFundsRaised = async () => {
    try {
      const contract = await getCrowdfundingContract();
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
      className="min-h-screen bg-sky-100 bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('https://mobbin.com/screenshots/2023-12-08/gofundme/1702010089567.png')",
        backgroundPosition: "center",
      }}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="text-2xl font-bold text-green-600">GoFundMe</div>
        <ul className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
          <li>
            <a href="#" className="hover:text-green-600">How it works</a>
          </li>
          <li>
            <a href="#" className="hover:text-green-600">For Individuals</a>
          </li>
          <li>
            <a href="#" className="hover:text-green-600">For Charities</a>
          </li>
        </ul>
        <div>
          <button
            onClick={handleConnect}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition text-sm font-medium shadow"
          >
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      {/* HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center pt-16 px-4"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold text-gray-800"
          >
            Your home for help
          </motion.h1>

          <CountdownTimer onCampaignEnd={setCampaignEnded} />

          <motion.input
            type="number"
            step="0.001"
            min="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter ETH amount"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          />

          {campaignEnded ? (
            <p className="text-lg font-semibold text-gray-500">Campaign ended</p>
          ) : (
            <motion.button
              onClick={checkDeadlineAndContribute}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-full transition shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Contribute {customAmount || "0"} ETH
            </motion.button>
          )}

          <p className="text-md font-medium text-gray-700">
            Total Raised:{" "}
            <span className="font-bold text-emerald-600">{raised}</span> ETH
          </p>
        </div>
      </motion.div>

      {/* Toast notifications */}
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
