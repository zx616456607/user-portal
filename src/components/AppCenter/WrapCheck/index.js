/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Check
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Button, Table, Icon, Card, Pagination } from 'antd'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'

const TabPane = Tabs.TabPane;

class WrapCheckTable extends React.Component {
  constructor(props) {
    super(props)
    this.getWrapStatus = this.getWrapStatus.bind(this)
    this.state = {
      
    }
  }
  getWrapStatus(status) {
    return(
      <span className={classNames({"statusPass": status, 'waitForCheck': !status})}><i/>{status ? '已通过' : '待审核'}</span>
    )
  }
  render() {
    const columns = [{
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: this.getWrapStatus
    }, {
      title: '应用包名称',
      dataIndex: 'appName',
      key: 'appName',
    }, {
      title: '分类名称',
      dataIndex: 'classifyName',
      key: 'classifyName',
    }, {
      title: '发布名称',
      dataIndex: 'releaseName',
      key: 'releaseName',
    }, {
      title: '应用包描述',
      dataIndex: 'description',
      key: 'description',
    }, {
      title: '发布者',
      dataIndex: 'releaseMan',
      key: 'releaseMan'
    }, {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime'
    }, {
      title: '操作',
      key: 'operation',
      render: () => {
        return(
          <div>
            <Button className="passBtn" type="primary">通过</Button>
            <Button type="ghost">拒绝</Button>
          </div>
        )
      }
    }]
    
    const data = []
    for (let i = 0; i < 5; i++) {
      data.push({
        key: i + 1,
        status: i === 1 ? true : false,
        appName: 'appTest',
        classifyName: '机器人学习',
        releaseName: 'release',
        description: '描述',
        releaseMan: 'admin',
        submitTime: '2017-11-09 10:50:00'
      })
    }
    return (
      <div className="wrapCheckTableBox">
        <Table
          className="wrapCheckTable"
          dataSource={data}
          columns={columns}
          pagination={{simple: true}}
        />
      </div>
    )
  }
}

class WrapCheck extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  render() {
    return (
      <QueueAnim>
        <div key="wrapCheck" className="wrapCheck">
          <div className="wrapCheckHead">
            <Button className="refreshBtn" type="primary" size="large">
              <i className='fa fa-refresh'/> 刷新
            </Button>
            <CommonSearchInput
              size="large"
              placeholder="请输入应用宝搜索"
              style={{ width: 200 }}
            />
            <span className="total verticalCenter">共 3 条</span>
          </div>
          <WrapCheckTable/>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(WrapCheck)