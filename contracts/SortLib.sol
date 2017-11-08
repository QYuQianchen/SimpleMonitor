pragma solidity ^0.4.4;

library SortLib {

  struct PriceTF {
    uint  prs;
    bool  updated;
  } 

  function maxStruct(PriceTF[] storage self) returns (uint ind) {
    uint _id;
    uint max;
    bool stat;
    for (uint i = 0; i < self.length; i++) {
      var x = self[i].prs;
      if (x > max) {
        max = x;
        _id = i;
        stat = self[i].updated;
      } else if (x == max && self[i].updated == false) {
        max = x;
        _id = i;
        stat = self[i].updated;
      }
    }
    ind = _id;
  }

  function del (PriceTF[] storage self, uint _id) {
    if (_id != self.length) {
      delete self[_id];
      self[_id] = self[self.length-1];
      self.length--;
    } else {
      delete self[_id];
      self.length--;
    }
  }
}
