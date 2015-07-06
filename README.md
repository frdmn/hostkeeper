# hostkeeper (WIP)

__hostkeeper__ is a Vagrant box that comes with a DNS server (dnsmasq) and a web interface to provide an easy way to manage LAN-wide DNS emulations (or modifications) during local web development phases. Usually you adjust your local `/etc/hosts` file on your OS X or Windows machine, but this approach won't work on a (non jailbreaked) iPhone which has no direct file system access. Once the DNS in your network settings is set to the IP of the __hostkeeper__ Vagrant box, all DNS requests from said device will obey the "faked" ones from __hostkeeper__, hence you can surf via Safari to "http://actual-domain.com" but don't end up on the productive web server of `actual-domain.com`. Instead you end up on your local development box, since you added a mapping in the __hostkeeper__ web interface.

## Installation

1. Make sure you've installed all requirements
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper`
3. Create host file storage (which is not tracked by `git`):  
  `cp server/db.example.json server/db.json `
4. Boot up the Vagrant box using:  
  `vagrant up`
5. Add your desired host/IP mappings in the _hostkeeper_ web interface:  
  `http://192.168.1.21` (The guest system tries to setup an bridged network interface from the WiFi interface of your Mac)
6. Setup `192.168.1.21` as DNS server on any device where you want to use the adjusted/dummy/fake hostnames.

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
