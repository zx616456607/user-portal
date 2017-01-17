#!/bin/sh
set -e
# build document

MODE=${RUNNING_MODE}
CLEAN_ALL_FILES_FLAG="false"
build_user_portal() {
  set -x
  echo "start build frontend files ..."
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
  echo "start build backtend files ..."
  outputPath="dist"
  tmp="user_portal_tmp"
  node_modules/.bin/webpack --config webpack.config.backend.js

  # 如果在执行脚本时传递 '--clean=all' 参数，构建完成后会删除源文件
  if [ "${CLEAN_ALL_FILES_FLAG}" = "true" ]; then
      mkdir -p ${tmp}
      # copy files to tmp dir
      cp ${outputPath}/app.js ${tmp}/app.js
      cp -rf static ${tmp}/
      cp index.html ${tmp}/index.html
      # rm all source files
      ls | grep -v ${tmp} | grep -v node_modules | xargs rm -rf
      mv ${tmp}/* ./
      rm -rf ${tmp}
  else
      cp ${outputPath}/app.js ./backend.js
  fi

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
  # build frontend files
  build_user_portal
  # build backend files
  if [ "$2" = "--clean=all" ]; then
      CLEAN_ALL_FILES_FLAG="true"
  fi
  # 只有在私有云，而且在执行脚本时传递 '--build=all' 参数，才会构建后端代码
  if [ "${MODE}" = "enterprise" ] && [ "$1" = "--build=all" ]; then
      echo "***********************************"
      echo "* will build backend              *"
      echo "* will delete all source files ...*"
      echo "***********************************"
      build_user_portal_backend
  fi
  echo "build ${project} success"
fi