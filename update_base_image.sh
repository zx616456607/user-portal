#!/bin/bash
set -e
# docker login
docker login -u admin -p Dream008 192.168.1.52
# build base image
base_image="192.168.1.52/front-end/node:base-6-alpine"
docker build -t ${base_image} -f Dockerfile.base.alpine .
# push base image
docker push ${base_image}
