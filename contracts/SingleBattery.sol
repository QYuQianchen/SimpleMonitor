pragma solidity ^0.4.4;

import "./IBattery.sol";
import "./SortLib.sol"; 
import "./AdrLib.sol"; 
//For simplicity, we do not use the sorting functions here, as in our configuration, there is only one battery and there's only one PV connected.  
import "./IPV.sol";
import "./IGrid.sol";

contract SingleBattery is IBattery {
  
  using AdrLib for address[];

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public owner;
  bytes32 public name;              // name of the device (Serie No.)
  uint    capacity;                 // Cap of the device
  uint    currentVolume;            // Production of electricity
  uint    buyVolume;                // Amount of electricity that this battery would like to buy. Will first participate in the supply competition 
                                    //and will be finally (anyway) fulfilled b either the network or from the grid...
  uint    volTimeOut = 5 minutes;
  uint    volStatusAt;              // timestamp of the update
  
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;
  uint    priceForSale;
  uint    priceForBuy;              // lower than market price
  uint    priceForExcessEnergy;     // lower than market price
  address grid = 0x0;                     // contract address of grid
  address[] connectedHouse; // List of households connected
  address[] connectedPV;// List of PV connected
  
  /*struct PriceTF {
    uint  prs;
    bool  updated;
  }*/

  using SortLib for SortLib.PriceTF[];
  SortLib.PriceTF[] prepPriceQueryInfo;
  uint    lastPriceQueryAt;

  mapping(address=>SortLib.PriceTF) priceQueryInfo;
  mapping(uint=>address) sortedPriceQueryInfo;

  function askForPrice() {
    // House query price info to all the connected PV/Battery. 
    // If the house is connected to grid (most of the time), the price of Grid will be automatically added to the end of the sorted list.
    uint tP = 0;
    bool tF = false;
    for (uint i = 0; i < connectedPV.length; i++) {
      (tP,tF) = IPV(connectedPV[i]).getPrice();
      priceQueryInfo[connectedPV[i]] = SortLib.PriceTF(tP,tF);
    }
    lastPriceQueryAt = now;
  }

  function sort() { // we are not doing sorting here -> as there is only 1 PV in the exercise layout
    sortedPriceQueryInfo[0] = connectedPV[0];
    if (grid != 0x0) {
      sortedPriceQueryInfo[1] = grid;
    } 
  } 

  function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated) {
    // address adr = msg.sender;     //If the PV is connected
    consum = buyVolume;
    rank = 1; // We only have one PV connnected (In the demo layout)
    if (grid != 0x0) {
      tot = connectedPV.length + 1;
    } else {
      tot = connectedPV.length;
    }
    if (lastPriceQueryAt + priceTimeOut < now) {
      updated = false;    // The house may be inactive for a while, so the list stored is outdated.
    } else {
      updated = true;      
    }
  }


  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  modifier adminOnly {
    if (msg.sender == Admin) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedPVOnly (address adrP) {
    if (connectedPV.AssertInside(adrP) == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedHouseOnly {
    if (connectedPV.AssertInside(msg.sender) == true) {
      _;
    } else {
      revert();
    }
  }

  modifier timed (uint initialTime, uint allowedTimeOut) {
    if(now < initialTime + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

  event VolLog(address adr, uint vol, uint volAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);

  function SingleBattery (address adr,  uint cap) {
    // constructor
    owner = adr;
    Admin = msg.sender;
    capacity = cap;
  }

  function setGridAdr(address adr) adminOnly external{
    grid = adr;
  }

  function setVolume(uint vol) ownerOnly {
    // Can only be triggered once....Should be moved to the constructor...Once the initial volumne is set, can only be changed by energy trading.
    currentVolume = vol;
    volStatusAt = now;
    VolLog(owner,vol,volStatusAt);
  }

  function setPrice(uint prsSale, uint prsBuy, uint prsExcess) ownerOnly {
    priceForSale = prsSale;
    priceForBuy = prsBuy;
    priceForExcessEnergy = prsExcess;
    priceStatusAt = now;
    PriceUpdate(priceStatusAt);
  }

  function setBuyVolume(uint v) ownerOnly {
    buyVolume = v;
  }

  // function askForPrice() {} // to ask for prices set by PVs...

  function addConnectedPV(address adrP) adminOnly external {
    connectedPV.push(adrP);
    ConfigurationLog("PV linked to Battery",now);
  }

  /*function deleteConnectedPV(address adrP) adminOnly external {
    for (uint i = 0; i < connectedPV.length; i++) {
      if (adrP == connectedPV[i]) {
        delete connectedPV[i];
        if (i != connectedPV.length-1) {
          connectedPV[i] = connectedPV[connectedPV.length-1];
        }
        connectedPV.length--;
      }
    }
  }*/

  function addConnectedHouse(address adrH) adminOnly external {
    connectedHouse.push(adrH);
    ConfigurationLog("House linked to Battery",now);
  }

  /*function deleteConnectedHouse(address adrH) adminOnly external {
    for (uint i = 0; i < connectedHouse.length; i++) {
      if (adrH == connectedHouse[i]) {
        delete connectedHouse[i];
        if (i != connectedHouse.length-1) {
          connectedHouse[i] = connectedHouse[connectedHouse.length-1];
        }
        connectedHouse.length--;
      }
    }
  }*/

  function getVolumeCapacity (uint initTime) timed(initTime,volTimeOut) external returns (uint vol, uint volAt, uint cap) {
    vol = currentVolume;
    volAt = volStatusAt;
    cap = capacity;
  }

  function getSalePrice() returns (uint prs, bool updatedOrNot) { // connectedHouseOnly external
    prs = priceForSale;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
    //adr = owner;
  }

  function getExcess() returns (uint prs, uint cap) {
    prs = priceForExcessEnergy;
    cap = capacity - currentVolume;
  }

}
