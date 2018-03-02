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

function transpose(element) {
  var json_result = {};
  json_result["temp"] = [];

  var keys = Object.keys(element);

  for (let i = 0; i < element.ConsumptionE.length; i++) {
    tempObj = new Object()
    keys.forEach(subelement => {
      if (Array.isArray(element[subelement][i])) {
        tempObj[subelement] = {}
        for (var subkey in element[subelement][i]) {
          tempObj[subelement][subkey] = element[subelement][i][subkey];
        }
      } else {
        tempObj[subelement] = element[subelement][i];
      }
    });
    json_result["temp"].push(tempObj)
  }
  console.log(json_result)
  return json_result;
}

readJson("./record_10.json").then(function(){

  console.log(Object.keys(myData.house[0]));

  return transpose(myData.house[0]);

}).then(function(json_result) {

  return parsing(json_result["temp"], ops);
  
}).then(function(csv) {

  fs.writeFileSync('./record_10.csv', csv);

});




