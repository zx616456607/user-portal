/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.txs page
 *
 * @author zhangtao
 * @date Tuesday June 12th 2018
 */
import * as React from 'react'
// import { connect } from 'react-redux'
import { Card, Table, Button, Select, DatePicker, Tooltip, Modal, Alert, Pagination } from 'antd'
import './style/index.less'
// import Notification from '../../../../src/components/Notification'
import Title from '../../../../src/components/Title'
import CommonSearchInput from '../../../../src/components/CommonSearchInput'
import ApplayDetail from '../ApplyLimit/Operation/ApplayDetail'

import QueueAnim from 'rc-queue-anim'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import TenxIcon from '@tenx-ui/icon'

const Option = Select.Option

// 格式化options
const optionFormat = optionArr => {
  return optionArr.map(option => {
    return <Option value={option}>{option}</Option>
  })
}

// 根据审批状态返回需要显示的信息及icon状态
const iconStatusFormat = approvalStatus => {
  let iconStatus = { text: '', status: '' }
  switch (approvalStatus) {
    case 'ok': {
      iconStatus.text = '全部同意'
      iconStatus.status = 'ok'
      break
    }
    case 'partOk': {
      iconStatus.text = '部分同意'
      iconStatus.status = 'partOk'
      break
    }
    case 'no': {
      iconStatus.text = '全部拒绝'
      iconStatus.status = 'no'
      break
    }
    case 'wait': {
      iconStatus.text = '待审批...'
      iconStatus.status = 'wait'
      break
    }
    default: {
      iconStatus = { text: '', status: '' }
    }
  }
  return iconStatus
}
// 表格头部
const getColums = ({ sortedInfo, toggleDetailForm, toggleCancelApproval, getDetailRecord }) => {
  const colums = [{
    title: '项目名称',
    dataIndex: 'item',
    key: 'item',
  }, {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
    sorter: (a, b) => a.age - b.age,
    sortOrder: sortedInfo.columKey = 'applyTime' && sortedInfo.order,
  }, {
    title: '审批状态',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    render: (text, record) => {
      const { approvalStatus } = record
      const iconStatus = iconStatusFormat(approvalStatus)
      return (
        <div>
          <span className="iconallAgree">
            <span className="iconText">{iconStatus.text}</span>
            <span className="icon" ></span>
          </span>
          <span className="iconPartAgree">
            <span className="iconText">{iconStatus.text}</span>
            <span className="icon" ></span>
          </span>
          <span className="iconWaitApproval">
            <span className="iconText">{iconStatus.text}</span>
            <span className="icon" ></span>
          </span>
        </div>
      )
    },
  }, {
    title: '查看详情',
    dataIndex: 'detail',
    key: 'detail',
    render: (text, record) => {
      const toggleDetail = record => {
        getDetailRecord(record)
        toggleDetailForm()
      }
      return (
        <TenxIcon type="circle-arrow-right-o" className="livingIcon"
          onClick={toggleDetail.bind(null, record)} />
      )
    },
  }, {
    title: '审批者',
    dataIndex: 'approvaler',
    key: 'approvaler',
    render: (text, record) => <span>
      {record.approvaler}
      <Tooltip title="撤销审批">
        <TenxIcon type="fat-arrow-left" className="livingIcon cancelApprovalIcon" onClick={toggleCancelApproval}/>
      </Tooltip>
    </span>,
  }]
  return colums
}
// 表格假数据
const data = [{
  key: '1',
  item: 'hao123',
  applyTime: '2014-09-13',
  approvalStatus: 'ok',
  detail: 'detail',
  approvaler: 'jingxiu',
}, {
  key: '2',
  item: 'huai123',
  applyTime: '2014-09-30',
  approvalStatus: 'wait',
  detail: 'detail',
  approvaler: 'jingxiu',
}]
// 表格页脚设置
const pageOption = {
  simple: true,
  // total: !isEmpty(projectList) && projectList['listMeta'].total || 0,
  // defaultPageSize: 10,
  // defaultCurrent: 1,
  // onChange: (n) => this.loadProjectList(n),
  // current: currentPage,
}
class ApprovalLimit extends React.Component {
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
    sortedInfo: null,
    approvalVisible: false, // 撤销审批显示影藏标志位
    approvalLoading: false, // 撤销审批loading
    detailVisible: false, // 详情页显示影藏标志位
  }
  record = null
  disabledStartDate = startValue => {
    if (!startValue || !this.state.endValue) {
      return false
    }
    return startValue.getTime() >= this.state.endValue.getTime()
  }
  disabledEndDate = endValue => {
    if (!endValue || !this.state.startValue) {
      return false
    }
    return endValue.getTime() <= this.state.startValue.getTime()
  }
  onChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }
  onStartChange = value => {
    this.onChange('startValue', value)
  }
  onEndChange = value => {
    this.onChange('endValue', value)
  }
  handleStartToggle = ({ open }) => {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }
  handleEndToggle = ({ open }) => {
    this.setState({ endOpen: open })
  }
  toggleCancelApproval = () => {
    const { approvalVisible } = this.state
    this.setState({
      approvalVisible: !approvalVisible,
    })
  }
  CancelApproval = () => {
    const { approvalVisible } = this.state
    this.setState({
      approvalLoading: true,
    })
    setTimeout(() => {
      this.setState({
        approvalLoading: false,
        approvalVisible: !approvalVisible,
      })
    }, 2000)
  }
  toggleDetailForm = () => {
    const { detailVisible } = this.state
    this.setState({
      detailVisible: !detailVisible,
    })
  }
  getDetailRecord = record => {
    this.record = record
  }
  render() {
    const { startValue, endValue, endOpen, approvalVisible, approvalLoading,
      detailVisible } = this.state
    const sortedInfo = this.state.sortedInfo || {}
    const toggleCancelApproval = this.toggleCancelApproval
    const toggleDetailForm = this.toggleDetailForm
    const getDetailRecord = this.getDetailRecord
    return (
      <TenxPage inner className="ApprovalLimit">
        <QueueAnim>
          <Title title="配额审批" />
          <div className="layout-content-btns header" key="header">
            <Select placeholder="项目类型" style={{ width: 100 }}>
              {optionFormat([ '类型一', '类型二' ])}
            </Select>
            <Select placeholder="审批状态" style={{ width: 100 }}>
              {optionFormat([ '审批状态1', '审批状态2' ])}
            </Select>
            <Select placeholder="审批者" style={{ width: 100 }}>
              {optionFormat([ '审批者一', '审批者二' ])}
            </Select>
            <DatePicker
              disabledDate={this.disabledStartDate}
              value={startValue}
              placeholder="选择开始日期"
              onChange={this.onStartChange}
              toggleOpen={this.handleStartToggle}
            />
            <DatePicker
              disabledDate={this.disabledEndDate}
              value={endValue}
              placeholder="选择结束日期"
              onChange={this.onEndChange}
              open={endOpen}
              toggleOpen={this.handleEndToggle}
            />
            <Button type="primary">立即查询</Button>
            <Button >清空所有记录</Button>
          </div>
          <div className="layout-content-btns header" key="secondHeader">
            <CommonSearchInput placeholder="按项目名称搜索" size="large" />
            <Button >刷新</Button>
            <Pagination {...pageOption}/>
            <span className="ApprovalMessage"><span>待审批:</span><span>7个</span></span>
          </div>
          <div className="content" key="content">
            <Card>
              <Table
                columns={getColums({ sortedInfo, toggleDetailForm,
                  toggleCancelApproval, getDetailRecord })}
                dataSource={data} pagination={false}/>
            </Card>
          </div>
        </QueueAnim>
        <Modal
          visible = {approvalVisible}
          title="撤销审批"
          onCancel={ this.toggleCancelApproval }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={this.toggleCancelApproval}>
              取消
            </Button>,
            <Button key="submit" type="primary" size="large" loading={approvalLoading}
              onClick={this.CancelApproval}>
              确 定
            </Button>,
          ]}
        >
          <Alert message="撤销该申请后, 该申请将不会发送给系统管理员, 确定撤销此次申请?"
            type="warning" showIcon />
        </Modal>
        {
          this.record !== null && <ApplayDetail title="资源配额审批详情" visible={detailVisible} toggleVisable={this.toggleDetailForm}
            record={this.record}/>
        }

      </TenxPage>
    )
  }
}

export default ApprovalLimit
