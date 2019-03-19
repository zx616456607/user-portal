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
import QueueAnim from 'rc-queue-anim'
import './style/AppCenter.less'
import { ROLE_USER, ROLE_SYS_ADMIN, ROLE_BASE_ADMIN } from '../../../constants'

const menuList = [
  {
   url: '/app_center/template',
   name: 'appTemplate'
  },
  {
    url: '/app_center/projects',
    name: 'imageProjects'
  },
  // {
  //   url: '/app_center/image_store',
  //   name: '应用商店'
  // },
  {
    url: '/app_center/wrap_manage',
    name: 'wrapManage'
  },
  {
    url: '/app_center/stack_center',
    name: 'stackCenter'
  },
  {
    url: '/app_center/wrap_store',
    name: 'wrapStore'
  }
]
const wrapCheck = {
  url: '/app_center/wrap_check',
  name: 'wrapCheck'
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
    if (role === ROLE_SYS_ADMIN || role === ROLE_BASE_ADMIN) {
      routerList = admin_menuList
    }
    return (
      <div id='AppCenter'>
        <div className="imageContent CommonSecondContent" >
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
