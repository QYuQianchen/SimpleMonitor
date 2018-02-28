const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

var objs = [];

var inputs = {
    "house" : [],
    "pv" : [],
    "battery" : [],
    "grid" : [],
    "watertank" : [],
}

function addElement() {
    var addPromise = [];
    for (let i = 0; i < 3; i++) {
        _dir = "./house_" + i + ".json"
        addPromise.push(readFile(_dir)
            // .then(e => console.log(e.toString()))
            .then(e => {
                objs[i] = JSON.parse(e);
                inputs["house"].push(objs[i]);
                // console.log(inputs["house"]);
            })
            .catch(e => console.log('FOOBAR ' + e)));
    }
    return Promise.all(addPromise);
}

addElement().then(function() {
    console.log(inputs);
    console.log(inputs["house"][1]["consumptionH"]);

    // var json = JSON.stringify(inputs);
    fs.writeFile('dyn_input.json', JSON.stringify(inputs), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });
})


