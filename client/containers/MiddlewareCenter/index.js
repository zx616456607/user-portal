/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Middleware center
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import SecondSider from '../../../src/components/SecondSider'
import './style/index.less'

const menuList = [
  {
    url: '/middleware_center/app',
    name: 'apps',
  },
  {
    url: '/middleware_center/deploy',
    name: 'deployManage',
  },
]

@connect()
class MiddlewareCenter extends React.PureComponent {
  state = {
    containerSiderStyle: 'normal',
  }

  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id="MiddlewareCenter">
        <QueueAnim
          key="middlewareCenter"
          type="left"
        >
          <div
            className={classNames('middlewareMenu CommonSecondMenu', {
              hiddenMenu: this.state.containerSiderStyle !== 'normal',
            })}
            key="middlewareSider"
          >
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div
          className={classNames('middlewareContent CommonSecondContent', {
            hiddenContent: this.state.containerSiderStyle !== 'normal',
          })}
        >
          {children}
        </div>
      </div>
    )
  }
}

export default MiddlewareCenter
