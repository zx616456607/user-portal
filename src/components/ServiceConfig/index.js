/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * service config
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import Title from '../Title'
import './style/index.less'

const tabs = [
  {
    text: '普通配置',
    key: '/app_manage/configs'
  },
  {
    text: '加密配置',
    key: '/app_manage/configs/secrets'
  },
]

export default class ServiceConfig extends React.Component {
  render() {
    const { children, location } = this.props
    const { pathname } = location
    return (
      <QueueAnim>
        <Title title="服务配置" />
        <div className="config-home" key="config-home">
          <div className='tabs_header_style'>
            {
              tabs.map(tab => {
                const { text, key } = tab
                const active = key === pathname
                const tabClassNames = classNames('tabs_item_style', {
                  'tabs_item_selected_style': active,
                })
                return (
                  <div
                    className={tabClassNames}
                    key={key}
                    onClick={() => !active && browserHistory.push(key)}
                  >
                    {text}
                  </div>
                )
              })
            }
          </div>
          <div className="children_box">
            { children }
          </div>
        </div>
      </QueueAnim>
    )
  }
}
