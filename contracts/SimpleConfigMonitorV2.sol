pragma solidity ^0.4.4;

contract SimpleConfigMonitorV2 {

  uint public transactionCount; // transactions executed within the system
  uint public statusAt; // timestamp of the update

  //address winner;

  // Several types of devices in the system
  struct PVpannel {
    address pvAddress;
    string  name;             // name of the device
    uint    production;       // Production of electricity
    uint    statusAt;         // timestamp of the update
    address[] connectedHouse; // List of households connected
    address[] connectedBattery;// List of batteries connected
  }

  struct House {
    address houseAddress;
    string  name;             // name of the device
    uint    consumption;      // Production of electricity
    uint    statusAt;         // timestamp of the update
    address[] connectedPV;    // List of households connected
    address[] connectedBattery;// List of batteries connected
  }

  struct Battery {
    address batteryAddress;
    string  name;             // name of the device
    uint    capacity;         // Production of electricity
    uint    currentVolume;    // Production of electricity
    uint    statusAt;         // timestamp of the update
    address[] connectedHouse; // List of households connected
    address[] connectedPV;// List of batteries connected
  }

  mapping(address=>PVpannel) pvMapping;
  mapping(address=>House) houseMapping;
  mapping(address=>Battery) batteryMapping;

  enum deviceType {PVpannel,House,Battery}

  House[3] public houseArray;
  PVpannel[2] public pvArray;
  Battery[1] public batteryArray;

  function SimpleConfigMonitorV2(uint8 num0, uint8 num1, uint8 num2, uint8 num3, uint8 num4, uint8 num5) {
    // constructor
    pvArray[0].production = num0;
    pvArray[1].production = num1;
    houseArray[0].consumption = num2;
    houseArray[1].consumption = num3;
    houseArray[2].consumption = num4;
    batteryArray[0].currentVolume = num5;

    statusAt = now;

    pvArray[0].statusAt = statusAt;
    pvArray[1].statusAt = statusAt;
    houseArray[0].statusAt = statusAt;
    houseArray[1].statusAt = statusAt;
    houseArray[2].statusAt = statusAt;
    batteryArray[0].statusAt = statusAt;
  
  }

  function systemConfiguration(address adr0, address adr1, address adr2, address adr3, address adr4, address adr5) {
    // linke accounts to devices/households
    
     /*pvMapping[adr0] = pvArray[0];
    pvMapping[adr1] = pvArray[1];
    houseMapping[adr2] = houseArray[0];
    houseMapping[adr3] = houseArray[1];
    houseMapping[adr4] = houseArray[2];
    batteryMapping[adr5] = batteryArray[0];
     */

    pvArray[0].pvAddress = adr0;
    pvArray[1].pvAddress = adr1;
    houseArray[0].houseAddress = adr2;
    houseArray[1].houseAddress = adr3;
    houseArray[2].houseAddress = adr4;
    batteryArray[0].batteryAddress = adr5;
    

    // connect the system into pre-defined configuration
    pvArray[0].connectedHouse.length = 1;
    pvArray[0].connectedBattery.length = 1;
    pvArray[0].connectedHouse[0] = houseArray[0].houseAddress;
    pvArray[0].connectedBattery[0] = batteryArray[0].batteryAddress;

    pvArray[1].connectedHouse.length = 2;
    pvArray[1].connectedBattery.length = 0;
    pvArray[1].connectedHouse[0] = houseArray[1].houseAddress;
    pvArray[1].connectedHouse[1] = houseArray[2].houseAddress;

    houseArray[0].connectedPV.length = 1;
    houseArray[0].connectedBattery.length = 1;
    houseArray[0].connectedPV[0] = pvArray[0].pvAddress;
    houseArray[0].connectedBattery[0] = batteryArray[0].batteryAddress;

    houseArray[0].connectedPV.length = 1;
    houseArray[0].connectedBattery.length = 0;
    houseArray[0].connectedPV[0] = pvArray[1].pvAddress;

    houseArray[2].connectedPV.length = 1;
    houseArray[2].connectedBattery.length = 1;
    houseArray[2].connectedPV[0] = pvArray[1].pvAddress;
    houseArray[2].connectedBattery[0] = batteryArray[0].batteryAddress;

    batteryArray[0].connectedHouse.length = 2;
    batteryArray[0].connectedPV.length = 1;
    batteryArray[0].connectedHouse[0] = houseArray[0].houseAddress;
    batteryArray[0].connectedHouse[1] = houseArray[2].houseAddress;
    batteryArray[0].connectedPV[0] = pvArray[0].pvAddress;
    batteryArray[0].capacity = 20;  // kW
  }

  function getAddress(uint8 arg, uint8 num) returns (address) {
    if (arg == uint8(deviceType.PVpannel)) {
      return pvArray[num].pvAddress;
    } else if (arg == uint8(deviceType.House)) {
     return houseArray[num].houseAddress;
    } else if (arg == uint8(deviceType.Battery)) {
      return batteryArray[num].batteryAddress;
    }
  }

  function getCurrentStatus(uint8 arg, uint8 num) returns (uint) {
     if (arg == uint8(deviceType.PVpannel)) {
       return pvArray[num].production;
     } else if (arg == uint8(deviceType.House)) {
       return houseArray[num].consumption;
     } else if (arg == uint8(deviceType.Battery)) {
       return batteryArray[num].currentVolume;
     }
  }

  function checkInMapping(address adr) returns (uint8 a, uint8 b) {
    /*if (pvMapping[adr].pvAddress != 0x0) {
      return uint8(deviceType.PVpannel);
    } else if (houseMapping[adr].houseAddress != 0x0) {
      return uint8(deviceType.House);
    } else if (batteryMapping[adr].batteryAddress != 0x0) {
      return uint8(deviceType.Battery);
    } else {
      return 9;
    }*/
    
    if (pvArray[0].pvAddress == adr) {
      a = 0;
      b = 0;
    } else if (pvArray[1].pvAddress == adr) {
      a = 0;
      b = 1;
    } else if (houseArray[0].houseAddress == adr) {
      a = 1;
      b = 0;
    } else if (houseArray[1].houseAddress == adr) {
      a = 1;
      b = 1;
    } else if (houseArray[2].houseAddress == adr) {
      a = 1;
      b = 2;
    } else if (batteryArray[0].batteryAddress == adr) {
      a = 2;
      b = 0;
    } else {
      a = 9;
      b = 9;
    }
  }

  function checkInConnection(address from_adr, address to_adr) returns (bool) {
    var (fromCheckA,fromCheckB) = checkInMapping(from_adr);
    var (toCheckA,toCheckB) = checkInMapping(to_adr);

    if (fromCheckA != 9 && toCheckA != 9) {
      // both of the adresses are in the system
      if (fromCheckB == 0 && toCheckB == 0) {
        return true;
      } else if (fromCheckB != 0 && toCheckB !=0 && fromCheckA != toCheckA) {
        return true;
      } else if ((fromCheckA == 2 && toCheckB == 2) || (toCheckA == 2 && fromCheckB == 2)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
      revert();
    }
  }

  function canSendElec(address from_adr, address to_adr, uint8 vol) {
    bool possibleToSend;
    bool possibleToReceive;
    var (fromCheckA,fromCheckB) = checkInMapping(from_adr);
    var (toCheckA,toCheckB) = checkInMapping(to_adr);
    
    // Sender's side
    if (fromCheckA == 0 && pvArray[fromCheckB].production >= vol) {
      // When from PV, enough production
      possibleToSend = true;
    } else if (fromCheckA == 2 && batteryArray[fromCheckB].currentVolume >= vol) {
      // When from battery, enough reserve
      possibleToSend = true;
    }

    // Receiver's side
    if (toCheckA == 1 && houseArray[toCheckB].consumption >= vol) {
      // When to household, more demand
      possibleToReceive = true;
    } else if (toCheckA == 2 && batteryArray[toCheckB].currentVolume + vol <= batteryArray[fromCheckB].capacity) {
      // When to battery, enough reserve
      possibleToReceive = true;
    }
      
    // All together
    if (checkInConnection(from_adr,to_adr) && possibleToSend && possibleToReceive) {
      // Trigger the event EnergyTransaction
      // event EnergyTransaction ({from: from, to: to, value: value, timestamp:statusAt})
      //EnergyTransaction(fromCheckA,fromCheckB,toCheckA,toCheckB,vol);
      if (fromCheckA == 0){
          pvArray[fromCheckB].production -= vol;
        } else if (fromCheckA == 2) {
          batteryArray[fromCheckB].currentVolume -= vol;
        }
        if (toCheckA == 1){
          houseArray[toCheckB].consumption -= vol;
        } else if (toCheckA == 2) {
          batteryArray[toCheckB].currentVolume += vol;
        }
       //return true;
    // } else {
    //   return false;
    }
  }
  
  function reducedStatus(uint8 arg, uint8 num, uint8 vol) returns (uint) {
     if (arg == uint8(deviceType.PVpannel)) {
       pvArray[num].production -= vol;
       return pvArray[num].production;
     } else if (arg == uint8(deviceType.House)) {
       houseArray[num].consumption -= vol;
       return houseArray[num].consumption;
     } else if (arg == uint8(deviceType.Battery)) {
       batteryArray[num].currentVolume -= vol;
       return batteryArray[num].currentVolume;
     }
  }

  // Im a comment

  /*
  function EnergyTransaction(uint fromCheckA, uint fromCheckB, uint toCheckA, uint toCheckB, uint vol){
    if (fromCheckA == 0){
      pvArray[fromCheckB].production -= vol;
    } else if (fromCheckA == 2) {
      batteryArray[fromCheckB].currentVolume -= vol;
    }
    if (toCheckA == 1){
      houseArray[toCheckB].consumption -= vol;
    } else if (toCheckA == 2) {
      batteryArray[toCheckB].currentVolume += vol;
    }
  }*/
  
}
