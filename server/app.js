/* Require modules */

var config = require('./config.json')
    , jsonServer = require('json-server')
    , http = require('http')
    , Router = require('node-simple-router')
    , fs = require('fs')
    , restler = require('restler')
    , isRoot = require('is-root');

/* Functions */

// Function to construct dnsmasq hosts file based on json-server's database
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
    restler.get('http://localhost:3000/hosts').on('complete', function(restData) {
      response.writeHead(200,
        {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      );
      response.end(JSON.stringify(restData));
    });
  });

  // POST /add - to add new hosts
  router.post('/add', function(request, response) {
    // First make sure we haven't already added the host
    restler.get('http://localhost:3000/hosts?host=' + request.post.host).on('complete', function(restData) {
      // Host didnt already exist if object is empty => continue
      if(restData.length === 0){
        // Add new host via REST API
        restler.post('http://localhost:3000/hosts', {
          data: {
            host: request.post.host,
            ip: request.post.ip
          }
        }).on('complete', function(restData, restResponse) {
          if (restResponse.statusCode === 201) {
            // Return response
            response.writeHead(200,
              {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            );
            // response.end(restResponse.rawEncoded);
            response.end('{"success": true}');
          }
        });
      } else {
        // Return response
        response.writeHead(200,
          {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        );
        // Return error message
        response.end('{"success": false, "payload":{ "error": "Host already exist"}}');
      }
    });
  });

  // POST /edit/:host - to edit existing hosts
  router.post('/edit/:host', function(request, response) {
    restler.put('http://localhost:3000/hosts/' + request.params.host, {
      data: {
        host: request.post.host,
        ip: request.post.ip
      },
    }).on('complete', function(restData, restResponse) {
      if (restResponse.statusCode === 200) {
        // Return response
        response.writeHead(200,
          {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        );
        // response.end(restResponse.rawEncoded);
        response.end('{"success": true}');
      }
    });
  });


  // POST /delete/:host - to delete existing hosts
  router.post('/delete/:host', function(request, response) {
    // @TODO - [SyntaxError: Unexpected end of input] ???
    restler.del('http://localhost:3000/hosts/' + request.params.host).on('complete', function(restData, restResponse) {
      if (restResponse.statusCode === 200) {
        // Return response
        response.writeHead(200,
          {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        );
        // response.end(restResponse.rawEncoded);
        response.end('{"success": true}');
      }
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
  startJSONserver();
  startAPIserver();
}
