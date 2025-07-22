# 🏗️ Crowdfunding DApp

A decentralized crowdfunding platform built with **React**, **Vite**, **Ethers.js v6**, and **Solidity**. Users can contribute ETH to campaigns, track progress in real-time, and view the total funds raised. Smart contract runs on Ethereum-compatible testnets like Sepolia.

---

## 🚀 Features

- 🦊 MetaMask Wallet Integration
- ⏳ Live Countdown Timer until campaign deadline
- 📈 Real-time fund tracking
- ✅ Smart contract verifies funding goal and status
- 🔔 User notifications via `react-toastify`
- 💻 Modern React UI with Tailwind CSS

---

## 🧱 Tech Stack

| Layer          | Tech                          |
|----------------|-------------------------------|
| Frontend       | React + Vite + Tailwind CSS   |
| Ethereum SDK   | Ethers.js (v6)                |
| Smart Contracts| Solidity                      |
| Notifications  | react-toastify                |
| Dev Tools      | Hardhat, MetaMask             |

---

## 🧪 Local Development Setup

### 1. Clone the Repo

```bash
git clone https://github.com/Khaosssss/crowdfunding-dapp.git
cd crowdfunding-dapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root with:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

> Make sure you deploy your smart contract first using Hardhat or any testnet deploy script.

---

## 📦 Smart Contract Overview

```solidity
function contribute() external payable beforeDeadline {
  require(msg.value > 0, "Contribution must be > 0");
  contributions[msg.sender] += msg.value;
  totalRaised += msg.value;

  emit ContributionReceived(msg.sender, msg.value);

  if (totalRaised >= fundingGoal) {
      goalReached = true;
      emit GoalReached(totalRaised);
  }
}
```

> The contract tracks contributors, totalRaised amount, and whether the goal has been reached.

---

## 🖼️ UI Preview


---

## ⚙️ Useful Scripts

### Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Run Frontend Locally

```bash
npm run dev
```

---

## 🔔 Toast Notifications

Integrated with `react-toastify` for better UX:

* Success on wallet connection
* Error on failed contract reads
* Info when campaign ends

---

## 🛡️ Security Note

This project is for demo and learning purposes.

* ⚠️ Not production-ready.
* ✅ All interactions are done on testnet.
* ⚠️ Refund Eligibility:
  > Refunds can only be claimed **after the campaign ends**.
  > The campaign must have **failed to meet the funding goal**.
  > If the goal was reached, **refunds are not allowed**.

---

## 📜 License

MIT License © 2025

---

## 🤝 Contributions

Feel free to fork, raise issues, or submit PRs. Suggestions are welcome!

```
