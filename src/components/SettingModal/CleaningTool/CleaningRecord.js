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
import { Select, Form, DatePicker, Button, Table } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'
import './style/CleaningRecord.less'

const Option = Select.Option
const FormItem = Form.Item

class CleaningRecord extends Component {
  constructor(props) {
    super(props)
    this.disabledStartDate = this.disabledStartDate.bind(this)
    this.onStartChange = this.onStartChange.bind(this)
    this.handleStartToggle = this.handleStartToggle.bind(this)
    this.disabledEndDate = this.disabledEndDate.bind(this)
    this.onEndChange = this.onEndChange.bind(this)
    this.handleEndToggle = this.handleEndToggle.bind(this)
    this.state = {
      startValue: null,
      endValue: null,
      endOpen: false,
    }
  }

  renderLogs(){
    const Array = []
    for(let i = 0; i  < 11; i++){
      const item = {
        key: i,
        time: '2017-2-2',
        status: i,
        type: i,
        fileType: i,
        people: 'dududu'
      }
      Array.push(item)
    }
    return Array
  }

  formatStatus(status){
    switch(status){
      case 1:
        return <span className='success_icon'><i className="fa fa-circle icon_circle" aria-hidden="true"></i>执行成功</span>
      default:
      case 2:
        return <span className='failed_icon'><i className="fa fa-circle icon_circle" aria-hidden="true"></i>执行失败</span>
      case 3:
        return <span className='pending_icon'><i className="fa fa-circle icon_circle" aria-hidden="true"></i>正在执行</span>
    }
  }

  formatType(type){
    switch(type){
      case 1:
        return <span>手动清理</span>
      default:
      case 2:
        return <span>定时清理</span>
    }
  }

  formatFileType(fileType){
    switch(fileType){
      case 1:
        return <div>系统日志</div>
      case 2:
        return <div>监控数据</div>
      case 3:
        return <div>停止容器</div>
      case 4:
        return <div>CI/CD缓存</div>
      case 5:
        return <div>镜像</div>
      default:
        return <div>未知</div>
    }
  }

  disabledStartDate(startValue) {
    if (!startValue || !this.state.endValue) {
      return false;
    }
    return startValue.getTime() >= this.state.endValue.getTime();
  }

  disabledEndDate(endValue) {
    if (!endValue || !this.state.startValue) {
      return false;
    }
    return endValue.getTime() <= this.state.startValue.getTime();
  }

  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  onStartChange(value) {
    this.onChange('startValue', value);
    this.setState({
      startValue: value,
    })
  }

  onEndChange(value) {
    this.onChange('endValue', value);
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

  searchLog(){

  }

  refreshLogList(){

  }

  render() {
    const { form } = this.props
    const { getFieldProps } = form
    const columns = [
      {
        key: 'time',
        dataIndex: 'time',
        title: '清理时间',
        width: '20%',
        sorter: (a, b) => a - b,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: '状态',
        width: '20%',
        render: text => <div>{ this.formatStatus(text) }</div>
      },
      {
        key: 'type',
        dataIndex: 'type',
        title: '清理类型',
        width: '20%',
        render: type => <div>{ this.formatType(type) }</div>
      },
      {
        key: 'fileType',
        dataIndex: 'fileType',
        title: '文件类型',
        width: '20%',
        render: fileType => <div>{ this.formatFileType(fileType) }</div>
      },
      {
        key: 'people',
        dataIndex: 'people',
        title: '清理人',
        width: '20%',
      },
    ]
    return(
      <QueueAnim className='cleaningRecord' type="right">
        <Title title="清理记录"/>
        <div id='cleaning_record' key="cleaningRecord">
          <div className='header'>
            <span
              className="back"
              onClick={() => {browserHistory.push(`/setting/cleaningTool`)}}
            >
              <span className="backjia"></span>
              <span className="btn-back">返回</span>
            </span>
            <span className='title'>清理记录</span>
          </div>
          <div className='body'>
            <div className='filter_box'>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择执行状态'
                  size='large'
                  {...getFieldProps('status')}
                >
                  <Option key="1" value="1">执行成功</Option>
                  <Option key="2" value="2">正在执行</Option>
                  <Option key="3" value="3">执行失败</Option>
                </Select>
              </FormItem>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择文件类型'
                  size='large'
                  {...getFieldProps('file_type')}
                >
                  <Option key="1" value="1">系统日志</Option>
                  <Option key="2" value="2">监控数据</Option>
                  <Option key="3" value="3">CI/CD缓存</Option>
                  <Option key="4" value="4">镜像</Option>
                </Select>
              </FormItem>
              <FormItem className='filter_formItem'>
                <Select
                  className='filter_item'
                  placeholder='请选择清理类型'
                  size='large'
                  {...getFieldProps('clean_type')}
                >
                  <Option key="1" value="1">手动清理</Option>
                  <Option key="2" value="2">定时清理</Option>
                </Select>
              </FormItem>
              <DatePicker
                disabledDate={this.disabledStartDate}
                value={this.state.startValue}
                placeholder="开始日期"
                onChange={this.onStartChange}
                toggleOpen={this.handleStartToggle}
                size="large"
                style={{marginRight: 12, float: 'left', width: 148, marginBottom: 25}}
              />
              <DatePicker
                disabledDate={this.disabledEndDate}
                value={this.state.endValue}
                placeholder="结束日期"
                onChange={this.onEndChange}
                open={this.state.endOpen}
                toggleOpen={this.handleEndToggle}
                size="large"
                style={{marginRight: 12, float: 'left', width: 148,marginBottom: 25}}
              />
              <Button
                icon="exception"
                type="primary"
                size="large"
                onClick={() => this.searchLog()}
                className='button_style'
              >
                立即查询
              </Button>
              <Button
                type="primary"
                size='large'
                onClick={() => this.refreshLogList()}
                className='button_style'
              >
                刷新
              </Button>
              {
                true
                ? <div className='totle_num'>共计 <span>11</span> 条</div>
                : null
              }
            </div>
            <div style={{clear: 'both'}}></div>
            <div className='table_box'>
              <Table
                dataSource={this.renderLogs()}
                columns={columns}
                loading={false}
                pagination={{ simple: true }}
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

  return {

  }
}

export default connect(mapStateToProp, {

})(CleaningRecord)