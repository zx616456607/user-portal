#!/bin/bash
set -e
# docker login
docker login -u zhangpc -p 11111111 192.168.1.113
# build base image
base_image="192.168.1.113/zhangpc/user-portal:base-6-alpine"
docker build -t ${base_image} -f Dockerfile.base.alpine .
# push base image
docker push ${base_image}
