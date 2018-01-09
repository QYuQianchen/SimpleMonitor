pragma solidity ^0.4.16;

import "./GeneralDevice.sol";

contract IHouseE is GeneralDevice {
  
  uint    consumption;              // Consumption of electricity (consumption: positive)

  //uint    consumTimeOut = 5 minutes;

  uint    consumStatusAt;           // timestamp of the update (consumption)
  uint    lastPriceQueryAt;
  //int     wallet;                   // To record loss & gain (that of house is negative -> need to pay others)      

  function getSortedPrice() external returns(uint consum, uint rank, uint tot, bool updated);
  
  function goNoGo(uint giveoutvol) public timed(4) returns (uint);

  function getConsumptionE() external view returns (uint consum, uint consumAt) {
    consum = consumption;
    consumAt = consumStatusAt;
  }
  
}
