// CLI mode

// json2csv -i record_10.json -f house --no-header -o record_10_house.csv
// json2csv -i record_10.json unwind:[house, house.ConsumptionE, house.ConsumptionH, house.Wallet] --no-header -o record_10_house_detail.csv

const fs = require('fs');
var json2csv = require('json2csv');
const Json2csvParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;
const readFile = require('util').promisify(fs.readFile);

var csv = require('csv-parser');

const looping = ['ConsumptionE','ConsumptionH', 'Wallet'];

var fields = null;
var unwind = null;

// const fields = ['ConsumptionE','ConsumptionH', 'Wallet']; // ,'ConsumptionH', 'Wallet'
// const unwind = ['ConsumptionE','ConsumptionH', 'Wallet'];
const flatten = true;
const ops = {flatten};
// const opts = { fields, unwind, flatten};

// const fields = [{
//   label: 'house.ConsumptionE',
//   value: 'consumptionE'
// },{
//   label: 'house.ConsumptionH',
//   value: 'consumptionH'
// }];

var myData = null;

function readJson(_dir) {
  return readFile(_dir)
      .then(e => {
          myData = JSON.parse(e);
      })
      .catch(e => console.log('FOOBAR ' + e));
}

function parsing(datasource, option) {
  try {
    const parser = new Json2csvParser(option);  //{ fields, unwind: ['items', 'items.items'] } 
    const csv = parser.parse(datasource);
    return csv;
  
  } catch (err) {
    console.error(err);
  }
}

readJson("./record_10.json").then(function(){

  console.log(myData.house[0]);

  var json_result = {};
  json_result["house0"] = [];

  for (let i = 0; i < myData.house[0].ConsumptionE.length; i++) {
    tempObj = new Object()
    for (var key in myData.house[0]) {
      if (Array.isArray(myData.house[0][key][i])) {
        tempObj[key] = {}
        for (var subkey in myData.house[0][key][i]) {
          tempObj[key][subkey] = myData.house[0][key][i][subkey];
        }
      } else {
        tempObj[key] = myData.house[0][key][i];
      }
    }
    json_result["house0"].push(tempObj)
  }
  console.log(json_result)
  return json_result;

}).then(function(json_result) {

  return parsing(json_result["house0"], ops);
  
}).then(function(csv) {
  fs.writeFileSync('./record_10.csv', csv);
});




