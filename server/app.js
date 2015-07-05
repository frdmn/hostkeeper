/* Require modules */

var config = require('./config.json')
    , jsonServer = require('json-server');

/* Logic */

// Function to start the RESTful json-server
function startJSONserver(){
  // Create json-server
  var server = jsonServer.create();

  // Set default middlewares (logger, static, cors and no-cache)
  server.use(jsonServer.defaults);

  // Set router
  var router = jsonServer.router(config.database);
  server.use(router);

  // Start json-server
  server.listen(3000);
}

startJSONserver();
