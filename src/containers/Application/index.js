/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppContainer component
 *
 * v0.1 - 2016-09-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/Application.less'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
let menuList = []

const menuList_standard  = [
  {
    url: '/app_manage',
    name: 'apps'
  },
  {
    url: '/app_manage/service',
    name: 'services'
  },
  {
    url: '/app_manage/container',
    name: 'containers'
  },
  {
    url: '/app_manage/storage',
    name: 'storage'
  },
  {
    url: '/app_manage/configs',
    name: 'configs'
  }
]

const menuList_enterprise = [
  {
    url: '/app_manage',
    name: 'apps'
  },
  {
    url: '/app_manage/service',
    name: 'services'
  },
  {
    url: '/app_manage/container',
    name: 'containers'
  },
  // {
  //   url: '/app_manage/storage',
  //   name: 'storage'
  // },
  // {
  //   url: '/app_manage/snapshot',
  //   name: 'snapshot'
  // },
  {
    url: '/app_manage/configs',
    name: 'configs'
  },
  // {
  //   url: '/app_manage/discover',
  //   name: 'discover'
  // },
  // {
  //   url: '/app_manage/security_group',
  //   name: 'securityGroup'
  // },
  // {
  //   url: '/app_manage/load_balance',
  //   name: 'loadBalance'
  // },
  {
    url: '/app_manage/auto_scale',
    name: 'autoScale'
  },
]
const vmWrapMenu = [
  {
    url: '/app_manage/vm_wrap',
    name: 'vmWrap'
  },
  {
    url: '/app_manage/vm_list',
    name: 'vmList'
  },
]

class Application extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  render() {
    const { children, loginUser } = this.props
    const scope = this
    let menuList = menuList_standard
    if(mode != standard){
      menuList = menuList_enterprise
      if (loginUser.vmWrapConfig.enabled) {
        menuList = menuList.concat(vmWrapMenu)
      }
    }
    return (
      <div id="Application">
        <div className="appContent CommonSecondContent" >
          {children}
        </div>
      </div>
    )
  }
}

Application.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}

function mapStateToProps(state) {
  return {
    loginUser: state.entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  //
})(Application)
