pragma solidity ^0.4.4;

library SortPLib {

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
    if (_tf == false) {
      _prm.fLength++;
    }
    _prm.sortedPrs[_prm.totalLength] = _adr;
    _prm.totalLength++;
  }

  function getPrsTable(PriceMap storage _prm, address _adr) returns (uint rank, uint tot, bool updated) {
    for (var i = 0; i < _prm.totalLength; i++) {
      if (_adr == _prm.sortedPrs[i]) {
        return (i+1,_prm.totalLength,_prm.prsTable[_adr].updated);
      }
    } 
    return (0,_prm.totalLength,false);
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
    for (uint i = 0; i < _prm.totalLength-1; i++) {
      minTemp = _prm.prsTable[_prm.sortedPrs[i]].prs; 
      _id = i;
      for (uint j = i+1; j < _prm.totalLength; j++) {
        var p = _prm.prsTable[_prm.sortedPrs[j]].prs;
        if (p <= minTemp) {
          minTemp = p;
          _id = j;
        }
      }
      swap(_prm,i,_id);
    }
    // put the non-updated price (if exists, false) to the end of the list
    if (_prm.fLength != 0) {
      uint nF = 0;
      for (i = 0; i < _prm.totalLength + _prm.fLength; i++) {
        if (_prm.prsTable[_prm.sortedPrs[i]].updated == false) {
          nF++;
          swap(_prm,i,nF+_prm.totalLength);
        } else {
          swap(_prm,i,i-nF);
        }
      }
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
