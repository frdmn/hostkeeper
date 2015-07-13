# hostkeeper (WIP)

[![Current tag](http://img.shields.io/github/tag/frdmn/hostkeeper.svg)](https://github.com/frdmn/hostkeeper/tags) [![Repository issues](http://issuestats.com/github/frdmn/hostkeeper/badge/issue)](http://issuestats.com/github/frdmn/hostkeeper) [![Flattr this repository](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=frdmn&url=https://github.com/frdmn/hostkeeper)

__hostkeeper__ is a Vagrant box that comes with a DNS server (dnsmasq) and a web interface to provide an easy way to manage LAN-wide DNS emulations (or modifications) during local web development phases. Usually you adjust your local `/etc/hosts` file on your OS X or Windows machine, but this approach won't work on a (non jailbreaked) iPhone which has no direct file system access. Once the DNS in your network settings is set to the IP of the __hostkeeper__ Vagrant box, all DNS requests from said device will obey the "faked" ones from __hostkeeper__, hence you can surf via Safari to "http://actual-domain.com" but don't end up on the productive web server of `actual-domain.com`. Instead you end up on your local development box, since you added a mapping in the __hostkeeper__ web interface.

(The introduction sentence sucks, can someone improve this please?)

## Installation

#### Using Vagrant (recommended)

1. Make sure you've installed Vagrant
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper`
3. Boot up the Vagrant box using:  
  `cd hostkeeper`  
  `vagrant up`
4. Grab a coffee and wait about 6-7 minutes until __hostkeeper__ is done set up. Keep an eye on the Vagrant provisioning script, it'll let you know as soon as it's done.
5. Once it's done, add your desired host/IP mappings in the __hostkeeper__ web interface:  
  `http://192.168.1.21` (The guest system tries to setup an bridged network interface of your primary interface)
6. Setup `192.168.1.21` as DNS server on any device where you want to use the adjusted/dummy/fake hostnames.

#### Without Vagrant

##### 1. Prepare DNS (dnsmasq)

1. Make sure you've installed dnsmasq
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper /opt/hostkeeper`
3. Adjust your dnsmasq configuration (`/etc/dnsmasq.conf`) so it'll load our hosts file:  
```shell
[...]
server=8.8.8.8
addn-hosts=/vagrant/db.dnsmasq
```
4. Restart dnsmasq to activate the new configuration:  
  `service dnsmasq restart`

##### 2. Web interface

1. Make sure you've installed `grunt-cli` and `bower` globally:  
  `npm install -g grunt-cli bower`  
2. Install all Node dependencies in the `public/` directory:  
  `cd /opt/hostkeeper/public`  
  `npm install`
3. Install all libraries using Bower:  
  `bower install`  
4. Run Grunt tasks to compile assets:  
  `grunt`  

##### 3. RESTful API

1. Install all Node dependencies in the project root (`/opt/hostkeeper`):  
  `cd /opt/hostkeeper`  
  `npm install`
2. Copy default host database into project root:  
  `cp /opt/hostkeeper/vagrant-opt/db.example.json /opt/hostkeeper/db.json`
3. Create folders for pid and log files:  
  `mkdir -p /opt/hostkeeper/pid /opt/hostkeeper/log`
4. Run `app.js` to start web and API server (as root - if your dnsmasq runs as root):  
  `sudo node app.js`
5. Open the hostkeeper web interface and add some mappings:  
  [http://localhost]()
  
---

To test the functionality, you can directly query your local DNS server by running: 

```shell
$ dig this.is.a.tld.test @127.0.0.1 +short
1.2.3.4
```

## Under the hood

__hostkeeper__ consists out of three main parts:

* DNS (dnsmasq)
* Web interface (for comfortable host management)
* RESTful API (to communicate between web interface and DNS server)

### DNS

_@TODO_

### Web interface

_@TODO_

### RESTful API

The REST API is written from scratch without any libraries, thus it might not be the most fault-tolerant API out there. But since the web interface is probably it's only client, I don't really see a need for it either.

At the moment the API provides the following routes:

##### Show all hosts

> GET /api/show

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/api/show

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:57:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "show",
    "payload": [
        {
            "id": 1,
            "host": "this.is.a.tld.test",
            "ip": "1.2.3.4"
        },
        {
            "id": 2,
            "host": "another.tld.test",
            "ip": "2.3.4.5"
        }
    ]
}
```

##### Show specific host

> GET /api/show/:host

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/api/show/2

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 12 Jul 2015 15:44:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "show/2",
    "payload": {
        "id": 2,
        "host": "another.tld.test",
        "ip": "2.3.4.5"
    }
}
```

##### Create new host

> POST /api/add

```shell
$ curl -i -X POST -H "Content-Type:application/json" http://[hostkeeper]/api/add \
-d '{"host":"test.de","ip":"8.9.10.11"}'

HTTP/1.1 201 Created
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:58:33 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "add",
    "payload": {
        "id": 3,
        "host": "test.de",
        "ip": "8.9.10.11"
    }
}
```

##### Delete specific host

> DELETE /api/delete/:host

In the example below, we delete host#3

```shell
$ curl -i -X DELETE -H "Content-Type:application/json" http://[hostkeeper]/api/delete/3

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:59:57 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "delete/3",
    "payload": {
        "id": 3,
        "host": "test.de",
        "ip": "8.9.10.11"
    }
}
```

##### Edit existing host

> PUT /api/edit/:host

In the example below, we adjust the hostname of host#2 to `this.is.a.adjusted.tld` .

```shell
$ curl -i -X PUT -H "Content-Type:application/json" http://[hostkeeper]/api/edit/2 \
-d '{"host":"this.is.a.adjusted.tld","ip":"3.4.5.6"}'

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:01:42 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "edit/2",
    "payload": {
        "id": 2,
        "host": "this.is.a.adjusted.tld",
        "ip": "34.45.56.67"
    }
}
```

##### Reload dnsmasq's hosts file manually

> GET /api/update

```shell
$ curl -i -X GET http://[hostkeeper]/api/update

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:02:23 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
    "success": true,
    "method": "update"
}
```

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## Requirements / Dependencies

* Vagrant

## Version

0.1.0

## License

[MIT](LICENSE)
