# Prefer Wi-Fi network for network bridge
preferred_interfaces = [
  # 'Ethernet',
  # 'Thunderbold 1',
  'Wi-Fi',
  'WLAN'
]

# Store possible interface names
host_interfaces = %x( VBoxManage list bridgedifs | grep ^Name )
                  .gsub(/Name:\s+/, '')
                  .split("\n")

# Select the most similiar one to our preferred interfaces
$network_interface_to_use = preferred_interfaces.map{ |pi| host_interfaces.find { |vm| vm =~ /#{Regexp.quote(pi)}/ } }.compact[0]

# Use Vagrant config version 2
Vagrant.configure("2") do |config|
    # Use Ubuntu 14.04 LTS
    config.vm.box = "ubuntu/trusty64"
    # Shell provisioning script for bootstrapping
    config.vm.provision :shell, :path => "bootstrap.sh"
    # Use DHCP to assign private IP
    config.vm.network "public_network", bridge: $network_interface_to_use

    # Sync "public/" folder to guest system "/var/www/html"
    config.vm.synced_folder "./public", "/var/www/html", :owner=>"root",:group=>"www-data"

    config.vm.provider :virtualbox do |vb|
        # 512 MB memory
        vb.customize ["modifyvm", :id, "--memory", "512"]
    end
end
