/* Require modules */

var config = require('./config.json')
    , http = require('http')
    , Router = require('node-simple-router')
    , fs = require('fs')
    , isRoot = require('is-root');

/* Functions */

/**
 * Function to construct dnsmasq hosts file based on json-server's database
 * @param  {callback}
 * @return {bool} true
 */
function updateHostsFile(callback){
  var database = require('./' + config.database);

  fs.writeFile(config.dnsmasqhostsfile, '', function(){
    database.hosts.forEach(function(host){
      fs.appendFile(config.dnsmasqhostsfile, host.ip + ' ' + host.host + '\n');
    })
  })

  // @TODO: make sure the fs functions are synchronous and callback gets called when its done.
  callback(true);
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


/* Logic */

// Function to start the actual API server
function startAPIserver(){
  // Create router instance
  var router = new Router();

  /* Set routes */

  // GET /update - to update the hosts file manually
  router.get('/update', function(request, response) {
    updateHostsFile(function(){
      response.writeHead(200,
        {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      );
      response.end('{"success": true}');
    });
  });

  // GET /show - to list all host entries
  router.get('/show', function(request, response) {
    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));
    // Write response
    response.writeHead(200,
      {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    );
    // Return hosts as JSON
    response.end(JSON.stringify(database.hosts));
  });

  // POST /add - to add new hosts
  router.post('/add', function(request, response) {
    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));
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
        response.writeHead(201,
          {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        );
        response.end('{"success": true}');
      })
    } else {
      // Return response
      response.writeHead(400,
        {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      );
      // Return error message
      response.end('{"success": false, "payload":{ "error": "Host already exist"}}');
    }
  });

  // PUT /edit/:host - to edit existing hosts
  router.put('/edit/:host', function(request, response) {
    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8')),
        index;

    // Find list index of host with id ":host"
    for (var i = 0; i < database.hosts.length; i++) {
      if (database.hosts[i].id.toString() === request.params.host) {
        index = i;
      }
    }

    // Update element
    database.hosts[index].host = request.post.host
    database.hosts[index].ip = request.post.ip

    // Write database
    fs.writeFile(config.database, JSON.stringify(database, null, 2), function(){
      // Return response
      response.writeHead(200,
        {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      );
      response.end('{"success": true}');
    });
  });

  // DELETE /delete/:host - to delete existing hosts
  router.delete('/delete/:host', function(request, response) {
    // Load hosts database
    var database = JSON.parse(fs.readFileSync(config.database, 'utf8'));

    // Remove :host from database
    for(var i = 0; i < database.hosts.length; i++) {
      if(database.hosts[i].id == request.params.host) {
        database.hosts.splice(i, 1);
        i--;
      }
    }

    // Write database
    fs.writeFile(config.database, JSON.stringify(database, null, 2), function(){
      // Return response
      response.writeHead(200,
        {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      );
      response.end('{"success": true}');
    });
  });

  // Create HTTP server
  var server = http.createServer(router);

  // Start server on port 4000
  server.listen(4000);
  console.log('API server successfuly started: http://localhost:4000');
}

// Check if run as root
if (!isRoot()){
  console.log('Error: This application needs root permissions! Make sure to run as root user.');
  process.exit(1);
} else {
  startAPIserver();
}
