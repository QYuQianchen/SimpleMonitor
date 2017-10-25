pragma solidity ^0.4.4;

contract PV {

  // one contract is associated to one particular PV panel in the network.
  // later we need to modify the parent contract that creates each PV contract - configuration.sol
  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public Address;
  bytes32 public name;              // name of the device (Serie No.)
  uint    production;               // Production of electricity (supply: negative)
  uint    prodStatusAt;             // timestamp of the update (prod)
  uint    prodTimeOut = 5 minutes;
  uint    price;
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;
  //mapping(address=>bool) connectedHouse;      // List of households connected
  // mapping(address=>bool) connectedBattery;   // List of batteries connected
  //uint    connectedHouseNum;
  //uint    connectedBatteryNum;  
  address[] connectedHouse;         // List of households connected
  address[] connectedBattery;       // List of batteries connected
  
  modifier ownerOnly {
    if (msg.sender == Address) {
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

  modifier connectedHouseOnly {
    var check = false;
    for (var i = 0; i < connectedHouse.length; i++) {
      if (msg.sender == connectedHouse[i]) {
        check = true;
      }
    }
    if (check == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedBatteryOnly (address adrB) {
    var check = false;
    for (var i = 0; i < connectedBattery.length; i++) {
      if (msg.sender == connectedBattery[i]) {
        check = true;
      }
    }
    if (check == true) {
      _;
    } else {
      revert();
    }
  }

  modifier timed (uint initialTime, uint allowedTimeOut){
    if(now < initialTime + allowedTimeOut){
      _;
    } else {
      revert();
    }
  }

  event ProductionLog(address adr, uint produc, uint prodAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);

  function PV(address adr, address adm) {
    // constructor
    Address = adr;
    Admin = adm;
  }

  function setProduction(uint produc) ownerOnly {
    production = produc;
    prodStatusAt = now;
    ProductionLog(Address, production, prodStatusAt);
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
    PriceUpdate(now);
  }

  function addConnectedHouse(address adrH) adminOnly external {
    connectedHouse.push(adrH);
    ConfigurationLog("House Connected",now);
  }

  function deleteConnectedHouse(address adrH) adminOnly external (bool) {
    for (var i = 0; i < connectedHouse.length; i++) {
      if (adrH == connectedHouse[i]) {
        delete connectedHouse[i];
        if (i != connectedHouse.length-1) {
          connectedHouse[i] = connectedHouse[connectedHouse.length-1];
        }
        connectedHouse.length--;
        ConfigurationLog("House Deleted",now);
        return true;
      }
    }
    return false;
  }

  function addConnectedBattery(address adrB) adminOnly external {
    connectedBattery.push(adrB);
    ConfigurationLog("Battery Added",now);

  }

  function deleteConnectedBattery(address adrB) adminOnly external (bool) {
    for (var i = 0; i < connectedBattery.length; i++) {
      if (adrB == connectedBattery[i]) {
        delete connectedBattery[i];
        if (i != connectedBattery.length-1) {
          connectedBattery[i] = connectedBattery[connectedBattery.length-1];
        }
        connectedBattery.length--;
        ConfigurationLog("Battery Deleted",now);
        return true;
      }
    }
    return false;
  }

  function getProduction(uint queryTime) timed(queryTime,prodTimeOut) external returns (uint prod, uint prodAt) {
    prod = production;
    prodAt = prodStatusAt;
  }

  function getPrice(uint queryTime) connectedHouseOnly external returns (uint prs, bool updatedOrNot, address adr) {
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt < queryTime+priceTimeOut) {
      updatedOrNot = true;
    } else {
      updatedOrNot = false;
    }
    adr = Address;
  }

  function getPriceRanking(address adrH) ownerOnly {

  }
}
