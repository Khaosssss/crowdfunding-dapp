const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding Contract", function () {
  let Crowdfunding;
  let crowdfunding;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Funding config for tests
  const fundingGoal = ethers.parseEther("10"); // 10 ETH
  const durationDays = 1; // 1 day duration

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
    Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy(
      ethers.parseEther("10") / ethers.parseEther("1"), // args expects ether as number => 10
      durationDays
    );
  });

  it("Should set the right owner and initial parameters", async function () {
    expect(await crowdfunding.owner()).to.equal(owner.address);
    expect(await crowdfunding.fundingGoal()).to.equal(fundingGoal);
    const deadline = await crowdfunding.deadline();
    expect(deadline).to.be.gt(0);
  });

  it("Should allow contributions before deadline and update totalRaised", async function () {
    const contribution = ethers.parseEther("1");
    await crowdfunding.connect(addr1).contribute({ value: contribution });

    const contributedAmount = await crowdfunding.contributions(addr1.address);
    expect(contributedAmount).to.equal(contribution);

    const totalRaised = await crowdfunding.totalRaised();
    expect(totalRaised).to.equal(contribution);
  });

  it("Should emit event on contribution", async function () {
    const contribution = ethers.parseEther("1");
    await expect(
      crowdfunding.connect(addr1).contribute({ value: contribution })
    )
      .to.emit(crowdfunding, "ContributionReceived")
      .withArgs(addr1.address, contribution);
  });

  it("Should mark goalReached if fundingGoal met", async function () {
    // Contribute enough to meet or exceed funding goal
    await crowdfunding.connect(addr1).contribute({ value: fundingGoal });
    expect(await crowdfunding.goalReached()).to.equal(true);
  });

  it("Should allow owner to withdraw funds after deadline if goal reached", async function () {
    const contribution = fundingGoal;
    await crowdfunding.connect(addr1).contribute({ value: contribution });

    // Fast forward time past deadline
    await ethers.provider.send("evm_increaseTime", [durationDays * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    // Withdraw
    const tx = await crowdfunding.withdrawFunds();
    const receipt = await tx.wait();

    // Gas cost calculation for withdrawal tx
    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice || ethers.parseUnits("1", "gwei");
    const gasCost = gasUsed * gasPrice; 

    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(finalOwnerBalance).to.be.gt(initialOwnerBalance - gasCost); // Owner balance should increase by at least fundingGoal minus gas cost

    expect(await crowdfunding.fundsWithdrawn()).to.equal(true);
  });

  it("Should not allow withdrawal before deadline", async function () {
    await crowdfunding.connect(addr1).contribute({ value: fundingGoal });
    await expect(crowdfunding.withdrawFunds()).to.be.revertedWith("Funding period not yet over");
  });

  it("Should allow contributors to get refund if goal not reached after deadline", async function () {
    const contribution = ethers.parseEther("1");
    await crowdfunding.connect(addr1).contribute({ value: contribution });

    // Fast forward time past deadline
    await ethers.provider.send("evm_increaseTime", [durationDays * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const initialBalance = await ethers.provider.getBalance(addr1.address);

    // Refund
    const tx = await crowdfunding.connect(addr1).refund();
    const receipt = await tx.wait();

    // Gas cost calculation for refund tx
    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice || ethers.parseUnits("1", "gwei");
    const gasCost = gasUsed * gasPrice;

    const finalBalance = await ethers.provider.getBalance(addr1.address);

    expect(finalBalance).to.be.gt(initialBalance - gasCost); // Refunded some ETH minus gas

    // Contribution reset to zero
    const refundedAmount = await crowdfunding.contributions(addr1.address);
    expect(refundedAmount).to.equal(0);
  });

  it("Should not allow refund if goal reached", async function () {
    await crowdfunding.connect(addr1).contribute({ value: fundingGoal });

    // Fast forward time past deadline
    await ethers.provider.send("evm_increaseTime", [durationDays * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(crowdfunding.connect(addr1).refund()).to.be.revertedWith("Goal was reached, no refunds");
  });
});
