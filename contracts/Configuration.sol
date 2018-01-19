pragma solidity ^0.4.16;

//import './FactoryInterfaces.sol';
import './DeviceFactoryInterface.sol';
//import './SingleHouseInterface.sol';
 
//import "./SingleHouse.sol";
//import "./SinglePV.sol";
//import "./SingleBattery.sol";
//import "./SingleHeatPump.sol";
//import "./SingleWaterTank.sol";

import "./IGeneralDevice.sol";
import "./GeneralDevice.sol";
import "./Grid.sol";
import "./GlobalTimer.sol";

contract Configuration {

  address public admin = msg.sender; // only the admin node can modify the configuration...
  address public globalTimerAdr;
  address public gridAdr;          // store the address of grid...(address of the transformer that links to the grid... not the contract address)
  uint public statusAt; // timestamp of the creation of Configuration instance

  // Several types of devices in the system
  enum deviceType {House, PV, Battery, HeatPump, WaterTank}

  struct EndUser {
    deviceType  dType;
    address     cAddress;           // address of the contract
    uint        statusAt;           // timestamp of the creation
    mapping(address=>EndUser) connectedUser;     // List of another node connected.
  }

  mapping(address=>EndUser) userList;   // the account of the owner => struct
  mapping(address=>address) contractList;   // now putting all the linkage to real contract address into this mapping

  //mapping (address => SingleHouseInterface) houses;
  SingleHouseFactoryInterface singleHouseFactory;
  SinglePVFactoryInterface singlePVFactory;
  SingleBatteryFactoryInterface singleBatteryFactory;
  SingleHeatPumpFactoryInterface singleHeatPumpFactory;
  SingleWaterTankFactoryInterface singleWaterTankFactory;
  
  // Restricts execution by admin only
  modifier adminOnly {
    if(msg.sender == admin) {
      _;
    } else {
      revert();
    }
  }

  event LogDevice(address deviceAdr);
  event LogConnection(address device1, address device2);

  function Configuration(address _singleHouseFactoryAddress,
                        address _singlePVFactoryAddress,
                        address _singleBatteryFactoryAddress,
                        address _singleHeatPumpFactoryAddress,
                        address _singleWaterTankFactoryAddress) adminOnly public {
      statusAt = now;
      globalTimerAdr = new GlobalTimer();
      singleHouseFactory = SingleHouseFactoryInterface(_singleHouseFactoryAddress);
      singlePVFactory = SinglePVFactoryInterface(_singlePVFactoryAddress);
      singleBatteryFactory = SingleBatteryFactoryInterface(_singleBatteryFactoryAddress);
      singleHeatPumpFactory = SingleHeatPumpFactoryInterface(_singleHeatPumpFactoryAddress);
      singleWaterTankFactory = SingleWaterTankFactoryInterface(_singleWaterTankFactoryAddress);
  }

  function addGrid(address adr) adminOnly public {
      contractList[adr] = new Grid(adr);
      GeneralDevice(contractList[adr]).setTimerAdr(globalTimerAdr);
      gridAdr = address(contractList[adr]);
  }

  function addDevice(uint8 _deviceType, address adr, uint capacity, bool g) adminOnly public {
      require (_deviceType < 5); //addBattery
      if (_deviceType == 0) {   // addHouse
        contractList[adr] = singleHouseFactory.createSingleHouse(adr);
      } else if (_deviceType == 1) {    //addPV
        contractList[adr] = singlePVFactory.createSinglePV(adr);
      } else if (_deviceType == 2) {
        contractList[adr] =singleBatteryFactory.createSingleBattery(adr,capacity);
      } else if (_deviceType == 3) {
        contractList[adr] = singleHeatPumpFactory.createSingleHeatPump(adr,capacity);
      } else {
        contractList[adr] = singleWaterTankFactory.createSingleWaterTank(adr,capacity,0);
      }
    //  if (g) {
    //       GeneralDevice(contractList[adr]).setGridAdr(gridAdr);
    //       GeneralDevice(gridAdr).addConnectedDevice(_deviceType, contractList[adr]);
    //     }
    //   EndUser memory tempEU;
    //   tempEU.dType = deviceType(_deviceType);
    //   tempEU.cAddress = address(contractList[adr]);
    //   tempEU.statusAt = now;
    //   userList[adr] = tempEU;
       IGeneralDevice(contractList[adr]).setTimerAdr(globalTimerAdr);
    //   LogDevice(adr);
  }

    function getContractAddress(address adr) public view adminOnly returns(address) {
      return address(contractList[adr]);
    }

    function getCAddress(address adr) public returns(address) {
      return singleHouseFactory.getSingleHouseAddress(adr);
    }

    function playwithGeneralDevice_setAdr(address adr) public {
      singleHouseFactory.setTimerAddress(contractList[adr],globalTimerAdr);
    }

    function playwithGeneralDevice_getAdr(address adr) public returns (address) {
      return singleHouseFactory.getTimerAddress(contractList[adr]);
    }

    function getDeviceType(address adr) public view returns (uint8) {
        // deviceType {House,PV,Battery}

        if (userList[adr].cAddress != 0x0) {
            return uint8(userList[adr].dType);
        } else {
            return 15;   // when the address corresponds no device in the configuration...
        }
    }

    function linkDevices(address adr1, address adr2) public adminOnly {
        uint8[2] memory dt;
        dt[0] = getDeviceType(adr1);
        dt[1] = getDeviceType(adr2);
        require(dt[0]<5 && userList[adr1].connectedUser[adr2].cAddress == 0x0);
        require(dt[1]<5 && userList[adr2].connectedUser[adr1].cAddress == 0x0);
        userList[adr1].connectedUser[adr2] = userList[adr2];
        userList[adr2].connectedUser[adr1] = userList[adr1];

        GeneralDevice(address(contractList[adr1])).addConnectedDevice(dt[1],address(contractList[adr2]));
        GeneralDevice(address(contractList[adr2])).addConnectedDevice(dt[0],address(contractList[adr1]));

        LogConnection(adr1,adr2);
    }

    // test functions

    function getTimer() public constant returns (address) {
        return globalTimerAdr;
    }

    function getGridAdr() public constant returns(address) {
        return gridAdr;
    }

}
