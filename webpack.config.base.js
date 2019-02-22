
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack dev config base
 *
 * v0.1 - 2018-08-13
 * @author RenSiWei
 */

const path = require('path')
const webpack = require('webpack')
const tsImportPluginFactory = require('ts-import-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const site = 'tenxcloud.com'
const env = process.env
const analyze = !!env.ANALYZE_ENV

const config =  {
  entry: {
    vendors: [
      '@babel/polyfill',
      'echarts',
      'moment',
      'js-yaml',
      'codemirror',
      'jquery'
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname, './src'),
      'node_modules',
    ],
    extensions: [ '.js', '.jsx', '.json', '.ts', '.tsx' ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({
              before: [
                tsImportPluginFactory({
                  libraryName: 'antd',
                  libraryDirectory: 'lib',
                })
              ]
            }),
            compilerOptions: {
              module: 'es2015'
            }
          },
        },
        exclude: /node_modules/
      },
      {
  　　　 test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 5192, // 5KB 以下图片自动转成 base64 码
          name: 'img/[name].[hash:8].[ext]',
        },
  　　 },
    ]
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.RUNNING_MODE': JSON.stringify(env.RUNNING_MODE),
      'process.env.IFRAME_PORTAL_HASH': Date.now(),
    }),
    new webpack.BannerPlugin({
      banner: `Licensed Materials - Property of ${site}\n(C) Copyright 2017~2018 ${site}. All Rights Reserved.\nhttp://${site}`,
      exclude: /\.svg$/,
    })
  ]
}

if (analyze) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config