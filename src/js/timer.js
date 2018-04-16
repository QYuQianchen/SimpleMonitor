Timer = {
  set_house_timer: function() {
    // Set interval to update the timestamp clock under the title
    setInterval(function(){
      Controller.get_energy(Date.now(), 120, 'house', function(returnJSON) {
        if ('energy' in returnJSON && 'timestamp' in returnJSON) {
          // console.log("Adding value to pv0 measurements.");
          // Model.config.house[0].measurements[returnJSON.timestamp] = returnJSON;
          $("#input_value_house0")[0].value = Math.round(returnJSON.energy);
        }
        View.update_view(Model.config.house[0]);
      });
    }, 15000);
  },


  set_pv_timer: function() {
    // Set interval to update the timestamp clock under the title
    setInterval(function(){
      Controller.get_energy(Date.now(), 120, 'pv', function(returnJSON) {
        if ('energy' in returnJSON && 'timestamp' in returnJSON) {
          // console.log("Adding value to pv0 measurements.");
          // Model.config.pv[0].measurements[returnJSON.timestamp] = returnJSON;
          $("#input_value_pv0")[0].value = Math.round(returnJSON.energy);
        }
        View.update_view(Model.config.pv[0]);
      });
    }, 15000);
  },

  set_timestamp_timer: function() {
    // Set interval to update the timestamp clock under the title
    setInterval(function(){
      // Get timestamp span and set to current second of timestamp.
      $("#span_timestamp")[0].innerHTML = parseInt(Date.now() / 1000);
    }, 1000);
  }
};
