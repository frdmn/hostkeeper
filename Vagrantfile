Vagrant.configure("2") do |config|
    # Use Ubuntu 14.04 LTS
    config.vm.box = "ubuntu/trusty64"
    # Shell provisioning script for bootstrapping
    config.vm.provision :shell, :path => "bootstrap.sh"
    # Static private IP
    config.vm.network "private_network", ip: "192.168.33.10"

    config.vm.provider :virtualbox do |vb|
        # Sync "public/" folder to guest system
        vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
        # 512 MB memory
        vb.customize ["modifyvm", :id, "--memory", "512"]
    end
end
