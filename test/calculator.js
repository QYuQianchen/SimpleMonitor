var Calculator = artifacts.require("./Calculator.sol")

contract('Calculator', function(accounts) {
  it("should assert true", function() {
    var calculator;
    return Calculator.deployed().then(function(instance){
      calculator = instance;
      return calculator.getResult.call();
    }).then(function(result){
      assert.equal(result.valueOf(),10, "Contract initialized with value Not equal to 10");
      calculator.addToNumber(10);
      calculator.subtractFromNumber(5);
      return calculator.getResult.call();
    }).then(function(result){
      assert.equal(result.valueOf(),15, "Contract calculated Not equal to 15");
      calculator.double();
      return calculator.getResult.call();
    }).then(function(result){
      console.log(result);
      assert.equal(result.valueOf(),30, "Contract calculated Not equal to 30");
      calculator.half();
      return calculator.getResult.call();
    }).then(function(result){
      assert.equal(result.valueOf(),15, "Contract calculated Not equal to 15");
      console.log(result);
      calculator.divideByNumber(0);
      return calculator.getResult.call();
    }).then(function(result){
      console.log("what");
      assert.equal(result.valueOf(),15, "Contract calculated Not equal to 30, devided by 0");
    });
  });
});