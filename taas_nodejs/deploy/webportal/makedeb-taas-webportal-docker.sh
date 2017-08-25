#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")"; pwd -P )"
WEBPORTAL_BASE=$SCRIPTPATH/taas-webportal-docker/
WEBPORTAL_INSTALL_BASE=$WEBPORTAL_BASE/usr/local/lib/taas-webportal
WEBPORTAL_DEB_BASE=$SCRIPTPATH/build

mkdir -p $WEBPORTAL_INSTALL_BASE


# Copy installation files
pushd .
cd $SCRIPTPATH/../..

cp -r app.js config.json lib log models logfile.json package.json public routes views $WEBPORTAL_INSTALL_BASE/

cp Dockerfile.physical $WEBPORTAL_INSTALL_BASE/

mkdir -p $WEBPORTAL_INSTALL_BASE/config
cp config/default.json $WEBPORTAL_INSTALL_BASE/config/

mkdir -p $WEBPORTAL_INSTALL_BASE/deploy
cp deploy/docker-compose.release.yml $WEBPORTAL_INSTALL_BASE/deploy

popd


# Make deb package
mkdir -p $WEBPORTAL_DEB_BASE
dpkg -b $WEBPORTAL_BASE $WEBPORTAL_DEB_BASE
