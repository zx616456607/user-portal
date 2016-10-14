#!/bin/bash
set -e
# build document
build_doc() {
  set -x
  rm -rf dist
  rm -f static/js/common.js static/js/main.js static/locales/frontend/*.js
  rm -f static/style/main.css
  webpack -p --config webpack.config.prod.js
  cp dist/common.js static/js/common.js
  cp dist/main.js static/js/main.js
  cp dist/zh.js static/locales/frontend/zh.js
  cp dist/en.js static/locales/frontend/en.js
  cp dist/main.css static/style/main.css
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
  echo "start build ${project}"
  build_doc
  echo "build ${project} success"
fi
