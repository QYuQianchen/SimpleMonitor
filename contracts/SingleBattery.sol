pragma solidity ^0.4.4;

contract SingleBattery {

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public Address;
  bytes32 public name;              // name of the device (Serie No.)
  uint    capacity;                 // Production of electricity
  uint    currentVolume;            // Production of electricity
  uint    volTimeOut = 5 minutes;
  uint    volStatusAt;              // timestamp of the update
  
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;
  uint    priceForSale;
  uint    priceForBuy;
  uint    priceForExcessEnergy;     // lower than the normal price
  address[] connectedHouse; // List of households connected
  address[] connectedPV;// List of PV connected
  
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

  modifier connectedPVOnly (address adrP) {
    var check = false;
    for (var i = 0; i < connectedPV.length; i++) {
      if (msg.sender == connectedPV[i]) {
        check = true;
      }
    }
    if (check == true) {
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

  modifier timed (uint initialTime, uint allowedTimeOut) {
    if(now < initialTime + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

  function SingleBattery (address adr,  uint cap, address adm) {
    // constructor
    Address = adr;
    Admin = adm;
    capacity = cap;
  }

  function setVolume(uint vol) ownerOnly {
    currentVolume = vol;
    volStatusAt = now;
  }

  function setPrice(uint prsSale, uint prsBuy, uint prsExcess) ownerOnly {
    priceForSale = prsSale;
    priceForBuy = prsBuy;
    priceForExcessEnergy = prsExcess;
    priceStatusAt = now;
  }

  function addConnectedPV(address adrP) adminOnly external {
    connectedPV.push(adrP);
  }

  function deleteConnectedPV(address adrP) adminOnly external {
    for (var i = 0; i < connectedPV.length; i++) {
      if (adrP == connectedPV[i]) {
        delete connectedPV[i];
        if (i != connectedPV.length-1) {
          connectedPV[i] = connectedPV[connectedPV.length-1];
        }
        connectedPV.length--;
      }
    }
  }

  function addConnectedHouse(address adrH) adminOnly external {
    connectedHouse.push(adrH);
  }

  function deleteConnectedHouse(address adrH) adminOnly external {
    for (var i = 0; i < connectedHouse.length; i++) {
      if (adrH == connectedHouse[i]) {
        delete connectedHouse[i];
        if (i != connectedHouse.length-1) {
          connectedHouse[i] = connectedHouse[connectedHouse.length-1];
        }
        connectedHouse.length--;
      }
    }
  }

  function getVolumeCapacity (uint initTime) timed(initTime,volTimeOut) external returns (uint vol, uint volAt, uint cap) {
    vol = currentVolume;
    volAt = volStatusAt;
    cap = capacity;
  }

  function getSalePrice(uint queryTime) connectedHouseOnly external returns (uint prs, bool updatedOrNot, address adr) {
    prs = priceForSale;
    //prsAt = priceStatusAt;
    if (priceStatusAt < queryTime+priceTimeOut) {
      updatedOrNot = true;
    } else {
      updatedOrNot = false;
    }
    adr = Address;
  }
}
