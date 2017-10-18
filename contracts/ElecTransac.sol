pragma solidity ^0.4.4;

import "./Configuration.sol";
// Use structures defined in the Configuration.sol

contract ElecTransac {

  uint public creationTime; // timestamp of the update
  address public lastFromAddress;
  address public lastToAddress;
  uint8 public lastValue;
  bool private _avail;
  uint private _prod;
  uint private _consum;
  uint public priceElec = 100; // constant price of electricity/kWh in Wei
  //enum deviceType {House,PVpannel,Battery}

  modifier sellerOrBuyerOnly (address _from, address _to){
    if(msg.sender == _from || msg.sender == _to){
      _;
    } else {
    // For now, the request will be rejected.
    // Later, we should add the approval mechanism, such that each user can add their device to the network and let admin to approve it. 
      revert();
    }
  }

  /*modifier connected(address _from, address _to) {
    if (configuration.isConnected(_from, _to)) {
      _;
    } else {
      revert();
    }
  }*/

  event elecTransacLog(address _from, address _to, uint8 _value);

  function ElecTransac() payable {
    // constructor
    creationTime = now;
    
  }

  function elecTransaction(address _from, address _to, uint8 _value, address configurationAdr) sellerOrBuyerOnly(_from,_to) payable  {//returns (bool)
    // Each node can as for a transaction for energy, as long as there is a need and a supply; the devices are connected; demand side has money.
    if (checkAvailability (_from, _to, _value, configurationAdr) ) { //|| _to.balance >= 0
      lastFromAddress = _from;
      lastToAddress = _to;
      lastValue = _value;
      changeStatus(_from, _to, _value, configurationAdr);
      //return true;
    }
  }

  //function checkBalance(address _)
  function checkAvailability (address _from, address _to, uint8 _value, address configurationAdr) returns (bool) {
   Configuration c = Configuration(configurationAdr);
    (_avail,_prod,_consum) = c.canTransactEnergy(_from,_to);
    if (_avail && _prod >= _value && _consum >= _value) {
      return true;
    } else {
      return false;
    }
  }

  function changeStatus (address _from, address _to, uint8 _value, address configurationAdr) returns (bool) {
    Configuration configuration = Configuration(configurationAdr);
    var dT1 = configuration.call(bytes4(sha3("changeStatus(address,address,uint8)")),_from,_to,_value);

    //var dT1 = configurationAdr.call(bytes4(sha3("changeStatus (address,address,uint8)")),_from,_to,_value);
    elecTransacLog(_from,_to,_value);
    return dT1;
  }
}