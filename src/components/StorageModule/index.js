/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Storage Home component
 *
 * v0.1 - 2017-9-8
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import Title from '../Title'
import ResourceBanner from '../../components/TenantManage/ResourceBanner/index'
import { injectIntl, FormattedMessage } from 'react-intl'
import StorageIntl from './StorageIntl'

const tabs = [
  {
    text: <FormattedMessage {...StorageIntl.exclusiveStorage}/>,
    key: '/app_manage/storage/rbd'
  }, {
    text: <FormattedMessage {...StorageIntl.SharedStorage}/>,
    key: '/app_manage/storage/shared'
  }, {
    text: <FormattedMessage {...StorageIntl.localStorage}/>,
    key: '/app_manage/storage/host'
  },
]

class StorageHome extends Component {
  render() {
    const { children, location,intl } = this.props
    const { pathname } = location
    return(
      <QueueAnim className='storage_home'>
        <Title title={intl.formatMessage(StorageIntl.storage)}/>
        <div id='storage_home' key="storage_home">
          <ResourceBanner resourceType='volume'/>
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

export default injectIntl(StorageHome, {withRef: true})