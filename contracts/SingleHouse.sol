pragma solidity ^0.4.4;

import "./SortLib.sol";
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

  //uint    consumTimeOut = 5 minutes;

  uint    consumStatusAt;           // timestamp of the update (consumption)
  address[] connectedPV;            // List of contract address of connected PV
  address[] connectedBattery;       // List of contract address of connected batteries

  // may be splited into another contract

  /*struct PriceTF {
    uint  prs;
    bool  updated;
  }*/

  using SortLib for SortLib.PriceTF[];
  SortLib.PriceTF[] prepPriceQueryInfo;

  uint    lastPriceQueryAt;

  mapping(address=>SortLib.PriceTF) priceQueryInfo;
  mapping(uint=>address) sortedPriceQueryInfo;
  
// ======= Modifiers =======
  

  modifier connectedPVOnly (address adrP) {
    if (connectedPV.AssertInside(adrP)) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedBatteryOnly (address adrB) {
    if (connectedBattery.AssertInside(adrB)) {
      _;
    } else {
      revert();
    }
  }

  modifier timed (uint allowedTimeOut) {
    if(now < consumStatusAt + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

// ======= Event Logs =======
  event ConsumptionLog(address adr, uint consum, uint consumAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event EnergyTransferLog(address adrFrom, address adrTo, uint eVol, uint transferAt);

// ======= Basic Functionalities =======

  // --- Upon contract creation and configuration ---

  function SingleHouse (address adr) GeneralDevice(adr) { }
  
  /*function setGridAdr(address adr) adminOnly external {
    grid = adr;
  }*/
  
  function addConnectedPV(address adrP) adminOnly external {
    connectedPV.push(adrP);
    ConfigurationLog("PV linked to House",now);
  }

  function addConnectedBattery(address adrB) adminOnly external {
    connectedBattery.push(adrB);
    ConfigurationLog("Battery linked to House",now);
  }

  // --- Regular usage ---

  function setConsumption(uint consum) ownerOnly {
    consumption = consum;
    consumStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  function getConsumption()  external timed(consumTimeOut) returns (uint consum, uint consumAt) { //
    consum = consumption;
    consumAt = consumStatusAt;
  }

  // 

  function askForPrice() {
    // House query price info to all the connected PV/Battery. 
    // If the house is connected to grid (most of the time), the price of Grid will be automatically added to the end of the sorted list.
    uint tP = 0;
    bool tF = false;
    for (uint i = 0; i < connectedPV.length; i++) {
      (tP,tF) = IPV(connectedPV[i]).getPrice();
      priceQueryInfo[connectedPV[i]] = SortLib.PriceTF(tP,tF);
    }
    for (i = 0; i < connectedBattery.length; i++) {
      (tP,tF) = IBattery(connectedBattery[i]).getSalePrice();
      priceQueryInfo[connectedBattery[i]] = SortLib.PriceTF(tP,tF);
    }
    lastPriceQueryAt = now;
  }

  //------------------------------
  // to Sort the received list of Price (from PV and Battery)
  //------------------------------
  

  function sortPriceList() {
    createPriceList();
    uint maxTemp;
    uint totalLength = connectedPV.length + connectedBattery.length;
    for (uint i = 0; i < totalLength; i++) {
      maxTemp = prepPriceQueryInfo.maxStruct();
      swap(totalLength-1-i,maxTemp);
      prepPriceQueryInfo.del(maxTemp);
    }
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      priceQueryInfo[grid] = SortLib.PriceTF(tP,tF);
      //setPriceQueryInfo(grid,tP,tF);
      sortedPriceQueryInfo[totalLength] = grid;
    }
  }

  function createPriceList() private {
    prepPriceQueryInfo.length = connectedPV.length + connectedBattery.length;
    //sortedPriceQueryInfo.length = prepPriceQueryInfo.length; => sortedPQI is using mapping now
    for (uint i = 0; i < connectedPV.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedPV[i]];
      sortedPriceQueryInfo[i] = connectedPV[i];
    }
    for (i = connectedPV.length; i < prepPriceQueryInfo.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedBattery[i-connectedPV.length]];
      sortedPriceQueryInfo[i] = connectedBattery[i-connectedPV.length];
    }
  }

  function swap (uint _id1, uint _id2) private {
    if (_id1 != _id2) {
      address temp;
      temp = sortedPriceQueryInfo[_id1];
      sortedPriceQueryInfo[_id1] = sortedPriceQueryInfo[_id2];
      sortedPriceQueryInfo[_id2] = temp;   
    }
  }

  //------------------------------
  // Once sorted, actively send to all the connected devices.
  //------------------------------

  function getSortedPosition (address adr) returns (uint) { // should be private, here the "private" is temporarily removed due to testing
    //require(adr != 0x0);      // Sometimes with this line, there will be error in the configuration.js test... sometimes not.... sometimes need to _migrate_ twice to eliminate the error.... Don't know why
    for (uint i=0; i<connectedPV.length + connectedBattery.length+1; i++) {
      if (adr == sortedPriceQueryInfo[i]) {
        return (i+1);
      }
    }
    return 0;
  }

  function getSortedInfo() external returns(uint consum, uint rank, uint tot, bool updated) {
    return  getSortedHInfo(msg.sender);
  }

  function getSortedHInfo(address adr) returns(uint consum, uint rank, uint tot, bool updated) {  // should be private, here the "private" is temporarily removed due to testing
    //address adr = msg.sender;
    consum = consumption;
    rank = getSortedPosition(adr);
    if (grid != 0x0) {
      tot = connectedPV.length + connectedBattery.length+1;
    } else {
      tot = connectedPV.length + connectedBattery.length;
    }
    if (lastPriceQueryAt + consumTimeOut < now) {
      updated = false;    // The house may be inactive for a while, so the list stored is outdated.
    } else {
      updated = true;      
    }
  }

  // ------------Functions used in transaction------------------
  function goNoGo(uint giveoutvol) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedBattery.AssertInside(adrDevice) || connectedPV.AssertInside(adrDevice));
    takeoutvol = consumption.findMin(giveoutvol);
    consumption = consumption.clearEnergyTransfer(takeoutvol, address(this));
    //EnergyTransferLog(adrDevice,address(this), takeoutvol, consumption);
    //wallet = wallet.clearMoneyTransfer(-int(takeoutvol*priceQueryInfo[adrDevice].prs), adrDevice);
    wallet -= int(takeoutvol*priceQueryInfo[adrDevice].prs);
    return (takeoutvol); 
  }

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
    return IPV(connectedPV[i]).getPrice();
  }

  function askForPriceB(uint i) returns (uint,bool) {
    return IBattery(connectedBattery[i]).getSalePrice();
  }

  function getOwnerAdmin() returns (address, address){
    return (owner,Admin);
  }

  function getConnectedPVCount() returns (uint){
    return connectedPV.length;
  }

  function getconnectedBatteryCount() returns (uint){
    return connectedBattery.length;
  }

  function getConnectPVAddress(uint a) returns (address) {
    if (a<connectedPV.length) {
      return connectedPV[a];
    } else {
      return 0x0;
    }
  }

  function getconnectedBatteryAddress(uint a) returns (address) {
    if (a<connectedBattery.length) {
      return connectedBattery[a];
    } else {
      return 0x0;
   
    }
  }
  */

  function getConnectPVAddress(uint a) returns (address) {
      return connectedPV[a];
  }
}
