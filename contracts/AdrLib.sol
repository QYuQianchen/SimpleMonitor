pragma solidity ^0.4.4;

library AdrLib {
  /*function AddInList(address[] storage adrL, address) returns (uint ind) {
    
  }*/

  function AssertInside(address[] storage adrL, address adr) returns (bool tF) {
    var check = false;
    for (uint i = 0; i < adrL.length; i++) {
      if (adr == adrL[i]) {
        check = true;
      }
    }
  }

}
