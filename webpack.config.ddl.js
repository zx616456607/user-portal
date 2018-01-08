const webpack = require('webpack');
const path = require('path');

console.log('Build webpack dll ...')

const vendors = [
  'antd',
  'classnames',
  'codemirror',
  'color-hash',
  'docker-file-parser',
  'echarts',
  'echarts-for-react',
  'humps',
  'jquery',
  'lodash',
  'moment',
  'normalizr',
  'qrcode.react',
  'rc-queue-anim',
  'rc-tween-one',
  'react',
  'react-dock',
  'react-dom',
  'react-codemirror2',
  'react-intercom',
  'react-intl',
  'react-redux',
  'react-router',
  'react-router-redux',
  'react-tagsinput',
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