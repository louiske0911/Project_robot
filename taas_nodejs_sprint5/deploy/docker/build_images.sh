#!/bin/bash
# build Docker images for TaaS Jenkins slave locally
#
# Usage:
#     ./build_images.sh
#     This will build the images of the default version.
#
#     ./build_images.sh [version_name]
#     This will build the images of the specified version,
#     and the images built will be tagged as taas_slave_*:[version_name].
#     A special version name "latest" is for installing the latest published packages in the image.

default_version=v1

if [ $# -ge 1 ]; then
	version=$1
else
	version=${default_version}
fi
echo version=${version}

sudo docker build -t taas_slave_base:${version} -f Dockerfile.slave_base .
