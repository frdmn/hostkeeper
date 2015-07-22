# hostkeeper (WIP)

[![Current tag](http://img.shields.io/github/tag/frdmn/hostkeeper.svg)](https://github.com/frdmn/hostkeeper/tags) [![Repository issues](http://issuestats.com/github/frdmn/hostkeeper/badge/issue)](http://issuestats.com/github/frdmn/hostkeeper) [![Flattr this repository](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=frdmn&url=https://github.com/frdmn/hostkeeper)

![](http://up.frd.mn/N0uS9.png)

__hostkeeper__ is a Vagrant box that comes with a DNS server (dnsmasq) and a web interface to provide an easy way to manage network-wide DNS emulations (or modifications) during local web development phases. Usually you need to adjust the `/etc/hosts` file on your OS X or Windows machine to test your local project with productive domains. However, this approach won't work on a (non jailbreaked) iPhone which has no direct file system access. Once the DNS in your network settings is set to the IP of the __hostkeeper__ Vagrant box, all DNS requests from said device will obey the "faked" ones from __hostkeeper__, hence you can surf via Safari to "http://reddit.com" but don't end up on the productive web server of `reddit.com`. Instead you end up on your local development box, since you added a mapping for that in the __hostkeeper__ web interface.

## Installation

#### Using Vagrant (recommended)

1. Make sure you've installed Vagrant
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper`
3. Boot up the Vagrant box using:  
  `cd hostkeeper`  
  `vagrant up`
4. Grab a coffee and wait about 6-7 minutes until __hostkeeper__ has finished setting everything up. Keep an eye on the Vagrant provisioning script, it'll let you know as soon as it's done.
5. Once completed, add your desired host/IP mappings in the __hostkeeper__ web interface:  
  `http://192.168.1.79` (The guest system tries to setup an bridged network interface of your primary interface)
6. Setup `192.168.1.79` as DNS server on any device where you want to use the adjusted/dummy/fake hostnames.

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
$ dig reddit.com @[hostkeeper] +short
192.168.1.100
```

As you can see, __hostkeeper__ returns our adjusted (example) web server IP: 192.168.1.100

## Usage

#### Install/setup hostkeeper

```shell
$ vagrant up
```

In case you want to see  `stdout` output of the commands running in the background: 

```shell
$ HOSTKEEPER_DEBUG=true vagrant up
```

#### Recompile assets/node modules/bower components

In case you contribute and want to test your changes: 

```shell
$ vagrant provision
```

Again, in case you want to see `stdout` output of the commands running in the background: 

```shell
$ HOSTKEEPER_DEBUG=true vagrant up
```

#### Remove virtual machine

```shell
$ vagrant destroy
```

## Architecture

![](http://i.imgur.com/NIoXALe.png)

__hostkeeper__ consists out of three parts:

### DNS

* Heart of the hostkeeper project
* Returns "modified" DNS requests for all clients

### Web interface

* Easy panel for users to add host/IP mappings
* Communicates via REST API to rebuild dnsmasq hosts files and restart services
* ExpressJS as static web server

### RESTful API

* REST using `simple-node-router`
* Maintains the hosts database/storage
* Turns database/storage into dnsmasq-compatible format
* Restarts dnsmasq to reload new hosts 

You can find a detailed API documentation here: [`API.md`](API.md)

## Requirements / Dependencies

#### Using Vagrant 

* Vagrant

#### Without Vagrant

* NodeJS
* Grunt
* Bower
* `dnsmasq`

## Version

0.2.0

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

[MIT](LICENSE)
