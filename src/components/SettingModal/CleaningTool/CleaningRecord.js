/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cleaning Record component
 *
 * v0.1 - 2017-9-1
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Select, Form, DatePicker, Button, Table, Timeline, Row, Col, Pagination, Modal } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'
import './style/CleaningRecord.less'
import {
  getCleanLogs, getSystemCleanLogs, cleanLogsFlush
} from '../../../actions/clean'
import { formatDate } from '../../../common/tools'
import flattenDeep from 'lodash/flattenDeep'
import Notification from '../../Notification'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm;

class CleaningRecord extends Component {
  constructor(props) {
    super(props)
    this.disabledStartDate = this.disabledStartDate.bind(this)
    this.onStartChange = this.onStartChange.bind(this)
    this.handleStartToggle = this.handleStartToggle.bind(this)
    this.disabledEndDate = this.disabledEndDate.bind(this)
    this.onEndChange = this.onEndChange.bind(this)
    this.handleEndToggle = this.handleEndToggle.bind(this)
    this.selectFilter = this.selectFilter.bind(this)
    this.searchLogs = this.searchLogs.bind(this)
    this.state = {
      startValue: null,
      endValue: null,
      endOpen: false,
      cleanLogs: [],
      totalCount: 0,
      currentPage: 1,
      sort: 'd,create_time',
      filter: '',
      createTimeSort: false,
      tableLoading: false
    }
  }
  componentWillMount() {
    const { type, form } = this.props
    if (type === 'system') {
      form.setFieldsValue({
        target: 'system_clean'
      })
      this.getSystemLogs()
      return
    }
    form.setFieldsValue({
      target: 'cicd_clean'
    })
    this.getCleanLogs()
  }
  getCleanLogs(loading) {
    const { currentPage, sort, startValue, endValue } = this.state
    const { getCleanLogs, form } = this.props
    const { getFieldsValue } = form
    const { status, type } = getFieldsValue(['status', 'type'])
    let newStatus = status === 'allStatus' ? '' : status
    let newType = type === 'allTypes' ? '' : type
    this.setState({
      tableLoading: true
    })
    getCleanLogs({
      sort,
      type: newType,
      status: newStatus,
      start: startValue && formatDate(startValue),
      end: endValue && formatDate(endValue),
      from: (currentPage - 1) * 10,
      size: 10,
    }, {
      success: {
        func: res => {
          this.setState({
            cleanLogs: res.data.body,
            totalCount: res.data.meta.total,
            [loading]: false,
            tableLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            cleanLogs: [],
            totalCount: 0,
            [loading]: false,
            tableLoading: false
          })
        },
        isAsync: true
      }
    })
  }
  getSystemLogs(loading) {
    const { currentPage, startValue, endValue, sort } = this.state
    const { getSystemCleanLogs, form } = this.props
    const { getFieldsValue } = form
    const { status, type } = getFieldsValue(['status', 'type'])
    let newStatus = status === 'allStatus' ? '' : status
    let newType = type === 'allTypes' ? '' : type
    let query = {}
    sort ? query = Object.assign(query, {sort}) : ''
    let body = {status: newStatus, type: newType, from: (currentPage - 1) * 10, size: 10}
    startValue ? body = Object.assign(body, {start: formatDate(startValue)}): ''
    endValue ? body = Object.assign(body, {end: formatDate(endValue)}) : ''
    this.setState({
      tableLoading: true
    })
    getSystemCleanLogs(query, body, {
      success: {
        func: res => {
          this.setState({
            cleanLogs: res.data.data,
            totalCount: res.data.total,
            [loading]: false,
            tableLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            cleanLogs: [],
            totalCount: 0,
            [loading]: false,
            tableLoading: false
          })
        },
        isAsync: true
      }
    })
  }
  getText(status) {
    switch(status) {
      case 'success':
        return '执行成功'
      case 'failed':
        return '执行失败'
      case 'timeout':
        return '执行超时'
      case 'running':
        return '正在执行'
    }
  }
  formatStatus(status, flag){
    return (
      <span className={`${status}_icon`}>
        {flag && <i className="fa fa-circle icon_circle" aria-hidden="true"/>}
        {this.getText(status)}
      </span>
    )
  }

  formatType(type){
    switch(type){
      case 'manual':
        return '手动清理'
      case 'auto':
        return '定时清理'
      // case 'stop':
      //   return '停止清理'
    }
  }

  formatFileType(fileType){
    switch(fileType){
      case 'systemlog_clean':
        return <div>服务日志</div>
      /*case 2:
        return <div>监控数据</div>
      case 3:
        return <div>停止容器</div>*/
      case 'cicd_clean':
        return <div>CI/CD缓存</div>
      /*case 5:
        return <div>镜像</div>*/
      default:
        return <div>未知</div>
    }
  }

  disabledStartDate(startValue) {
    const disFea = startValue.getTime() > Date.now()
    if (!startValue || !this.state.endValue) {
      return disFea || false
    }
    return startValue.getTime() >= this.state.endValue.getTime() || disFea
  }

  disabledEndDate(endValue) {
    const disFea = endValue.getTime() > Date.now()
    if (!endValue || !this.state.startValue) {
      return disFea || false
    }
    return endValue.getTime() <= this.state.startValue.getTime() || disFea
  }


  onStartChange(value, dateString) {
    this.selectFilter('start', String(dateString))
    this.setState({
      startValue: value,
    })
  }

  onEndChange(value, dateString) {
    this.selectFilter('end', dateString)
    this.setState({
      endValue: value,
    })
  }

  handleStartToggle({ open }) {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndToggle({ open }) {
    this.setState({ endOpen: open });
  }

  refreshLogList(){
    const { form } = this.props
    const { resetFields, getFieldValue } = form
    const target = getFieldValue('target')
    resetFields(['status', 'type'])
    this.setState({
      sort: 'd,create_time',
      filter: '',
      startValue: null,
      endValue: null,
      createTimeSort: undefined,
      currentPage: 1,
      freshBtnLoading: true
    }, () => {
      if (target === 'system_clean') {
        this.getSystemLogs('freshBtnLoading')
      } else {
        this.getCleanLogs('freshBtnLoading')
      }
    })
  }
  onTableChange(pagination) {
    const { getFieldValue } = this.props.form
    const logType = getFieldValue('target')
    this.setState({
      currentPage: pagination
    }, () => {
      logType === 'cicd_clean' && this.getCleanLogs()
      logType === 'system_clean' && this.getSystemLogs()
    })
  }
  getSort(flag, sort) {
    let str = 'a,'
    if (flag) {
      str = 'd,'
    }
    return str + sort
  }
  handleSort(sortStr){
    const { createTimeSort } = this.state
    const { getFieldValue } = this.props.form
    const logType = getFieldValue('target')
    const sort = this.getSort(createTimeSort, sortStr)
    this.setState({
      createTimeSort: !createTimeSort,
      sort
    }, () => {
      logType === 'cicd_clean' && this.getCleanLogs()
      logType === 'system_clean' && this.getSystemLogs()
    })
  }
  selectFilter(opt, target) {
    const { filter } = this.state
    let newFilter
    newFilter = filter ? `${filter},${opt},${target}` : `${opt},${target}`
    this.setState({
      filter: newFilter,
      [opt]: target
    }, () => {
      if (opt === 'target') {
        if (target === 'cicd_clean') {
          this.getCleanLogs()
        } else {
          this.getSystemLogs()
        }
      }
    })
  }
  selectLogType(value) {
    this.setState({
      currentPage: 1
    })
    this.selectFilter('target', value)
  }
  searchLogs() {
    this.setState({
      currentPage: 1
    }, () => {
      const { getFieldValue } = this.props.form
      const logType = getFieldValue('target')
      this.setState({
        searchBtnLoading: true
      })
      if (logType === 'cicd_clean') {
        this.getCleanLogs('searchBtnLoading')
        return
      }
      this.getSystemLogs('searchBtnLoading')
    })
  }
  renderExpand(record) {
    const { getFieldValue } = this.props.form
    const logType = getFieldValue('target')
    const isCicd = logType === 'cicd_clean'
    const colorOpt = {
      success: 'green',
      failed: 'red',
      running: '#0b9eeb',
      timeout: '#fab163'
    }
    let nodeArr = []
    if (isCicd) {
      record.detail.forEach(item => {
        item.nodes && nodeArr.push(Object.values(item.nodes))
      })
      nodeArr = flattenDeep(nodeArr)
    } else {
      nodeArr = record.detail
    }
    return(
      <Timeline>
        {
          nodeArr.map(item =>
            <Timeline.Item key={item.name} color={colorOpt[item.status]}>
              <Row className="nodeItem">
                <Col span={8}>{item.name}</Col>
                <Col span={8}>{this.formatStatus(item.status)}</Col>
                {
                  isCicd ?
                    <Col span={8}>{`已清理：${((item.total - item.remain) / (1024 * 1024)).toFixed(2)}MB`}</Col>
                    :
                    <Col span={8}>{`已清理：${item.total}个文件`}</Col>
                }

              </Row>
            </Timeline.Item>
          )
        }
      </Timeline>
    )
  }
  showDeleteModal() {
    const { cleanLogsFlush, userName } = this.props
    let notify = new Notification()
    confirm({
      title: '清空清理记录后无法恢复，确定删除？',
      onOk: () => {
        notify.spin('删除清理记录中')
        cleanLogsFlush({
          cicd_clean:{
            meta: {
              automatic: true,
              cleaner: userName,
              target: "cicd_clean",
              type: 'clean-records'
            },
            spec: {
              cron: "0 0 0 0 ?",
              scope: 0
            }
          }
        }, {
          success: {
            func: () => {
              notify.close()
              notify.success('删除清理记录成功')
              this.searchLogs()
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notify.close()
              notify.error('删除清理记录失败')
            }
          }
        })
      },
      onCancel() {},
    });
  }
  render() {
    const { form } = this.props
    const { cleanLogs, totalCount, createTimeSort, currentPage, freshBtnLoading, searchBtnLoading, tableLoading } = this.state
    const { getFieldProps, getFieldValue } = form
    const pagination = {
      simple: true,
      total: totalCount,
      current: currentPage,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: this.onTableChange.bind(this)
    }
    const columns = [
      {
        title: (
          <div onClick={() => this.handleSort('create_time')}>
            清理时间
            <div className="ant-table-column-sorter">
            <span
              className={createTimeSort === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
              title="↑">
              <i className="anticon anticon-caret-up"/>
            </span>
              <span
                className={createTimeSort === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
                title="↓">
              <i className="anticon anticon-caret-down"/>
            </span>
            </div>
          </div>
        ),
        key: 'createTime',
        dataIndex: 'createTime',
        width: '20%',
        render: text => formatDate(text)
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: '状态',
        width: '20%',
        render: text => this.formatStatus(text, true)
      },
      {
        key: 'type',
        dataIndex: 'type',
        title: '清理类型',
        width: '20%',
        render: type => this.formatType(type)
      },
      {
        key: 'target',
        dataIndex: 'target',
        title: '文件类型',
        width: '20%',
        render: target => this.formatFileType(target)
      },
      {
        key: 'cleaner',
        dataIndex: 'cleaner',
        title: '清理人',
        width: '20%',
      },
    ]
    const target = getFieldValue('target')
    return(
      <QueueAnim className='cleaningRecord' type="right">
        <Title title="清理记录"/>
        <div id='cleaning_record' key="cleaningRecord">
          <div className='header'>
            <span
              className="back"
              onClick={() => {browserHistory.push(`/setting/cleaningTool`)}}
            >
              <span className="backjia"/>
              <span className="btn-back">返回</span>
            </span>
            <span className='title'>清理记录</span>
          </div>
          <div className='body'>
            <div className='filter_box'>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择文件类型'
                  size='large'
                  {...getFieldProps('target', {
                    initialValue: 'system_clean',
                    onChange: value => this.selectLogType(value)
                  })}
                >
                  <Option key="system_clean" value="system_clean">服务日志</Option>
                  {/*<Option key="2" value="2">监控数据</Option>*/}
                  <Option key="cicd_clean" value="cicd_clean">CI/CD缓存</Option>
                  {/*<Option key="4" value="4">镜像</Option>*/}
                </Select>
              </FormItem>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择执行状态'
                  size='large'
                  {...getFieldProps('status', {
                    onChange: value => this.selectFilter('status', value)
                  })}
                >
                  <Option key="allStatus" value="allStatus">所有状态</Option>
                  <Option key="success" value="success">执行成功</Option>
                  <Option key="running" value="running">正在执行</Option>
                  <Option key="timeout" value="timeout">执行超时</Option>
                  <Option key="failed" value="failed">执行失败</Option>
                </Select>
              </FormItem>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择清理类型'
                  size='large'
                  {...getFieldProps('type', {
                    onChange: value => this.selectFilter('type', value)
                  })}
                >
                  <Option key="allTypes" value="allTypes">所有类型</Option>
                  <Option key="manual" value="manual">手动清理</Option>
                  <Option key="auto" value="auto">定时清理</Option>
                </Select>
              </FormItem>
              <FormItem className='filter_formItem' style={{width:'auto'}}>
                <DatePicker
                  showTime
                  format="yyyy-MM-dd HH:mm:ss"
                  disabledDate={this.disabledStartDate}
                  value={this.state.startValue}
                  placeholder="开始日期"
                  onChange={this.onStartChange}
                  toggleOpen={this.handleStartToggle}
                  size="large"
                />
              </FormItem>
              <FormItem className='filter_formItem' style={{width:'auto'}}>
                <DatePicker
                  showTime
                  format="yyyy-MM-dd HH:mm:ss"
                  disabledDate={this.disabledEndDate}
                  value={this.state.endValue}
                  placeholder="结束日期"
                  onChange={this.onEndChange}
                  open={this.state.endOpen}
                  toggleOpen={this.handleEndToggle}
                  size="large"
                />
              </FormItem>
              <FormItem className='filter_formItem' style={{width:'auto'}}>
                <Button
                  icon="exception"
                  type="primary"
                  size="large"
                  onClick={this.searchLogs}
                  className='button_style'
                  loading={searchBtnLoading}
                >
                  立即查询
                </Button>
              </FormItem>
              <FormItem className='filter_formItem' style={{width:'auto'}}>
                <Button
                  size='large'
                  onClick={this.refreshLogList.bind(this)}
                  className='button_style refreshBtn'
                  loading={freshBtnLoading}
                >
                  <i className='fa fa-refresh'/> 刷 新
                </Button>
              </FormItem>
              <FormItem className='filter_formItem' style={{width:'auto'}}>
                <Button
                  size="large"
                  className="deleteBtn"
                  onClick={this.showDeleteModal.bind(this)}
                >
                  <i className="fa fa-trash-o"/> 清空所有记录
                </Button>
              </FormItem>
              { totalCount !== 0 && <Pagination {...pagination}/>}
              { totalCount !== 0 && <div className='totle_num'>共计 <span>{totalCount}</span> 条</div>}
            </div>
            <div style={{clear: 'both'}}/>
            <div className='table_box'>
              <Table
                loading={tableLoading}
                dataSource={cleanLogs}
                columns={columns}
                expandedRowRender={(record => record.detail && record.detail.length && this.renderExpand(record))}
                pagination={false}
                rowKey={record => record.id}
              />
            </div>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

CleaningRecord = Form.create()(CleaningRecord)

function mapStateToProp(state, props) {
  const { loginUser } = state.entities
  const { location } = props
  const { type } = location.query
  const { info } = loginUser
  const { userName } = info
  return {
    userName,
    type
  }
}

export default connect(mapStateToProp, {
  getCleanLogs,
  getSystemCleanLogs,
  cleanLogsFlush
})(CleaningRecord)