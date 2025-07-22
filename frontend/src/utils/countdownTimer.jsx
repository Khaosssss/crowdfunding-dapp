import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { getCrowdfundingContract } from "./contract";

export default function CountdownTimer({ onCampaignEnd }) {
  const [timeLeft, setTimeLeft] = useState("");
  const intervalRef = useRef(null);
  const toastShownRef = useRef(false); // to show toast only once

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const contract = await getCrowdfundingContract();
        const deadline = Number(await contract.deadline());

        intervalRef.current = setInterval(() => {
          const now = Math.floor(Date.now() / 1000);
          const remaining = deadline - now;

          if (remaining <= 0) {
            clearInterval(intervalRef.current);
            setTimeLeft("Campaign ended");
            onCampaignEnd(true);

            // Show toast only once
            if (!toastShownRef.current) {
              toast.info("🎉 The campaign has ended!");
              toastShownRef.current = true;
            }
          } else {
            setTimeLeft(formatTime(remaining));
          }
        }, 1000);
      } catch (err) {
        console.error("Countdown error:", err);
        setTimeLeft("Unavailable");
        toast.error("⏳ Failed to load campaign deadline.");
      }
    };

    fetchDeadline();
    return () => clearInterval(intervalRef.current);
  }, [onCampaignEnd]);

  return (
    <p className="text-lg font-medium text-red-600">
      {timeLeft && `Time Left: ${timeLeft}`}
    </p>
  );
}
