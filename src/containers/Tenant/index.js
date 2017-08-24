/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Tenant managemant
 *
 * v0.1 - 2017-06-01
 * @author zhangpc
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import './style/index.less'

const menuList = [
  {
    url: '/tenant_manage',
    name: '概览'
  },{
    url: '/tenant_manage/user',
    name: '成员管理'
  },{
    url: '/tenant_manage/team',
    name: '团队管理'
  },{
    url: '/tenant_manage/project_manage',
    name: '项目管理'
  },{
    url: '/tenant_manage/rolemanagement',
    name: '角色管理'
  },{
    url: '/tenant_manage/allpermissions',
    name: '所有权限'
  },{
    url: '/tenant_manage/ldap',
    name: '集成企业目录'
  }
]

export default class Tenant extends Component {
  constructor(props) {
    super(props)
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  render() {
    const { children } = this.props
    const scope = this
    const { containerSiderStyle } = this.state
    const tenantMenuClass = classNames({
      'tenantMenu': true,
      'CommonSecondMenu': true,
      'hiddenMenu': !containerSiderStyle === 'normal',
    })
    const tenantContentClass = classNames({
      'tenantContent': true,
      'CommonSecondContent': true,
      'hiddenContent': !containerSiderStyle === 'normal',
    })
    return (
      <div id="TenantManage">
        <QueueAnim
          className="appSiderAnimate"
          key="appSiderAnimate"
          type="left"
          >
          <div className={ tenantMenuClass } key="TenantSider">
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ tenantContentClass } >
          {children}
        </div>
      </div>
    )
  }
}
