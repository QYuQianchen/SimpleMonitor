pragma solidity ^0.4.4;

library SortRLib {

  struct Rank {
    uint  consump;
    uint  rank;
    uint  total;
  }

  struct RankMap {
    mapping(address=>Rank) rnkTable;
    mapping(uint=>address) sortedRnk;
    uint totalLength;
  }

  function initRnkTable(RankMap storage _rnk) public {
    _rnk.totalLength = 0;
  }

  function addToRnkTable(RankMap storage _rnk, address _adr, uint _consum, uint _rk, uint _tot) public {
    _rnk.rnkTable[_adr] = Rank(_consum,_rk,_tot);
    //_rnk.prepPrs.push(PriceTF(_p,_tf));
    _rnk.sortedRnk[_rnk.totalLength] = _adr;
    _rnk.totalLength++;
  }

  function sortRnkTable(RankMap storage _rnk) public {
    uint _id;
    uint con;
    uint rk;
    uint tot;
    bool tf;
    if (_rnk.totalLength > 1) {
      for (uint i = 0; i < _rnk.totalLength-1; i++) {
        _id = i;
        con = _rnk.rnkTable[_rnk.sortedRnk[i]].consump;
        rk = _rnk.rnkTable[_rnk.sortedRnk[i]].rank;
        tot = _rnk.rnkTable[_rnk.sortedRnk[i]].total;
        for (uint j = i+1; j < _rnk.totalLength; j++) {
          tf = false;
          var r = _rnk.rnkTable[_rnk.sortedRnk[j]].rank;
          if (r < rk) {
            tf = true;
          } else if (r == rk) {
            if (_rnk.rnkTable[_rnk.sortedRnk[j]].total < tot) {
              tf = true;
            } else if (_rnk.rnkTable[_rnk.sortedRnk[j]].total == tot && _rnk.rnkTable[_rnk.sortedRnk[j]].consump < con) {
              tf = true;   
            }
          }
          if (tf == true) {
            _id = j;
            con = _rnk.rnkTable[_rnk.sortedRnk[j]].consump;
            rk = r;
            tot = _rnk.rnkTable[_rnk.sortedRnk[j]].total;  
          }
        }
        swap(_rnk,i,_id);
      }
    }
  }

  function swap (RankMap storage _rnk, uint _id1, uint _id2) private {
    if (_id1 != _id2) {
      address temp;
      temp = _rnk.sortedRnk[_id1];
      _rnk.sortedRnk[_id1] = _rnk.sortedRnk[_id2];
      _rnk.sortedRnk[_id2] = temp;   
    }
  }

  function getSortedList(RankMap storage _rnk, uint a) public view returns(address adr, uint consum, uint rank, uint tot) {
    adr = _rnk.sortedRnk[a];
    consum = _rnk.rnkTable[_rnk.sortedRnk[a]].consump;
    rank = _rnk.rnkTable[_rnk.sortedRnk[a]].rank;
    tot = _rnk.rnkTable[_rnk.sortedRnk[a]].total;
  }


  function getTotalLength(RankMap storage _rnk) public view returns(uint) {
    return _rnk.totalLength;
  }

  function getRankTable(RankMap storage _rnk, address adr) public view returns (uint, uint, uint) {
    return (_rnk.rnkTable[adr].consump, _rnk.rnkTable[adr].rank, _rnk.rnkTable[adr].total);
  }
}