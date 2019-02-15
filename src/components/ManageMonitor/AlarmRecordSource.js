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
import { Card, Icon, Spin, Table, Select, DatePicker, Menu, Button, Pagination, Modal, Popover, Timeline } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
// import { calcuDate } from '../../../common/tools.js'
import moment from 'moment'
import './style/AlarmRecord.less'
import { loadRecords, loadRecordsFilters, deleteRecords, getAlertSetting, getSettingList } from '../../actions/alert'
import { loadAppList } from '../../actions/app_manage'
import { loadServiceDetail, loadServiceInstance, loadAllServices } from '../../actions/services'
import { getHostInfo } from '../../actions/cluster'
import { getAllClusterNodes } from '../../actions/cluster_node'
import NotificationHandler from '../../components/Notification'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
const Option = Select.Option
import { STANDARD_MODE } from '../../../configs/constants'
import { mode } from '../../../configs/model'
const standardFlag = mode === STANDARD_MODE
import Title from '../Title'
import isEmpty from 'lodash/isEmpty'
import TenxIcon from '@tenx-ui/icon/es/_old'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Ellipsis from '@tenx-ui/ellipsis/lib'

class AlarmRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strategyFilter: '',
      noticeType: undefined,
      targetTypeFilter: '0',
      targetFilter: '',
      beginTimeFilter: '',
      endTimeFilter: '',
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
      deleteModal: false,
      restartInfo: [],
      loadingRestartInfo: false,
    }
  }

  loadData(props, condition) {
    const {
      strategyFilter,
      noticeType,
      targetTypeFilter,
      targetFilter,
      beginTimeFilter,
      endTimeFilter
    } = this.state
    let query = {
      beginTime: beginTimeFilter,
      endTime: endTimeFilter,
      cluster: props.clusterID
    }
    if (condition) {
      query.strategyName = condition.strategyName
      query.targetType = condition.targetType
      query.targetNamy = condition.targetName
    } else {
      query.strategyName = strategyFilter
      query.targetType = targetTypeFilter
      query.targetName = targetFilter
      query.alertStatus = noticeType
    }
    query.targetType = '0'
    this.props.loadRecords(query, props.clusterID)
  }
  componentWillMount() {
    const { loadRecordsFilters, clusterID, location, getSettingList, loadAppList, getAllClusterNodes } = this.props
    const { targetType, targetName, strategyName } = location.query
    this.setState({
      strategyFilter: strategyName,
      targetTypeFilter: targetType,
      targetFilter: targetName
    })
    loadRecordsFilters(clusterID)
    loadAppList(clusterID, {size: 100})
    getSettingList(clusterID, {
      targetType: 0,
      from: 0,
      size: 0
    })
    getAllClusterNodes(clusterID) //加载节点
    this.loadData(this.props, location.query)
    this.loadServices()//加载所有服务
  }
  loadServices = () => {
    const query ={
      pageIndex: 1, pageSize: 0, name: undefined, label: undefined
    }
    const { loadAllServices, clusterID } = this.props
    loadAllServices(clusterID, query)

  }
  componentWillReceiveProps(nextProps) {
    const { clusterID } = this.props
    if (clusterID !== nextProps.clusterID) {
      this.loadData(nextProps)
    }
  }
  getFilters() {
    const {
      recordFilters,
      strategyList,
      servicesTargets,
      nodeTargets
    } = this.props
    const { targetTypeFilter } = this.state
    let strategies = [<Option value="" key={'all'}>全部</Option>]
    let targets = [<Option value="" key={'targetsAll'}>全部</Option>]
    if (strategyList && strategyList.length > 0) {
      for (let strategy of strategyList) {
        strategies.push(<Option value={strategy.strategyName}>
          <span title={strategy.strategyName}>{strategy.strategyName}</span></Option>)
      }
    }
    let targetsData = []
    if (!targetTypeFilter) {
      targets = [<Option value="" key={'targetsAll'}>全部</Option>]
    } else if(targetTypeFilter === '0') {
      targetsData = servicesTargets
    } else if(targetTypeFilter === '1') {
      targetsData = nodeTargets
    }
    for (let target of targetsData) {
      targets.push(<Option value={target} key={target}>{target}</Option>)
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
    const clusterID = this.props.clusterID
    let notification = new NotificationHandler()
    this.setState({ deleteModal: false })
    deleteRecords(clusterID, null, {
      success: {
        func: () => {
          loadRecords({targetType: '0'})
          notification.success('清空记录成功')
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
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
      this.props.records.records.map(function (r) {
        records.push({
          alertStatus: r.alertStatus,
          createTime: r.createTime,
          strategyName: r.strategyName,
          targetType: r.targetType,
          targetName: r.targetName,
          triggerValue: r.triggerValue,
          triggerRule: r.triggerRule,
          status: r.status,
          strategyID: r.strategyID
        })
      })
    }
    return records
  }
  onPageChange(current) {
    this.setState({ page: current })
    const {
      strategyFilter,
      noticeType,
      targetTypeFilter,
      targetFilter,
      beginTimeFilter,
      endTimeFilter,
    } = this.state
    const { size, sortOrder, sortBy, clusterID } = this.props
    const query = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE,
      strategyName: strategyFilter,
      alertStatus: noticeType,
      targetType: '0',
      targetName: targetFilter,
      beginTime: beginTimeFilter,
      endTime: endTimeFilter,
      cluster: clusterID
    }
    this.props.loadRecords(query, clusterID)
  }
  toProjectDetail(list) {
    const { clusterID, loadServiceDetail, getHostInfo } = this.props;
    const notify = new NotificationHandler()
    if (!list.targetType) {
      loadServiceDetail(clusterID, list.targetName, {
        success: {
          func: () => {
            browserHistory.push(`/app_manage/service?serName=${list.targetName}`)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            if (err.statusCode === 404) {
              notify.info('关联服务不存在或者已经被删除')
            }
          },
          isAsync: true
        }
      })
    } else {
      const body = {
        clusterID: clusterID,
        clusterName: list.targetName
      }
      getHostInfo(body, {
        success: {
          func: () => {
            browserHistory.push(`/cluster/${clusterID}/${list.targetName}`)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.info('关联节点不存在或者已被删除')
          },
          isAsync: true
        }
      })
    }
  }
  toAlarmDetail(record) {
    const { getAlertSetting, clusterID } = this.props
    const notify = new NotificationHandler()
    getAlertSetting(clusterID, {
      strategy: record.strategyID
    }, {
        success: {
          func: (result) => {
            if (isEmpty(result.data)) {
              notify.error('此策略不存在或者已被删除')
            } else {
              browserHistory.push(`/manange_monitor/alarm_setting/${encodeURIComponent(record.strategyID)}?name=${record.strategyName}&clusterID=${clusterID}`)
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notify.error('此策略不存在或者已被删除')
          },
          isAsync: true
        }
      })
  }
  disabledDate = current => {
    return current && current.getTime() > Date.now()
  }
  // 使用后端返回信息，暂不用此
  renderTriggerValue = ({ triggerRule, triggerValue, targetName, ...otherProps }) => {
    if (triggerRule.indexOf('任一容器连续重启次数') < 0) {
      return triggerValue
    }
    return <Popover
      trigger="click"
      placement="rightTop"
      content={this.showPodTree(targetName)}
      onVisibleChange={v => v && this.loadServerInstance(targetName)}
      arrowPointAtCenter={true}
    >
      <a>查看详情</a>
    </Popover>
  }

  loadServerInstance = async targetName => {
    this.setState({
      loadingRestartInfo: true,
    })
    const { loadServiceInstance, clusterID } = this.props
    const notify = new NotificationHandler()
    await loadServiceInstance(clusterID, targetName, {
      success: {
        func: (result) => {
          const instances = result.data.instances
          const restartInfo = [{ name: '', restartCount: '' }]
          instances.forEach(item => {
            restartInfo.push({
              name: item.metadata.name,
              restartCount: getDeepValue(item, [ 'status', 'containerStatuses', '0', 'restartCount' ]) || 0,
            })
          })
          this.setState({
            restartInfo,
            loadingRestartInfo: false
          })
        }
      },
      failed: {
        func: (err) => {
          this.setState({
            restartInfo: [],
            loadingRestartInfo: false
          })
          notify.warn('获取容器启动信息失败')
        }
      }
    })
  }
  showPodTree = targetName => {
    const { loadingRestartInfo, restartInfo } = this.state
    if (loadingRestartInfo) return <div style={{ textAlign: 'center' }}><Spin /></div>
    if (!restartInfo.length) return <div>无重启信息</div>
    return <div id="AlarmLogPodTree">
      <div className="serverName">{targetName}</div>
      <Timeline className="AlarmLogPodTreeBody">
        {
          restartInfo.map((item, ind) => {
            return <Timeline.Item
              dot={<div style={{ height: 0 }}></div>}
            >
            {
              ind !== 0 ?
                <span>
                  <TenxIcon type={'line'} size='14' color="#2db7f5"/>
                  &nbsp;&nbsp;{ `pod: ${item.name} 累计重启 ${item.restartCount} 次` }
                </span>
                : null
            }
            </Timeline.Item>
          })
        }
      </Timeline>
    </div>
  }

  showAlarmStatus = (status = '') => {
    switch (status.toString()) {
      case '0':
        return <span><TenxIcon type={'circle'} color="#ffbf00" /> 告警</span>
      case '1':
        return <span><TenxIcon type={'circle'} color="#5cb85c" /> 恢复</span>
      default :
        return <span>--</span>
    }
  }

  render() {
    const columns = [
      {
        title: '告警时间',
        dataIndex: 'createTime',
        render: (text) => {
          return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
        }
      },
      {
        title: '状态',
        dataIndex: 'alertStatus',
        render: text => this.showAlarmStatus(text)
      },
      {
        title: '策略名称',
        dataIndex: 'strategyName',
        width: 250,
        render: (text, record) => {
          return <span className="targetName" onClick={() => this.toAlarmDetail(record)}><Ellipsis length={20} >{text}</Ellipsis></span>
        }
      },
      {
        title: '类型',
        dataIndex: 'targetType',
        render: (text) => {
          switch (text) {
            case 0:
              return <div>服务</div>
            case 1:
              return <div>节点</div>
            default:
              return <div>未知</div>
          }
        }
      },
      {
        title: '告警对象',
        dataIndex: 'targetName',
        width: 170,
        render: (text, record) => {
          return <span className="targetName" onClick={() => this.toProjectDetail(record)}><Ellipsis length={20} >{text}</Ellipsis></span>
        }
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
        title: '是否发送邮件/短信',
        dataIndex: 'status',
        render: (text) => {
          switch (text) {
            case 0:
              return <div style={{ color: '#f23e3f' }}>否</div>
            case 1:
              return <div style={{ color: '#33b867' }}>是</div>
            case 2:
              return <div style={{ color: '#f23e3f' }}>短信发送失败</div>
            case 3:
              return <div style={{ color: '#f23e3f' }}>邮件发送失败</div>
            case 4:
              return <div style={{ color: '#f23e3f' }}>短信和邮件都发送失败</div>
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
    const getTypeOptions = function () {
      let options = [<Option value="0">服务</Option>]
      // options.push(<Option value="0">服务</Option>)
      // if (!standardFlag) {
      //   options.push(<Option value="1">节点</Option>)
      // }
      return options
    }
    const noticeTypeOptions = () => [
        <Option value="">全部</Option>,
        <Option value="0">告警</Option>,
        <Option value="1">恢复</Option>
    ]
    return (
      <QueueAnim type="right">
        <div id="AlarmRecord" key="AlarmRecord" >
          <Title title="告警记录" />
          <div className="topRow">
            <Select style={{ width: 150 }} getPopupContainer={() => document.getElementById('AlarmRecord')}
              size="large"
              showSearch
              defaultValue={this.state.strategyFilter}
              placeholder="选择告警策略"
              optionFilterProp="children"
              notFoundContent="无法找到" onChange={(value) => this.setState({ strategyFilter: value })}
            >
              {filters.strategies}
            </Select>
            <Select
              style={{ width: 120 }}
              size="large"
              placeholder="选择状态"
              defaultValue={this.state.noticeType}
              onChange={noticeType => this.setState({ noticeType })}
            >
              {noticeTypeOptions()}
            </Select>
            <Select
              style={{ width: 120 }}
              size="large"
              placeholder="选择类型"
              defaultValue={this.state.targetTypeFilter}
              onChange={(value) => {
                if (value === '') {
                  this.setState({
                    targetFilter: ''
                  })
                }
                this.setState({ targetTypeFilter: value })
              }}>
              {getTypeOptions()}
            </Select>
            <Select
              showSearch
              style={{ width: 120 }}
              getPopupContainer={() => document.getElementById('AlarmRecord')}
              size="large"
              placeholder="选择告警对象"
              value={this.state.targetFilter}
              onChange={(value) => this.setState({ targetFilter: value })}
            >
              {filters.targets}
            </Select>
            <DatePicker placeholder="选择起始日期" size="large" disabledDate={this.disabledDate} onChange={(value) => this.onBeginTimeFilterChange(value)} />
            <DatePicker placeholder="选择结束日期" size="large" disabledDate={this.disabledDate} onChange={(value) => this.onEndTimeFilterChange(value)} />
            <Button icon="exception" size="large" type="primary" onClick={() => this.getRecords()}>立即查询</Button>
            <Button className="empty" icon="delete" size="large" onClick={() => this.setState({ deleteModal: true })}>清空所有记录</Button>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'>共计 {total} 条</span>
              <Pagination
                simple
                className='inlineBlock'
                onChange={(page) => this.onPageChange(page)}
                current={page}
                pageSize={size}
                total={total} />
            </div>}
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card style={{ marginTop: 20 }}>
            <Table className="strategyTable" columns={columns} dataSource={data} pagination={false} />
          </Card>
        </div>
        <Modal title="清除所有告警记录" visible={this.state.deleteModal}
          onCancel={() => this.setState({ deleteModal: false })}
          onOk={() => this.deleteRecords()}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{ marginRight: 10 }}></i>您的操作将会清空所有告警记录，并且无法恢复，是否清空？</div>
        </Modal>
      </QueueAnim>
    )
  }

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
  let strategyList = state.alert.settingList.result? state.alert.settingList.result.data.strategys : []
  const { current } = state.entities
  const { clusterID } = current.cluster
  const { services } = state.services.serviceList
  const servicesTargets = []
  const nodeTargets = []
  let appList = state.apps.appItems
  let clusterNode = state.cluster_nodes.getAllClusterNodes
  if (!appList || !appList[clusterID]) {
    appList = []
  } else {
    appList = appList[clusterID].appList
  }
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
  if (services) {
    services.forEach(v => servicesTargets.push(v.metadata.name))
  }
  if (clusterNode && clusterNode[clusterID]) {
    const { nodes } = clusterNode[clusterID]
    if (nodes.clusters) {
      const { podCount } = nodes.clusters
      podCount.forEach(v => v.name !== '' && nodeTargets.push(v.name))
    }
  }
  return {
    recordFilters: recordFiltersData,
    records: recordsData,
    isFetching: records.isFetching,
    clusterID,
    strategyList,
    appList,
    servicesTargets,
    nodeTargets,
  }
}

export default connect(mapStateToProps, {
  loadRecords,
  loadRecordsFilters,
  deleteRecords,
  loadServiceDetail,
  getHostInfo,
  loadServiceInstance,
  loadAllServices,
  getAllClusterNodes,
  getAlertSetting,
  getSettingList,
  loadAppList,
})(AlarmRecord)
