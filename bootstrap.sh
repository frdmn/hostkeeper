#!/usr/bin/env bash

# Parse debug arg from Ruby
[[ $1 == "true" ]] && set -x

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

# Check if dnsmasq package is installed
if [[ ! -n $(dpkg -l | grep dnsmasq) ]]; then
    # Update apt repositories
    apt-get -y update
    # Install requirements
    apt-get install -y curl vim git build-essential dnsmasq apache2 nodejs npm fontconfig
    ln -sf /usr/bin/nodejs /usr/bin/node
    # Apply base config for dnsmasq
    cp /vagrant/opt/dnsmasq.conf /etc/dnsmasq.conf
    touch /etc/dnsmasq.hosts
    # Prepare Apache2
    a2dissite 000-default.conf
    rm -rf /var/www/html
    cp /vagrant/opt/apache2_hostkeeper.conf /etc/apache2/sites-available/hostkeeper.conf
    a2ensite hostkeeper.conf
    service apache2 restart
    # Compile assets of web interface
    cd /var/www/hostkeeper
    npm install -g grunt-cli bower &>/dev/null && echo "success: bower and grunt installation" || echo "failed: bower and grunt installation"
    npm install &>/dev/null && echo "success: npm package installation for web interface" || echo "failed: npm package installation for web interface"
    bower install --allow-root
    grunt
    # Install hostkeeper-server
    cd /vagrant/server/
    npm install &>/dev/null && echo "success: npm package installation for API server" || echo "failed: npm package installation for API server"
    cp /vagrant/opt/initd_node-app /etc/init.d/node-app
    chmod +x /etc/init.d/node-app
    update-rc.d node-app defaults
    service node-app start
    # Create initial dnsmasqs host file via API server
    sleep 5
    curl -s http://localhost:4000/update &>/dev/null && echo "success: Created initial hosts file for dnsmasq via API server! :)" || echo "failed: Couldn't reach API server! :("
    # Final success message
    guestIP=$(ip address show eth1 | grep 'inet ' | sed -e 's/^.*inet //' -e 's/\/.*$//')
    echo "${asciitypo}"
    echo "---"
    echo "Try to run the following command on your host to test the DNS server:"
    echo "$ dig this.is.a.tld.test @${guestIP} +short"
    echo "Access the hostkeeper web interface:"
    echo "$ open http://${guestIP}"
fi
