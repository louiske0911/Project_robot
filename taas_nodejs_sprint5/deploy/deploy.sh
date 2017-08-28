#!/bin/bash

runcmd() {
	local cmd=$1
	echo "Running command on remote host: $cmd"
	ssh -i $private_key ec2-user@$floating_ip "$cmd"
	RETVAL=$?
	if [ $RETVAL != 0 ]; then
		echo Error :Operation failed
		exit $RETVAL
	fi
}



echo "-------------------Copy source files----------------"
scp -r -i $private_key ./* ec2-user@$floating_ip:~
RETVAL=$?
if [ $RETVAL != 0 ]; then
echo Error :Source copy failed
exit $RETVAL
fi



echo "-------------------Install docker---------------------"
runcmd "sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D"

runcmd 'sudo -s <<EOT
echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" > /etc/apt/sources.list.d/docker.list
EOT'

runcmd "sudo apt-get update"

runcmd "sudo apt-get install -y docker-engine=1.7.1-0~trusty"

# validate installation
runcmd "sudo docker info"



echo "-------------------Install docker-compose---------------------"
runcmd 'sudo -s <<EOT
curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
EOT'

# validate installation
runcmd "docker-compose --version"



echo "-------------------Build & run TaaS Web portal container---------------------"
deployDir=deploy
dockerComposeFile=docker-compose.openstack_ha.yml

runcmd "cd $deployDir; sudo docker-compose -f $dockerComposeFile build"
runcmd "cd $deployDir; sudo docker-compose -f $dockerComposeFile up -d"
