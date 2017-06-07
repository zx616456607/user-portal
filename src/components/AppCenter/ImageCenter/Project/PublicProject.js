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

class PublicProject extends Component {
  constructor(props) {
    super()
  }
  render() {
    const dataSource = [
      {
        name: 'demo-1',
        type: 1,
        role: '1',
        ropo: '90',
        createTime: '2017-4-5'
      },
      {
        name: 'demo-2',
        type: 2,
        role: '2',
        ropo: '30',
        createTime: '2017-8-5'
      },
      {
        name: 'demo-33',
        type: 1,
        role: '3',
        ropo: '50',
        createTime: '2017-4-0'
      }
    ]
    const func={
      scope: this,
    }
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出来的镜像</div>
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Input placeholder="搜索" className="search" size="large" />
                <i className="fa fa-search"></i>
                <span className="totalPage">共计：{dataSource.length} 条</span>
              </div>
              <DataTable dataSource={dataSource}  func={func}/>
            </Card>

          </div>
        </QueueAnim>
      </div>
    )
  }
}

export default PublicProject