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
import { loadProjectDetail } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import { camelize } from 'humps'

const TabPane = Tabs.TabPane

class ItemDetail extends Component {
  constructor(props) {
    super()
    this.state = {
      isProject: true, // top project type
      sortedInfo: null,
      filteredInfo: null
    }
  }

  componentWillMount() {
    const { loadProjectDetail, params } = this.props
    loadProjectDetail(DEFAULT_REGISTRY, params.id)
  }

  renderPublic(key) {
    switch (key) {
      case 0:
        return '私有项目'
      case 1:
        return '公开项目'
      default:
        break;
    }
  }

  renderRole(role) {
    switch (role) {
      case 0:
        return '未知'
      case 1:
        return '项目管理员'
      case 2:
        return '开发人员'
      case 3:
        return '访客'
      default:
        break;
    }
  }

  render() {
    const { projectDetail, params } = this.props
    const { name, } = projectDetail
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出来的镜像</div>
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
                <span className="margin">|</span>
                <span className="role">
                  <span className="role-key">
                    我的角色&nbsp;
                  </span>
                  {this.renderRole(projectDetail[camelize('current_user_role_id')])}
                </span>
              </div>
              <br />
              <Tabs defaultActiveKey="repo">
                <TabPane tab="镜像仓库" key="repo"><CodeRepo {...this.props} /></TabPane>
                <TabPane tab="权限管理" key="role"><Management /></TabPane>
                <TabPane tab="审计日志" key="log"><Logs params={this.props.params}/></TabPane>
                <TabPane tab="镜像同步" key="sync"><ImageUpdate /></TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor } = state
  return {
    projectDetail: harbor.detail.data || {},
  }
}

export default connect(mapStateToProps, {
  loadProjectDetail,
})(ItemDetail)
