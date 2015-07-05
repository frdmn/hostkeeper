# hostkeeper (WIP)

Simple DNS server and web interface to provide LAN-wide host<->IP mappings for development testing. Similar to the `/etc/hosts` file.

## Installation

1. Make sure you've installed all requirements
2. Clone this repository:  
  `git clone https://github.com/frdmn/hostkeeper`
3. Compile the assets of the web interface:  
  `cd public`  
  `npm install`  
  `npm bower install`  
  `grunt`  
4. Create default hosts storage:  
  `cp server/db.example.json server/db.json `
5. Boot up the Vagrant box using:  
  `vagrant up`
6. Add your desired host/IP mappings in the _hostkeeper_ webinterface:  
  `http://192.168.1.21` (The guest system tries to setup an bridged network interface from the WiFi interface of your Mac)
7. Setup `192.168.1.21` as DNS server on any device where you want to use the adjusted/dummy/fake hostnames.

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
