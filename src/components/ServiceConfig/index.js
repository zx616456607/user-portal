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
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import Title from '../Title'
import './style/index.less'
import indexIntl from './intl/indexIntl.js'

class ServiceConfig extends React.Component {
  render() {
    const { children, location, intl } = this.props
    const { formatMessage } = intl
    const { pathname } = location
    const tabs = [{
      text: formatMessage(indexIntl.tabName1),
      key: '/app_manage/configs'
    }, {
      text: formatMessage(indexIntl.tabName2),
      key: '/app_manage/configs/secrets'
    }]
    return <QueueAnim>
        <Title title={formatMessage(indexIntl.serviceConfig)} />
        <div className="config-home" key="config-home">
          <div className="tabs_header_style">
            {tabs.map(tab => {
            const { text, key } = tab
            const active = key === pathname
            const tabClassNames = classNames('tabs_item_style', {
              'tabs_item_selected_style': active
            })
            return <div className={tabClassNames} key={key} onClick={() => !active && browserHistory.push(key)}>
                    {text}
                  </div>
          })}
          </div>
          <div className="children_box">
            {children}
          </div>
        </div>
      </QueueAnim>
  }
}
export default injectIntl(ServiceConfig, {
  withRef: true
})