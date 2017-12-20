const webpack = require('webpack');
const path = require('path');

console.log('Build webpack dll ...')

const vendors = [
  'antd',
  // 'babel-plugin-antd',
  // 'babel-plugin-react-transform',
  // 'babel-plugin-transform-runtime',
  // 'babel-preset-es2015',
  // 'babel-preset-react',
  // 'babel-preset-react-hmre',
  // 'babel-preset-stage-0',
  // 'babel-preset-stage-2',
  'classnames',
  'codemirror',
  'color-hash',
  'echarts',
  'echarts-for-react',
  // 'es6-object-assign',
  // 'es6-promise',
  'humps',
  'lodash',
  'jquery',
  'moment',
  'normalizr',
  'qrcode.react',
  'rc-queue-anim',
  'rc-tween-one',
  'react',
  'react-codemirror2',
  'react-dom',
  'react-intercom',
  'react-intl',
  'react-redux',
  'react-router',
  'react-router-redux',
  'redux',
  'redux-devtools-extension',
  'redux-thunk',
  'socket.io-client',
  'text-encoding',
  'whatwg-fetch',
  // ...其它库
]

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  output: {
    path: path.join(__dirname, './static/webpack_dll'),
    filename: '[name].js',
    library: '[name]',
  },
  entry: {
    lib: vendors,
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, './manifest.json'),
      name: '[name]',
      context: __dirname,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}