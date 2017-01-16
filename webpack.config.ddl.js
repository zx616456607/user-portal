const webpack = require('webpack');
const path = require('path');

console.log('Build webpack dll ...')

const vendors = [
  'antd',
  'babel-polyfill',
  'classnames',
  'color-hash',
  'echarts-for-react',
  'humps',
  'isomorphic-fetch',
  'lodash',
  'moment',
  'normalizr',
  'rc-animate',
  'rc-queue-anim',
  'rc-scroll-anim',
  'rc-tween-one',
  'react',
  'react-codemirror',
  'react-dom',
  'react-intl',
  'react-redux',
  'react-router',
  'react-router-redux',
  'redux',
  'redux-devtools',
  'redux-devtools-dock-monitor',
  'redux-devtools-log-monitor',
  'redux-logger',
  'redux-thunk',
  'socket.io-client',
  'qrcode.react',
  // ...其它库
];

module.exports = {
  devtool: 'cheap-source-map',
  output: {
    path: 'static/webpack_dll',
    filename: '[name].js',
    library: '[name]',
  },
  entry: {
    "lib": vendors,
  },
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]',
      context: __dirname,
    }),
    new webpack.NoErrorsPlugin(),
  ],
};