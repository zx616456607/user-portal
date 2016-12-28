#!/bin/bash
set -e
# build document

# MODEL=enterprise

# gen_model_config() {
#   echo -e "\nmodule.exports = require('./model.$MODEL')" >> "configs/model.js"
# }

build_user_portal() {
  set -x
  rm -rf dist

  node_modules/.bin/webpack -p

  rm -f static/js/common.*
  rm -f static/js/main.*
  rm -f static/js/chunk.*
  rm -f static/locales/frontend/*.js
  rm -f static/style/main.*

  cp dist/common.* static/js/
  cp dist/main.* static/js/
  cp dist/chunk.* static/js/
  cp dist/zh.* static/locales/frontend/
  cp dist/en.* static/locales/frontend/
  cp dist/index.* static/style/

  set +x
}

project="user-portal 2.0"
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  cat << EOF
Run the command the build release of the ${project}:
sh build.sh
EOF
#注意： Windows下也可使用（需要安装git）
else
  # if [ "$1" = "--model=SE" ]; then
  #   echo "build in SE model"
  #   MODEL=standard
  # fi
  echo "start build ${project}"
  echo "node_env: ${NODE_ENV}"
  echo "running_mode: ${RUNNING_MODE}"
  # gen_model_config
  build_user_portal
  echo "build ${project} success"
fi