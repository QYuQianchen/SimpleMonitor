pragma solidity ^0.4.4;

import "./SingleHouse.sol";
import "./SinglePV.sol";
import "./SingleBattery.sol";
import "./Grid.sol";

contract Configuration {

  address public admin = msg.sender; // only the admin node can modify the configuration...
  uint public statusAt; // timestamp of the creation of Configuration instance
  uint8 public numHouseTotal;       // number of houses in the system
  uint8 public numPVTotal;          // number of PVs in the system
  uint8 public numBatteryTotal;     // number of batteries in the system
  address private gridAdr;          // store the address of grid...(address of the transformer that links to the grid... not the contract address)
  uint8 private numHouseCurrent = 0;    // current houses in the system
  uint8 private numPVCurrent = 0;       // current PVs in the system
  uint8 private numBatteryCurrent = 0;    // current batteries in the system

  // Several types of devices in the system
  struct House {
    address Address;          // address of the contract
    uint    statusAt;         // timestamp of the update
    mapping(address=>PVpannel) connectedPV;       // List of PV connected
    mapping(address=>Battery) connectedBattery;   // List of batteries connected
  }

  struct PVpannel {
    address Address;          // address of the contract
    uint    statusAt;         // creation time
    address[] connectedHouse; // List of households connected
    address[] connectedBattery;// List of batteries connected
  }

  struct Battery {
    address Address;          // address of the contract
    uint    statusAt;         // creation time
    address[] connectedHouse; // List of households connected
    address[] connectedPV;// List of PV connected
  }

  event LogConfig(uint numHouses, uint numPV, uint numBattery, uint statusat);
  event LogDevice(address deviceAdr);
  event LogConnection(address device1, address device2);


  mapping(address=>House) Houses;       
  mapping(address=>PVpannel) PVs;
  mapping(address=>Battery) Batteries;

  //mapping(address=>address) mHouse;     // IP address of the owner (or device... this makes more sense? or just an identifier of the physical device) -> address of the contract
  //mapping(address=>address) mPV;        // Or... mapping(bytes32=>address).... where the bytes32 is a hashed indentifier of the device serie number / address of house...
  //mapping(address=>address) mBattery;

  mapping(address=>address) contractList;   // now putting all the linkage to real contract address into this mapping

  // Restricts execution by admin only
  modifier adminOnly {
    if(msg.sender == admin){
      _;
    } else {
    // For now, the request will be rejected.
    // Later, we should add the approval mechanism, such that each user can add their device to the network and let admin to approve it. 
      revert();
    }
  }

  function Configuration(uint8 numHouse, uint8 numPV, uint8 numBattery) adminOnly {
      // constructor
      numHouseTotal = numHouse;
      numPVTotal = numPV;
      numBatteryTotal = numBattery;
      statusAt = now;
      // create the grid contract
      LogConfig(numHouseTotal,numPVTotal,numBatteryTotal,statusAt);
  }

  function addGrid(address adr) adminOnly {
      contractList[adr] = new Grid(adr);
      gridAdr = address(contractList[adr]);
  }

  function addHouse(address adr, bool g) adminOnly {
      require(numHouseCurrent < numHouseTotal);// "Error: House number maximun. Cannot add more houses."
      //mHouse[adr] = new SingleHouse(adr);   // create a SingleHouse contract and store it on the mHouse mapping
      contractList[adr] = new SingleHouse(adr);
      // creates a minimature (Struct House) that also stores the address and connection information, which is a private attribute in the Configuration.sol
      House memory tempHouse;
      //tempHouse.Address = address(mHouse[adr]);
      tempHouse.Address = address(contractList[adr]);
      tempHouse.statusAt = now;
      Houses[adr] = tempHouse;
      if (g) {
          SingleHouse(contractList[adr]).setGridAdr(gridAdr);
          Grid(gridAdr).addH(contractList[adr]);
      }
      numHouseCurrent++;
      LogDevice(adr);
  }

    function getContractAddress(address adr) adminOnly returns(address) {
      return address(contractList[adr]);
    }

    function addPV(address adr, bool g) adminOnly {
        require(numPVCurrent < numPVTotal); //"Error: House number maximun. Cannot add more houses."
        //mPV[adr] = new SinglePV(adr);     // create a SingleHouse contract and store it on the mHouse mapping
        contractList[adr] = new SinglePV(adr);
        // creates a minimature (Struct PV) that also stores the address and connection information, which is a private attribute in the Configuration.sol
        PVpannel memory tempPV;
        //tempPV.Address = address(mPV[adr]);
        tempPV.Address = address(contractList[adr]);
        tempPV.statusAt = now;
        PVs[adr] = tempPV;
        if (g) {
            SinglePV(contractList[adr]).setGridAdr(gridAdr);
            Grid(gridAdr).addPV(contractList[adr]);
        }
        numPVCurrent++;
         LogDevice(adr);
  }
  
  function addBattery(address adr, uint capacity, bool g) adminOnly {
      require(numBatteryCurrent < numBatteryTotal); // "Error: Battery number maximun. Cannot add more Batteries."
      //mBattery[adr] = new SingleBattery(adr, capacity);
      contractList[adr] = new SingleBattery(adr, capacity);
      Battery memory tempBattery;
      //tempBattery.Address = address(mBattery[adr]);
      tempBattery.Address = address(contractList[adr]);
      tempBattery.statusAt = now;
      Batteries[adr] = tempBattery;
      if (g) {
          SingleBattery(contractList[adr]).setGridAdr(gridAdr);
          Grid(gridAdr).addB(contractList[adr]);
      }
      numBatteryCurrent++;
      LogDevice(adr);
  }

    // test functions
    
    /*function checkHouseCon(address adrHouse) returns (uint) {
        return (Houses[adrHouse].consumption);
    }*/ 
    /*function checkHouseAdr(address adrHouse) returns (address) {
        return (Houses[adrHouse].Address);
    }*/
    /*
    function checkPVPro(address adrPV) returns (uint) {
        return (PVs[adrPV].production);
    }*/
    /*
    function checkPVAdr(address adrPV) returns (address) {
        return (PVs[adrPV].Address);
    }
    function checkHousePVConnection(address adrHouse, address adrPV) returns (address) {
        return (Houses[adrHouse].connectedPV[adrPV].Address);
    }*/
    function getAdmin() constant returns (address) {
        return admin;
    } 

    function getGridAdr() constant returns(address) {
        return gridAdr;
    }   

  function linkHousePV(address adrHouse, address adrPV) adminOnly {     // the input shall be changed into hash info (device identifier)
      require(Houses[adrHouse].Address != 0x0);                         // "Error: House contract does not exist!"
      require(PVs[adrPV].Address != 0x0);                               // "Error: PV contract does not exist!"
      require(Houses[adrHouse].connectedPV[adrPV].Address == address(0)); // "Error: Already connected!"
      Houses[adrHouse].connectedPV[adrPV] = PVs[adrPV];
      PVs[adrPV].connectedHouse.push(adrHouse);
      // call functions in the contract
      //SingleHouse(mHouse[adrHouse]).call(bytes4(sha3("addConnectedPV(address)")),adrPV);
      //SinglePV(mPV[adrPV]).call(bytes4(sha3("addConnectedHouse(address)")),adrHouse);
      // or
      //SingleHouse(mHouse[adrHouse]).addConnectedPV(mPV[adrPV]);
      //SinglePV(mPV[adrPV]).addConnectedHouse(mHouse[adrHouse]);
      // or
      SingleHouse(address(contractList[adrHouse])).addConnectedPV(address(contractList[adrPV]));
      SinglePV(address(contractList[adrPV])).addConnectedHouse(address(contractList[adrHouse]));
      LogConnection(adrHouse,adrPV);
  }


  function linkHouseBattery(address adrHouse, address adrBattery) adminOnly {   // the input shall be changed into hash info (device identifier)
      require(Houses[adrHouse].Address != 0x0);                                 // "Error: House does not exist!"
      require(Batteries[adrBattery].Address != 0x0);                            // "Error: Battery does not exist!"
      require(Houses[adrHouse].connectedBattery[adrBattery].Address == 0x0);    // "Error: Already connected!"
      Houses[adrHouse].connectedBattery[adrBattery] = Batteries[adrBattery];
      Batteries[adrBattery].connectedHouse.push(adrHouse);
      // call functions in the contract
      //SingleHouse(mHouse[adrHouse]).addConnectedBattery(mBattery[adrBattery]);
      //SingleBattery(mBattery[adrBattery]).addConnectedHouse(mHouse[adrHouse]);
      //or
      SingleHouse(contractList[adrHouse]).addConnectedBattery(contractList[adrBattery]);
      SingleBattery(contractList[adrBattery]).addConnectedHouse(contractList[adrHouse]);
      LogConnection(adrHouse,adrBattery);
  }


  function linkPVBattery(address adrPV, address adrBattery) adminOnly{          // the input shall be changed into hash info (device identifier)
      require(PVs[adrPV].Address != 0x0);                                       // "Error: PV does not exist!"
      require(Batteries[adrBattery].Address != 0x0);                            // "Error: Battery does not exist!"
      for (uint k = 0;k<PVs[adrPV].connectedBattery.length;k++) {
           require(PVs[adrPV].connectedBattery[k] != adrBattery);               // "Error: Already connected!"
      }
      PVs[adrPV].connectedBattery.push(adrBattery);
      Batteries[adrBattery].connectedPV.push(adrPV);
      // call functions in the contract
      //SinglePV(mPV[adrPV]).addConnectedBattery(mBattery[adrBattery]);
      //SingleBattery(mBattery[adrBattery]).addConnectedPV(mPV[adrPV]);
      // or
      SinglePV(contractList[adrPV]).addConnectedBattery(contractList[adrBattery]);
      SingleBattery(contractList[adrBattery]).addConnectedPV(contractList[adrPV]);
      LogConnection(adrPV,adrBattery);
  }

  function getPVConnection(address adrPV) returns (uint numConnectedHouse, uint numConnectedBattery) {
      numConnectedHouse = PVs[adrPV].connectedHouse.length;
      numConnectedBattery = PVs[adrPV].connectedBattery.length;
  }
/*
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
    }*/
}
