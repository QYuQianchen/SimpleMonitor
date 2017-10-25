pragma solidity ^0.4.4;

import "./SingleHouse.sol";
import "./SinglePV.sol";
import "./SingleBattery.sol";

contract Configuration {

  address public admin = msg.sender; // only the admin node can modify the configuration...
  uint public statusAt; // timestamp of the update
  uint8 public numHouseTotal;       // number of houses in the system
  uint8 public numPVTotal;          // number of PVs in the system
  uint8 public numBatteryTotal;     // number of batteries in the system
  uint8 private numHouseCurrent = 0;    // current houses in the system
  uint8 private numPVCurrent = 0;       // current PVs in the system
  uint8 private numBatteryCurrent = 0;    // current batteries in the system

  enum deviceType {House,PVpannel,Battery}

  // Several types of devices in the system
  struct House {
    address Address;
    bytes32  name;             // name of the house
    uint    consumption;      // Production of electricity (consumption: positive)
    uint    statusAt;         // timestamp of the update
    //address[] connectedPV;    // List of PV connected
    //address[] connectedBattery;// List of batteries connected
    mapping(address=>PVpannel) connectedPV;       // List of PV connected
    mapping(address=>Battery) connectedBattery;   // List of batteries connected
  }

  struct PVpannel {
    address Address;
    bytes32  name;             // name of the device (Serie No.)
    uint    production;        // Production of electricity (supply: negative) -> tbd
    uint    statusAt;         // creation time
    address[] connectedHouse; // List of households connected
    address[] connectedBattery;// List of batteries connected
  }

  struct Battery {
    address Address;
    bytes32  name;             // name of the device (Serie No.)
    uint    capacity;         // Production of electricity
    uint    currentVolume;    // Production of electricity
    uint    statusAt;         // timestamp of the update
    address[] connectedHouse; // List of households connected
    address[] connectedPV;// List of PV connected
  }

  event LogConfig(uint numHouses, uint numPV, uint numBattery, uint statusat);
  event LogDevice(address deviceAdr);
  event LogConnection(address device1, address device2);


  mapping(address=>House) Houses;
  mapping(address=>PVpannel) PVs;
  mapping(address=>Battery) Batteries;
  //House[3] public houseArray;
  //PVpannel[2] public pvArray;
  //Battery[1] public batteryArray;

  //mapping(address=>MatchableHouse) mHouses;
  SingleHouse[] mHouse;
  SinglePV[] mPV;
  SingleBattery[] mBattery;

  // Restricts execution by admin only
  modifier ownerOnly {
    if(msg.sender == admin){
      _;
    } else {
    // For now, the request will be rejected.
    // Later, we should add the approval mechanism, such that each user can add their device to the network and let admin to approve it. 
      revert();
    }
  }

  function Configuration(uint8 numHouse, uint8 numPV, uint8 numBattery) ownerOnly {
      // constructor
      numHouseTotal = numHouse;
      numPVTotal = numPV;
      numBatteryTotal = numBattery;
      statusAt = now;
      LogConfig(numHouseTotal,numPVTotal,numBatteryTotal,statusAt);
  }

  function addHouse(address adr, uint consum) ownerOnly {
      // add only the contract address inside.
      // uint consum should be added later inside the contract HOUSE
      require(numHouseCurrent < numHouseTotal);// "Error: House number maximun. Cannot add more houses."
      House memory tempHouse;
      tempHouse.Address = adr;
      tempHouse.consumption = consum;
      tempHouse.statusAt = statusAt;    // creation time
      Houses[adr] = tempHouse;
      numHouseCurrent++;
      mHouse.push(new SingleHouse(adr, admin));
      LogDevice(adr);
  }

  function addPV(address adr, uint produc) ownerOnly {
      require(numPVCurrent < numPVTotal); //"Error: House number maximun. Cannot add more houses."
      // create a PV contract instead of creating a new PV struct. Or, at the same time.
      PVpannel memory tempPV;
      tempPV.Address = adr;
      tempPV.production = produc;
      tempPV.statusAt = statusAt;       // creation time
      PVs[adr] = tempPV;
      numPVCurrent++;
      LogDevice(adr);
  }

  function addBattery(address adr, uint capacity, uint currentVolume) ownerOnly {
      require(numBatteryCurrent < numBatteryTotal); // "Error: House number maximun. Cannot add more houses."
      Battery memory tempBattery;
      tempBattery.Address = adr;
      tempBattery.capacity = capacity;
      tempBattery.currentVolume = currentVolume;
      tempBattery.statusAt = statusAt;
      Batteries[adr] = tempBattery;
      numBatteryCurrent++;
      LogDevice(adr);
  }

    // test functions
    
    function checkHouseCon(address adrHouse) returns (uint) {
        return (Houses[adrHouse].consumption);
    }
    /*function checkHouseAdr(address adrHouse) returns (address) {
        return (Houses[adrHouse].Address);
    }*/
    function checkPVPro(address adrPV) returns (uint) {
        return (PVs[adrPV].production);
    }/*
    function checkPVAdr(address adrPV) returns (address) {
        return (PVs[adrPV].Address);
    }
    function checkHousePVConnection(address adrHouse, address adrPV) returns (address) {
        return (Houses[adrHouse].connectedPV[adrPV].Address);
    }*/
    function getAdmin() constant returns (address) {
        return admin;
    }    

  function linkHousePV(address adrHouse, address adrPV) ownerOnly {
      require(Houses[adrHouse].Address != 0x0); //  "Error: House does not exist!"
      require(PVs[adrPV].Address != 0x0); //  "Error: PV does not exist!"
      require(Houses[adrHouse].connectedPV[adrPV].Address == address(0)); //  "Error: Already connected!"
      Houses[adrHouse].connectedPV[adrPV] = PVs[adrPV];
      PVs[adrPV].connectedHouse.push(adrHouse);
      LogConnection(adrHouse,adrPV);
  }

  function linkHouseBattery(address adrHouse, address adrBattery) ownerOnly {
      require(Houses[adrHouse].Address != 0x0); //   "Error: House does not exist!"
      require(Batteries[adrBattery].Address != 0x0); //    "Error: Battery does not exist!"
      require(Houses[adrHouse].connectedBattery[adrBattery].Address == 0x0); //    "Error: Already connected!"
      Houses[adrHouse].connectedBattery[adrBattery] = Batteries[adrBattery];
      Batteries[adrBattery].connectedHouse.push(adrHouse);
      LogConnection(adrHouse,adrBattery);
  }

  function linkPVBattery(address adrPV, address adrBattery) {
      require(PVs[adrPV].Address != 0x0); //   "Error: PV does not exist!"
      require(Batteries[adrBattery].Address != 0x0); //    "Error: Battery does not exist!"
      require(msg.sender == admin);     // "Error: someone else wants to add a battery into the system"
      for (uint k = 0;k<PVs[adrPV].connectedBattery.length;k++) {
           require(PVs[adrPV].connectedBattery[k] != adrBattery); //    "Error: Already connected!"
      }
      PVs[adrPV].connectedBattery.push(adrBattery);
      Batteries[adrBattery].connectedPV.push(adrPV);
      LogConnection(adrPV,adrBattery);
  }

  function getPVConnection(address adrPV) returns (uint numConnectedHouse, uint numConnectedBattery) {
      numConnectedHouse = PVs[adrPV].connectedHouse.length;
      numConnectedBattery = PVs[adrPV].connectedBattery.length;
  }

  function getBatteryConnection(address adrBattery) returns (uint numConnectedHouse, uint numConnectedPV) {
      numConnectedHouse = Batteries[adrBattery].connectedHouse.length;
      numConnectedPV = Batteries[adrBattery].connectedPV.length;
  }

  function assertHouseConnection(address adrHouse, address adr) returns (bool) {
      if (Houses[adrHouse].connectedBattery[adr].Address != 0x0 || Houses[adrHouse].connectedPV[adr].Address != 0x0) {
          return true;
      } else {
          return false;
      }
  }

  function assertPVConnection(address adrPV, address adr) returns (bool) {
      var cH = PVs[adrPV].connectedHouse.length;
      var cB = PVs[adrPV].connectedBattery.length;
      for (uint i = 0; i < cH; i++) {
          if (PVs[adrPV].connectedHouse[i] == adr) {
              return true;
          }
      }
      for (uint j = 0; j < cB; j++) {
          if (PVs[adrPV].connectedBattery[j] == adr) {
              return true;
          }
      }
      return false;
  }

  function assertBatteryConnection(address adrBattery, address adr) returns (bool) {
      var cH = Batteries[adrBattery].connectedHouse.length;
      var cP = Batteries[adrBattery].connectedPV.length;
      for (uint i = 0; i < cH; i++) {
          if (Batteries[adrBattery].connectedHouse[i] == adr) {
              return true;
          }
      }
      for (uint j = 0; j < cP; j++) {
          if (Batteries[adrBattery].connectedPV[j] == adr) {
              return true;
          }
      }
      return false;
  }

    function getDeviceType(address adr) returns (uint8) {
        // deviceType {House,PVpannel,Battery}
        if (Houses[adr].Address != 0x0) {
            return 0;
        } else if (PVs[adr].Address != 0x0) {
            return 1;
        } else if (Batteries[adr].Address != 0x0) {
            return 2;
        } else {
            return 15;   // when the address corresponds no device in the configuration...
        }
  }

    function isConnected(address adr1, address adr2) external returns (bool) {
        if (Houses[adr1].Address != 0x0) {
            return assertHouseConnection(adr1,adr2);
        } else if (PVs[adr1].Address != 0x0) {
            return assertPVConnection(adr1,adr2);
        } else if (Batteries[adr1].Address != 0x0) {
            return assertBatteryConnection(adr1,adr2);
        } else {
            return false;   // when the address corresponds no device in the configuration...
        }
  }

    function canTransactEnergy(address adr1, address adr2) external returns (bool availability, uint productCap, uint consumpCap) {
        var dT1 = getDeviceType(adr1);
        var dT2 = getDeviceType(adr2);
        if (dT1 == 0 || dT1 == 15) {
            return(false,0,0);
        } else if (dT1 == 1) {
            // from PV panels to ...
            if (dT2 == 0) {
                availability = assertPVConnection(adr1,adr2);
                productCap = PVs[adr1].production;
                consumpCap = Houses[adr2].consumption;
            } else if (dT2 == 2) {
                availability = assertPVConnection(adr1,adr2);
                productCap = PVs[adr1].production;
                consumpCap = Batteries[adr2].capacity-Batteries[adr2].currentVolume;
            } else {
                return(false,0,0);
            }
        } else if (dT1 == 2) {
            // from Storage to ...
            if (dT2 == 0) {
                availability = assertBatteryConnection(adr1,adr2);
                productCap = Batteries[adr1].currentVolume;
                consumpCap = Houses[adr2].consumption;
            } else if (dT2 == 2) {
                availability = assertBatteryConnection(adr1,adr2);
                productCap = Batteries[adr1].currentVolume;
                consumpCap = Batteries[adr2].capacity-Batteries[adr2].currentVolume;
            } else {
                return(false,0,0);
            }
        }
    }

 /*   function canTransactEnergyExtA(address adr1, address adr2) external returns (bool) {
        var (a,b,c) = canTransactEnergy(adr1, adr2);
        return a;
    }

    function canTransactEnergyExtB(address adr1, address adr2) external returns (uint) {
        var (a,b,c) = canTransactEnergy(adr1, adr2);
        return b;
    }
    function canTransactEnergyExtC(address adr1, address adr2) external returns (uint) {
        var (a,b,c) = canTransactEnergy(adr1, adr2);
        return c;
    }
*/

    function changeStatus (address _from, address _to, uint8 _value) returns (bool) {
    var dT1 = getDeviceType(_from);
    var dT2 = getDeviceType(_to);

    if (dT1 == 1) {
      // from PV panels to ...
      if (dT2 == 0) {
        Houses[_to].consumption -= _value;
      } else { // if (dT2 == 2) 
        Batteries[_to].currentVolume -= _value;
      }
      PVs[_from].production -= _value;
      return true;
    } else if (dT1 == 2) {
      // from Storage to ...
      if (dT2 == 0) {
        Houses[_to].consumption -= _value;
      } else { // if (dT2 == 2)
        Batteries[_to].currentVolume -= _value;
      }
      Batteries[_from].currentVolume -= _value;
      return true;
    } else {
      return false;
    }
    
  }   
}
