pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IWaterTank is GeneralDevice {
  
  //uint    volTimeOut = 5 minutes;
  // uint    priceTimeOut = 5 minutes;
  // uint    priceStatusAt;            // timestamp of the update (price)
  // uint    volStatusAt;              // timestamp of the update
  // uint    lastPriceQueryAt;
  // uint    lastRankingAt;

  uint    consumTimeOut = 5 minutes;
  uint    consumStatusAt;            // timestamp of setting the consumption
  uint    needStatusAt;            // timestamp of asking Houses' need
  uint    volStatusAt;              // timestamp of the update
  uint    priceStatusAt;            // timestamp of the update (price)
  

  // function getSalePrice() public view returns (uint prs, bool updatedOrNot);
  // function getSortedPrice() external view returns(uint consum, uint rank, uint tot, bool updated);
  // function goNoGo(uint giveoutvol) timed(4) returns (uint);
  // function goExcess(uint vol) timed(5) returns ( uint takeVol, uint prs);

  function getConsumption() public view returns (uint consum, bool updatedOrNot);
  function getPrice() external view returns(uint prs);
  function goNoGo(uint giveoutvol, uint prs) public timed(4) returns (uint);
}
