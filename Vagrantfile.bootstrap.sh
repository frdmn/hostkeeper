#!/usr/bin/env bash

# Parse debug arg from Ruby
[[ $1 == "true" ]] && DEBUG=true || DEBUG=false

# Redirect stderr conditionally based on DEBUG
run() {
    if $DEBUG; then
        v=$(exec 2>&1 && set -x && set -- "$@")
        echo "#${v#*--}"
        "$@"
    else
        "$@" >/dev/null 2>&1
    fi
}

# ASCII typo
asciitypo="$(cat <<-ENDOFTYPO
.__                    __   __
|  |__   ____  _______/  |_|  | __ ____   ____ ______   ___________
|  |  \ /  _ \/  ___/\   __\  |/ // __ \_/ __ \\\____ \_/ __ \_  __ \.
|   Y  (  <_> )___ \  |  | |    <\  ___/\  ___/|  |_> >  ___/|  | \/
|___|  /\____/____  > |__| |__|_ \\\___  >\___  >   __/ \___  >__|
     \/           \/            \/    \/     \/|__|        \/
ENDOFTYPO
)"

# Make sure to use root user
sudo su

# Check for lock file
if [[ ! -f /opt/HOSTKEEPER_SUCCESSFULLY_INSTALLED ]]; then
    # Proceed with initial installation
    echo "Update apt repositories"
    run apt-get -y update
    # Install requirements
    run apt-get install -y curl vim git build-essential dnsmasq nodejs npm fontconfig
    run ln -sf /usr/bin/nodejs /usr/bin/node
    # Apply base config for dnsmasq
    run cp /vagrant/vagrant-opt/dnsmasq.conf /etc/dnsmasq.conf
    run touch /vagrant/db.dnsmasq
    # Compile assets of web interface
    cd /vagrant/public
    run npm install -g grunt-cli bower
    run npm install
    run bower install --allow-root
    run grunt
    # Install hostkeeper-server
    cd /vagrant
    run npm install
    run cp /vagrant/vagrant-opt/initd_hostkeeper /etc/init.d/hostkeeper
    run cp /vagrant/vagrant-opt/db.example.json /vagrant/db.json
    run mkdir -p /vagrant/pid /vagrant/log
    run chmod +x /etc/init.d/hostkeeper
    run update-rc.d hostkeeper defaults
    run service hostkeeper start
    # Create initial dnsmasqs host file via API server
    run sleep 5
    run printf "%s %s" "Updating hosts file for dnsmasq using REST API ... " $(curl -s http://localhost/api/update &>/dev/null && printf "success :)\n" || echo "failed :(\n")
    # Create installation lock file
    run touch /opt/HOSTKEEPER_SUCCESSFULLY_INSTALLED
else
    # hostkeeper is already installed
    echo "hostkeeper already installed!"
    cd /vagrant
    echo "Install node modules ..."
    run npm install
    cd /vagrant/public
    run npm install
    echo "Install bower components ..."
    run bower install --allow-root
    echo "Recompile assets using Grunt"
    run grunt
    echo "Restart hostkeeper ..."
    run service hostkeeper stop
    run service hostkeeper start
    sleep 5
    printf "%s %s" "Updating hosts file for dnsmasq using REST API ... " $(curl -s http://localhost/api/update &>/dev/null && printf "success :)\n" || echo "failed :(\n")
fi

# Final success message
guestIP=$(ip address show eth1 | grep 'inet ' | sed -e 's/^.*inet //' -e 's/\/.*$//')
echo "${asciitypo}"
echo "---"
echo "Try to run the following command on your host to test the DNS server:"
echo "$ dig reddit.com @${guestIP} +short"
echo "Access the hostkeeper web interface:"
echo "$ open http://${guestIP}"
