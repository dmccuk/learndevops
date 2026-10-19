## Server Setup
Take a moment to setup your VM with all the tools your going to need as you work your way through the course.

This section will do the following:

 * Update/Upgrade the operating system to the latest available version
 * Add the ansible REPO
 * Install some required packages
   * ansible
   * wget
   * curl
   * git
   * unzip
   * awscli
   * pip

Please run the following commands:

````
$ echo | sudo apt-add-repository ppa:ansible/ansible
$ sudo apt update -yq
$ sudo DEBIAN_FRONTEND=noninteractive apt upgrade -yq
$ sudo apt install wget curl git ansible unzip awscli pip -yq

$ [[ ! -f /home/ubuntu/.ssh/mykey ]] \
&& mkdir -p /home/ubuntu/.ssh \
&& ssh-keygen -f /home/ubuntu/.ssh/mykey -N '' \
&& chown -R ubuntu:ubuntu /home/ubuntu/.ssh

$ sudo apt-get clean
$ aws configure
$ aws sts get-caller-identity


