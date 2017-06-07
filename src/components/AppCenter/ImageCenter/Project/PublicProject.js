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
import { Table,  Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import { Link } from 'react-router'
import DataTable from './DataTable'
import { connect } from 'react-redux'
import { loadProjectList } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'


class PublicProject extends Component {
  constructor(props) {
    super()
    this.loadData = this.loadData.bind(this)
  }

  loadData(query) {
    const { loadProjectList } = this.props
    loadProjectList(DEFAULT_REGISTRY, query)
  }

  componentWillMount() {
    this.loadData({
      page_size: 10,
      is_public: 1,
    })
  }

  render() {
    const { harborProjects } = this.props
    const func={
      scope: this,
      loadData: this.loadData
    }
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过 TenxFlow 构建出来的镜像</div>
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Input placeholder="搜索" className="search" size="large" />
                <i className="fa fa-search"></i>
                <span className="totalPage">共计：{harborProjects.list && harborProjects.list.length || 0} 条</span>
              </div>
              <DataTable dataSource={harborProjects} func={func}/>
            </Card>

          </div>
        </QueueAnim>
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  const { harbor } = state
  let harborProjects = harbor.projects && harbor.projects[DEFAULT_REGISTRY] || {}
  return {
    harborProjects,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
})(PublicProject)
