# TaaS Jenkins Slave Deployment README #

## Jenkins Master ##

Presumptions:

- **docker-engine** is installed;


### Build Docker image locally ###

Change to this directory first.

To build the image of the default version:

`sudo bash build_images.sh`

This method only works when the related files are deployed by Ansible, and no other versions are applied since deployment.

Alternatively, to build the image of a specific version:

`cd docker`  

`python3 apply_version.py slave.[version_name].json Dockerfile.slave_base.template Dockerfile.slave_base.template.[version_name]`

`python3 gen_version.py Dockerfile.slave_base.template.[version_name] ../Dockerfile.slave_base`

`cd ..`

`sudo bash build_images.sh`

It assumes the corresponding version database *slave.[version_name].json* exists in the docker directory, and the images built will be tagged as *iod_slave_\*:[version_name]*.

A special version name *latest* is for installing the latest published packages in the image.

Finally, a Docker image named `taas_slave_base:[version_name]` will be created after successful execution.


### Run a Jenkins slave ###

To run a slave:
`sudo docker run --cap-add=SYS_ADMIN --rm --name taas_slave_base_1 taas_slave_base:[version_name] -description "TaaS testing slave" -executors 1 -fsroot "/usr/src/jenkins_home" -labels "taas swarm base" -mode normal -name "taas-slave-base" -master "http://10.206.20.2:8080/"`

Notes:

1. Replace `[version_name]` with the exact version name.
1. If you need to run multiple slaves, make sure they have distinct container names, such as `taas_slave_base_1`, `taas_slave_base_2`...
1. We add the `--cap-add=SYS_ADMIN` option to allow for additional privileges for running the Chromium browser in sand-box mode, which requires running processes in a new namespace.
1. If you need to have the slave names registered to Jenkins server excactly the same as in the `-name` Swarm parameter without the trailing unique identifier, add the `-disableClientsUniqueId` Swarm parameter.
