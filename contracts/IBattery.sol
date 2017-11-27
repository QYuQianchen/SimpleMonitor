pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IBattery is GeneralDevice {

  int     wallet;                   // To record loss & gain 

  function getSalePrice() public view returns (uint prs, bool updatedOrNot);
  function goExcess(uint vol) returns ( uint takeVol, uint prs);
  function getSortedPrice() external view returns(uint consum, uint rank, uint tot, bool updated);
  function goNoGo(uint giveoutvol) returns (uint);

}
