pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IHouse is GeneralDevice {
  

  uint    consumTimeOut = 5 minutes;
  uint    consumption;              // Production of electricity (consumption: positive)
  //int     wallet;                   // To record loss & gain (that of house is negative -> need to pay others)      

  function getSortedPrice() external returns(uint consum, uint rank, uint tot, bool updated);

  function goNoGo(uint giveoutvol) returns (uint);

  function getWallet() constant returns(int) {
    return wallet;
  }
  
}
