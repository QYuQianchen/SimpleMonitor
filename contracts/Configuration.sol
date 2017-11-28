pragma solidity ^0.4.4;

import "./SingleHouse.sol";
import "./SinglePV.sol";
import "./SingleBattery.sol";
import "./Grid.sol";
import "./GlobalTimer.sol";

contract Configuration {

  address public admin = msg.sender; // only the admin node can modify the configuration...
  address public globalTimerAdr;
  address public gridAdr;          // store the address of grid...(address of the transformer that links to the grid... not the contract address)
  uint public statusAt; // timestamp of the creation of Configuration instance

  // The variables below should be deleted... 
  uint8 private numHouseCurrent = 0;    // current houses in the system
  uint8 private numPVCurrent = 0;       // current PVs in the system
  uint8 private numBatteryCurrent = 0;    // current batteries in the system

  // Several types of devices in the system
  enum deviceType {House, PV, Battery}

  struct EndUser {
    deviceType  dType;
    address     cAddress;           // address of the contract
    uint        statusAt;           // timestamp of the creation
    mapping(address=>EndUser) connectedUser;     // List of another node connected.
  }


  mapping(address=>EndUser) userList;   // the account of the owner => struct
  mapping(address=>address) contractList;   // now putting all the linkage to real contract address into this mapping

  // Restricts execution by admin only
  modifier adminOnly {
    if(msg.sender == admin){
      _;
    } else {
      revert();
    }
  }
  
  event LogDevice(address deviceAdr);
  event LogConnection(address device1, address device2);

  function Configuration() adminOnly {
      statusAt = now;
      globalTimerAdr = new GlobalTimer();

  }

  function addGrid(address adr) adminOnly {
      contractList[adr] = new Grid(adr);
      GeneralDevice(contractList[adr]).setTimerAdr(globalTimerAdr);
      gridAdr = address(contractList[adr]);
  }

  function addDevice(uint8 _deviceType, address adr, uint capacity, bool g) adminOnly public {
      require (_deviceType < 3); //addBattery
      if (_deviceType == 0) {   // addHouse
        contractList[adr] = new SingleHouse(adr);
        numHouseCurrent++;
      } else if (_deviceType == 1) {    //addPV
        contractList[adr] = new SinglePV(adr);
        numPVCurrent++;
      } else {
        contractList[adr] = new SingleBattery(adr, capacity);
        numBatteryCurrent++;
      }
      if (g) {
          GeneralDevice(contractList[adr]).setGridAdr(gridAdr);
          GeneralDevice(gridAdr).addConnectedDevice(_deviceType, contractList[adr]);
        }
      EndUser memory tempEU;
      tempEU.dType = deviceType(_deviceType);
      tempEU.cAddress = address(contractList[adr]);
      tempEU.statusAt = now;
      userList[adr] = tempEU;
      GeneralDevice(contractList[adr]).setTimerAdr(globalTimerAdr);
      LogDevice(adr);
  }

    function getContractAddress(address adr) view adminOnly returns(address) {
      return address(contractList[adr]);
    }  

    function getDeviceType(address adr) returns (uint8) {
        // deviceType {House,PV,Battery}
        
        if (userList[adr].cAddress != 0x0) {
            return uint8(userList[adr].dType);
        } else {
            return 15;   // when the address corresponds no device in the configuration...
        }
    }

    function linkDevices(address adr1, address adr2) adminOnly {
        uint8[2] memory dt;
        dt[0] = getDeviceType(adr1);
        dt[1] = getDeviceType(adr2);
        require(dt[0]<3 && userList[adr1].connectedUser[adr2].cAddress == 0x0);
        require(dt[1]<3 && userList[adr2].connectedUser[adr1].cAddress == 0x0);
        userList[adr1].connectedUser[adr2] = userList[adr2];
        userList[adr2].connectedUser[adr1] = userList[adr1];

        GeneralDevice(address(contractList[adr1])).addConnectedDevice(dt[1],address(contractList[adr2]));
        GeneralDevice(address(contractList[adr2])).addConnectedDevice(dt[0],address(contractList[adr1]));
        
        LogConnection(adr1,adr2);
    }

    // test functions

    function getAdmin() constant returns (address) {
        return admin;
    } 

    function getGridAdr() constant returns(address) {
        return gridAdr;
    } 

}
