#!/usr/bin/env bash

# Make sure to use root user
sudo su

# Check if dnsmasq package is installed
if [[ ! -n $(dpkg -l | grep dnsmasq) ]]; then
    # Update apt repositories
    apt-get -y update
    # Install requirements for further unattended installation
    #apt-get install -y python-software-properties vim git subversion curl build-essential
fi
