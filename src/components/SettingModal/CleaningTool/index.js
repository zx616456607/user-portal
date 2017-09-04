/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cleaning Tool component
 *
 * v0.1 - 2017-8-31
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Tabs, Select, Form, Button, Modal, Icon, InputNumber, Row, Col, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import Title from '../../Title'
import CleaningToolImg from '../../../../static/img/setting/cleaningTool.png'
import StepsImg from '../../../../static/img/setting/steps.png'
import Accomplish from '../../../../static/img/setting/accomplish.png'
import ForbidImg from '../../../../static/img/setting/forbid.png'
import PendingImg from '../../../../static/img/setting/pending.png'
import NotificationHandler from '../../../components/Notification'
import ReactEcharts from 'echarts-for-react'
import classNames from 'classnames'

const TabPane = Tabs.TabPane
const Option = Select.Option
const FormItem = Form.Item

class CleaningTool extends Component {
  constructor(props) {
    super(props)
    this.renderLogsList = this.renderLogsList.bind(this)
    this.state = {
      systemLog: false,
      confirmLoading: false,
      cleanSystemLogDone: false,
      editMonitoringData: false,
      mirrorImageEdit: true,
      accomplish: true,
      pending: false,
      forbid: false,
    }
  }

  cleaningSystemLog(){
    const { form } = this.props
    this.setState({
      confirmLoading: false,
    })
    const validateArray = ['systemLogTime']
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      this.setState({
        systemLog: true,
      })
    })
  }

  confirmCleanSystemLog(){
    const { form } = this.props
    const time = form.getFieldValue("systemLogTime")
    this.setState({
      confirmLoading: false,
      systemLog: false,
      cleanSystemLogDone: true,
    })
  }

  cancelEditMonitoringData(){
    this.setState({
      editMonitoringData: false,
    })
  }

  saveEditMonitoringData(){
    this.setState({
      editMonitoringData: false,
    })
  }

  cleaningStopContainer(){
    const { form } = this.props
    const validateArray = ['stopContainer']
    form.validateFields(validateArray, (errors) => {
      if(!!errors){
        return
      }
      this.setState({
        systemLog: true
      })
    })
  }

  cleaningCache(){
    const { form } = this.props
    const validateArray = ['cache']
    form.validateFields(validateArray, errors => {
      if(!!errors){
        return
      }
      this.setState({
        systemLog: true
      })
    })
  }

  saveMirrorImage(){
    const { accomplish, pending, forbid } = this.state 
    const { form } = this.props

    if(accomplish){
      form.setFieldsValue({
        'pendingTime': 1
      })
      this.setState({
        mirrorImageEdit: true,
      })
      return
    }
    if(pending){
      const time = form.getFieldValue('pendingTime')
      this.setState({
        mirrorImageEdit: true,
      })
      return
    }
    form.setFieldsValue({
      'pendingTime': 1
    })
    this.setState({
      mirrorImageEdit: true,
    })
  }

  renderLogsList(){
    const array = []
    for(let i = 0; i < 5; i++){
      let item = {
        key: i,
        logs: '上次清理1233MB垃圾',
        time: '8-28'
      }
      array.push(item)
    }
    const logs = array.map((item, index) => {
      return <Tooltip title={item.logs} placement="topLeft" key={`toolip${index}`}>
        <div className='item' key={`logs${item.key}`}>{item.logs}</div>
      </Tooltip>
    })
    const times = array.map(item => {
      return <div className='time_item'>{item.time}</div>
    })
    return { logs, times}
  }

  cleaningMirrorImage(type){
    switch(type){
      case 'pending':
        this.setState({
          accomplish: false,
          pending: true,
          forbid: false,
          mirrorImageEdit: false,
        })
        return
      case 'forbid':
        this.setState({
          accomplish: false,
          pending: false,
          forbid: true,
          mirrorImageEdit: false,
        })
        return
      default:
      case 'accomplish':
        this.setState({
          accomplish: true,
          pending: false,
          forbid: false,
          mirrorImageEdit: false,
        })
        return
    }
  }

  render() {
    const {
      cleanSystemLogDone, editMonitoringData,
      accomplish, pending,
      forbid, mirrorImageEdit,
    } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    const option = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          data : ['系统日志', '监控数据', '停止容器', '镜像', 'CI/CD缓存'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'最近清除',
          type:'bar',
          barWidth: '40px',
          data:[10, 52, 200, 334, 5000]
        }
      ]
    };
    const accomplishProps = classNames({
      'until_done': true,
      'selected_style': accomplish
    })
    const pendingProps = classNames({
      'duration': true,
      'selected_style': pending,
    })
    const forbidProps = classNames({
      'forbiden_use': true,
      'selected_style': forbid,
    })
    return(
      <QueueAnim className='cleaningTool' type="right">
        <Title title="清理工具"/>
        <div id='cleaning_tool' key="cleaning_tool">
          <div className='tool_header'>
            清理工具
          </div>
          <div className='tool_tabs'>
            <Tabs
              tabBarExtraContent={<Button
                type="ghost"
                size="large"
                style={{margin: '12px 20px 0 0'}}
                onClick={() => browserHistory.push(`/setting/cleaningTool/timingClean`)}
              >
                定时清理
              </Button>}
            >
              <TabPane tab="系统日志" key="systemLog">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                {
                  cleanSystemLogDone
                  ? <div className='done_box'>
                      <div className='tips'>
                        清理完成，此次清理 <span className='number'>1256</span> MB，查看 <span className='log'>清理记录</span>
                      </div>
                        <Button size="large" type="primary" onClick={() => this.setState({cleanSystemLogDone: false})}>完成</Button>
                    </div>
                  : <div className='handle_box'>
                    <div className='tips'>您可以根据数据时效选择需要清理的文件范围!</div>
                    <FormItem className='time_select'>
                      <Select
                        placeholder="选择删除系统日志时间"
                        size="large"
                        className='select_box'
                        {...getFieldProps('systemLogTime',{
                          rules: [{required: true, message: '请选择删除系统日志时间'}]
                        })}
                      >
                        <Option key="0" value="0">清除所有数据</Option>
                        <Option key="1" value="1">清除1天前数据</Option>
                        <Option key="2" value="2">清除3天前数据</Option>
                        <Option key="3" value="3">清除7天前数据</Option>
                        <Option key="4" value="4">清除15天数据</Option>
                        <Option key="5" value="5">清除1月前数据</Option>
                        <Option key="6" value="6">清除3月前数据</Option>
                      </Select>
                    </FormItem>
                    <div>
                      <Button size="large" type="primary" onClick={() => this.cleaningSystemLog()}>清理</Button>
                    </div>
                  </div>
                }
              </TabPane>
              <TabPane tab="监控数据" key="monitoringData">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以根据数据时效配置数据保留时间！</div>
                  <FormItem className='time_select'>
                    <Select
                      placeholder="选择数据保留时间"
                      size="large"
                      className='select_box'
                      disabled={!editMonitoringData}
                      {...getFieldProps('monitoringDataTime',{
                        initialValue: "0",
                        rules: [{required: true, message: '请选择数据保留时间'}],
                      })}
                    >
                      <Option key="0" value="0">保留7天</Option>
                      <Option key="1" value="1">保留15天</Option>
                      <Option key="2" value="2">保留30天</Option>
                      <Option key="3" value="3">保留60天</Option>
                      <Option key="4" value="4">永久保留</Option>
                    </Select>
                  </FormItem>
                  <div>
                    {
                      editMonitoringData
                      ? <div>
                          <Button
                            size="large"
                            onClick={() => this.cancelEditMonitoringData()}
                            style={{marginRight: 8}}
                          >
                            取消
                          </Button>
                          <Button
                            size="large"
                            type="primary"
                            onClick={() => this.saveEditMonitoringData()}
                          >
                            保存
                          </Button>
                        </div>
                      : <Button
                          size="large"
                          type="primary"
                          onClick={() => this.setState({editMonitoringData: true})}
                        >
                          编辑
                        </Button>
                    }
                  </div>
                </div>
              </TabPane>
              <TabPane tab="停止容器" key="stopContainer">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以根据选择清理未正常运行的容器!</div>
                  <FormItem className='time_select'>
                    <Select
                      placeholder="请选择要停止的容器"
                      size="large"
                      className='select_box'
                      {...getFieldProps('stopContainer',{
                        rules: [{required: true, message: '请选择要停止的容器'}]
                      })}
                    >
                      <Option key="0" value="0">pending超时</Option>
                      <Option key="1" value="1">已经停止</Option>
                      <Option key="2" value="2">不断重启</Option>
                      <Option key="3" value="3">全选</Option>
                    </Select>
                  </FormItem>
                  <div>
                    <Button size="large" type="primary" onClick={() => this.cleaningStopContainer()}>清理</Button>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="CI/CD缓存" key="cache">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以根据数据时效选择需要清理的文件范围!</div>
                  <FormItem className='time_select'>
                    <Select
                      placeholder="请选择删除缓存时间"
                      size="large"
                      className='select_box'
                      {...getFieldProps('cache',{
                        rules: [{required: true, message: '请选择删除缓存时间'}]
                      })}
                    >
                      <Option key="0" value="0">清除所有数据</Option>
                      <Option key="1" value="1">清除1天前数据</Option>
                      <Option key="2" value="2">清除3天前数据</Option>
                      <Option key="3" value="3">清除7天前数据</Option>
                      <Option key="4" value="4">清除15天数据</Option>
                      <Option key="5" value="5">清除1月前数据</Option>
                      <Option key="6" value="6">清除3月前数据</Option>
                    </Select>
                  </FormItem>
                  <div>
                    <Button size="large" type="primary" onClick={() => this.cleaningCache()}>清理</Button>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="镜像" key="mirrorImage">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以在存储后端运行垃圾回收来移除无标签镜像!</div>
                  <div>删除镜像</div>
                  <div className='image_time_picker_box'>
                    <div
                      className={accomplishProps}
                      onClick={() => this.cleaningMirrorImage('accomplish')}
                    >
                      <img src={Accomplish} alt="" className='img_style'/>
                      直到完成
                      {
                        accomplish && <div className='check_container'>
                        <i className="fa fa-check check_icon" aria-hidden="true"></i>
                      </div>
                      }
                    </div>
                    <div
                      className={pendingProps}
                      onClick={() => this.cleaningMirrorImage('pending')}
                    >
                      <img src={PendingImg} alt="" className='img_style'/>
                      持续
                      <InputNumber
                        min={1}
                        style={{width: '55px', margin: '0 4px'}}
                        {...getFieldProps('pendingTime', {
                          initialValue: 1
                        })}
                      />
                      分钟
                      {
                        pending && <div className='check_container'>
                          <i className="fa fa-check check_icon" aria-hidden="true"></i>
                        </div>
                      }
                    </div>
                    <div
                      className={forbidProps}
                      onClick={() => this.cleaningMirrorImage('forbid')}
                    >
                      <img src={ForbidImg} alt="" className='img_style'/>
                      禁止使用
                      {
                        forbid && <div className='check_container'>
                          <i className="fa fa-check check_icon" aria-hidden="true"></i>
                        </div>
                      }
                    </div>
                  </div>
                  <div className='checkBox'></div>
                  <div>
                    <Button
                      size="large"
                      type="primary"
                      disabled={mirrorImageEdit}
                      onClick={() => this.saveMirrorImage()}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>

          <div className='tool_echarts'>
            <Row>
              <Col span="16">
                <div className='left_box'>
                  <div className='header'>最近一次清理详情</div>
                  <div style={{width: '100%', height: '280px'}}>
                    <ReactEcharts
                      option={option}
                      style={{ height: '280px'}}
                    />
                  </div>
                </div>
              </Col>
              <Col span="8" className='right_box_col'>
                <div className='right_box'>
                  <div className='header'>成就清单</div>
                  <div className='logs_list'>
                    <div className='image_box'>
                      <img src={StepsImg} alt=""/>
                    </div>
                    <div className='logs'>
                      <Row>
                        <Col span="14">
                          { this.renderLogsList().logs }
                        </Col>
                        <Col span="10">
                          { this.renderLogsList().times}
                        </Col>
                      </Row>
                    </div>
                  </div>
                  <div className='log_record'>
                    <span
                      className='go_record'
                      onClick={() => browserHistory.push(`/setting/cleaningTool/cleaningRecord`)}
                    >
                      清理记录>>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Modal
            title="确认清理"
            visible={this.state.systemLog}
            closable={true}
            onOk={() => this.confirmCleanSystemLog()}
            onCancel={() => this.setState({ systemLog: false })}
            width="570px"
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="cleanTool_systemLog"
          >
            <div>
              <Icon type="question-circle-o" className='icon_margin'/>数据清除之后无法恢复，是否确认清理？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

CleaningTool = Form.create({})(CleaningTool)

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(CleaningTool)