pragma solidity ^0.4.4;

library SortLib {

  struct PriceTF {
    uint  prs;
    bool  updated;
  }

  struct PriceMap {
    mapping(address=>PriceTF) prsTable;
    mapping(uint=>address) sortedPrs;
    //PriceTF[] prepPrs;
    uint totalLength;
    uint fLength;
  } 

  function initPrsTable(PriceMap storage _prm) {
    //_prm.prepPrs = new PriceTF[](0);
    _prm.totalLength = 0;
    _prm.fLength = 0;
  }

  function addToPrsTable(PriceMap storage _prm, address _adr, uint _p, bool _tf) {
    _prm.prsTable[_adr] = PriceTF(_p,_tf);
    //_prm.prepPrs.push(PriceTF(_p,_tf));
    _prm.totalLength++;
    if (_tf == false) {
      _prm.fLength++;
    }
    _prm.sortedPrs[_prm.totalLength] = _adr;
  }

  function getPrsTable(PriceMap storage _prm, address _adr) returns (uint) {
    for (var i = 0; i < _prm.totalLength+1; i++) {
      if (_adr == _prm.sortedPrs[i]) {
        return i;
      }
    } 
    return 0;
  }

  function getSortedList(PriceMap storage _prm, uint a) returns(address adr, uint p, bool tF) {
    adr = _prm.sortedPrs[a];
    p = _prm.prsTable[_prm.sortedPrs[a]].prs;
    tF = _prm.prsTable[_prm.sortedPrs[a]].updated;
  }

  function sortPrsTable(PriceMap storage _prm) {
    uint minTemp;
    uint _id;
    //bool _stat = true;
    // sort the price list according to the price
    for (uint i = 1; i < _prm.totalLength; i++) {
      minTemp = _prm.prsTable[_prm.sortedPrs[i]].prs; 
      _id = i;
      for (uint j = i+1; j < _prm.totalLength+1; j++) {
        var p = _prm.prsTable[_prm.sortedPrs[j]].prs;
        if (p < minTemp) {
          minTemp = p;
          _id = j;
        }
      }
      swap(_prm,i,_id);
    }
    // put the non-updated price (if exists, false) to the end of the list
    if (_prm.fLength != 0) {
      uint nF = 0;
      for (i = 1; i < _prm.totalLength + _prm.fLength+1; i++) {
        if (_prm.prsTable[_prm.sortedPrs[i]].updated == false) {
          nF++;
          swap(_prm,i,nF+_prm.totalLength);
        } else {
          swap(_prm,i,i-nF);
        }
      }
    }
  }

  function maxStruct(PriceTF[] storage self) returns (uint ind) {
    uint _id;
    uint max;
    bool stat;
    for (uint i = 0; i < self.length; i++) {
      var x = self[i].prs;
      if (x >= max) { // Small perference to put houses before battery.
        max = x;
        _id = i;
        stat = self[i].updated;
      } /*else if (x == max && self[i].updated == false) {
        max = x;
        _id = i;
        stat = self[i].updated;
      }*/
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

  function swap (PriceMap storage _prm, uint _id1, uint _id2) {
    if (_id1 != _id2) {
      address temp;
      temp = _prm.sortedPrs[_id1];
      _prm.sortedPrs[_id1] = _prm.sortedPrs[_id2];
      _prm.sortedPrs[_id2] = temp;   
    }
  }
}
