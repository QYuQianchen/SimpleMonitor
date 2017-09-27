pragma solidity ^0.4.4;

contract SimpleConfigMonitorV1 {

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

  House[3]  houseArray;
  PVpannel[2]  pvArray;
  Battery[1]  batteryArray;

  function SimpleConfigMonitorV1(uint8 num0, uint8 num1, uint8 num2, uint8 num3, uint8 num4, uint8 num5) {
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

    /*
    pvArray[0].pvAddress = adr0;
    pvArray[1].pvAddress = adr1;
    houseArray[0].houseAddress = adr2;
    houseArray[1].houseAddress = adr3;
    houseArray[2].houseAddress = adr4;
    batteryArray[0].batteryAddress = adr5;
    */
    
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


  function sendElec(address from_adr, address to_adr, uint vol) returns (bool) {
    uint temp;
    temp = checkInMapping(from_adr);  // is one of the devices
    if (temp != 9) {
      var (connec,device) = checkInConnection(temp,from_adr,to_adr);
      if (connec && device != 0) {
        // from & to devices physically connected
        if (temp == 0 && pvMapping[from_adr].production >= vol ) {
          if (device == 1 && houseMapping[to_adr].consumption >= vol) {
            // PV to household
            pvMapping[from_adr].production -= vol;
            houseMapping[to_adr].consumption -= vol;
            return true;
          } else if (device == 2 && batteryMapping[to_adr].currentVolume + vol <= batteryMapping[to_adr].capacity) {
            // PV to battery
            pvMapping[from_adr].production -= vol;
            batteryMapping[to_adr].currentVolume -= vol;
            return true;
          } else {
            revert();
          }
        } else if (temp == 1){
          revert();          
        } else if (temp == 2 && batteryMapping[to_adr].currentVolume >= vol && device == 2 && houseMapping[to_adr].consumption >= vol) {
          // battery to household
          batteryMapping[to_adr].currentVolume -= vol;
          houseMapping[to_adr].consumption -= vol;
          return true;
        } else {
          revert(); 
        }
      } else {
        // physically not connected or to PV
        revert();    
      }
    } else {
      revert();  
    }
  }

  function checkInMapping(address adr) returns (uint8) {
    /*if (pvMapping[adr].pvAddress != 0x0) {
      return uint8(deviceType.PVpannel);
    } else if (houseMapping[adr].houseAddress != 0x0) {
      return uint8(deviceType.House);
    } else if (batteryMapping[adr].batteryAddress != 0x0) {
      return uint8(deviceType.Battery);
    } else {
      return 9;
    }*/
    
    if (pvArray[0].pvAddress == adr || pvArray[1].pvAddress == adr) {
      return 0;
    } else if (houseArray[0].houseAddress == adr || houseArray[1].houseAddress == adr || houseArray[2].houseAddress == adr) {
      return 1;
    } else if (batteryArray[0].batteryAddress == adr) {
      return 2;
    } else {
      return 9;
    }
  }

  function checkInConnection(uint arg, address from_adr, address to_adr) returns (bool a, uint8 b) {
    uint l1;
    uint l2;
    uint8 i;
    if (arg == uint8(deviceType.PVpannel)) {
      l1 = pvMapping[from_adr].connectedHouse.length;
      l2 = pvMapping[from_adr].connectedBattery.length;
      for (i = 0 ; i < l1; i++) {
        if (to_adr == pvMapping[from_adr].connectedHouse[i]) {
          a = true;
          b = uint8(deviceType.House);
        }
      }
      for (i = 0 ; i < l2; i++) {
        if (to_adr == pvMapping[from_adr].connectedBattery[i]) {
          a = true;
          b = uint8(deviceType.Battery);
        }
      }
     } else if (arg == uint8(deviceType.House)) {
      l1 = houseMapping[from_adr].connectedPV.length;
      l2 = houseMapping[from_adr].connectedBattery.length;
      for (i = 0 ; i < l1; i++) {
        if (to_adr == houseMapping[from_adr].connectedPV[i]) {
          a = true;
          b = uint8(deviceType.PVpannel);
        }
      }
      for (i = 0 ; i < l2; i++) {
        if (to_adr == houseMapping[from_adr].connectedBattery[i]) {
          a = true;
          b = uint8(deviceType.Battery);
        }
      }
     } else if (arg == uint8(deviceType.Battery)) {
      l1 = batteryMapping[from_adr].connectedHouse.length;
      l2 = batteryMapping[from_adr].connectedPV.length;
      for (i = 0 ; i < l1; i++) {
        if (to_adr == batteryMapping[from_adr].connectedHouse[i]) {
          a = true;
          b = uint8(deviceType.House);
        }
      }
      for (i = 0 ; i < l2; i++) {
        if (to_adr == batteryMapping[from_adr].connectedPV[i]) {
          a = true;
          b = uint8(deviceType.PVpannel);
        }
      }
     } else {
       a = false;
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

}
