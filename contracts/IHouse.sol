pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IHouse is GeneralDevice {
  
 
  address grid = 0x0;
  uint    consumTimeOut = 5 minutes;
  uint    consumption;              // Production of electricity (consumption: positive)
  int     wallet;                   // To record loss & gain (that of house is negative -> need to pay others)      

  function getSortedInfo() external returns(uint consum, uint rank, uint tot, bool updated);

  function goNoGo(uint giveoutvol) returns (uint);

  function setGridAdr(address adr) adminOnly external {
    grid = adr;
  }

  function getWallet() constant returns(int) {
    return wallet;
  }
  
}
