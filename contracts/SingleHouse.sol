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
  
  // --- Regular usage ---

  function setConsumption(uint consum) public ownerOnly {
    consumption = consum;
    consumStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  function getConsumption() external view timed(consumTimeOut) returns (uint consum, uint consumAt) { 
    consum = consumption;
    consumAt = consumStatusAt;
  }

  // 

  function askForPrice() {
    // House query price info to all the connected PV/Battery. 
    // If the house is connected to grid (most of the time), the price of Grid will be automatically added to the end of the sorted list.
    uint tP = 0;
    bool tF = false;
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      (tP,tF) = IPV(connectedDevice[1][i]).getPrice();
      priceQueryInfo[connectedDevice[1][i]] = SortLib.PriceTF(tP,tF);
    }
    for (i = 0; i < connectedDevice[2].length; i++) {
      (tP,tF) = IBattery(connectedDevice[2][i]).getSalePrice();
      priceQueryInfo[connectedDevice[2][i]] = SortLib.PriceTF(tP,tF);
    }
    lastPriceQueryAt = now;
  }

  //------------------------------
  // to Sort the received list of Price (from PV and Battery)
  //------------------------------
  

  function sortPriceList() {
    createPriceList();
    uint maxTemp;
    uint totalLength = connectedDevice[1].length + connectedDevice[2].length;
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
    prepPriceQueryInfo.length = connectedDevice[1].length + connectedDevice[2].length;
    //sortedPriceQueryInfo.length = prepPriceQueryInfo.length; => sortedPQI is using mapping now
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedDevice[1][i]];
      sortedPriceQueryInfo[i] = connectedDevice[1][i];
    }
    for (i = connectedDevice[1].length; i < prepPriceQueryInfo.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedDevice[2][i-connectedDevice[1].length]];
      sortedPriceQueryInfo[i] = connectedDevice[2][i-connectedDevice[1].length];
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
    for (uint i=0; i<connectedDevice[1].length + connectedDevice[2].length+1; i++) {
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
      tot = connectedDevice[1].length + connectedDevice[2].length+1;
    } else {
      tot = connectedDevice[1].length + connectedDevice[2].length;
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
    require(connectedDevice[2].assertInside(adrDevice) || connectedDevice[1].assertInside(adrDevice));
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
    return IPV(connectedDevice[1][i]).getPrice();
  }

  function askForPriceB(uint i) returns (uint,bool) {
    return IBattery(connectedDevice[2][i]).getSalePrice();
  }

  function getOwnerAdmin() returns (address, address){
    return (owner,Admin);
  }

  function getConnectedPVCount() returns (uint){
    return connectedDevice[1].length;
  }

  function getconnectedBatteryCount() returns (uint){
    return connectedDevice[2].length;
  }

  function getConnectPVAddress(uint a) returns (address) {
    if (a<connectedDevice[1].length) {
      return connectedDevice[1][a];
    } else {
      return 0x0;
    }
  }

  function getconnectedBatteryAddress(uint a) returns (address) {
    if (a<connectedDevice[2].length) {
      return connectedDevice[2][a];
    } else {
      return 0x0;
   
    }
  }
  */

  function getConnectPVAddress(uint a) returns (address) {
      return connectedDevice[1][a];
  }
}
