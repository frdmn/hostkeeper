# Debug mode?
debugMode = ENV['DEBUG']

# Check if debug mode and set variable with string
if debugMode
    debug = "true"
else
    debug = "false"
end

# Store possible interface names
host_interfaces = %x( VBoxManage list bridgedifs | grep ^Name )
                  .gsub(/Name:\s+/, '')
                  .split("\n")

# Select the primary one
$network_interface_to_use = host_interfaces[0]

# Use Vagrant config version 2
Vagrant.configure("2") do |config|
    # Use Ubuntu 14.04 LTS
    config.vm.box = "ubuntu/trusty64"
    # Shell provisioning script for bootstrapping
    config.vm.provision :shell, :path => "Vagrantfile.bootstrap.sh", :args => debug
    # Use DHCP to assign private IP
    config.vm.network "public_network", bridge: $network_interface_to_use
    config.vm.provider :virtualbox do |vb|
        # 512 MB memory
        vb.customize ["modifyvm", :id, "--memory", "512"]
    end
end
