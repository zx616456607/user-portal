/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * App webpack postcss config
 *
 * v0.1 - 2017-12-14
 * @author Zhangpc
 */

const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    autoprefixer({
      browsers: [
        'last 2 versions',
        'Firefox ESR',
        '> 1%',
        'ie >= 10',
        'iOS >= 8',
        'Android >= 4'
      ],
    }),
  ],
}
