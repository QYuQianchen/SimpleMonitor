pragma solidity ^0.4.16;

import "./GeneralDevice.sol";

contract IHeatPump is GeneralDevice {

  uint consumptionWater;
  uint consumptionElec;
  uint lastConsumpQueryAt;
  uint lastPriceQueryAt;
  uint priceTimeOut = 10 minutes;
  uint priceStatusAt;            // timestamp of the update (price)

  function getPrice() public view returns (uint prs, bool updatedOrNot);
  function getSortedPrice() view external returns(uint consum, uint rank, uint tot, bool updated);
  function goNoGo(uint giveoutvol) public timed(4) returns (uint);
  function getConsumptionE() external view returns (uint consum) {
    consum = consumptionElec;
  }
  function getConsumptionW() external view returns (uint consum) {
    consum = consumptionWater;
  }
  
}
