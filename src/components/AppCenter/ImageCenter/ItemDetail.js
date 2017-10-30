/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Tabs, Table, Icon, Button, Card, Input } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/Project.less'
import { Link, browserHistory } from 'react-router'
import Logs from './ImageItem/Logs'
import Management from './ImageItem/Management'
import CodeRepo from './ImageItem/CodeRepo'
import ImageUpdate from './ImageItem/ImageUpdate'
import { loadProjectDetail, loadProjectMembers } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import { camelize } from 'humps'
import NotificationHandler from '../../../components/Notification'

const notification = new NotificationHandler()
const TabPane = Tabs.TabPane

class ItemDetail extends Component {
  constructor(props) {
    super()
    this.state = {
      isProject: true, // top project type
      sortedInfo: null,
      filteredInfo: null
    }
    this.currentUser = {}
  }

  componentWillMount() {
    const { loadProjectDetail, loadProjectMembers, params } = this.props
    loadProjectDetail(DEFAULT_REGISTRY, params.id)
    loadProjectMembers(DEFAULT_REGISTRY,  params.id, null, {
      failed: {
        func: err => {
          const { statusCode } = err
          this.currentUser = {}
          if (statusCode === 403) {
            return
          }
          notification.error(`获取成员失败`)
        }
      }
    })
  }

  renderPublic(key) {
    switch (key) {
      case 0:
        return '私有仓库组'
      case 1:
        return '公开仓库组'
      default:
        break;
    }
  }

  renderRole(role) {
    switch (role) {
      case 0:
        return '未知'
      case 1:
        return '管理员'
      case 2:
        return '开发人员'
      case 3:
        return '访客'
      default:
        break;
    }
  }

  render() {
    const { projectDetail, params, projectMembers, loginUser, registry } = this.props
    const { name } = projectDetail
    const members = projectMembers.list || []
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    let currentMember = {}
    members.every(member => {
      if (member.username === loginUser.userName) {
        currentMember = member
        return false
      }
      return true
    })
    if (isAdmin) {
      this.currentUser = loginUser.harbor
    } else {
      this.currentUser = currentMember
    }
    const currentUserRole = currentMember[camelize('role_id')]
    console.log('currentUserRole', currentUserRole)
    const tabPanels = [
      <TabPane tab="镜像仓库" key="repo">
        <CodeRepo registry={DEFAULT_REGISTRY} {...this.props} />
      </TabPane>,
    ]
    if (currentUserRole > 0 || isAdmin) {
      tabPanels.push(<TabPane tab="审计日志" key="log"><Logs params={this.props.params}/></TabPane>)
      tabPanels.push(
        <TabPane tab="权限管理" key="role">
          <Management
            {...params}
            registry={DEFAULT_REGISTRY}
            members={projectMembers}
            currentUser={this.currentUser}
          />
        </TabPane>
      )
    }
    if (isAdmin) {
      tabPanels.push(<TabPane tab="镜像同步" key="sync"><ImageUpdate registry={registry} /></TabPane>)
    }
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="Item">
            <Card>
              <div className="topNav">
                <span className="back" onClick={() => browserHistory.goBack()}>
                  <span className="backjia"></span>
                  <span className="btn-back">返回</span>
                </span>
                <span className="itemName">{name || ''}</span>
                <span>{this.renderPublic(projectDetail.public)} </span>
                {
                  (currentUserRole > 0) && (
                    <span className="margin">|</span>,
                    <span className="role">
                      <span className="role-key">
                        我的角色&nbsp;
                      </span>
                      {this.renderRole(currentUserRole)}
                    </span>
                  )
                }
              </div>
              <br />
              <Tabs defaultActiveKey="repo">
                { tabPanels }
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor, entities } = state
  return {
    projectDetail: harbor.detail.data || {},
    projectMembers: harbor.members || {},
    loginUser: entities.loginUser.info,
    registry: DEFAULT_REGISTRY
  }
}

export default connect(mapStateToProps, {
  loadProjectDetail,
  loadProjectMembers,
})(ItemDetail)
