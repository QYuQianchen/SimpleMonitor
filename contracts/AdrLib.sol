pragma solidity ^0.4.4;

library AdrLib {
  /*function AddInList(address[] storage adrL, address) returns (uint ind) {
    
  }*/

  function assertInside(address[] storage adrL, address adr) public view returns (bool) {
    for (uint i = 0; i < adrL.length; i++) {
      if (adr == adrL[i]) {
        return true;
      }
    }
    return false;
  }

}
