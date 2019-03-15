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
import QueueAnim from 'rc-queue-anim'
import './style/setting.less'
import { ROLE_USER, ROLE_SYS_ADMIN, ROLE_BASE_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../constants'
import { connect } from 'react-redux'

const menuList_platform = [
  {
    url: '/setting/version',
    name: 'version'
  },
  {
    url: '/setting/license',
    name: 'license'
  },
  {
    url: '/setting/API',
    name: 'openApi'
  },
  {
    url: '/setting/advancedSetting',
    name: 'advancedSetting'
  },{
    url:'/setting/personalized',
    name:'personalized'
  }
]
const menuList_base = [
  {
    url: '/setting/version',
    name: 'version'
  },

  {
    url: '/setting/API',
    name: 'openApi'
  },
  {
    url: '/setting/advancedSetting',
    name: 'advancedSetting'
  },
  {
    url:'/setting/cleaningTool',
    name:'cleaningTool'
  }
]
const menuList_sysAdmin = [
  {
    url: '/setting/version',
    name: 'version'
  },
  {
    url: '/setting/license',
    name: 'license'
  },
  {
    url: '/setting/API',
    name: 'openApi'
  },{
    url: '/setting/advancedSetting',
    name: 'advancedSetting'
  },{
    url:'/setting/personalized',
    name:'personalized'
  },{
    url:'/setting/cleaningTool',
    name:'cleaningTool'
  }
]
const menuList_normal = [
  {
    url: '/setting/version',
    name: 'version'
  },
  {
    url: '/setting/API',
    name: 'openApi'
  }
]

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children, role } = this.props
    const scope = this
    const menuList = () => {
      switch (role) {
        case ROLE_USER:
          return menuList_normal
        case ROLE_BASE_ADMIN:
          return menuList_base
        case ROLE_PLATFORM_ADMIN:
          return menuList_platform
        case ROLE_SYS_ADMIN:
          return menuList_sysAdmin
      }
    }

    return (
      <div id="Setting">
        <div className="settingContent CommonSecondContent" >
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

function mapStateToProp(state) {
  let role = ROLE_USER
  const { entities } = state
  if (entities && entities.loginUser && entities.loginUser.info.role) {
    role = entities.loginUser.info.role
  }
  return {
    role
  }
}

export default connect(mapStateToProp, {
})(Setting)
