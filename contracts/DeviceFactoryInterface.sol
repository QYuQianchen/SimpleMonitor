pragma solidity ^0.4.16;

contract SingleHouseFactoryInterface {
  function createSingleHouse(address _accountAddress) public returns (address houseAddress);
  function getSingleHouseAddress(address _accountAddress) public constant returns (address houseAddress);
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
  function createSingleHeatPump(address _accountAddress, uint _price, bool _capacity) public returns (address heatpumpAddress);
  function getSingleHeatPumpAddress(address _accountAddress) public constant returns (address heatpumpAddress);
}

contract SingleWaterTankFactoryInterface {
  function createSingleWaterTank(address _accountAddress, uint _capacity, bool _waterType) public returns (address watertankAddress);
  function getSingleWaterTankAddress(address _accountAddress) public constant returns (address watertankAddress);
}

contract GridFactoryInterface {
  function createGrid(address _accountAddress) public returns (address gridAddress);
  function getGridAddress(address _accountAddress) public constant returns (address gridAddress);
}
