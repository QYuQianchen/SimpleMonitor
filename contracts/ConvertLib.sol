pragma solidity ^0.4.16;

library ConvertLib {

  function convertToElec(uint consum, uint cop) returns (uint c) {
    if (cop == 0) { // cop == 3
      c = uint(consum/10);
    } else { // cop == 4.5
      c = uint(consum/16);    
    }
  }

  function convertToHeat(uint consum, uint cop) returns (uint c) {
    if (cop == 0) { // cop == 3
      c = uint(consum*10);
    } else { // cop == 4.5
      c = uint(consum*16);    
    }
  }
  

}
