pragma solidity ^0.4.16;

library PriceLib {

  struct PriceVolume {
    uint  prs;
    uint  vol;
  }

  struct PriceMap {
    mapping(address=>PriceVolume) prsTable;
    mapping(uint=>address) order;
    uint totalLength;
  }

  function setPrice(PriceMap storage _prm, address _adr, uint i, uint _p, bool _tf) {
    if (_tf == false) {
      _prm.prsTable[_adr].prs = 0;
    } else {
      _prm.prsTable[_adr].prs = _p;
    }
     _prm.order[i] = _adr;
  }

  function calPrice(PriceMap storage _prm, uint _pOld, uint _vOld, uint _vCurrent) returns (uint _pNew) {

    uint pavg;
    uint temp1;
    uint temp2;
    
    if (_pOld == 0 || _vCurrent == 0) {
      pavg = 5;
    }

    for (uint i = 0; i < _prm.totalLength-1; i++) {
      temp1 += _prm.prsTable[_prm.order[i]].vol;
      temp2 += _prm.prsTable[_prm.order[i]].vol * _prm.prsTable[_prm.order[i]].prs;
    }

    if (_vOld - temp1 > 0) {
      temp1 = _vOld - temp1;
    } else {
      temp1 = 0;
    }

    _pNew = uint((_pOld*temp1+temp2*(2))/_vCurrent);  // here (2) is the factor... too big but cannot use ufixed for now

  }

  // calculateMin...
  function findMin(uint a, uint b) returns (uint c) {
    if (a >= b) {
      c = b;      
    } else {
      c = a;      
    }
  }
}
