pragma solidity ^0.4.16;

import "./GeneralDevice.sol";

contract IHouseH is GeneralDevice {
  
  uint    consumptionMTWater;         // Consumption of Medium-temperature water (in Liter)
  uint    consumptionHTWater;         // Consumption of High-temperature water (in Liter)
  uint    consumWaterStatusAt;      // timestamp of the update (water consumption)
  // uint    lastPriceQueryAt;    


  function getConsumptionH() external view returns (uint consumMT, uint consumHT, uint consumAt) {
    consumMT = consumptionMTWater;
    consumHT = consumptionHTWater;
    consumAt = consumWaterStatusAt;
  }

  function goNoGoHeating(uint giveoutvol, uint prs, uint wType) timed(4) returns (uint);
  
}
