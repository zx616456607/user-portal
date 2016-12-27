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

  rm -f static/js/common.js static/js/main.js static/js/*.chunk.js static/locales/frontend/*.js
  rm -f static/style/main.css

  # rm *.js.map
  # rm -f static/js/common.js.map static/js/main.js.map static/js/*.chunk.js.map static/locales/frontend/*.js.map

  cp dist/common.js static/js/common.js
  cp dist/main.js static/js/main.js
  cp dist/*.chunk.js static/js/
  cp dist/zh.js static/locales/frontend/zh.js
  cp dist/en.js static/locales/frontend/en.js
  cp dist/main.css static/style/main.css

  # cp *.js.map
  # cp dist/common.js.map static/js/common.js.map
  # cp dist/main.js.map static/js/main.js.map
  # cp dist/*.chunk.js.map static/js/
  # cp dist/zh.js.map static/locales/frontend/zh.js.map
  # cp dist/en.js.map static/locales/frontend/en.js.map

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