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

  function PV(address adr, address adm) {
    // constructor
    Address = adr;
    Admin = adm;
  }

  function setProduction(uint produc) ownerOnly {
    production = produc;
    prodStatusAt = now;
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
  }

  function addConnectedHouse(address adrH) adminOnly {
    //connectedHouse.push(adrH);
    connectedHouse[adrH] = true;
    connectedHouseNum++;
  }

  function deleteConnectedHouse(address adrH) adminOnly {
    connectedHouse[adrH] = false;
    connectedHouseNum--;
  }

  function addConnectedBattery(address adrB) adminOnly {
    //connectedHouse.push(adrH);
    connectedBattery[adrB] = true;
    connectedBatteryNum++;
  }

  function deleteConnectedBattery(address adrB) adminOnly {
    connectedBattery[adrB] = false;
    connectedBatteryNum--;
  }

  function getProduction(uint queryTime) timed(queryTime,prodTimeOut) returns (uint prod, uint prodAt) {
    prod = production;
    prodAt = prodStatusAt;
  }

  function getPrice(uint queryTime) connectedHouseOnly returns (uint prs, uint prsAt, bool updatedOrNot) {
    prs = price;
    prsAt = priceStatusAt;
    if (now < queryTime+priceTimeOut) {
      updatedOrNot = true;
    } else {
      updatedOrNot = false;
    }
  }
}
