/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/AppCenter.less'

const menuList = [
  {
    url: '/app_center/projects',
    name: '镜像仓库'
  },
  {
    url: '/app_center/image_store',
    name: '应用商店'
  },
  {
    url: '/app_center/stack_center',
    name: '编排文件'
  },
  {
    url: '/app_center/wrap_manage',
    name: '应用包管理'
  }
]


export default class ImageCenter extends Component {
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
      <div id='AppCenter'>
        <QueueAnim
          className='ImageCenterSiderAnimate'
          key='ImageCenterSiderAnimate'
          type='left'
          >
          <div key="menu-appcenter" className={ this.state.containerSiderStyle == 'normal' ?  'imageMenu CommonSecondMenu' : 'hiddenMenu imageMenu CommonSecondMenu'} key='imageSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'imageContent CommonSecondContent' : 'hiddenContent imageContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

ImageCenter.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}