/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 6th 2018
 */
import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import Title from '../../../Title'

// tabs 书写例子
// const tabs = [
//   {
//     text: '独享型存储',
//     key: '/app_manage/storage/rbd'
//   }, {
//     text: '共享型存储',
//     key: '/app_manage/storage/shared'
//   }, {
//     text: '本地存储',
//     key: '/app_manage/storage/host'
//   },
// ]

export default class StorageHome extends Component {
  render() {
    const { children, location, tabs } = this.props
    const { pathname } = location
    return(
      <QueueAnim className='storage_home'>
        <Title title="存储"/>
        <div id='storage_home' key="storage_home">
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
            { children  }
          </div>
        </div>
      </QueueAnim>
    )
  }
}
