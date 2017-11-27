pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IBattery is GeneralDevice {

  int     wallet;                   // To record loss & gain 
  //address grid = 0x0;                     // contract address of grid

  function getSalePrice() public view returns (uint prs, bool updatedOrNot);
  function goExcess(uint vol) returns ( uint takeVol, uint prs);
  //function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated);
  function getSortedPVInfo() external view returns(uint consum, uint rank, uint tot, bool updated);
  function goNoGo(uint giveoutvol) returns (uint);

  /*function setGridAdr(address adr) adminOnly external{
    grid = adr;
  }*/
}
