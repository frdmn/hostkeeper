# hostkeeper (WIP)

__hostkeeper__ is a Vagrant box that comes with a DNS server (dnsmasq) and a web interface to provide an easy way to manage LAN-wide DNS emulations (or modifications) during local web development phases. Usually you adjust your local `/etc/hosts` file on your OS X or Windows machine, but this approach won't work on a (non jailbreaked) iPhone which has no direct file system access. Once the DNS in your network settings is set to the IP of the __hostkeeper__ Vagrant box, all DNS requests from said device will obey the "faked" ones from __hostkeeper__, hence you can surf via Safari to "http://actual-domain.com" but don't end up on the productive web server of `actual-domain.com`. Instead you end up on your local development box, since you added a mapping in the __hostkeeper__ web interface.

(The introduction sentence sucks, can someone improve this please?)

## Installation

1. Make sure you've installed all requirements
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper`
3. Boot up the Vagrant box using:  
  `vagrant up`
4. Add your desired host/IP mappings in the _hostkeeper_ web interface:  
  `http://192.168.1.21` (The guest system tries to setup an bridged network interface from the WiFi interface of your Mac)
5. Setup `192.168.1.21` as DNS server on any device where you want to use the adjusted/dummy/fake hostnames.

## Under the hood

__hostkeeper__ consists out of three main parts:

* DNS (dnsmasq)
* RESTful API (to communicate between web interface and DNS server)
* Web interface (for comfortable host management)

### DNS

_@TODO_

### RESTful API

The REST API is written from scratch without any libraries, thus it might not be the most fault-tolerant API out there. But since the web interface is probably it's only client, I don't really see a need for it either.

At the moment the API provides the following routes:

##### Show all hosts

> GET /show

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/show

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:57:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked

[  
   {  
      "id":1,
      "host":"this.is.a.tld.test",
      "ip":"1.2.3.4"
   },
   {  
      "id":2,
      "host":"another.tld.test",
      "ip":"2.3.4.5"
   }
]
```

##### Show specific host

> GET /show/:host

```shell
$ curl -i -X GET -H "Content-Type:application/json" http://[hostkeeper]/show/1

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 12 Jul 2015 15:44:54 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{  
   "id":1,
   "host":"this.is.a.tld.test",
   "ip":"1.2.3.4"
}
```

##### Create new host

> POST /add

```shell
$ curl -i -X POST -H "Content-Type:application/json" http://[hostkeeper]/add \
-d '{"host":"test.de","ip":"3.4.5.6"}'

HTTP/1.1 201 Created
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:58:33 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{  
   "success":true
}
```

##### Delete specific host

> DELETE /delete/:host

In the example below, we delete host#3

```shell
$ curl -i -X DELETE -H "Content-Type:application/json" http://[hostkeeper]/delete/3

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 22:59:57 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{  
   "success":true
}
```

##### Edit existing host

> PUT /edit/:host

In the example below, we adjust the hostname of host#2 to `this.is.a.adjusted.tld` .

```shell
$ curl -i -X PUT -H "Content-Type:application/json" http://[hostkeeper]/edit/2 \
-d '{"host":"this.is.a.adjusted.tld","ip":"3.4.5.6"}'

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:01:42 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{  
   "success":true
}
```

##### Reload dnsmasq's hosts file manually

> GET /update

```shell
$ curl -i -X GET http://[hostkeeper]/update

HTTP/1.1 200 OK
Content-type: application/json
Access-Control-Allow-Origin: *
Date: Mon, 06 Jul 2015 23:02:23 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{  
   "success":true
}
```

### Web interface

_@TODO_

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## Requirements / Dependencies

* Vagrant

## Version

0.0.1

## License

[MIT](LICENSE)
