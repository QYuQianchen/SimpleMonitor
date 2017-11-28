pragma solidity ^0.4.4;

import "./SortPLib.sol";
import "./AdrLib.sol";
import "./TransactLib.sol";
import "./IPV.sol";
import "./IGrid.sol";
import "./IBattery.sol";
import "./IHouse.sol";
import "./GeneralDevice.sol";

contract SingleHouse is GeneralDevice, IHouse {
  // one contract is associated to one particular House in the network.

  using AdrLib for address[];
  using TransactLib for uint;
  using SortPLib for *;

  SortPLib.PriceMap draftPriceMap;

// ======= Modifiers =======

  modifier timed (uint allowedTimeOut) {
    if(now < consumStatusAt + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

// ======= Event Logs =======

  event ConsumptionLog(address adr, uint consum, uint consumAt);
  //event ConfigurationLog(string confMod, uint statusAt);
  event EnergyTransferLog(address adrFrom, address adrTo, uint eVol, uint transferAt);

// ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SingleHouse (address adr) GeneralDevice(adr) { }
  
  // --- 1. set and get house consumption every 15 min (or less) ---

  function setConsumption(uint consum) public ownerOnly {
    consumption = consum;
    consumStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  function getConsumption() external view timed(consumTimeOut) returns (uint consum, uint consumAt) { 
    consum = consumption;
    consumAt = consumStatusAt;
  }

  // --- 2. ask for connected PV / batteries / grid for price of electricity supply ---

  function askForPrice() {
    uint tP = 0;
    bool tF = false;
    draftPriceMap.initPrsTable();
    for (i = 0; i < connectedDevice[2].length; i++) {
      (tP,tF) = IBattery(connectedDevice[2][i]).getSalePrice(); 
      draftPriceMap.addToPrsTable(connectedDevice[2][i],tP,tF);
    }
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      (tP,tF) = IPV(connectedDevice[1][i]).getPrice();
      draftPriceMap.addToPrsTable(connectedDevice[1][i],tP,tF);
    }
    lastPriceQueryAt = now;
  }

  // --- 3. House sorts all the information internally ---

  function sortPrice() {
    draftPriceMap.sortPrsTable();
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      draftPriceMap.addToPrsTable(grid,tP,tF);
    }
  }

  function getSortedPrice() external returns(uint consum, uint rank, uint tot, bool updated) {
    address adr = msg.sender;
    consum = consumption;
    (rank,tot,updated) = draftPriceMap.getPrsTable(adr);
  }

  // --- 4. PV/Battery ask House to confirm energy transaction ---

  function goNoGo(uint giveoutvol) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[2].assertInside(adrDevice) || connectedDevice[1].assertInside(adrDevice));
    takeoutvol = consumption.findMin(giveoutvol);
    consumption = consumption.clearEnergyTransfer(takeoutvol, address(this));
    //EnergyTransferLog(adrDevice,address(this), takeoutvol, consumption);
    //wallet = wallet.clearMoneyTransfer(-int(takeoutvol*priceQueryInfo[adrDevice].prs), adrDevice);
    wallet -= int(takeoutvol*draftPriceMap.prsTable[adrDevice].prs);
    return (takeoutvol); 
  }

  // --- 5. If house still has energy demand, ask grid for energy ---

  function buyExtra() {
    // when houses still have extra needs...
    uint whatDeviceAccept;
    uint receivedMoney;
    uint unitPrs;
    require(grid != 0x0);
    if (consumption > 0) {
      (whatDeviceAccept, unitPrs) = IGrid(grid).goExtra(consumption);
      consumption = consumption.clearEnergyTransfer(whatDeviceAccept, address(this));
      receivedMoney = whatDeviceAccept*unitPrs;
      wallet -= int(receivedMoney);
    }
  }


  // ------------Functions used in testing------------------
/*
  function getSortedPriceList (uint _id) returns (address) {
    return sortedPriceQueryInfo[_id];
  }

  function getAskedPrice(address adr) returns (uint,bool) {
    return (priceQueryInfo[adr].prs,priceQueryInfo[adr].updated) ;
  }

  function askForPricePV(uint i) returns (uint,bool) {
    return IPV(connectedDevice[1][i]).getPrice();
  }

  function askForPriceB(uint i) returns (uint,bool) {
    return IBattery(connectedDevice[2][i]).getSalePrice();
  }
  */

  /*function getConnectPVAddress(uint a) returns (address) {
      return connectedDevice[1][a];
  }

  function getDraftPrsMap(address adr) public view returns (uint, bool) {
    return (draftPriceMap.prsTable[adr].prs, draftPriceMap.prsTable[adr].updated);
  }
  function getSrtPosition(address adr) public returns (uint, uint, bool) {
    return draftPriceMap.getPrsTable(adr);
  }

  function getSrtList(uint a) public returns(address, uint, bool) { //address, uint, bool
    return draftPriceMap.getSortedList(a);
  }*/
}
