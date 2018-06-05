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
import { connect } from 'react-redux'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import cloneDeep from 'lodash/cloneDeep'
import { ROLE_USER, ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../constants'
import './style/index.less'

const menuList_normal = [
{
    url: '/tenant_manage/team',
    name: '团队管理'
  },{
    url: '/tenant_manage/project_manage',
    name: '项目管理'
  },
  {
    url: '/tenant_manage/allpermissions',
    name: '项目权限'
  },
]
const menuList_base = [
{
    url: '/tenant_manage/team',
    name: '团队管理'
  },{
    url: '/tenant_manage/project_manage',
    name: '项目管理'
  },
  {
    url: '/tenant_manage/allpermissions',
    name: '项目权限'
  },
]
const menuList_sys = [
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
  },
  // {
  //   url: '/tenant_manage/rolemanagement',
  //   name: '项目角色'
  // },
  {
    url: '/tenant_manage/allpermissions',
    name: '项目权限'
  },
  {
    url: '/tenant_manage/cluster_authorization',
    name: '集群授权审批'
  },
  {
    url: '/tenant_manage/ldap',
    name: '集成企业目录'
  },
]
const menuList_platform = menuList_sys

class Tenant extends Component {
  constructor(props) {
    super(props)
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  render() {
    const { children, role } = this.props

    const scope = this

    const renderMenuList = (roleCode) => {
      switch (roleCode){
        case ROLE_USER:
          return menuList_normal
        case  ROLE_BASE_ADMIN:
          return menuList_base
        case ROLE_SYS_ADMIN:
          return menuList_sys
        case ROLE_PLATFORM_ADMIN:
          return menuList_platform
      }
    }

    const { containerSiderStyle } = this.state
    const tenantMenuClass = classNames({
      'tenantMenu': true,
      'CommonSecondMenu': true,
      'hiddenMenu': !(containerSiderStyle === 'normal'),
    })
    const tenantContentClass = classNames({
      'tenantContent': true,
      'CommonSecondContent': true,
      'hiddenContent': !(containerSiderStyle === 'normal'),
    })

    return (
      <div id="TenantManage">
        <QueueAnim
          className="appSiderAnimate"
          key="appSiderAnimate"
          type="left"
          >
          <div className={ tenantMenuClass } key="TenantSider">
            <SecondSider menuList={renderMenuList(role)} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ tenantContentClass } >
          {children}
        </div>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let role = ROLE_USER
  const {entities} = state
  if (entities && entities.loginUser && entities.loginUser.info) {
    role = entities.loginUser.info.role?entities.loginUser.info.role:0
  }

  return {
    role
  }
}

export default connect(mapStateToProp, {
})(Tenant)
