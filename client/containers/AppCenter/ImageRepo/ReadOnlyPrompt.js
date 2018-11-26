/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* ReadOnly Mode for ImageRepo
 *
 * v0.1 - 2018-11-26
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'

const ReadOnlyPrompt = ({ toggleVisible, visible }) => (
  <div className="readOnlyPrompt">
    {
      visible ?
        <div className="readOnlyCont">
          该仓库已被设置为只读模式，在此模式下，不能删除镜像、标签、推送镜像及发布镜像商店
          <div
            className="candlePrompt"
            onClick={() => toggleVisible(false)}
          >
            x
          </div>
        </div>
        : null
    }
  </div>
)

export default ReadOnlyPrompt
