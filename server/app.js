/* Require modules */

var config = require('./config.json')
    , jsonServer = require('json-server');

/* Logic */

// Create json-server
var server = jsonServer.create();

// Set default middlewares (logger, static, cors and no-cache)
server.use(jsonServer.defaults);

// Set router
var router = jsonServer.router(config.database);
server.use(router);

// Start server
server.listen(config.port);
console.log('API successfully started on port ' + config.port);
