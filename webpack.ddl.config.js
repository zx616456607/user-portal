const webpack = require('webpack');
const path = require('path');

const vendors = [
  'antd',
  'color-hash',
  'echarts-for-react',
  'humps',
  'isomorphic-fetch',
  'n-zepto',
  'normalizr',
  'rc-queue-anim',
  'rc-scroll-anim',
  'rc-tween-one',
  'react',
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
  // ...其它库
];

module.exports = {
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