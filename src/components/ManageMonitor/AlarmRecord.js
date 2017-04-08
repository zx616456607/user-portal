/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Record component
 *
 * v0.1 - 2017-3-16
 * @author Baiyu
 */
'use strict'
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Spin, Table, Select, DatePicker, Menu, Button, Pagination, Modal } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
// import { calcuDate } from '../../../common/tools.js'
import moment from 'moment'
import './style/AlarmRecord.less'
import { loadRecords, loadRecordsFilters, deleteRecords } from '../../actions/alert'
import NotificationHandler from '../../common/notification_handler'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
const Option = Select.Option

class AlarmRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strategyFilter: '',
      targetTypeFilter: '',
      targetFilter: '',
      beginTimeFilter: '',
      endTimeFilter: '',
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
      deleteModal: false
    }
  }

  loadData(props) {
    const {
      strategyFilter,
      targetTypeFilter,
      targetFilter,
      beginTimeFilter,
      endTimeFilter,
    } = this.state
    const query = {
      strategyName: strategyFilter,
      targetType: targetTypeFilter,
      targetName: targetFilter,
      beginTime: beginTimeFilter,
      endTime: endTimeFilter,
      cluster: props.clusterID,
    }
    this.props.loadRecords(query)
  }
  componentWillMount() {
    document.title = '告警记录 | 时速云'
    const { loadRecordsFilters, clusterID } = this.props
    loadRecordsFilters(clusterID)
    this.loadData(this.props)
  }
  componentWillReceiveProps(nextProps) {
    const { clusterID } = this.props
    if (clusterID !== nextProps.clusterID) {
      this.loadData(nextProps)
    }
  }
  getFilters() {
    const {
      recordFilters
    } = this.props

    let strategies = [<Option value="">全部</Option>]
    for (let strategy of recordFilters.strategies) {
      strategies.push(<Option value={strategy.name}>{strategy.name}</Option>)
    }

    let targets = [<Option value="">全部</Option>]
    for (let target of recordFilters.targets) {
      targets.push(<Option value={target.name}>{target.name}</Option>)
    }

    return {
      strategies,
      targets,
    }
  }
  getRecords() {
    this.loadData(this.props)
  }
  deleteRecords() {
    const {
      deleteRecords,
      loadRecords,
     } = this.props
    const _this = this
    this.setState({deleteModal: false})
    deleteRecords('', {
      success: {
        func: () => {
          loadRecords()
          let notification = new NotificationHandler()
          notification.success('清空记录成功')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          let notification = new NotificationHandler()
          notification.error('清空记录失败')
        }
      }
    })
  }
  onBeginTimeFilterChange(time) {
    // covert to utc to avoid '+'
    const t = moment(moment(time).format('YYYY-MM-DD 00:00:00')).utc().format()
    this.setState({
      beginTimeFilter: t,
    })
  }
  onEndTimeFilterChange(time) {
    // covert to utc to avoid '+'
    const t = moment(moment(time).format('YYYY-MM-DD 00:00:00')).utc().add(1, 'day').format()
    this.setState({
      endTimeFilter: t,
    })
  }
  getRecordData() {
    let records = []
    if (this.props.records.records) {
      this.props.records.records.map(function(r) {
        records.push({
          createTime: r.createTime,
          strategyName: r.strategyName,
          targetType: r.targetType,
          targetName: r.targetName,
          triggerValue: r.triggerValue,
          triggerRule: r.triggerRule,
          status: r.status,
        })
      })
    }
    return records
  }
  onPageChange(current) {
    this.setState({page: current})
    const {
      strategyFilter,
      targetTypeFilter,
      targetFilter,
      beginTimeFilter,
      endTimeFilter,
    } = this.state
    const {size,sortOrder, sortBy, clusterID } = this.props
    const query = {
      from: (current -1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE,
      strategyName: strategyFilter,
      targetType: targetTypeFilter,
      targetName: targetFilter,
      beginTime: beginTimeFilter,
      endTime: endTimeFilter,
      cluster: clusterID
    }
    this.props.loadRecords(query)
  }
  render () {
    const columns = [
      {
        title: '告警时间',
        dataIndex: 'createTime',
        render: (text)=> {
          return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
        }
      },
      {
        title: '策略名称',
        dataIndex: 'strategyName',
      },
      {
        title: '类型',
        dataIndex: 'targetType',
        render: (text)=> {
          switch (text) {
            case 0:
              return <div>服务</div>
              break
            case 1:
              return <div>节点</div>
              break
            default:
              return <div>未知</div>
          }
        }
      },
      {
        title: '告警对象',
        dataIndex: 'targetName',
      },
      {
        title: '告警当前值',
        dataIndex: 'triggerValue',
      },
      {
        title: '告警规则',
        dataIndex: 'triggerRule',

      },
      {
        title: '是否发送邮件',
        dataIndex: 'status',
        render: (text)=> {
          switch (text) {
            case 0:
              return <div>未发送</div>
              break
            case 1:
              return <div style={{color:'#33b867'}}>已发送</div>
              break
            default:
              return <div>未知</div>
          }
        }
      }
    ];

    const filters = this.getFilters()
    const data = this.getRecordData()
    const { total } = this.props.records
    const { page, size } = this.state
    return (
      <QueueAnim className="AlarmRecord" type="right">
        <div id="AlarmRecord" key="AlarmRecord">
          <div className="topRow">
            <Select style={{ width: 120 }} size="large" placeholder="选择告警策略" onChange={(value) => this.setState({strategyFilter: value})}>
              {filters.strategies}
            </Select>
            <Select style={{ width: 120 }} size="large" placeholder="选择类型" onChange={(value) => this.setState({targetTypeFilter: value})}>
              <Option value="">全部</Option>
              <Option value="0">服务</Option>
              <Option value="1">节点</Option>
            </Select>
            <Select style={{ width: 120 }} size="large" placeholder="选择告警对象" onChange={(value) => this.setState({targetFilter: value})}>
              {filters.targets}
            </Select>
            <DatePicker placeholder="选择起始日期" size="large" onChange={(value) => this.onBeginTimeFilterChange(value)}/>
            <DatePicker placeholder="选择结束日期" size="large" onChange={(value) => this.onEndTimeFilterChange(value)}/>
            <Button icon="exception" size="large" type="primary" onClick={() => this.getRecords()}>立即查询</Button>
            <Button icon="delete" size="large"  onClick={() => this.setState({deleteModal: true})}>清空所有记录</Button>
            <div className='pageBox'>
              <span className='totalPage'>共计 {total} 条</span>
              <Pagination
                simple
                className='inlineBlock'
                onChange={(page)=> this.onPageChange(page)}
                current={page}
                pageSize={size}
                total={total} />
            </div>
            <div style={{clear:'both'}}></div>
          </div>
          <Card style={{marginTop: 20}}>
            <Table className="strategyTable" columns={columns} dataSource={data} pagination={false}  loading={this.props.isFetching}/>
          </Card>
        </div>
        <Modal title="清除所有告警记录" visible={this.state.deleteModal}
          onCancel={()=> this.setState({deleteModal: false})}
          onOk={()=> this.deleteRecords()}
        >
        <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您的操作将会清空所有告警记录，并且无法恢复，是否清空？</div>
        </Modal>
      </QueueAnim>
    )}

}

function mapStateToProps(state, props) {
  const {
    recordFilters,
    records,
  } = state.alert

  let recordFiltersData = {
    strategies: [],
    targets: [],
  }
  const { current } = state.entities
  const { clusterID } = current.cluster
  if (recordFilters && recordFilters.result) {
    recordFiltersData = recordFilters.result.data
  }

  let recordsData = {
    total: 0,
    records: [],
  }
  if (records && records.result) {
    recordsData = records.result.data
  }
  return {
    recordFilters: recordFiltersData,
    records: recordsData,
    isFetching: records.isFetching,
    clusterID
  }
}

export default connect(mapStateToProps, {
  loadRecords,
  loadRecordsFilters,
  deleteRecords,
})(AlarmRecord)