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
import { Card, Icon, Spin, Table, Select, DatePicker, Menu, Button } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
// import { calcuDate } from '../../../common/tools.js'
import moment from 'moment'
import './style/AlarmRecord.less'
import { loadRecords, loadRecordsFilters, deleteRecords } from '../../actions/alert'
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
    }
  }
  componentWillMount() {
    const { loadRecordsFilters } = this.props
    loadRecordsFilters('CID-fe23111d77cb')
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
      cluster: 'CID-fe23111d77cb', // TODO
    }
    this.props.loadRecords(query)
  }
  deleteRecords() {
    this.props.deleteRecords()
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
              return <div>已发送</div>
              break
            default:
              return <div>未知</div>
          }
        }
      }
    ];


    const filters = this.getFilters()
    const data = this.getRecordData()
    return (
      <QueueAnim className="AlarmRecord" type="right">
        <div id="AlarmRecord">
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
            <Button icon="delete" size="large"  onClick={() => this.deleteRecords()}>清空所有记录</Button>
          </div>
          <Card>
            <Table className="strategyTable" onRowClick={(record, index)=>console.log('click', record, index)} columns={columns} dataSource={data} pagination={false} />
          </Card>
        </div>
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
  if (recordFilters && recordFilters.isFetching === false && recordFilters.result && recordFilters.result.result && recordFilters.result.result.code === 200) {
    recordFiltersData = recordFilters.result.result.data
  }

  let recordsData = {
    total: 0,
    records: [],
  }
  if (records && records.isFetching === false && records.result && records.result.result && records.result.result.code === 200) {
    recordsData = records.result.result.data
  }
  return {
    recordFilters: recordFiltersData,
    records: recordsData,
  }
}

export default connect(mapStateToProps, {
  loadRecords,
  loadRecordsFilters,
  deleteRecords,
})(AlarmRecord)