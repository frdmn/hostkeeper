/* Require modules */

var configfile = require('./config.json'),
    http = require('http'),
    Router = require('node-simple-router'),
    fs = require('fs'),
    isRoot = require('is-root'),
    shell = require('shelljs/global'),
    async = require('async');

// Check if environment variable "HOSTKEEPER_DATABSE" is set
if (process.env.HOSTKEEPER_CONFIG) {
  // Check if file exists
  fs.exists(process.env.HOSTKEEPER_CONFIG, function(exists) {
    if (exists) {
      // User custom database
      console.log('Using custom config file:' + process.env.HOSTKEEPER_CONFIG)
      var config = process.env.HOSTKEEPER_CONFIG;
    } else {
      // Use default database path from config file
      var config = configfile;
    }
  });
} else {
  var config = configfile;
}

/* Functions */

/**
 * Function to construct dnsmasq hosts file based on json-server's database
 * @param  {callback}
 * @return {bool} true
 */
function updateHostsFile(callback){
  // Load current database
  var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));

  // Clear hosts file
  fs.writeFile(config.dnsmasq.hostsfile, '', function(){

    // For each host in database
    async.each(database.hosts, function(host, cb){
      // Append each host mapping
      fs.appendFile(config.dnsmasq.hostsfile, host.ip + ' ' + host.host + '\n');
      cb();
    }, function (err){
      // Restart dnsmasq
      exec(config.commands.dnsmasq, { silent:true }, function() {
        callback(true);
      });
    });
  });
}

/**
 * Function to find the next array element id
 * @param  {array} hosts object
 * @return {integer} host id
 */
function findNextHostId(array){
  var lastitem = array[array.length-1];
  if (typeof lastitem !== 'undefined' && lastitem) {
    return Number(lastitem.id) + 1;
  } else {
    return 1;
  }
}

/**
 * Find array element which has a key value of val
 * @param  {array} input array
 * @param  {string} key to search
 * @param  {string} val to search
 * @return {bool} success
 */
function find(arr, key, val) {
  for (var ai, i = arr.length; i--;)
    if ((ai = arr[i]) && ai[key] === val)
      return ai;
  return null;
}
/**
 * Return JSON response defaults
 * @return object
 */
function initiateJSONdefaults(){
  // Set response defaults
  delete json;
  var json = {};
  json.success = false;
  json.payload = {};

  return json;
}

/* Logic */

// Function to start hostkeeper server
function startServer(){
  // Create router instance
  var router = new Router();

  var responseHeaders = {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  /* Set routes */

  // GET /api/update - to update the hosts file manually
  router.get('/api/update', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Adjust response defaults
    json.method = 'update';
    delete json.payload;

    // Update hosts file
    updateHostsFile(function(){
      // Return 200 response
      response.writeHead(200, responseHeaders);

      // Construct JSON response
      json.success = true;

      // Return JSON
      response.end(JSON.stringify(json));
    });
  });

  // GET /api/info - show api information
  router.get('/api/info', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));

    // Adjust response defaults
    json.method = 'info';

    // Return 200 response
    response.writeHead(200, responseHeaders);

    // Construct JSON response
    json.success = true;
    json.payload['hosts'] = database.hosts.length;
    json.payload['server-ip'] = exec(config.commands.ipextract, {silent:true}).output.replace('\n', '');
    json.payload['node-version'] = exec(config.commands['node-version'], {silent:true}).output.replace('\n', '');
    json.payload['dnsmasq-version'] = exec(config.commands['dnsmasq-version'], {silent:true}).output.replace('\n', '');
    json.payload.uptime = exec(config.commands.uptime, {silent:true}).output;

    // Return JSON
    response.end(JSON.stringify(json));
  });

  // GET /api/show - to list all host entries
  router.get('/api/show', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));

    // Adjust response defaults
    json.method = 'show';

    // Return 200 response
    response.writeHead(200, responseHeaders);

    // Construct JSON response
    json.success = true;
    json.payload = database.hosts;

    // Return JSON
    response.end(JSON.stringify(json));
  });

  // GET /api/show/:host - show specific host
  router.get('/api/show/:host', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8')),
        index;

    // Adjust response defaults
    json.method = 'show/' + request.params.host;

    // Find list index of host with id ":host"
    for (var i = 0; i < database.hosts.length; i++) {
      if (database.hosts[i].id.toString() === request.params.host) {
        index = i;
      }
    }

    // Make sure the desired host exists
    if (database.hosts[index]) {
      // Return 200 response
      response.writeHead(200, responseHeaders);

      // Construct JSON response
      json.success = true;
      json.payload = database.hosts[index];

      // Return JSON
      response.end(JSON.stringify(json));
    } else {
      // Return 404 response
      response.writeHead(404, responseHeaders);

      // Construct JSON response
      json.payload.error = 'Host does not exist';

      // Return JSON
      response.end(JSON.stringify(json));
    }
  });

  // POST /api/add - to add new hosts
  router.post('/api/add', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));

    // Adjust response defaults
    json.method = 'add';

    // Make sure we haven't already added the host
    if (!find(database.hosts, 'host', request.post.host)) {
      // Create object for our new host
      var newHost = {
        id: findNextHostId(database.hosts),
        host: request.post.host,
        ip: request.post.ip
      };

      // Push newHost into database object
      database.hosts.push(newHost);

      // Write database
      fs.writeFile(config.database, JSON.stringify(database, null, 2), function(){
        // Return 201 CREATED status code
        response.writeHead(201, responseHeaders);

        // Construct JSON response
        json.success = true;
        json.payload = newHost;

        // Return JSON
        response.end(JSON.stringify(json));
      });
    } else {
      // Return response
      response.writeHead(400, responseHeaders);

      // Construct JSON response
      json.payload.error = 'Host already exists';
      json.success = false;

      console.log(json);

      // Return JSON
      response.end(JSON.stringify(json));
    }
  });

  // PUT /api/edit/:host - to edit existing hosts
  router.put('/api/edit/:host', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8')),
        index;

    // Adjust response defaults
    json.method = 'edit/' + request.params.host;

    // Find list index of host with id ":host"
    for (var i = 0; i < database.hosts.length; i++) {
      if (database.hosts[i].id.toString() === request.params.host) {
        index = i;
      }
    }

    // Make sure the desired host exists
    if (database.hosts[index]) {
      // Make sure we haven't already added the host
      if (!find(database.hosts, 'host', request.post.host) || find(database.hosts, 'host', request.post.host).id === database.hosts[index].id) {

        // Update element
        database.hosts[index].host = request.post.host;
        database.hosts[index].ip = request.post.ip;

        // Write database
        fs.writeFile(config.database, JSON.stringify(database, null, 2), function(){
          // Return response
          response.writeHead(200,responseHeaders);

          // Construct JSON response
          json.success = true;
          json.payload = database.hosts[index];

          // Return JSON
          response.end(JSON.stringify(json));
        });
      } else {
        // Return response
        response.writeHead(400, responseHeaders);

        // Construct JSON response
        json.success = false;
        json.payload.error = 'Host already exist';
        json.payload.input = {};
        json.payload.input.host = request.post.host;
        json.payload.input.ip = request.post.ip;

        // Return JSON
        response.end(JSON.stringify(json));
      }
    } else {
      // Return 404 response
      response.writeHead(404, responseHeaders);

      // Construct JSON response
      json.success = false;
      json.payload.error = 'Host does not exist';
      json.payload.input = {};
      json.payload.input.host = request.post.host;
      json.payload.input.ip = request.post.ip;

      // Return JSON
      response.end(JSON.stringify(json));
    }
  });

  // DELETE /api/delete/:host - to delete existing hosts
  router.delete('/api/delete/:host', function(request, response) {
    // Load JSON defaults
    var json = initiateJSONdefaults();

    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8')),
        currentHostAmount = Object.keys(database.hosts).length;

    // Adjust response defaults
    json.method = 'delete/' + request.params.host;

    // Remove :host from database
    for(var i = 0; i < database.hosts.length; i++) {
      if(database.hosts[i].id.toString() === request.params.host) {
        var deletedHost = database.hosts[i];
        database.hosts.splice(i, 1);
        i--;
      }
    }

    // Store new host amount
    var newHostAmount = Object.keys(database.hosts).length;

    // Compare if amount changed
    if (newHostAmount !== currentHostAmount) {
      // Write database
      fs.writeFile(config.database, JSON.stringify(database, null, 2), function(){

        // Return 200 response
        response.writeHead(200, responseHeaders);

        // Construct JSON response
        json.success = true;
        json.payload = deletedHost;

        // Return JSON
        response.end(JSON.stringify(json));
      });
    } else {
      // Return 404 response
      response.writeHead(404, responseHeaders);

      // Construct JSON response
      json.payload.error = 'Host does not exist';

      // Return JSON
      response.end(JSON.stringify(json));
    }
  });

  // Create HTTP server
  var express = require('express'),
      cors = require('cors'),
      app = express();

  // Add cors middleware
  app.use(cors());

  // Add static/assets folder
  app.use(express.static(__dirname+'/public'));

  // Inject GET / route to show actual web interface
  app.get('/', function(req, res){
      res.sendfile(__dirname + '/public/index.html');
  });

  // Add API router middleware on top of that
  app.use(router);

  // Start server on configured port
  app.listen(config.port);
  console.log('hostkeeper server successfuly started: http://localhost:' + config.port);
}

// Check if run as root
if (!isRoot()){
  console.log('Error: This application needs root permissions! Make sure to run as root user.');
  // Exit with code 1
  process.exit(1);
} else {
  // Start server
  startServer();
}
