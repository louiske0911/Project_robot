#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")"; pwd -P )"
DEB_SRC_BASE=$SCRIPTPATH/taas-webportal-docker-dep/
DEB_BUILD_BASE=$SCRIPTPATH/build

# Make deb package
mkdir -p $DEB_BUILD_BASE
dpkg -b $DEB_SRC_BASE $DEB_BUILD_BASE
