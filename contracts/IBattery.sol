pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IBattery is GeneralDevice {

//  int     wallet;                   // To record loss & gain
  
  //uint    volTimeOut = 5 minutes;
  uint    priceTimeOut = 5 minutes;
  
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    volStatusAt;              // timestamp of the update
  uint    lastPriceQueryAt;
  uint    lastRankingAt;

  function getSalePrice() public view returns (uint prs, bool updatedOrNot);
  function getSortedPrice() external view returns(uint consum, uint rank, uint tot, bool updated);
  function goNoGo(uint giveoutvol) timed(4) returns (uint);
  function goExcess(uint vol) timed(5) returns ( uint takeVol, uint prs);
}
