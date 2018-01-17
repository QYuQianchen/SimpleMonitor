pragma solidity ^0.4.16;
import "./IHeatPump.sol";
import "./IPV.sol";
import "./IBattery.sol";
import "./IGrid.sol";
import "./IWaterTank.sol";
import "./GeneralDevice.sol";

import "./ConvertLib.sol";
import "./SortPLib.sol"; 
import "./AdrLib.sol"; 
import "./TransactLib.sol";
import "./DeviceFactoryInterface.sol";

contract SingleHeatPumpFactory is SingleHeatPumpFactoryInterface {
  mapping(address => SingleHeatPump) heatpumps;

  function SingleHeatPumpFactory() public {}

  function createSingleHeatPump(address _accountAddress, uint _capacity) public returns (address heatpumpAddress) {
    SingleHeatPump _singleHeatPump = new SingleHeatPump(_accountAddress, _capacity);
    heatpumps[_accountAddress] = _singleHeatPump;
    return _singleHeatPump;
  }

  function getSingleHeatPumpAddress(address _accountAddress) public constant returns (address heatpumpAddress) {
    return heatpumps[_accountAddress];
  }
}

//For simplicity, we do not use the sorting functions here, as in our configuration, there is only one battery and there's only one PV connected.  

contract SingleHeatPump is GeneralDevice, IHeatPump {
  using ConvertLib for uint;
  using AdrLib for address[];
  using TransactLib for uint;
  using SortPLib for *;

  SortPLib.PriceMap draftPriceMap;

  uint waterType;   // coefficience of performance, (*1e-1). Some typical values are 30 and 45 (coef of performance is 3 and 4.5)
  uint consumptionWater;
  uint consumptionElec;
  uint price;
  uint maxSupplyPrice;

  // ======= Event Logs =======

  event PriceUpdate(uint updateAt);

  // ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SingleHeatPump (address adr, uint wT) public adminOnly GeneralDevice(adr) {
    waterType = wT;
    consumptionWater = 0;
  }

  // --- 1. ask for connected water tank for water consumption ---
  //        and convert the water consumption into electricity consumption

  function askForConsump() public timed(1) {
    uint tC = 0;
    bool tF = false;
    for (uint i = 0; i < connectedDevice[4].length; i++) {
      (tC,tF) = IWaterTank(connectedDevice[4][i]).getConsumption();
      if (tF == true) {
        consumptionWater += tC;
      }
    }
    consumptionElec = consumptionWater.convertToElec(waterType);
    lastConsumpQueryAt = now;
  }

  /*function convertConsumption() private timed(1) {    // can also move into phase 2
    consumptionElec = consumptionWater.convertToElec(waterType);
  }*/

  // --- 2. ask for connected PV / batteries / grid for price of electricity supply ---

  function askForPrice() public timed(2) {
    uint tP = 0;
    bool tF = false;
    maxSupplyPrice = 0;
    draftPriceMap.initPrsTable();
    for (uint i = 0; i < connectedDevice[2].length; i++) {
      (tP,tF) = IBattery(connectedDevice[2][i]).getSalePrice();
      draftPriceMap.addToPrsTable(connectedDevice[2][i],tP,tF);
    }
    for (i = 0; i < connectedDevice[1].length; i++) {
      (tP,tF) = IPV(connectedDevice[1][i]).getPrice();
      draftPriceMap.addToPrsTable(connectedDevice[1][i],tP,tF);
    }
    lastPriceQueryAt = now;
  }

    // --- 3. HP sorts all the information internally ---

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

  function getSortedPrice() view external returns(uint consum, uint rank, uint tot, bool updated) {
    address adr = msg.sender;
    consum = consumptionElec;
    (rank,tot,updated) = draftPriceMap.getPrsTable(adr);
  }

  // --- 4. PV/Battery ask HP to confirm ...
    // --- 4.1 energy transaction ---

  function goNoGo(uint giveoutvol) public timed(4) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    
    require(connectedDevice[2].assertInside(adrDevice) || connectedDevice[1].assertInside(adrDevice));
    takeoutvol = consumptionElec.findMin(giveoutvol);
    consumptionElec = consumptionElec.clearEnergyTransfer(takeoutvol, address(this));
    //wallet -= int(takeoutvol*draftPriceMap.prsTable[adrDevice].prs);
    wallet -= takeoutvol.payment(draftPriceMap.prsTable[adrDevice].prs);
    // Set the price for heat pump
    if (draftPriceMap.prsTable[adrDevice].prs > maxSupplyPrice) {
      maxSupplyPrice = draftPriceMap.prsTable[adrDevice].prs;
    }
    setPrice();
    initiateTransaction(takeoutvol);

    // Here HP trigger the transaction to water tank...
    return (takeoutvol);
  }

  // --- 5. If HP still has energy demand, ask grid for energy ---

  function buyExtra() public timed(5) {
    // when houses still have extra needs...
    uint whatDeviceAccept;
    uint unitPrs;
    require(grid != 0x0);
    if (consumptionElec > 0) {
      (whatDeviceAccept, unitPrs) = IGrid(grid).goExtra(consumptionElec);
      consumptionElec = consumptionElec.clearEnergyTransfer(whatDeviceAccept, address(this));
      //wallet -= int(whatDeviceAccept * unitPrs);
      wallet -= whatDeviceAccept.payment(unitPrs);
      // Set the price for heat pump
      if (unitPrs > maxSupplyPrice) {
        maxSupplyPrice = unitPrs;
      }
      setPrice();
      initiateTransaction(whatDeviceAccept);
      
      // Here HP trigger the transaction to water tank...
    } 
  }

  // transact to water tank (also give out prs information.)
  function initiateTransaction(uint takeoutvolE) private {
    uint whatDeviceAccept;
    uint waterFlow;

    waterFlow = takeoutvolE.convertToHeat(waterType);

    for (uint i = 0; i < connectedDevice[4].length; i++) {
      //giveoutVol = currentVolume.findMin(volMap[i]);
      whatDeviceAccept = IWaterTank(connectedDevice[4][i]).goNoGo(waterFlow,price);
      consumptionWater -= whatDeviceAccept;
      wallet +=  int(whatDeviceAccept * price * 2); // here 2 is factor to gain money...
    }
 
  }
  
  // not yet set the phase
  
  function setPrice() ownerOnly private {
    price = maxSupplyPrice;
    priceStatusAt = now;
    PriceUpdate(now);
  }

  function getPrice() public view returns (uint prs, bool updatedOrNot) { //connectedHouseOnly external
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
  }
}
