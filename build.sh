#!/bin/bash
set -e
# build document

# MODEL=enterprise

# gen_model_config() {
#   echo -e "\nmodule.exports = require('./model.$MODEL')" >> "configs/model.js"
# }

build_user_portal() {
  set -x
  outputPath="static/bundles"
  # rm -rf dist
  rm -rf ${outputPath}

  node_modules/.bin/webpack -p

  cp ${outputPath}/zh.*.js ${outputPath}/zh.js
  rm -f ${outputPath}/zh.*.js
  cp ${outputPath}/en.*.js ${outputPath}/en.js
  rm -f ${outputPath}/en.*.js

  # rm -f static/js/common.*
  # rm -f static/js/main.*
  # rm -f static/js/chunk.*
  # rm -f static/locales/frontend/*.js
  # rm -f static/style/main.*

  # rm -rf static/static/bundles/*

  # cp dist/common.* static/bundles/
  # cp dist/main.* static/bundles/
  # cp dist/chunk.* static/bundles/
  # # Rename files for intl
  # cp dist/zh.*.js static/bundles/zh.js
  # cp dist/en.*.js static/bundles/en.js
  # cp dist/index.* static/bundles/
  # cp dist/src/index.html index.html
  # cp dist/img/* static/bundles/img/

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