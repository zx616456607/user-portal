/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer health examination component
 *
 * v0.1 - 2017-7-21
 * @author ZhangChengZheng
 * update by baiyu 2017-12-21
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal, InputNumber, message } from 'antd'
import { connect } from 'react-redux'
import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'
import {
  loadopenstackLbHealthcheckList,
  createopenstackLbHealthcheck,
  deleteopenstackLbHealthcheck,
  searchHealthCheck,
} from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'

class HealthExamination extends Component {
  constructor(props) {
    super(props)
    this.selectTableRow = this.selectTableRow.bind(this)
    this.confirmCreateAlarm = this.confirmCreateAlarm.bind(this)
    this.openCreateModal = this.openCreateModal.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.getVadcID = this.getVadcID.bind(this)
    this.refreshLoadList = this.refreshLoadList.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.state = {
      selectedRowKeys: [],
      addAlarmVisible: false,
      confirmLoading: false,
      deleteVisible: false,
      currentItem: {}
    }
  }

  componentWillMount() {
    this.refreshLoadList()
  }

  getVadcID(){
    const { location } = this.props
    const { pathname } = location
    const pathnameArray = pathname.split('/')
    let vadcID = pathnameArray[pathnameArray.length - 1]
    return vadcID
  }

  searchInput(){
    const { searchHealthCheck } = this.props
    let value = this.state.healthCheckSearch
    let vadcID = this.getVadcID()
    searchHealthCheck(vadcID, value)
  }

  formatStatus(status) {
    if (status) {
      status = status.toLocaleUpperCase()
    }
    switch(status){
      case 'ERROR':
        return <span className='stop'>错误</span>
      case 'ACTIVE':
        return <span className='running'>已启动</span>
      case 'CONNECTED':
        return <span className='running'>已连接</span>
      case 'BUILD': {
        return <span className='padding'>创建中</span>
      }
      case 'SHUTOFF':
        return <span className='padding'>停止</span>
      case 'UNKNOWN':
      default:
        return <span style={{color: '#999'}}>未知</span>
    }
  }

  selectTableRow(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    })
  }

  confirmCreateAlarm() {
    const { form, createopenstackLbHealthcheck,params } = this.props
    form.validateFields( (errors,values) => {
      if(!!errors){
        return
      }
      const Noti = new NotificationHandler()
      const vadcsID = this.getVadcID()
      const body = {
        health_check:{
          'name': values.healthName,
          "method": values.loadBanlancer,
          "timeout": values.timeout,
          "retry": values.repetitionCount,
          "interval": values.testinterval,
        }
      }
      this.setState({
        confirmLoading: true
      })
      if (values.loadBanlancer === 'icmp') {
        delete body.port
      }
      createopenstackLbHealthcheck(vadcsID, body,{
        success: {
          func: () => {
            Noti.success('添加健康检查成功')
            this.refreshLoadList()
            this.setState({
              confirmLoading: false,
              addAlarmVisible: false,
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              confirmLoading: false,
            })
            let message = ''
            message = res.message || res.mes
            Noti.error('添加失败',message)
          }
        }
      })
    })
  }

  openCreateModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      confirmLoading: false,
      addAlarmVisible: true,
    })
    setTimeout(()=> {
      document.getElementById('healthName').focus()
    },400)
  }

  editHealthExamination(record){
    const { form } = this.props
    this.setState({
      currentItem: record,
    })
  }

  deleteHealthExamination(record){
    this.setState({
      deleteVisible: true,
      currentItem: record,
    })
  }

  confirmDelete(){
    const { deleteopenstackLbHealthcheck } = this.props
    const { currentItem } = this.state
    const vadcsID = this.getVadcID()
    const Noti = new NotificationHandler()
    this.setState({confirmLoading: true})
    deleteopenstackLbHealthcheck(vadcsID, currentItem.name, {
      success: {
        func: (res) => {
          if(!res.success){
            this.setState({
              confirmLoading: false,
            })
            let message = ''
            message = res.message || res.mes
            Noti.error('删除失败',message)
            return
          }
          this.refreshLoadList()
          Noti.success('删除成功')
          this.setState({
            confirmLoading: false,
            deleteVisible: false,
          })
        },
        isAsync: true,
      },
      false: {
        func: (res) => {
          this.setState({
            confirmLoading: false,
          })
          let message = ''
          message = res.message || res.mes
          Noti.error('删除失败',message)
        }
      }
    })
  }

  refreshLoadList(e){
    const { loadopenstackLbHealthcheckList } = this.props
    let vadcID = this.getVadcID()
    loadopenstackLbHealthcheckList(undefined, vadcID, {
      failed: {
        func:(res)=> {
          let message = res.message || res.msg
          new NotificationHandler().warn(message)
        }
      },
      finally: {
        func: () => {
          if (e) {
            this.setState({healthCheckSearch:''})
          }
        }
      }
    })
  }

  render() {
    const { selectedRowKeys } = this.state
    const { healthCheckList, location, healthCheckNameArray, form } = this.props
    const query = location.query
    const status = query.status || ""
    const { getFieldProps,getFieldValue } = form
    const vadcsID = this.getVadcID()
    let column = [{
      title: '名称',
      dataIndex: 'name',
      width: '30%',
      render: (text) => <div>{text}</div>
    },{
      title: '协议',
      dataIndex: 'method',
      //width: '11%',
      width: '15%',
      render: (text) => <div>{text.toLocaleUpperCase()}</div>
    },{
      title: '超时时间',
      dataIndex: 'timeout',
      width: '10%',
      render: (text) => <div>{text} s</div>
    },{
      title: '重试次数',
      dataIndex: 'retry',
      //width: '10%',
      width: '10%',
      render: (text) => <div>{text}</div>
    },{
      title: '健康检查间隔',
      dataIndex: 'interval',
      width: '15%',
      render: (text) => <div>{text} s</div>
    },
    //  {
    //  title: '服务池',
    //  dataIndex: 'service',
    //  width: '11%',
    //  render: (text) => <div>{text}</div>
    //},
    {
      title: '操作',
      width: '20%',
      render: (text,record,index) => <div>
        {/*<Button type="primary" className='editButton' onClick={this.editHealthExamination.bind(this, record)}>修改</Button>*/}
        <Button onClick={this.deleteHealthExamination.bind(this, record)}>删除</Button>
      </div>
    }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectTableRow
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }
    const healthNameProps = getFieldProps('healthName',{
      rules: [{
        validator: function(rule, value, callback){
          if(!value){
            return callback('健康检查名称不能为空')
          }
          if(value.length < 3 || value.length > 32){
            return callback('长度为3～32个字符')
          }
          if(!/^[a-zA-Z0-9]{1}[A-Za-z0-9_]{1,30}[a-zA-Z0-9]+$/.test(value)){
            return callback("以字母数字开头和结尾，中间可下划线")
          }
          for(let i = 0; i < healthCheckNameArray.length; i++){
            if(healthCheckNameArray[i].toLocaleUpperCase() == value.toLocaleUpperCase()){
              return callback('健康检查名称已存在')
            }
          }
          return callback()
        }
      }]
    })
    const timeoutProps = getFieldProps('timeout',{
      rules: [{ required: true,message: '响应超时时间不能为空' }]
    })
    const repetitionCountProps = getFieldProps('repetitionCount',{
      rules: [{ required: true,message: '重试次数不能为空' }]
    })
    const testintervalProps = getFieldProps('testinterval',{
      rules: [{ required: true,message: '健康检查间隔不能为空' }]
    })
    const loadBalancerProps = getFieldProps('loadBanlancer',{
      rules: [{ required: true,message: '前端协议不能为空' }],
      initialValue:'icmp'
    })
    // let hasPort = true
    // let prototype = form.getFieldValue('loadBanlancer')
    // if (prototype === 'icmp' || prototype === 'http') {
    //   hasPort = false
    // }
    // const portProps = getFieldProps('port',{
    //   rules: [{ required: hasPort,message: '端口不能为空' }]
    // })
    return (
      <QueueAnim type="right">
        <Title title="健康检查"/>
        <div id='load_balancer_detail' key="load_balancer_health_check_detail">
          <div className='detail_header'>
          <span className="back" onClick={() => browserHistory.goBack()}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
          </div>
          <div className='detailHeaderBox'>
            <div className='leftBox'>
              <img src={newworkImg} className='imgBox'/>
            </div>
            <div className='rightBox'>
              <div className='name'>{ vadcsID }</div>
              <div className='status'>运行状态: <span>{this.formatStatus(status)}</span></div>
              {/*<div className='type'>类型: <span>全局负载均衡</span></div>*/}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="detailBodyBox wrap-page">
            <div className='handleBox page-header'>
              <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
                <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>
                添加健康检查
              </Button>
              <Button className='buttonMarign' size="large" onClick={()=> this.refreshLoadList(true)}>
                <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>
                刷新
              </Button>
              {/*<Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}*/}
              {/*disabled={!selectedRowKeys.length}>*/}
              {/*<i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>*/}
              {/*删除*/}
              {/*</Button>*/}
              <div className='searchDiv'>
                <Input placeholder='请输入名称搜索' value={this.state.healthCheckSearch} onChange={(e)=> this.setState({healthCheckSearch:e.target.value})} onPressEnter={this.searchInput} className='searchBox' size="large"/>
                <i className="fa fa-search btn-search" aria-hidden="true" onClick={this.searchInput}></i>
              </div>
              {
                healthCheckList.result.length >0
                  && <div className='totleNum'>
                    共计 { healthCheckList.result.length } 条
                  </div>
              }
            </div>
            <Table
              dataSource={healthCheckList.result}
              columns={column}
              //rowSelection={rowSelection}
              loading={healthCheckList.isFecthing}
              pagination={{ simple: true }}
              className="reset-ant-table"
            />
          </div>
          <Modal
            title="添加健康检查"
            visible={this.state.addAlarmVisible}
            closable={true}
            onOk={this.confirmCreateAlarm}
            onCancel={() => this.setState({ addAlarmVisible: false })}
            width='570px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="addAlarmModal"
          >
            <Form>
              <Form.Item
                {...formItemLayout}
                label={<span>健康检查名称</span>}
              >
                <Input placeholder='请输入健康检查名称' {...healthNameProps}/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>前端协议【端口】</span>}
              >
                <Form.Item className='deal'>
                  <Select
                    placeholder='请选择前端协议'
                    {...loadBalancerProps}
                  >
                    <Option key="1" value="tcp">TCP</Option>
                    <Option key="2" value="udp">UDP</Option>
                    <Option key="3" value="icmp">ICMP</Option>
                    <Option key="3" value="http">HTTP</Option>
                  </Select>
                </Form.Item>
                {/* { hasPort &&
                  <Form.Item className='port'>
                    <InputNumber min={1} step={1} max={65535} style={{width: '100%'}} placeholder='请输入端口' {...portProps}/>
                  </Form.Item>
                } */}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>超时时间(秒)）</span>}
              >
                <InputNumber min={1} step={1} max={12} style={{width: '100%'}} placeholder='请输入超时时间' {...timeoutProps}/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>重试次数</span>}
              >
                <InputNumber min={1} step={1} max={5} style={{width: '100%'}} placeholder='请输入重试次数' {...repetitionCountProps}/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>健康检查间隔(秒)</span>}
              >
                <InputNumber min={1} step={1} max={12} style={{width: '100%'}} placeholder='请输入健康检查间隔' {...testintervalProps}/>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title='删除健康检查'
            visible={this.state.deleteVisible}
            closable={true}
            onOk={this.confirmDelete}
            onCancel={() => this.setState({deleteVisible: false})}
            width='570px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
          >
            <div className="alertRow" style={{wordBreak: 'break-all'}}>
              您确定删除 <span style={{color: '#58c2f6'}}>{this.state.currentItem.name}</span> 这个健康检查吗？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

HealthExamination = Form.create()(HealthExamination)

function mapStateToProp(state,props) {
  const { location } = props
  const { base_station } = state
  const { loadBanlacerHealthCheck } =  base_station
  const { pathname } = location
  const pathnameArray = pathname.split('/')
  const vadcID = pathnameArray[pathnameArray.length - 1]
  let healthCheckList = {
    isFecthing: false,
    result: [],
  }
  if(loadBanlacerHealthCheck[vadcID]){
    healthCheckList = loadBanlacerHealthCheck[vadcID]
  }
  const healthCheckNameArray = healthCheckList.result.map(item => {
    return item.name
  })
  return {
    healthCheckList,
    healthCheckNameArray,
  }
}

export default connect(mapStateToProp,{
  loadopenstackLbHealthcheckList,
  createopenstackLbHealthcheck,
  deleteopenstackLbHealthcheck,
  searchHealthCheck,
})(HealthExamination)