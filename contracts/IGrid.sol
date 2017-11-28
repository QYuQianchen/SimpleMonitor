pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IGrid is GeneralDevice {

  uint    priceTimeOut = 5 minutes;
  uint    priceStatusAt;            // timestamp of the update (price)
  
  uint    posBackup = 100;         // Assume that the grid is ready to supply the microgrid for 100kwh
  uint    negBackup = 100;         // Assume that the grid is ready to absort 100kwh of excess energy from microgrid
  int     wallet;                   // To record loss & gain

  function getPrice() public view returns (uint prs, bool updatedOrNot);
  function goExcess(uint vol) returns ( uint takeVol, uint prs);    // when grid absorbing energy
  function goExtra(uint vol) returns (uint takeVol, uint prs);      // when grid supplying energy

  /*function addPV(address adr) {connectedPV.push(adr);}
  function addH(address adr) {connectedHouse.push(adr);}
  function addB(address adr) {connectedBattery.push(adr);}*/
}
