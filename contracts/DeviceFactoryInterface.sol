pragma solidity ^0.4.16;

contract SingleHouseFactoryInterface {
  function createSingleHouse(address _accountAddress) public returns (address houseAddress);
  function getSingleHouseAddress(address _accountAddress) public constant returns (address houseAddress);
  function setTimerAddress(address _contractAddress, address _timerAddress) public returns (bool);
  function getTimerAddress(address _contractAddress) public returns (address);
}

contract SinglePVFactoryInterface {
  function createSinglePV(address _accountAddress) public returns (address pvAddress);
  function getSinglePVAddress(address _accountAddress) public constant returns (address pvAddress);
}

contract SingleBatteryFactoryInterface {
  function createSingleBattery(address _accountAddress, uint _capacity) public returns (address batteryAddress);
  function getSingleBatteryAddress(address _accountAddress) public constant returns (address batteryAddress);
}

contract SingleHeatPumpFactoryInterface {
  function createSingleHeatPump(address _accountAddress, uint _capacity) public returns (address heatpumpAddress);
  function getSingleHeatPumpAddress(address _accountAddress) public constant returns (address heatpumpAddress);
}

contract SingleWaterTankFactoryInterface {
  function createSingleWaterTank(address _accountAddress, uint _capacity, uint _waterType) public returns (address watertankAddress);
  function getSingleWaterTankAddress(address _accountAddress) public constant returns (address watertankAddress);
}