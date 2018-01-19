pragma solidity ^0.4.16;

contract IGeneralDevice {
  function setTimerAdr(address adr) public;
  function getTimerAddress() public view returns (address);
  function addConnectedDevice(uint a, address adr) public;
}
