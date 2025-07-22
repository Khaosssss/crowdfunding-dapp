// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public owner;
    uint public fundingGoal;       // Goal in wei
    uint public deadline;          // Timestamp until which funding is accepted
    uint public totalRaised;       // Total funds raised
    bool public goalReached;       // Flag if goal was reached
    bool public fundsWithdrawn;    // Flag if funds were withdrawn by owner

    mapping(address => uint) public contributions;

    event ContributionReceived(address contributor, uint amount);
    event GoalReached(uint totalAmount);
    event FundsWithdrawn(address owner, uint amount);
    event RefundIssued(address contributor, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp <= deadline, "Funding period is over");
        _;
    }

    modifier afterDeadline() {
        require(block.timestamp > deadline, "Funding period not yet over");
        _;
    }

    constructor(uint _fundingGoalInEther, uint _durationInDays) {
        owner = msg.sender;
        fundingGoal = _fundingGoalInEther * 1 ether;
        deadline = block.timestamp + (_durationInDays * 1 days);
    }

    // Function to contribute funds
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

    // Withdraw funds by owner if goal reached
    function withdrawFunds() external onlyOwner afterDeadline {
        require(goalReached, "Goal not reached");
        require(!fundsWithdrawn, "Funds already withdrawn");

        fundsWithdrawn = true;
        payable(owner).transfer(address(this).balance);

        emit FundsWithdrawn(owner, address(this).balance);
    }

    // Refund contributors if goal not reached
    function refund() external afterDeadline {
        require(!goalReached, "Goal was reached, no refunds");
        uint contributed = contributions[msg.sender];
        require(contributed > 0, "No contributions to refund");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributed);

        emit RefundIssued(msg.sender, contributed);
    }
}
