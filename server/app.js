/* Require modules */

var config = require('./config.json')
    , jsonServer = require('json-server')
    , http = require('http')
    , Router = require('node-simple-router');

/* Functions */

// Function to construct dnsmasq hosts file based on json-server's database
function updateHostsFile(callback){
  var database = require('./' + config.database);

  callback(database);
}

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

  // Start json-server on port 3000
  server.listen(3000);
}

// Function to start the actual API server
function startAPIserver(){
  // Create router instance
  var router = new Router();

  // Set routes
  router.get('/hello', function(request, response) {
    updateHostsFile(function(data){
      response.end('data');
      console.log(data);
    });
  });

  // Create HTTP server
  var server = http.createServer(router);

  // Start server on port 4000
  server.listen(4000);
}

startJSONserver();
startAPIserver();
