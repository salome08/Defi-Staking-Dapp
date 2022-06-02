pragma solidity ^0.5.0;

contract SLM {
  string public name = 'Salome token';
  string public symbol = 'SLM';
  uint256 public totalSupply = 1000000000000000000000000;
  uint8 public decimals = 18;

event Transfer(
  address indexed _from, 
  address indexed _to, 
  uint _value);

event Approve(
  address indexed _owner,
  address indexed _spender,
  uint _value);

mapping(address => uint) public balanceOf;
mapping(address => mapping(address => uint)) public allowance;

function transfer(address _to, uint _value) public returns (bool success){
  require(balanceOf[msg.sender] >= _value);

  balanceOf[msg.sender] -= _value;
  balanceOf[_to] += _value;
  emit Transfer(msg.sender, _to, _value);
  return true;
}

function approve(address _spender, uint _value) public returns (bool success){
  allowance[msg.sender][_spender] = _value;
  emit Approve(msg.sender, _spender, _value);
  return true;
}

function transferFrom(address _from, address _to, uint _value) public returns (bool success){
  require(balanceOf[_from] >= _value);

  balanceOf[_from] -= _value;
  balanceOf[_to] += _value;
  emit Transfer(_from, _to, _value);
  return true;
}
}