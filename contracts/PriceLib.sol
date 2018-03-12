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

  function setPrice(PriceMap storage _prm, address _adr, uint i, uint _p, bool _tf) public {
    if (_tf == false) {
      _prm.prsTable[_adr].prs = 0;
      // _prm.prsTable[_adr].prs = _p;   // for test
    } else {
      _prm.prsTable[_adr].prs = _p;
    }
     _prm.order[i] = _adr;
  }

  function setVolume(PriceMap storage _prm, address _adr, uint _v) public {
    _prm.prsTable[_adr].vol = _v;
  }

  function calPrice(PriceMap storage _prm, uint _pOld, uint _vCurrent) public view returns (uint) {
  // function calPrice(PriceMap storage _prm, uint _pOld, uint _vOld, uint _vCurrent) public view returns (uint) {
    uint _pNew;
    uint pavg;
    uint temp1;
    uint temp2;
    
    if (_pOld == 0 || _vCurrent == 0) {
      pavg = 5;
      _pNew = 5; // test
    }

    for (uint i = 0; i < _prm.totalLength-1; i++) {
      temp1 += _prm.prsTable[_prm.order[i]].vol;
      temp2 += _prm.prsTable[_prm.order[i]].vol * _prm.prsTable[_prm.order[i]].prs;
    }

    if (_vCurrent - temp1 > 0) {
      temp1 = _vCurrent - temp1; // temp1 = _vOld - temp1;
    } else {
      temp1 = 0;
    }

    _pNew = uint((_pOld*temp1+temp2*(2))/_vCurrent);  // here (2) is the factor... too big but cannot use ufixed for now

    if (_pNew <= 0) {
      _pNew = 3;  // for test;
    }

    return _pNew;
  }

  // calculateMin...
  function findMin(uint a, uint b) pure public returns (uint c) {
    if (a >= b) {
      c = b;      
    } else {
      c = a;      
    }
  }
}
