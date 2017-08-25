# This script is for installing Python3 environments in CI system
apt-get install -y python3 python3-pip
yes | pip3 install -r ../python_requirement.txt
