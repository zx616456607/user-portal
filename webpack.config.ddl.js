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
  "@tenx-ui/b-unified-navigation",
  "@tenx-ui/editor",
  // "@tenx-ui/ellipsis",
  "@tenx-ui/icon",
  "@tenx-ui/loader",
  "@tenx-ui/logs",
  "@tenx-ui/page",
  "@tenx-ui/relation-chart",
  // "@tenx-ui/resourcebanner",
  "@tenx-ui/return-button",
  "@tenx-ui/select-with-checkbox",
  "@tenx-ui/time-hover",
  // "@tenx-ui/utils",
  "@tenx-ui/webSocket",
  "@tenx-ui/xterm",
  // ...其它库
]

module.exports = {
  mode: 'development',
  devtool: '#cheap-module-eval-source-map',
  output: {
    path: path.join(__dirname, './static/webpack_dll'),
    filename: '[name].js',
    library: '[name]',
  },
  entry: {
    lib: vendors,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ]
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, './manifest.json'),
      name: '[name]',
      context: __dirname,
    }),
  ],
}
