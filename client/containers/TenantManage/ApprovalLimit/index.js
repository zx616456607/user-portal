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
import { Card, Table, Button, Select, DatePicker, Modal, Alert, Pagination } from 'antd'
import './style/index.less'
// import Notification from '../../../../src/components/Notification'
import Title from '../../../../src/components/Title'
import CommonSearchInput from '../../../../src/components/CommonSearchInput'
import ApplayDetail from '../ApplyLimit/Operation/ApplayDetail'

import QueueAnim from 'rc-queue-anim'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import TenxIcon from '@tenx-ui/icon'
import { connect } from 'react-redux'
import { checkApplyRecord } from '../../../actions/applyLimit'
import _ from 'lodash'
import { loadUserList } from '../../../../src/actions/user'
import { getDeepValue } from '../../../util/util'
import moment from 'moment'
import { checkResourcequotaDetail } from '../../../actions/applyLimit'
import { ListProjects } from '../../../../src/actions/project'
import ApprovalOperation from '../../../../src/components/TenantManage/ApprovalOperation'

const Option = Select.Option

// 格式化options
// optionArr = { key: value }
const optionFormat = optionobj => {
  const data = []
  for (const key in optionobj) {
    data.push(<Option value={optionobj[key]} key={key}>{key}</Option>)
  }
  return data
}

// 根据审批状态返回需要显示的信息及icon状态
const iconStatusFormat = approvalStatus => {
  let iconStatus = { text: '', className: '' }
  switch (approvalStatus) {
    case 1: {
      iconStatus.text = '全部同意'
      iconStatus.className = 'iconallAgree'
      break
    }
    case 3: {
      iconStatus.text = '部分同意'
      iconStatus.className = 'iconPartAgree'
      break
    }
    case 2: {
      iconStatus.text = '全部拒绝'
      iconStatus.status = 'iconallRefuse'
      break
    }
    case 0: {
      iconStatus.text = '待审批...'
      iconStatus.className = 'iconWaitApproval'
      break
    }
    default: {
      iconStatus = { text: '', status: '' }
    }
  }
  return iconStatus
}
// 表格头部
const getColums = ({ toggleDetailForm, getDetailRecord,
  checkResourcequotaDetail, toggleApprovalModal }) => {
  const colums = [{
    title: '项目名称',
    dataIndex: 'item',
    key: 'item',
  }, {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
    sorter: (a, b) => {
      return (Boolean(moment(a.applyTime).format('X') - moment(b.applyTime).format('X')))
    },
  }, {
    title: '审批状态',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    render: (text, record) => {
      const { approvalStatus } = record
      const iconStatus = iconStatusFormat(approvalStatus)
      return (
        <div>
          <span className={iconStatus.className}>
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
        checkResourcequotaDetail(record.id)
        if (record.approvalStatus === 0) {
          toggleApprovalModal()
          return
        }
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
      {
        !_.isEmpty(record.approvaler) ? record.approvaler : '-'
      }
      {/* <Tooltip title="撤销审批">
        <TenxIcon type="fat-arrow-left" className="livingIcon cancelApprovalIcon" onClick={toggleCancelApproval}/>
      </Tooltip> */}
    </span>,
  }]
  return colums
}
// 将后台返回数据格式化成需要的表格数据
const formateTabDate = tabData => {
  let waitApproval = 0
  let data = []
  if (!_.isEmpty(tabData)) {
    data = tabData.map((o, index) => {
      if (o.status === 0) {
        waitApproval++
      }
      return {
        key: index + 1,
        item: o.displayName,
        applyTime: o.createTime,
        approvalStatus: o.status,
        detail: 'detail',
        approvaler: o.approver,
        id: o.id,
      }
    })
  }
  return { waitApproval, data }
}
//
const formateUsername = userName => {
  const user = {}
  userName.forEach(o => {
    user[o.userName] = o.userName
  })
  return user
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
    currentPage: 1,
    searchValue: null, // 当前搜索的关键字
    itemType: undefined, // 项目类型
    approvalStatus: undefined, // 审批状态
    approver: undefined, // 审批者
    showApprovalModal: false, // 显示/隐藏审批页面
  }
  record = null
  componentDidMount = () => {
    const { checkApplyRecord, loadUserList, ListProjects } = this.props
    const query = { from: 0, size: 10 } // 刷新页面时 默认请求第一页
    checkApplyRecord(query)
    // 查询平台管理员和系统管理员
    // 后台接口不支持全部查询,假设最大不可能超过100个管理员
    const userQuery = { from: 0, size: 100, filter: 'role,3,role,2' }
    loadUserList(userQuery) // 获取所有成员
    ListProjects() // 获取集群信息
  }
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
  reload = () => {
    const { checkApplyRecord } = this.props
    this.setState({ currentPage: 1, searchValue: null, itemType: undefined,
      approvalStatus: undefined, approver: undefined, startValue: undefined, endValue: undefined })
    const query = { from: 0, size: 10 }
    checkApplyRecord(query)
  }
  onSearch = value => {
    const { checkApplyRecord } = this.props
    this.setState({ searchValue: value })
    if (!_.isEmpty(value)) {
      const query = { from: 0, size: 10, filter: `display_name,${value}` } // 搜索关键词的时候 默认请求第一页
      checkApplyRecord(query)
    }
  }
  clickItemType = value => {
    this.setState({ itemType: value })
  }
  clickApprovalStatus = value => {
    if (value === 0) {
      this.setState({ approver: undefined })
    }
    this.setState({ approvalStatus: value })
  }
  clickApprover = value => {
    const { approvalStatus } = this.state
    if (approvalStatus === 0) {
      return
    }
    this.setState({ approver: value })
  }
  toggleApprovalModal = () => {
    const { showApprovalModal } = this.state
    this.setState({ showApprovalModal: !showApprovalModal })
  }
  handleSearch = () => {
    const { itemType, approvalStatus, approver, startValue, endValue } = this.state
    const { checkApplyRecord } = this.props
    const formateStartValue = moment(startValue).format('X') // 转换成事件戳
    const formatEndValue = moment(endValue).format('X') // 转换成事件戳
    let filter = ''
    if (!_.isEmpty(itemType)) {
      filter += `project_type,${itemType},`

    }
    if (approvalStatus !== undefined) { // 因为审批中是零
      filter += `status,${approvalStatus},`
    }
    if (!_.isEmpty(approver)) {
      filter += `approver,${approver},`
    }
    if (!!startValue && !!endValue) {
      filter += `create_time,${formateStartValue}_${formatEndValue},`
    }
    filter = filter.substring(0, filter.length - 1)
    const query = { from: 0, size: 10, filter }
    checkApplyRecord(query)
    this.setState({ currentPage: 1 })
  }
  render() {
    const { startValue, endValue, endOpen, approvalVisible, approvalLoading,
      detailVisible, currentPage, itemType, approvalStatus, approver,
      showApprovalModal } = this.state
    const sortedInfo = this.state.sortedInfo || {}
    const toggleCancelApproval = this.toggleCancelApproval
    const toggleDetailForm = this.toggleDetailForm
    const getDetailRecord = this.getDetailRecord
    const { resourcequoteRecord, checkApplyRecord, userName, checkResourcequotaDetail } = this.props
    const { isFetching, data: tabData, total } = resourcequoteRecord
    const { waitApproval, data: formatTabData } = formateTabDate(tabData)
    const toggleApprovalModal = this.toggleApprovalModal
    const formateStartValue = moment(startValue).format('X') // 转换成事件戳
    const formatEndValue = moment(endValue).format('X') // 转换成事件戳
    let filter = ''
    if (!_.isEmpty(itemType)) {
      filter += `project_type,${itemType},`

    }
    if (!_.isEmpty(approvalStatus)) {
      filter += `status,${approvalStatus}`
    }
    if (!_.isEmpty(approver)) {
      filter += `approver,${approver},`
    }
    if (!_.isEmpty(startValue) && !_.isEmpty(endValue)) {
      filter += ` create_time,${formateStartValue}_${formatEndValue}`
    }
    filter = filter.substring(0, filter.length - 1)
    // 页脚设置
    const pageOption = {
      simple: true,
      total: !_.isEmpty(tabData) && total || 0,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: n => {
        this.setState({ currentPage: n })
        const query = { from: (n - 1) * 10, size: 10, filter }
        checkApplyRecord(query)
      },
      current: currentPage,
    }
    // console.log('查询条件', {
    //   itemType, approvalStatus, approver, startValue1: moment(startValue).format('X'), startValue, endValue,
    // })
    return (
      <TenxPage inner className="ApprovalLimit">
        <QueueAnim>
          <Title title="配额审批" />
          <div className="layout-content-btns header" key="header">
            <Select placeholder="项目类型" style={{ width: 100 }} value={itemType}
              onChange={this.clickItemType}>
              {optionFormat({ 个人项目: 'person', 共享项目: 'public' })}
            </Select>
            <Select placeholder="审批状态" style={{ width: 100 }} value={approvalStatus}
              onChange={this.clickApprovalStatus}
            >
              {optionFormat({ 审批中: 0, 全部同意: 1, 全部拒绝: 2, 部分同意: 3 })}
            </Select>
            <Select placeholder="审批者" style={{ width: 100 }} value={ approver}
              onChange={this.clickApprover} disabled={ approvalStatus === 0 }
            >
              {optionFormat((formateUsername(userName)))}
            </Select>
            <DatePicker
              showTime format="yyyy-MM-dd HH:mm:ss"
              disabledDate={this.disabledStartDate}
              value={startValue}
              placeholder="选择开始日期"
              onChange={this.onStartChange}
              toggleOpen={this.handleStartToggle}
            />
            <DatePicker
              showTime format="yyyy-MM-dd HH:mm:ss"
              disabledDate={this.disabledEndDate}
              value={endValue}
              placeholder="选择结束日期"
              onChange={this.onEndChange}
              open={endOpen}
              toggleOpen={this.handleEndToggle}
            />
            <Button type="primary" onClick={this.handleSearch}>立即查询</Button>
            {/* <Button >清空所有记录</Button> */}
          </div>
          <div className="layout-content-btns header" key="secondHeader">
            <CommonSearchInput placeholder="按项目名称搜索" size="large" onSearch={this.onSearch}/>
            <Button onClick={this.reload}>刷新</Button>
            <Pagination {...pageOption}/>
            <span className="ApprovalMessage"><span>待审批:</span><span>{waitApproval}</span></span>
          </div>
          <div className="content" key="content">
            <Card>
              <Table
                loading={isFetching}
                columns={getColums({ sortedInfo, toggleDetailForm, toggleCancelApproval,
                  getDetailRecord, checkResourcequotaDetail, toggleApprovalModal })}
                dataSource={formatTabData} pagination={false} />
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
        {
          this.record !== null && <ApprovalOperation title="资源配额审批" visible={showApprovalModal}
            toggleVisable={this.toggleApprovalModal}
            record={this.record} reload={this.reload}/>
        }
      </TenxPage>
    )
  }
}

const mapStateToProps = state => {
  const resourcequoteRecord = state.applyLimit.resourcequoteRecord
  const userName = getDeepValue(state.user, [ 'users', 'result', 'users' ]) || []
  // const namespace = state.entities.loginUser.info.namespace
  return {
    resourcequoteRecord, userName,
  }
}

export default connect(mapStateToProps, {
  checkApplyRecord, loadUserList, checkResourcequotaDetail, ListProjects,
})(ApprovalLimit)
