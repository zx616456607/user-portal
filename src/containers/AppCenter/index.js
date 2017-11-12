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
import { connect } from 'react-redux'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import './style/AppCenter.less'
import { ROLE_USER, ROLE_SYS_ADMIN } from '../../../constants'

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
  },
  {
    url: '/app_center/wrap_store',
    name: '应用包商店'
  }
]
const wrapCheck = {
  url: '/app_center/wrap_check',
  name: '发布审核'
}
const admin_menuList = menuList.concat(wrapCheck)

class ImageCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children, role } = this.props
    const scope = this
    let routerList = menuList
    if (role === ROLE_SYS_ADMIN) {
      routerList = admin_menuList
    }
    return (
      <div id='AppCenter'>
        <QueueAnim
          className='ImageCenterSiderAnimate'
          key='ImageCenterSiderAnimate'
          type='left'
          >
          <div className={ this.state.containerSiderStyle == 'normal' ?  'imageMenu CommonSecondMenu' : 'hiddenMenu imageMenu CommonSecondMenu'} key='imageSider'>
            <SecondSider menuList={routerList} scope={scope} />
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

function mapStateToProp(state) {
  let role = ROLE_USER
  const {entities} = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role
  }
  return {
    role
  }
}

export default connect(mapStateToProp, {
})(ImageCenter)