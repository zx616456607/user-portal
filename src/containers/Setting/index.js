/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import './style/setting.less'

const menuList = [
  {
    url: '/setting/version',
    name: '平台版本'
  },
  {
    url: '/setting/license',
    name: '授权管理'
  },
  {
    url: '/setting/API',
    name: '开放 API'
  },
]

export default class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id="Setting">
        <QueueAnim
          className="settingAnimate"
          key="settingAnimate"
          type="left"
        >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'settingMenu CommonSecondMenu' : 'hiddenMenu settingMenu CommonSecondMenu'} key='settingSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'settingContent CommonSecondContent' : 'hiddenContent settingContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

Setting.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}