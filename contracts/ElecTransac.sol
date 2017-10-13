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
    //Configuration configuration = Configuration(configurationAdr);
    //(_avail,_prod,_consum) = configuration.call(bytes4(sha3("canTransactEnergyExtC(address,address)")),_from,_to);
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
    //var (_avail, _prod, _consum) = configuration.canTransactEnergy(_from,_to);
    //var _avail = configurationAdr.call(bytes4(sha3("canTransactEnergyExtA(address,address)")),_from,_to);
    //var _prod = configurationAdr.call(bytes4(sha3("canTransactEnergyExtB(address,address)")),_from,_to);
    //var _consum = configurationAdr.call(bytes4(sha3("canTransactEnergyExtC(address,address)")),_from,_to);
    Configuration c = Configuration(configurationAdr);
    (_avail,_prod,_consum) = c.canTransactEnergy(_from,_to);
    if (_avail && _prod >= _value && _consum >= _value) {
      return true;
    } else {
      return false;
    }
  }

  /*function checkAvailabilityCheck1 (address _from, address _to, uint8 _value, address configurationAdr) returns (bool a, uint256 b, uint256 c) {
    Configuration conf = Configuration(configurationAdr);
    (a,b,c) = conf.canTransactEnergy(_from,_to);
  }*/

  /*function changeStatus (address _from, address _to, uint8 _value, address configurationAdr) returns (bool) {
    //var dT1 = configuration.getDeviceType(_from);
    //var dT2 = configuration.getDeviceType(_to);
    var dT1 = configurationAdr.call(bytes4(sha3("getDeviceType(address)")),_from);
    var dT2 = configurationAdr.call(bytes4(sha3("getDeviceType(address)")),_to);
    if (dT1 == 1) {
      // from PV panels to ...
      if (dT2 == 0) {
        configuration.Houses[_to].consumption -= _value;
      } else { // if (dT2 == 2) 
        configuration.Batteries[_to].currentVolume -= _value;
      }
      configuration.PVs[_from].production += _value;
      ElecTransacLog(_from,_to,_value);
      return true;
    } else if (dT1 == 2) {
      // from Storage to ...
      if (dT2 == 0) {
        configuration.Houses[_to].consumption -= _value;
      } else { // if (dT2 == 2)
        configuration.Batteries[_to].currentVolume -= _value;
      }
      configuration.Batteries[_from].currentVolume -= _value;
      ElecTransacLog(_from,_to,_value);
      return true;
    } else {
      return false;
    }
  }*/

  function changeStatus (address _from, address _to, uint8 _value, address configurationAdr) returns (bool) {
    Configuration configuration = Configuration(configurationAdr);
    var dT1 = configuration.call(bytes4(sha3("changeStatus(address,address,uint8)")),_from,_to,_value);

    //var dT1 = configurationAdr.call(bytes4(sha3("changeStatus (address,address,uint8)")),_from,_to,_value);
    elecTransacLog(_from,_to,_value);
    return dT1;
  }
}