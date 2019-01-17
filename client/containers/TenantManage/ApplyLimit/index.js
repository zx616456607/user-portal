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
import { Button, Icon, Pagination, Card, Table } from 'antd'
// import { Link } from 'react-router'
import './style/ApplyLimit.less'
import _ from 'lodash'
// import Notification from '../../../../src/components/Notification'
import Title from '../../../../src/components/Title'
import CommonSearchInput from '../../../../src/components/CommonSearchInput'
import QueueAnim from 'rc-queue-anim'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import './style/ApplyLimit.less'
import Operation from './Operation'
import ApplyForm from './ApplyForm'
import * as applyLimitActions from '../../../actions/applyLimit' // checkApplyRecord
import * as projectActions from '../../../../src/actions/project' // { ListProjects }
import { connect } from 'react-redux'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
// import moment from 'moment'
import { calcuDate } from '../../../../src/common/tools'
// 表格头定义
const columns = ({ reloadApplyRecord }) => {
  const columnsArr = [{
    title: '申请项目',
    dataIndex: 'item',
    key: 'item',
    filters: [
      { text: '个人项目', value: 'person' },
      { text: '共享项目', value: 'public' },
    ],
    // filteredInfo:
  }, {
    title: '申请时间',
    key: 'time',
    dataIndex: 'time',
    sorter: () => {
    },
  }, {
    title: '审批状态',
    dataIndex: 'condition',
    key: 'condition',
    filters: [
      { text: '全部同意', value: 1 }, // '全部同意'
      { text: '部分同意', value: 3 }, // '全部拒绝'
      { text: '全部拒绝', value: 2 }, // 部分同意
      { text: '待审批', value: 0 }, // 审批中
    ],
    render: (text, record) => {
      const iconText = { iconName: '', iconText: '' }
      switch (record.condition) {
        case 0: {
          iconText.iconName = 'iconWaitApproval'
          iconText.iconText = '待审批'
          break
        }
        case 1: { // 全部同意
          iconText.iconName = 'iconallAgree'
          iconText.iconText = '全部同意'
          break
        }
        case 2: {
          iconText.iconName = 'iconallRefuse'
          iconText.iconText = '全部拒绝'
          break
        }
        case 3: { // 部分同意
          iconText.iconName = 'iconPartAgree'
          iconText.iconText = '部分同意'
          break
        }
        default:
          break
      }
      return (<div>
        <span className={iconText.iconName}>
          <span className="icon" ></span>
          <span className="iconText">{iconText.iconText}</span>
        </span>
      </div>)
    },
  }, {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 250,
    render: (text, record) => {
      const { condition } = record
      let newCondition = ''
      newCondition = condition === 0 ? 'notCondition' : 'condition'
      return (
        <Operation condition={newCondition} record={record} reloadApplyRecord={reloadApplyRecord}/>
      )
    },
  }]
  return columnsArr
}

const getdataSource = ({ dataSource, namespace }) => {
  const datas = []
  if (_.isArray(dataSource) && !_.isEmpty(dataSource)) {
    dataSource.forEach((o, index) => {
      datas.push({
        key: index,
        item: o.displayName,
        time: calcuDate(o.createTime), // moment(o.createTime).format('YYYY-MM-DD HH:mm:ss'),
        condition: o.status,
        itemProp: o.namespace === namespace ? '个人项目' : '共享项目',
        id: o.id,
        namespace: o.namespace, // namespace
      })
    })
  }
  return datas
}
class ApplyLimit extends React.Component {
  state = {
    filteredInfo: null, // 保存当前需要搜索的关键词
    applayVisable: false, // 申请配额弹窗标志位
    currentPage: 1,
    searchValue: null, // 当前搜索的关键字
    applyTimeSorted: '', // 根据申请事件排序关键字
    displayName: undefined, // 从query传过来的项目名称
    displayNameText: undefined, // 从query传过来的用于搜索的项目名称
    showWindow: false, // 显示申请框
    resourceType: undefined, // 跳转带过来的资源类型
    clusterID: undefined, // 跳转带过来的集群id

  }
  handleChange = (pagination, filters, sorter) => {
    const { checkApplyRecord } = this.props
    const { columnKey, order } = sorter
    let sorterquery
    if (_.isEmpty(columnKey)) { // 取消排序
      this.setState({ applyTimeSorted: {}, currentPage: 1 })
    }
    if (columnKey === 'time' && order === 'ascend') { // 小的放上面
      sorterquery = 'a,create_time'
      this.setState({ applyTimeSorted: sorterquery, currentPage: 1 })
    }
    if (columnKey === 'time' && order === 'descend') { // 小的放上面
      sorterquery = 'd,create_time'
      this.setState({ applyTimeSorted: sorterquery, currentPage: 1 })
    }
    let filter = ''
    if (_.isEmpty(filters.item) && _.isEmpty(filters.condition)) { // 重置的时候清空搜索条件
      this.setState({ filteredInfo: undefined, currentPage: 1 })
      const query = { from: 0, size: 10 } // 刷新页面时 默认请求第一页
      if (sorterquery) {
        query.sort = sorterquery
      }
      checkApplyRecord(query)
      return
    }
    for (const key in filters) {
      let filterkey = ''
      if (key === 'item') {
        filterkey = 'project_type'
      } else if (key === 'condition') {
        filterkey = 'status'
      }
      if (Array.isArray(filters[key])) {
        for (const value of filters[key]) {
          filter += `${filterkey},${value},`
        }
      }
    }
    filter = filter.substring(0, filter.length - 1)
    this.setState({ filteredInfo: filter, currentPage: 1 })
    const query = { from: 0, size: 10, filter }
    if (sorterquery) {
      query.sort = sorterquery
    }
    checkApplyRecord(query)
  }
  componentDidMount = () => {
    const { checkApplyRecord, userName, location, getProjectVisibleClusters } = this.props
    const query = { from: 0, size: 10, filter: `applier,${userName}` } // 刷新页面时 默认请求第一页
    checkApplyRecord(query)
    const { displayName, namespace, resourceType, clusterID } = location.query
    let showdisplayNameText
    if (displayName === undefined) {
      showdisplayNameText = namespace
    }
    if (displayName !== undefined) {
      showdisplayNameText = `${displayName} ( ${namespace} )`
    }
    if (location.search !== '') {
      this.setState({ displayNameText: showdisplayNameText, displayName: namespace, resourceType,
        clusterID, applayVisable: true })
      getProjectVisibleClusters('default')
    }
  }
  setApplayVisable = status => { // 当status的值为success时 会重新liading一下数据
    const { ListProjects, checkApplyRecord, userName } = this.props
    const { currentPage: n } = this.state
    const { applayVisable } = this.state
    this.setState({ applayVisable: !applayVisable, showWindow: true })
    ListProjects() // 获取项目名称
    if (status === 'success') {
      const query = { from: (n - 1) * 10, size: 10, filter: `applier,${userName}` } // 刷新页面时 默认请求第一页
      checkApplyRecord(query)
    }
  }
  cancelApplayVisable = () => {
    this.setState({ applayVisable: false })
  }
  reloadApplyRecord = () => {
    const { currentPage: n } = this.state
    const { checkApplyRecord, userName } = this.props
    const query = { from: (n - 1) * 10, size: 10, filter: `applier,${userName}` } // 刷新页面时 默认请求第一页
    checkApplyRecord(query)
  }
  onSearch = value => {
    const { checkApplyRecord, userName } = this.props
    this.setState({ searchValue: value })
    if (!_.isEmpty(value)) {
      const query = { from: 0, size: 10, filter: `display_name,${value},applier,${userName}` } // 搜索关键词的时候 默认请求第一页
      checkApplyRecord(query)
    }
  }
  reload = () => {
    const { checkApplyRecord, userName } = this.props
    this.setState({
      currentPage: 1, searchValue: null, filteredInfo: null,
    })
    const query = { from: 0, size: 10, filter: `applier,${userName}` } // 搜索关键词的时候 默认请求第一页
    checkApplyRecord(query)
  }
  render() {
    const { filteredInfo, applayVisable, searchValue, applyTimeSorted, displayNameText, showWindow,
      resourceType, clusterID } = this.state
    const { isFetching, data, total } = this.props.resourcequoteRecord
    const { checkApplyRecord, namespace, userName } = this.props
    const { currentPage, displayName } = this.state
    const reloadApplyRecord = this.reloadApplyRecord
    const pageOption = {
      simple: true,
      total: !_.isEmpty(data) && total || 0,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: n => {
        this.setState({ currentPage: n })
        const query = { from: (n - 1) * 10, size: 10, filter: '' }

        if (!_.isEmpty(searchValue)) {
          query.filter = `display_name,${searchValue},applier,${userName}`
        }
        if (!_.isEmpty(filteredInfo) && !_.isEmpty(query.filter)) {
          query.filter += `,${filteredInfo}`
        }
        if (!_.isEmpty(filteredInfo) && _.isEmpty(query.filter)) {
          query.filter += filteredInfo
        }
        if (!_.isEmpty(applyTimeSorted)) {
          query.sort = applyTimeSorted

        }
        checkApplyRecord(query)
      },
      current: currentPage,
    }
    return (
      <TenxPage inner className="ApplyLimitPage">
        <QueueAnim>
          <Title title="配额申请" />
          <div className="layout-content-btns secondHeader" key="top">
            <Button type="primary" onClick={this.setApplayVisable}>
              <Icon type="file-text" />申请配额
            </Button>
            <Button onClick={this.reload}><Icon type="reload" />刷新</Button>
            <CommonSearchInput placeholder="按项目名称搜索" size="large" onSearch={this.onSearch}/>
            <span className="paginationWrap">
              <span className="paginationtotal">{`共计${total}条`}</span>
              <Pagination {...pageOption}/>
            </span>
          </div>
          <div className="content" key="content">
            <Card>
              <Table
                loading={isFetching}
                pagination={false}
                columns={columns({ filteredInfo, reloadApplyRecord })}
                dataSource={getdataSource({ dataSource: data, namespace })}
                onChange={this.handleChange}
              />
            </Card>
          </div>
        </QueueAnim>
        {
          (displayNameText || showWindow)
           && <ApplyForm applayVisable={applayVisable} setApplayVisable={this.setApplayVisable}
             displayName={displayName} displayNameText={displayNameText}
             cancelApplayVisable={this.cancelApplayVisable} resourceType={resourceType}
             clusterIDParams={clusterID}/>}
      </TenxPage>
    )
  }
}

const mapStateToProps = state => {
  const resourcequoteRecord = state.applyLimit.resourcequoteRecord
  // const namespace = state.entities.loginUser.info.namespace
  const userName = getDeepValue(state, [ 'entities', 'loginUser', 'info', 'userName' ])
  return {
    resourcequoteRecord, userName,
  }
}

export default connect(mapStateToProps, {
  checkApplyRecord: applyLimitActions.checkApplyRecord,
  ListProjects: projectActions.ListProjects,
  getProjectVisibleClusters: projectActions.getProjectVisibleClusters,
})(ApplyLimit)
