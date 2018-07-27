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
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/Application.less'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
let menuList = []

const menuList_standard  = [
  {
    url: '/app_manage',
    name: '应用'
  },
  {
    url: '/app_manage/service',
    name: '服务'
  },
  {
    url: '/app_manage/container',
    name: '容器'
  },
  {
    url: '/app_manage/storage',
    name: '存储'
  },
  {
    url: '/app_manage/configs',
    name: '服务配置'
  }
]

const menuList_enterprise = [
  {
    url: '/app_manage',
    name: '应用'
  },
  {
    url: '/app_manage/service',
    name: '服务'
  },
  {
    url: '/app_manage/container',
    name: '容器'
  },
  {
    url: '/app_manage/storage',
    name: '存储'
  },
  {
    url: '/app_manage/snapshot',
    name: '独享存储快照'
  },
  {
    url: '/app_manage/configs',
    name: '服务配置'
  },
  {
    url: '/app_manage/discover',
    name: '服务发现'
  },
  {
    url: '/app_manage/security_group',
    name: '安全组'
  },
  {
    url: '/app_manage/load_balance',
    name: '应用负载均衡'
  },
  {
    url: '/app_manage/auto_scale',
    name: '自动伸缩策略'
  },
]
const vmWrapMenu = [
  {
    url: '/app_manage/vm_wrap',
    name: '传统应用'
  },
  {
    url: '/app_manage/vm_list',
    name: '传统应用环境'
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
        <QueueAnim
          className="appSiderAnimate"
          key="appSiderAnimate"
          type="left"
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'appMenu CommonSecondMenu' : 'hiddenMenu appMenu CommonSecondMenu'} key="appSider">
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'appContent CommonSecondContent' : 'hiddenContent appContent CommonSecondContent' } >
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
