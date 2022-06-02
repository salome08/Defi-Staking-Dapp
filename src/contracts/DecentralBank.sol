pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
  string public name = 'Decentral Bank';
  address public owner;
  Tether public tether;
  RWD public rwd;

  address[] public stakers;

  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(RWD _rwd,Tether _tether) public {
    rwd = _rwd;
    tether = _tether;
    owner = msg.sender;
  }
  
  // Staking function
  function depositToken(uint _amount) public {
    // Transfer tether tokens to this contract address for staking
    
    // require staking amount > 0
    require(_amount > 0);
    // require(stakingBalance[msg.sender] >= _amount);

    tether.transferFrom(msg.sender, address(this), _amount);

    // Update staking balance
    stakingBalance[msg.sender] += _amount;

    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    // Update staking balance
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }
    
    // Unstake tokens
    function unstakeTokens() public {
      uint balance = stakingBalance[msg.sender];
      require (balance > 0);

      // transfer the tokens to the specified address from our bank
      tether.transfer(msg.sender, balance);
      // reset staking balance
      stakingBalance[msg.sender] = 0;
      // update staking status
      isStaking[msg.sender] = false;
    }

      // Issue Reward Tokens
    function issueTokens() public {
      require(msg.sender == owner, "caller must be the owner");

      for (uint i=0; i<stakers.length; i++) {
        address recipient = stakers[i];
        uint balance = stakingBalance[recipient] / 9; // for create percentage incentive for staker
        if (balance > 0) {
        rwd.transfer(recipient, balance);
        }
      } 
    }
}
