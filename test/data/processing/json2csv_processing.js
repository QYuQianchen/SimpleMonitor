// CLI mode

// json2csv -i record_10.json -f house --no-header -o record_10_house.csv
// json2csv -i record_10.json unwind:[house, house.ConsumptionE, house.ConsumptionH, house.Wallet] --no-header -o record_10_house_detail.csv

const fs = require('fs');
const path = require('path');
var json2csv = require('json2csv');
const Json2csvParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;
const readFile = require('util').promisify(fs.readFile);

var csv = require('csv-parser');

var myData = null;
var flatten = true;
var myResult = {
  "house" : [],
  "pv" : [],
  "battery" : [],
  "grid" : [],
  "watertank" : [],
  "heatpump" : []
};

var prefix = "../output/test22_sce3/";
var filename = "record_step_5"
// var prefix = "../input/dyn_input";

readJson(prefix + filename + ".json").then(function(){
  for (const _deviceType in myResult) {
    for (let i = 0; i < myData[_deviceType].length; i++) {
      // for (const key in myData[_deviceType][i]) {
      //   console.log(_deviceType + i + ' -> ' + key + ' -> ' + myData[_deviceType][i][key].length);
      // }
      saveOneDevice(_deviceType,i);
    }
  }
});

function readJson(_dir) {
  return readFile(_dir)
      .then(e => {
          myData = JSON.parse(e);
      })
      .catch(e => console.log('FOOBAR ' + e));
}

function parsing(datasource) {
  try {
    var parser = new Json2csvParser({flatten});  //{ fields, unwind: ['items', 'items.items'] } 
    var csv = parser.parse(datasource);
    return csv;
  
  } catch (err) {
    console.error(err);
  }
}

function transpose(element) {
  var json_result = {};
  json_result["temp"] = [];

  var keys = Object.keys(element);

  for (let i = 0; i < element[keys[0]].length; i++) {
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

async function saveOneDevice(_deviceType, i) {
  mkdirSync(path.resolve(prefix + 'result'));
  var registerString = './' + prefix + 'result/' + filename + '_' + _deviceType + '_' + i + '.csv';
  var json_result = await transpose(myData[_deviceType][i]);
  console.log(json_result);
  var csv = parsing(json_result["temp"]); 
  await fs.writeFileSync(registerString, csv);
}

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}