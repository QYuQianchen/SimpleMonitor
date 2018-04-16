View = {

  checkTimer: function(element) {

    if (element.contract.getTimeToNext != undefined) {
      // element.contract.getTimeToNextStatus({from: element.address, gas: 2100000}).then((result)=>{
      View.executeStep(element);

      element.contract.getTimeToNext.call().then((result)=>{
        View.log(element, "Remaining time: " + result.toNumber());
        var remainTime = result.toNumber()*1000;

        if (remainTime != 0)
        {
          setTimeout(function () {
            View.checkTimer(element);
            View.update_view(element);
          }, remainTime+1000);
        }
        else {
          setTimeout(function () {
            View.checkTimer(element);
            View.update_view(element);
          }, 1000);
        }
      });

    }

  },

  executeStep: function(element) {

    // STEP 1
    if (element.next_status == "1") {
      // console.log(element.device_name + " trying step 1!");
      View.log(element, "Trying step 1...");

      Controller.get_energy(Date.now(), 120, 'house', function(returnJSON) {
        if ('energy' in returnJSON && 'timestamp' in returnJSON) {
          // console.log("Adding value to pv0 measurements.");
          // Model.config.house[0].measurements[returnJSON.timestamp] = returnJSON;
          $("#input_value_house0")[0].value = Math.round(returnJSON.energy);
        }

        var value = $('#input_value_' + element.device_name)[0].value;

        Controller.set_value(element, value, function(success) {

          if (element.type == "house" && success) {
            element.next_status = "2a";
          } else if (element.type == "pv" && success) {

            var price = $('#input_price_' + element.device_name)[0].value;
            Controller.set_price(element, price);
            element.next_status = "3a";
          } else {
            Controller.log("Unknown device_type");
          }
        });
      });

    // STEP 2a
    } else if (element.next_status == "2a") {
      // console.log(element.device_name + " trying step 2a!");
      View.log(element, "Trying step 2a...");


      if (element.contract.askForPrice != undefined) {
        // console.log(element.device_name + " askForPrice()");
        View.log(element, "askForPrice()...");
        element.contract.askForPrice({from: element.address, gas: 21000000}).then((result)=>{
          View.log(element, "Got askForPrice() receipt.");
          // console.log(element.device_name + "<-- askForPrice() receipt:");
          // console.log(result);
          element.next_status = "2b"
          View.executeStep(element);

        }).catch(function(error) {
          View.log(element, "askForPrice() error");
          View.log(element, error);
          // Controller.log("Error in askForPrice() <- " + element.device_name);
        });
      }

    // STEP 2b
    } else if (element.next_status == "2b") {
      View.log(element, "Trying step 2b...");

      if (element.contract.sortPrice != undefined) {
        // console.log(element.device_name + " sortPrice()");
        View.log(element, "sortPrice()...");
        element.contract.sortPrice({from: element.address, gas: 21000000}).then((result)=>{
          View.log(element, "Got sortPrice() receipt.");
          // console.log(element.device_name + "<-- sortPrice() receipt:");
          // console.log(result);
          element.next_status = "5";
        }).catch(function(error) {
          View.log(element, "sortPrice() error");
          View.log(element, error);
          // Controller.log("Error in sortPrice() <- " + element.device_name);
        });
      }

    // STEP 3a
    } else if (element.next_status == "3a") {
      View.log(element, "Trying step 3a...");
      // console.log(element.device_name + " trying step 3a!");

      if (element.contract.askForRank != undefined) {
        // console.log(element.device_name + " askForRank()");
        View.log(element, "askForRank()...");
        element.contract.askForRank({from: element.address, gas: 2100000}).then((result)=>{
          View.log(element, "Got askForRank() receipt.");
          // console.log(element.device_name + "<-- askForRank() receipt:");
          // console.log(result);
          element.next_status = "3b";
          View.executeStep(element);
        }).catch(function(error) {
          View.log(element, "askForRank() error");
          View.log(element, error);
          // Controller.log("Error in askForRank() <- " + element.device_name);
        });
      }

    // STEP 3b
    } else if (element.next_status == "3b") {
      View.log(element, "Trying step 3b...");
      // console.log(element.device_name + " trying step 3b!");

      if (element.contract.sortRank != undefined) {
        // console.log(element.device_name + " askForRank()");
        View.log(element, "sortRank()...");
        element.contract.sortRank({from: element.address, gas: 2100000}).then((result)=>{
          View.log(element, "Got sortRank() receipt.");
          // console.log(element.device_name + "<-- askForRank() receipt:");
          // console.log(result);
          element.next_status = "4";
        }).catch(function(error) {
          View.log(element, "sortRank() error");
          View.log(element, error);
          // Controller.log("Error in askForRank() <- " + element.device_name);
        });
      }

    // STEP 4
    } else if (element.next_status == "4") {
      // console.log(element.device_name + " trying step 4!");
      View.log(element, "Trying step 4...");

      Controller.execute(element, "sellEnergy", function(result) {
        if (result != undefined) {
          console.log(result);
          element.next_status = "5";
        }
      });

    // STEP 5
    } else if (element.next_status == "5") {
      View.log(element, "Trying step 5...");
      // console.log(element.device_name + " trying step 5!");

      Controller.execute(element, "buyExtra", function(result) {
        if (result != undefined) {
          element.next_status = "1";
        }
      });

      Controller.execute(element, "sellExcess", function(result) {
        if (result != undefined) {
          element.next_status = "1";
        }
      });

    // DEFAULT
    } else {
      View.log(element, "No element status defined.");
      // console.log("No element status defined.");
    }
  },

  init: function(callback) {
    // Load configuration into elements of table view.
    var participant_row = $('#participant_row');

    for (var device_type in Model.config) {
      for (var device_id in Model.config[device_type]) {
        (function(element) {
          // console.log(element.contract_address);

          // console.log(_key + "[" + _unit + "]");
          element = View.build_element(element);
          participant_row.append(element.template.html());

          if (element.contract_address != 0) {
            element.next_status = "1";
            // console.log("\n\n" + element.type + "\n\n");

            if (element.type == "house" || element.type == "pv") {
              setTimeout(function () {
                View.checkTimer(element);

              }, 100 + Math.round(Math.random()*100));


            }
          }
        })(Model.config[device_type][device_id])
      }
    }

    if (callback != undefined) callback();
  },

  build_element: function(element) {
    var template = $('#template');

    // Fill panel title text
    template.find('.panel-title').text(element.device_name);
    // Set panel picture
    template.find('img').attr('src', element.picture);
    // Set unique ID for balance span (i.e. span_balance_pv0)
    template.find('.span-consumed').attr("id", "span_consumed_" + element.device_name);
    template.find('.span-balance').attr("id", "span_balance_" + element.device_name);
    template.find('.span-wallet').attr("id", "span_wallet_" + element.device_name);
    template.find('.select_address').attr("id", "select_address_" + element.device_name);
    template.find('.span_address').attr('id', "span_address_" + element.device_name);
    template.find('.span_contract_address').attr('id', "span_contract_address_" + element.device_name);
    template.find('.span_current_value').attr('id', "span_current_value_" + element.device_name);

    template.find('.btn-register').attr('data-id', element.id);
    template.find('.btn-register').attr('data-type', element.type);
    template.find('.btn-register').attr('id', "btn_register_" + element.device_name);

    template.find('.btn-set-value').attr('data-id', element.id);
    template.find('.btn-set-value').attr('data-type', element.type);
    template.find('.input_value').attr('id', "input_value_" + element.device_name);
    template.find('.btn-show-last').attr('data-id', element.id);
    template.find('.btn-show-last').attr('data-type', element.type);
    template.find('.table-last-values').attr('id', "table_last_values_" + element.device_name);


    template.find('.div-price-input').attr('style', "display: none");
    if (element.type == "pv" || element.type == "grid") {
      template.find('.div-price-input').attr('style', "display: inline");
      template.find('.btn-set-price').attr('data-id', element.id);
      template.find('.btn-set-price').attr('data-type', element.type);
      template.find('.input_price').attr('id', "input_price_" + element.device_name);
      template.find('.span_current_price').attr('id', "span_current_price_" + element.device_name);
    }

    if (Controller.debug) {
      template.find('.div-debug-console').attr('style', "display: inline");
      template.find('.text-debug-console').attr('id', "debug_console_" + element.device_name);
    }

    element.template = template;

    return element;
  },

  // Bind UI events to functions in app
  bindEvents: function() {
    $(document).on('click', '.btn-register', View.handle_register);
    $(document).on('click', '.btn-set-value', View.handle_set_value);
    $(document).on('click', '.btn-set-price', View.handle_set_price);
    $(document).on('click', '.btn-settle', View.handle_settle);
    $(document).on('click', '.btn-link-participants', View.handle_link);
  },

  update_view: function(element) {
    $("#span_address_" + element.device_name)[0].innerHTML = element.address;
    $("#span_contract_address_" + element.device_name)[0].innerHTML = element.contract_address;
    $("#span_balance_" + element.device_name)[0].innerHTML = element.balance / 1000000000000000000;
    $("#span_consumed_" + element.device_name)[0].innerHTML = (100 - (element.balance / 1000000000000000000)) * 800;
    $("#span_wallet_" + element.device_name)[0].innerHTML = element.wallet;

    if (element.type == 'pv' || element.type == 'house'|| element.type == 'battery') {
      if (element.value != undefined)
        $("#span_current_value_" + element.device_name)[0].innerHTML = element.value.value + " at " + element.value.timestamp;
    }

    if (element.type == 'pv' || element.type == 'battery') {
      $("#span_current_price_" + element.device_name)[0].innerHTML = element.price;
    }
    if (typeof(element.contract) != undefined) {
      // $("#btn_register_" + element.device_name).attr("disabled", "disabled");
    }
  },

  // Handle input for a value of a device
  handle_set_value: function() {
    event.preventDefault();

    var device_id = parseInt($(event.target).data('id'));
    var device_type = $(event.target).data('type');
    var element = Model.config[device_type][device_id];
    var value = $('#input_value_' + element.device_name)[0].value;

    Controller.set_value(element, value);
  },

  log: function(element, line) {
    var textarea = $('#debug_console_' + element.device_name)[0];
    textarea.append("> " + line + "\n");
    textarea.scrollTop = textarea.scrollHeight;
  },

  handle_set_price: function() {
    event.preventDefault();

    var device_id = parseInt($(event.target).data('id'));
    var device_type = $(event.target).data('type');
    var element = Model.config[device_type][device_id];

    var price = $('#input_price_' + element.device_name)[0].value;

    Controller.set_price(element, price);
  },

  handle_register: function() {
    event.preventDefault();

    var device_id = parseInt($(event.target).data('id'));
    var device_type = $(event.target).data('type');
    var element = Model.config[device_type][device_id];

    Controller.register(element);
  },

  handle_settle: function() {
    event.preventDefault();
    Controller.settle_auto();
  },

  handle_link: function() {
    event.preventDefault();
    Controller.link_participants(Controller.log);
  }

};
