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
import QueueAnim from 'rc-queue-anim'
import './style/Project.less'
import { Link, browserHistory } from 'react-router'
import Logs from './ImageItem/Logs'
import Management from './ImageItem/Management'
import CodeRepo from './ImageItem/CodeRepo'
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

  render() {
    console.log(this.props.params)

    const { params } = this.props
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出来的镜像</div>
        <QueueAnim>
          <div key="Item">
            <Card>
              <div className="topNav">
                <span className="back" onClick={() => browserHistory.goBack()}><span className="backjia"></span><span className="btn-back">返回</span></span>
                <span className="itemName">{params.name}</span>
                私有项目 <span className="margin">|</span> <span className="role"><span className="role-key">我的角色：</span>项目管理员</span>
              </div>
              <br />
              <Tabs defaultActiveKey="repo">
                <TabPane tab="镜像仓库" key="repo"><CodeRepo /></TabPane>
                <TabPane tab="权限管理" key="role"><Management /></TabPane>
                <TabPane tab="审计日志" key="log"><Logs /></TabPane>
                <TabPane tab="镜像同步" key="sync">镜像同步内容</TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

export default ItemDetail