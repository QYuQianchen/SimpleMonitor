pragma solidity ^0.4.4;

contract IBattery {

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  int     wallet;                   // To record loss & gain 
  address grid = 0x0;                     // contract address of grid

  modifier adminOnly {
    if (msg.sender == Admin) {
      _;
    } else {
      revert();
    }
  }

  function getSalePrice() returns (uint prs, bool updatedOrNot);
  function goExcess(uint vol) returns ( uint takeVol, uint prs);
  function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated);
  function goNoGo(uint giveoutvol) returns (uint);

  function setGridAdr(address adr) adminOnly external{
    grid = adr;
  }
}
