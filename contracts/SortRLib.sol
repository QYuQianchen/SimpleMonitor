pragma solidity ^0.4.4;

library SortRLib {

  struct Request {
    uint  consump;
    uint  rank;
    uint  total;
  } 

  function minStruct(Request[] storage self) returns (uint ind) {
    uint _id;
    uint con = self[0].consump;
    uint min = self[0].rank;
    uint tot = self[0].total;
    for (uint i = 0; i < self.length; i++) {
      var x = self[i].rank;
      if (x < min) {
        _id = i;
        min = x;
        con = self[i].consump;
        tot = self[i].total;
      } else if (x == min) {
        if (self[i].total < tot) {
          _id = i;
          min = x;
          con = self[i].consump;
          tot = self[i].total;
        } else if (self[i].total == tot && self[i].consump < con) {
          _id = i;
          min = x;
          con = self[i].consump;
          tot = self[i].total;          
        }        
      }
    }
    ind = _id;
  }
}