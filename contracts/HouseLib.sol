pragma solidity ^0.4.4;

import "./SingleHouse.sol";

library HouseLib {

  function getConnectedPVCount(address _singleHouseContract) constant returns (uint) {
    return SingleHouse(_singleHouseContract).getConnectedPVCount();
  }

  function getconnectedBatteryCount(address _singleHouseContract) constant returns (uint){
    return SingleHouse(_singleHouseContract).getconnectedBatteryCount();
  }

  function getConnectPVAddress(address _singleHouseContract, uint _id) constant returns (address) {
    return SingleHouse(_singleHouseContract).getConnectPVAddress(_id); //sha3(_id)
  }

  function getconnectedBatteryAddress(address _singleHouseContract, uint a) constant returns (address) {
    return SingleHouse(_singleHouseContract).getconnectedBatteryAddress(_id); //sha3(_id)
  }

  function set
}
