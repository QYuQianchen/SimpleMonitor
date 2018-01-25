pragma solidity ^0.4.16;

import "./SortPLib.sol";
import "./AdrLib.sol";
import "./TransactLib.sol";
import "./IPV.sol";
import "./IGrid.sol";
import "./IBattery.sol";
import "./IHouseE.sol";
import "./IHouseH.sol";
import "./GeneralDevice.sol";
//import "./IGeneralDevice.sol";
import "./DeviceFactoryInterface.sol";


contract SingleHouseFactory { //is SingleHouseFactoryInterface, IGeneralDevice
  //mapping(address => SingleHouse) houses;
  mapping(address => address) houses;
  

  function SingleHouseFactory() public {}

  function createSingleHouse(address _accountAddress) public returns (address houseAddress) {
    houses[_accountAddress] = new SingleHouse(_accountAddress);
    return address(houses[_accountAddress]);
  }

  function getSingleHouseAddress(address _accountAddress) public constant returns (address houseAddress) {
    return houses[_accountAddress];
  }
}


contract SingleHouse is GeneralDevice, IHouseE, IHouseH {
  // one contract is associated to one particular House in the network.

  using AdrLib for address[];
  using TransactLib for uint;
  using SortPLib for *;

  SortPLib.PriceMap draftPriceMap;

// ======= Modifiers =======


// ======= Event Logs =======

  event ConsumptionLog(address adr, uint consum, uint consumAt);
  event EnergyTransferLog(address adrFrom, address adrTo, uint eVol, uint transferAt);

// ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SingleHouse (address adr) public adminOnly GeneralDevice(adr) { }

  // --- 1. set and get house consumption every 15 min (or less) ---

  function setConsumption(uint consum) public timed(1) ownerOnly { //
    consumption = consum;
    consumStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  // overload function of setConsumption
  // consum1: electricity consumption; consum2: Medium-Temperature water consumption (liter); consum3: High-Temperature water consumption (liter)
  
  function setConsumptionH(uint consum1, uint consum2, uint consum3) public timed(1) ownerOnly {
    consumption = consum1;
    consumptionMTWater = consum2;
    consumptionHTWater = consum3;
    consumStatusAt = now;
    consumWaterStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  // --- 2. ask for connected PV / batteries / grid for price of electricity supply ---

  function askForPrice() public timed(2) {
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

  function sortPrice() public timed(2) {
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

  // --- 4. PV/Battery ask House to confirm ...
    // --- 4.1 energy transaction ---

  function goNoGo(uint giveoutvol) public timed(4) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[2].assertInside(adrDevice) || connectedDevice[1].assertInside(adrDevice));
    takeoutvol = consumption.findMin(giveoutvol);
    consumption = consumption.clearEnergyTransfer(takeoutvol, address(this));
    //wallet -= int(takeoutvol*draftPriceMap.prsTable[adrDevice].prs);
    wallet -= takeoutvol.payment(draftPriceMap.prsTable[adrDevice].prs);
    return (takeoutvol);
  }
    // --- 4.1 heating transaction ---
  function goNoGoHeating(uint giveoutvol, uint prs, bool wType) public timed(4) returns (uint) {
    // possible to overload the function with goNoGo -> simplify the code of calling
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[4].assertInside(adrDevice));
    if (wType == false) {
      takeoutvol = consumptionMTWater.findMin(giveoutvol);
      consumptionMTWater -= takeoutvol;
    } else {  // high temperature water
      takeoutvol = consumptionHTWater.findMin(giveoutvol);
      consumptionHTWater -= takeoutvol;
    }
    //wallet -= int(takeoutvol*prs);
    wallet -= takeoutvol.payment(prs);
    return (takeoutvol);
  }


  // --- 5. If house still has energy demand, ask grid for energy ---

  function buyExtra() public timed(5) {
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
  function getTime() public returns (uint) {
    return getTimerStatus();
  }

  function getTimeToNext() public returns (uint) {
    return getTimeToNextStatus();
  }

  function getNow() public view returns (uint) {
    return now;
  }
}
