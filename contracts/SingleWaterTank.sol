pragma solidity ^0.4.4;

import "./IWaterTank.sol";
import "./IHouseH.sol";
import "./IHeatPump.sol";
import "./GeneralDevice.sol";

import "./PriceLib.sol";

contract SingleWaterTankFactory {
  mapping(address => SingleWaterTank) watertanks;

  function SingleWaterTankFactory() public {}

  function createSingleWaterTank(address _accountAddress, uint _capacity, uint _waterType) public returns (address watertankAddress) {
    SingleWaterTank _singleWaterTank = new SingleWaterTank(_accountAddress, _capacity, _waterType);
    watertanks[_accountAddress] = _singleWaterTank;
    return _singleWaterTank;
  }

  function getSingleWaterTankAddress(address _accountAddress) public constant returns (address watertankAddress) {
    return watertanks[_accountAddress];
  }
}

contract SingleWaterTank is GeneralDevice, IWaterTank {
  
  using PriceLib for *;

  uint    capacity;                 // maximum volume of water
  uint    currentVolume;            // current volume of water
  uint    previousVolume;
  uint    consumption;              // amount of water that needs to be supplied by HP (estimed by the water tank) for the next 10 min
  uint    price;
  uint    waterType;                // two types of water : 0 - medium temperature and 1 - high temperature
  uint[]  volMap;

  PriceLib.PriceMap prsMap;

// ======= Modifiers =======

// ======= Event Logs =======

  event VolLog(address adr, uint vol, uint volAt);
  event PrsLog(uint price, uint priceAt);
  event ConsumptionUpdate(uint updateAt);

// ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SingleWaterTank (address adr,  uint cap, uint wType) GeneralDevice(adr) public adminOnly {
    capacity = cap;
    waterType = wType;
  }

  function setVolume(uint vol) public ownerOnly {
    // Can only be triggered once....Should be moved into the constructor...Once the initial volumne is set, can only be changed by energy trading.
    previousVolume = currentVolume;
    currentVolume = vol;
    volStatusAt = now;
    VolLog(owner,vol,volStatusAt);
  }

  // --- 1. set and get the active purchase volume (if battery wants) and selling price every 15 min (or less) ---

  function setConsumption(uint consum) public timed(1) ownerOnly {
    consumption = consum;
    consumStatusAt = now;
    ConsumptionUpdate(consumStatusAt);
  }

  function getConsumption() public view returns (uint consum, bool updatedOrNot) { // connectedHouseOnly external
    consum = consumption;
    if (consumStatusAt + consumTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
  }

  // --- 2. ask HP for the last price that it set ---
  // ---    also calculate the new price ---

  function askForPrice() public timed(2) {
    uint tP = 0;
    bool tF = false;
    //prsMap.initPrsTable();
    for (uint i = 0; i < connectedDevice[3].length; i++) {
      (tP,tF) = IHeatPump(connectedDevice[3][i]).getPrice();
      prsMap.setPrice(connectedDevice[3][i],i,tP,tF);
    }
    prsMap.totalLength = connectedDevice[3].length;
    // calculate price
    price = prsMap.calPrice(price,previousVolume,currentVolume);
    priceStatusAt = now;
    PrsLog(price,priceStatusAt);

  }

  function getPrice() external view returns(uint prs) {
    prs = price;
  }

  // --- 3. Water tank ask Houses for their water consumption --- 

  function askForNeed() public timed(3) {
    uint consumMT;
    uint consumHT;
    uint consumAt;

    // draftRankMap.initRnkTable();
    for (uint i = 0; i < connectedDevice[0].length; i++) {
      (consumMT, consumHT, consumAt) = IHouseH(connectedDevice[0][i]).getConsumptionH();
      if (waterType == 0) {   //Medium temperature water tank
        //draftRankMap.addToRnkTable(connectedDevice[0][i],consum, rank, tot);
        volMap[i] = consumMT;
      } else {
        volMap[i] = consumHT;
      }
    }
    needStatusAt = now;
  }

  // --- 4. HP sell water to water tank ---

  function goNoGo(uint giveoutvol, uint prs) public timed(4) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[3].assertInside(adrDevice));
    takeoutvol = consumption.findMin(giveoutvol);
    currentVolume += takeoutvol;
    volStatusAt = now;
    VolLog(owner,currentVolume,volStatusAt);
    consumption -= takeoutvol;
    wallet -= int(takeoutvol*prs);
    return (takeoutvol); 
  }

  // --- 4. Water tank send water to houses ---

  function sellEnergy() public timed(4) {
    uint giveoutVol;
    uint whatDeviceAccept;

    for (uint i = 0; i < connectedDevice[0].length; i++) {
      giveoutVol = currentVolume.findMin(volMap[i]);
      whatDeviceAccept = IHouseH(connectedDevice[0][i]).goNoGoHeating(giveoutVol,price,waterType);
      currentVolume -= whatDeviceAccept;
      volStatusAt = now;
      VolLog(owner,currentVolume,volStatusAt);
      wallet += int(whatDeviceAccept * price);
      volMap[i] -= whatDeviceAccept;
    }
  }

  // // --- 5. Deal with excess energy --- 

  // function goExcess(uint vol) timed(5) returns (uint takeVol, uint prs) {
  //   prs = priceForBuy;
  //   takeVol = vol.findMin(capacity-currentVolume);
  //   currentVolume = currentVolume.clearExcessTransfer(takeVol, address(this));
  //   wallet -= int(takeVol*prs);
  // }

}
