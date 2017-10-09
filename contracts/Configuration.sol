pragma solidity ^0.4.4;

contract Configuration {

  uint public statusAt; // timestamp of the update
  uint8 public numHouseTotal;       // number of houses in the system
  uint8 public numPVTotal;          // number of PVs in the system
  uint8 public numBatteryTotal;     // number of batteries in the system
  uint8 private numHouseCurrent;    // current houses in the system
  uint8 private numPVCurrent;       // current PVs in the system
  uint8 private numBatteryCurrent;    // current batteries in the system

  enum deviceType {PVpannel,House,Battery}

  // Several types of devices in the system
  struct House {
    address Address;
    string  name;             // name of the house
    uint    consumption;      // Production of electricity (consumption: positive)
    uint    statusAt;         // timestamp of the update
    //address[] connectedPV;    // List of PV connected
    //address[] connectedBattery;// List of batteries connected
    mapping(address=>PVpannel) connectedPV;       // List of PV connected
    mapping(address=>Battery) connectedBattery;   // List of batteries connected
  }

  struct PVpannel {
    address Address;
    string  name;             // name of the device (Serie No.)
    int    production;        // Production of electricity (supply: negative)
    uint    statusAt;         // timestamp of the update
    address[] connectedHouse; // List of households connected
    address[] connectedBattery;// List of batteries connected
  }

  struct Battery {
    address Address;
    string  name;             // name of the device (Serie No.)
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

  function Configuration(uint8 numHouse, uint8 numPV, uint8 numBattery) {
      // constructor
      numHouseTotal = numHouse;
      numPVTotal = numPV;
      numBatteryTotal = numBattery;
      statusAt = now;
      LogConfig(numHouseTotal,numPVTotal,numBatteryTotal,statusAt);
  }

  function addHouse(address adr, uint consum) {
      require(numHouseCurrent < numHouseTotal);// "Error: House number maximun. Cannot add more houses."
      House memory tempHouse;
      tempHouse.Address = adr;
      tempHouse.consumption = consum;
      tempHouse.statusAt = statusAt;
      Houses[adr] = tempHouse;
      numHouseCurrent++;
      LogDevice(adr);
  }

  function addPV(address adr, int produc) {
      require(numPVCurrent < numPVTotal); //"Error: House number maximun. Cannot add more houses."
      PVpannel memory tempPV;
      tempPV.Address = adr;
      tempPV.production = produc;
      tempPV.statusAt = statusAt;
      PVs[adr] = tempPV;
      numPVCurrent++;
      LogDevice(adr);
  }

  function addBattery(address adr, uint capacity, uint currentVolume) {
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
    function checkHouseAdr(address adrHouse) returns (address) {
        return (Houses[adrHouse].Address);
    }
    function checkPVPro(address adrPV) returns (int) {
        return (PVs[adrPV].production);
    }
    function checkPVAdr(address adrPV) returns (address) {
        return (PVs[adrPV].Address);
    }
    function checkHousePVConnection(address adrHouse, address adrPV) returns (address) {
        return (Houses[adrHouse].connectedPV[adrPV].Address);
    }

  function linkHousePV(address adrHouse, address adrPV) {
      require(Houses[adrHouse].Address != 0x0); //  "Error: House does not exist!"
      require(PVs[adrPV].Address != 0x0); //  "Error: PV does not exist!"
      require(Houses[adrHouse].connectedPV[adrPV].Address == address(0)); //  "Error: Already connected!"
      Houses[adrHouse].connectedPV[adrPV] = PVs[adrPV];
      PVs[adrPV].connectedHouse.push(adrHouse);
      LogConnection(adrHouse,adrPV);
  }

  function linkHouseBattery(address adrHouse, address adrBattery) {
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
}
