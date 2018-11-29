#!/bin/bash
set -e
# docker login
docker login -u zhangpc -p Passw0rd 192.168.1.52
# build base image
# base_image="192.168.1.52/front-end/node:base-6-alpine.prod"
base_image="192.168.1.52/front-end/node:user-portal-base-6-alpine"
# base_image="192.168.1.52/front-end/node:base-6-alpine.prod"
docker build -t ${base_image} -f Dockerfile.base.alpine .
# push base image
docker push ${base_image}
