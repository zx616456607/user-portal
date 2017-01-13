#!/bin/bash
set -e
# build document

MODE=${RUNNING_MODE}

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

  set +x
}

build_user_portal_backend() {
  set -x
  outputPath="dist"
  tmp="user_portal_tmp"
  node_modules/.bin/webpack --config webpack.config.backend.js
  mkdir ${tmp}
  # copy files to tmp dir
  cp ${outputPath}/app.js ${tmp}/app.js
  cp -rf static ${tmp}/
  cp index.html ${tmp}/index.html
  # rm all source files
  ls | grep -v ${tmp} | grep -v node_modules | xargs rm -rf
  mv ${tmp}/* ./
  rm -rf ${tmp}

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
  echo "node_env: ${NODE_ENV}"
  echo "running_mode: ${MODE}"
  build_user_portal
  # 只有在私有云，而且在执行脚本时传递 '--clean=all' 参数
  # 才会构建后端代码，且在构建完成后会删除源文件
  if [ "$1" = "--clean=all" ] && [ "${MODE}" = "enterprise" ]; then
      echo "***********************************"
      echo "* will build backend              *"
      echo "* will delete all source files ...*"
      echo "***********************************"
      build_user_portal_backend
  fi
  echo "build ${project} success"
fi