/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.tsx page
 *
 * @author zhangtao
 * @date Tuesday June 12th 2018
 */
import * as React from 'react'
// import { connect } from 'react-redux'
import { Button, Icon, Pagination, Card, Table, Progress, Modal } from 'antd'
// import { Link } from 'react-router'
import './style/ApplyLimit.less'
// import Notification from '../../../../src/components/Notification'
import Title from '../../../../src/components/Title'
import CommonSearchInput from '../../../../src/components/CommonSearchInput'
import QueueAnim from 'rc-queue-anim'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import './style/ApplyLimit.less'
import Operation from './Operation'
import ApplyForm from './ApplyForm'

// 表格头定义
const columns = () => {
  const columns = [{
    title: '申请项目',
    dataIndex: 'item',
    key: 'item',
    filters: [
      { text: '个人项目', value: '个人项目' },
      { text: '共享项目', value: '共享项目' },
    ],
    // filterMultiple: false,
    onFilter: (value, record) => record.title.indexOf(value) === 0, // 针对哪个字段进行筛选
  }, {
    title: '申请时间',
    key: 'time',
    dataIndex: 'time',
  }, {
    title: '审批状态',
    dataIndex: 'condition',
    key: 'condition',
    filters: [
      { text: '全部同意', value: '全部同意' },
      { text: '部分同意', value: '部分同意' },
      { text: '部分拒绝', value: '部分拒绝' },
      { text: '待审批', value: '待审批' },
    ],
    // filterMultiple: false,
    onFilter: (value, record) => record.title.indexOf(value) === 0, // 针对哪个字段进行筛选
    render: () =>
      <div>
        全部同意
        <span className="ProgressWrap">
          <Progress type="circle" strokeWidth={20} percent={30} width={20} format={() => ' '}
            status="exception"/>
        </span>
      </div>,
  }, {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 250,
    render: (text, record) => {
      const { condition } = record
      let newCondition = ''
      newCondition = condition === '待审批' ? 'notCondition' : 'condition'
      return (
        <Operation condition={newCondition} record={record}/>
      )
    },
  }]
  return columns
}
// 表格假数据
const dataSource = [{
  key: 1,
  item: 'hah123',
  time: '2017-09-08 03:30:41',
  condition: '全部同意',
}, {
  key: 2,
  item: 'hah123',
  time: '2017-09-08 03:30:41',
  condition: '全部同意',
}, {
  key: 3,
  item: 'hah123',
  time: '2017-09-08 03:30:41',
  condition: '待审批',
}]
// 页脚设置
const pageOption = {
  simple: true,
  // total: !isEmpty(projectList) && projectList['listMeta'].total || 0,
  // defaultPageSize: 10,
  // defaultCurrent: 1,
  // onChange: (n) => this.loadProjectList(n),
  // current: currentPage,
}
class ApplyLimit extends React.Component {
  state = {
    filteredInfo: null,
    applayVisable: false, // 申请配额弹窗标志位
  }
  setApplayVisable = () => {
    const { applayVisable } = this.state
    this.setState({ applayVisable: !applayVisable })
  }
  render() {
    let { filteredInfo, applayVisable } = this.state
    filteredInfo = filteredInfo || {}
    return (
      <TenxPage inner className="page">
        <QueueAnim>
          <Title title="配额申请" />
          <div className="layout-content-btns" key="top">
            <Button type="primary" onClick={this.setApplayVisable}>
              <Icon type="file-text" />申请配额
            </Button>
            <CommonSearchInput placeholder="按项目名称搜索" size="large" />
            <Pagination {...pageOption}/>
          </div>
          <div className="content" key="content">
            <Card>
              <Table
                loading={false}
                pagination={false}
                columns={columns({ filteredInfo })}
                dataSource={dataSource}
                onChange={this.projectFilter}
              />
            </Card>
          </div>
        </QueueAnim>
        <ApplyForm applayVisable={applayVisable} setApplayVisable={this.setApplayVisable}/>
      </TenxPage>
    )
  }
}

export default ApplyLimit
