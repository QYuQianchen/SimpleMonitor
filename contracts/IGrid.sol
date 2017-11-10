pragma solidity ^0.4.4;

contract IGrid {

  int     wallet;                   // To record loss & gain
  uint    priceTimeOut = 5 minutes;
  uint    posBackup = 100;         // Assume that the grid is ready to supply the microgrid for 100kwh
  address[] connectedHouse; // List of households connected
  address[] connectedPV;// List of PV connected
  address[] connectedBattery;

  function getPrice() returns (uint prs, bool updatedOrNot);

  function addPV(address adr) {connectedPV.push(adr);}
  function addH(address adr) {connectedHouse.push(adr);}
  function addB(address adr) {connectedBattery.push(adr);}
}
