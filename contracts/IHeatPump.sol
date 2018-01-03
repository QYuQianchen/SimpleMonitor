pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IHeatPump is GeneralDevice {

  uint lastConsumpQueryAt;
  uint lastPriceQueryAt;
  uint priceTimeOut = 10 minutes;
  uint priceStatusAt;            // timestamp of the update (price)

  function getPrice() public view returns (uint prs, bool updatedOrNot);
}
