const fs = require('fs');
const csv = require('csvtojson')

// parseHouse(0);
// parseHouse(1);
// parseHouse(2);
parsePV(0);
parsePV(1);
parsePV(2);
// parseGrid(0);
// parseBattery(0);
// parseWatertank(0);
// parseWatertank(1);
// parseWatertank(2);


function parseHouse(fileNo) {

    var csvFilePath = "./house_" + fileNo + ".csv";
    var jsonFileName = "house_" + fileNo + ".json"

    var house= {
        "consumption" : [],
        "consumptionH" : []
    }

    csv({
        colParser:{
            "user.name":function(item, head, resultRow, row , colIdx){
                resultRow[head]=item;
            }
        }
    })
    .fromFile(csvFilePath)

    .on('json',(jsonObj) => {
        house["consumption"].push(parseInt(jsonObj["consumption"],10));
        // house["consumptionH"].push(parseInt(jsonObj["consumptionH"],10));
        house["consumptionH"].push([parseInt(jsonObj["consumptionH_M"],10),parseInt(jsonObj["consumptionH_H"],10)]);
    })

    .on('end_parsed',(jsonArrObj)=>{
        // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
        fs.writeFile(jsonFileName, JSON.stringify(house,null), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved");
            }
        });
    })
}

function parsePV(fileNo) {

    var csvFilePath = "./pv_" + fileNo + ".csv";
    var jsonFileName = "pv_" + fileNo + ".json"

    var pv= {
        "production" : [],
        "price" : []
    }

    csv({
        colParser:{
            "user.name":function(item, head, resultRow, row , colIdx){
                resultRow[head]=item;
            }
        }
    })
        .fromFile(csvFilePath)

        .on('json',(jsonObj) => {
            pv["production"].push(parseInt(jsonObj["production"],10));
            pv["price"].push(parseInt(jsonObj["price"],10));
        })

        .on('end_parsed',(jsonArrObj)=>{
            // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
            fs.writeFile(jsonFileName, JSON.stringify(pv,null), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("JSON saved");
                }
            });
        })
}

function parseBattery(fileNo) {

    var csvFilePath = "./battery_" + fileNo + ".csv";
    var jsonFileName = "battery_" + fileNo + ".json"

    var battery= {
        "consumption" : [],
        "price" : []
    }

    csv({
        colParser:{
            "user.name":function(item, head, resultRow, row , colIdx){
                resultRow[head]=item;
            }
        }
    })
        .fromFile(csvFilePath)

        .on('json',(jsonObj) => {
            battery["consumption"].push(parseInt(jsonObj["consumption"],10));
            battery["price"].push([parseInt(jsonObj["price_1"],10),parseInt(jsonObj["price_2"],10)]);
        })

        .on('end_parsed',(jsonArrObj)=>{
            // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
            fs.writeFile(jsonFileName, JSON.stringify(battery,null), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("JSON saved");
                }
            });
        })
}

function parseGrid(fileNo) {

    var csvFilePath = "./grid_" + fileNo + ".csv";
    var jsonFileName = "grid_" + fileNo + ".json"

    var grid= {
        "price" : []
    }

    csv({
        colParser:{
            "user.name":function(item, head, resultRow, row , colIdx){
                resultRow[head]=item;
            }
        }
    })
        .fromFile(csvFilePath)

        .on('json',(jsonObj) => {
            grid["price"].push([parseInt(jsonObj["price_1"],10),parseInt(jsonObj["price_2"],10)]);
        })

        .on('end_parsed',(jsonArrObj)=>{
            // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
            fs.writeFile(jsonFileName, JSON.stringify(grid,null), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("JSON saved");
                }
            });
        })
}

function parseWatertank(fileNo) {

    var csvFilePath = "./watertank_" + fileNo + ".csv";
    var jsonFileName = "watertank_" + fileNo + ".json"

var watertank= {
    "consumption" : []
  }

csv({
    colParser:{
        "user.name":function(item, head, resultRow, row , colIdx){
            resultRow[head]=item;
        }
    }
})
    .fromFile(csvFilePath)

    .on('json',(jsonObj) => {
        watertank["consumption"].push(parseInt(jsonObj["consumption"],10));
    })

    .on('end_parsed',(jsonArrObj)=>{
        // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
        fs.writeFile(jsonFileName, JSON.stringify(watertank,null), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved");
            }
        });
    })
}