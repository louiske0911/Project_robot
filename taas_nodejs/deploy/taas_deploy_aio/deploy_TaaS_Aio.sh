#!/bin/bash

runcmd(){
	local cmd="$1"
	echo "Running command on remote host: $cmd "
	ssh -i $private_key ec2-user@$floating_ip "$cmd"
	RETVAL=$?
	if [ $RETVAL != 0 ]; then
		echo Error :Operation failed
		exit $RETVAL
	fi
}



echo "-------------------Copy source files----------------"
echo "instance_type = $instance_type" $instance_type

scp -r -i $private_key ./* ec2-user@$floating_ip:~
RETVAL=$?
if [ $RETVAL != 0 ]; then
echo Error :Source copy failed
exit $RETVAL
fi

echo "-------------------OS Update-------------------------"
runcmd "echo 'yes'|sudo apt-get update"

if [ $? != 0 ]; then
echo Error: OS Update failed
exit 1
fi

echo "-------------------Install node.js----------------"
runcmd "tar -zxvf /home/ec2-user/deploy/taas_deploy_aio/node-v4.2.4-linux-x64.tar.gz" 

if [ $? != 0 ]; then
echo Error: Install node.js failed
exit 1
fi

echo "-------------------Install Mongodb----------------"
runcmd "tar -zxvf /home/ec2-user/deploy/taas_deploy_aio/mongodb-linux-x86_64-3.2.4.tgz" 
runcmd "sudo mv /home/ec2-user/mongodb-linux-x86_64-3.2.4/ /usr/local/mongodb"
runcmd "sudo mkdir -p /data/db"
runcmd "sudo chmod 777 /data/db/"
runcmd "echo 'Y'| sudo apt-get install mongodb-server"
runcmd "sudo service mongodb restart"

 
if [ $? != 0 ]; then
echo Error: Install Mongodbs failed
exit 1
fi

echo "-------------------Install npm----------------"
runcmd "sudo ln -s /home/ec2-user/node-v4.2.4-linux-x64/bin/node /usr/bin/node"
runcmd "sudo ln -s /home/ec2-user/node-v4.2.4-linux-x64/bin/npm /usr/bin/npm"
if [ $? != 0 ]; then
echo Error: Install npm failed
exit 1
fi

echo "-------------------install -y libkrb5-dev----------------"
runcmd "sudo apt-get install -y libkrb5-dev "

echo "-------------------install build-essential----------------"
runcmd "sudo apt-get install -y build-essential "

echo "-------------------npm Install---------------"
runcmd "cd ~/ && npm config set registry http://registry.npmjs.org/ && npm install"

echo "--------------------Set TAAS_ENV & Set Testcase BaseUrl ----------------------"
if [ $instance_type != 'AIO' ]; then
TaaS_env=openstack_ha

else
TaaS_env=openstack_aio 
sudo sed -i '6 s/7281/7481/' ~/jenkins/workspace/$jobName/tests/testsuite/* 
fi


echo "-------------------Node App.js---------------"
runcmd "sudo sed -i '1a 127.0.0.1 mongodb' /etc/hosts"
runcmd "sudo npm install -g forever"
sleep 5
runcmd "sudo ln -s /home/ec2-user/node-v4.2.4-linux-x64/bin/forever /usr/bin/forever &&  cd ~/ "
runcmd "sudo TAAS_ENV=$TaaS_env forever start -l forever.log -o out.log -e err.log --append app.js"

echo "----------------insert userinfo-------------------------"
ssh -i $private_key ec2-user@$floating_ip "mongo TaaS" <<EOI
db.userinfos.insert({"_id" : ObjectId("56b4191a483db8a012fd09c2"),"name" : "ccma","password" : "b59c67bf196a4758191e42f76670ceba","email" : "ya2648130@gmail.com","createtime" : "Fri Feb 05 2016 11:38:02 GMT+0800 (台北標準時間)","__v" : 0})
exit
EOI




