/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer Virtual IP Detial component
 *
 * v0.1 - 2017-7-21
 * @author ZhangChengZheng
 * update by baiyu 2017-12-21
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal, InputNumber } from 'antd'
import { connect } from 'react-redux'
import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'
import {
  loadopenstackLbVipsList,
  createopenstackLbVips,
  loadopenstackLbPoolsList,
  deleteopenstackLbVips,
  fetchUpdateopenstackLbVips,
  searchVips,
} from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'

class DNSDetila extends Component {
  constructor(props) {
    super(props)
    this.formatStatus = this.formatStatus.bind(this)
    this.openCreateVirtualIPModal = this.openCreateVirtualIPModal.bind(this)
    this.confirmCreateVirtualIP = this.confirmCreateVirtualIP.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.renderServicePoolOption = this.renderServicePoolOption.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.state = {
      selectedRowKeys: [],
      createVirtualIPVisible: false,
      virtualIPSearch: '',
      confirmLoading: false,
      currentItem: {},
      deleteVisible: false,
      updateVirtualIP: false,
    }
  }

  componentWillMount() {
    this.refreshVirtualIP()
    const { vadcID,location } = this.props
    if (location.query.poolName) {
      return
    }
    this.props.loadopenstackLbPoolsList(undefined, vadcID)
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

  searchInput(){
    const { searchVips } = this.props
    let {virtualIPSearch} = this.state
    const { vadcID } = this.props
    searchVips(vadcID, virtualIPSearch)
  }

  openCreateVirtualIPModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      confirmLoading: false,
      createVirtualIPVisible: true,
      updateVirtualIP: false,
    })
    setTimeout(()=> {
      document.getElementById('IP_name').focus()
    },300)
  }

  confirmCreateVirtualIP() {
    const { form, createopenstackLbVips, fetchUpdateopenstackLbVips } = this.props
    const { updateVirtualIP, currentItem } = this.state
    const { vadcID } = this.props
    const Noti = new NotificationHandler()
    if(updateVirtualIP){
      const validateArray = [
        'IP_service_pool',
        'IP_link',
        'IP_session',
        'IP_deal'
      ]
      form.validateFields(validateArray, (errors, values) => {
        if(!!errors){
          return
        }
        let body = {
          "pool": values.IP_service_pool,
          "connmulti": values.IP_link,
          "persist": values.IP_session,
        }
        if (values.IP_deal !== 'http') {
          delete body.connmulti
          delete body.persist
        }
        this.setState({
          confirmLoading: true,
        })
        fetchUpdateopenstackLbVips(vadcID, currentItem.vipname, {vip:body}, {
          success: {
            func: (res) => {
              this.setState({
                confirmLoading: false,
              })
              if(!res.success){
                let message = ''
                message = res.message || res.mes
                Noti.error('修改虚服务失败',message)
                return
              }
              this.setState({
                createVirtualIPVisible: false,
                protocol: 'none'
              })
              Noti.success('修改虚服务成功')
              this.refreshVirtualIP()
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
              Noti.error('修改虚服务失败',message)
            }
          }
        })
      })
      return
    }
    const validateArray = [
      'IP_name',
      'IP_address',
      'IP_deal',
      'IP_port',
      'IP_service_pool',
      'IP_link',
      'IP_session',
    ]
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      let body = {
        vipname: values.IP_name,
        "vip": values['IP_address'],
        "port": values['IP_port'],
        "type": values['IP_deal'],
        "connmulti": values['IP_link'],
        "persist": values['IP_session'],
        "pool": values['IP_service_pool']
      }
      this.setState({
        confirmLoading: true,
      })
      if (values.IP_deal !== 'http') {
        delete body.connmulti
        delete body.persist
      }
      createopenstackLbVips(vadcID, {vip:body}, {
        success: {
          func: () => {
            Noti.success('创建虚服务成功')
            this.setState({
              confirmLoading: false,
              createVirtualIPVisible: false,
              protocol: 'none'
            })
            this.refreshVirtualIP()
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            this.setState({
              confirmLoading: false
            })
            let message = ''
              message = res.message || res.mes
            Noti.error('创建虚服务失败',message)
          }
        }
      })
    })
  }


  editVirtualIP(record){
    const { form } = this.props
    form.setFieldsValue({
      "IP_name": record.vipname,
      "IP_address": record.vip,
      "IP_deal": record.type,
      "IP_port": record.port,
      "IP_service_pool": record.pool,
    })
    if(record.connmulti){
      form.setFieldsValue({
        "IP_link": record.connmulti,
      })
    } else {
      form.setFieldsValue({
        "IP_link": false
      })
    }
    if(record.persist){
      form.setFieldsValue({
        "IP_session": record.persist
      })
    } else {
      // form.setFieldsValue({
      //   "IP_session": "cookie"
      // })
    }
    this.setState({
      confirmLoading: false,
      createVirtualIPVisible: true,
      currentItem: record,
      updateVirtualIP: true,
      protocol: record.type
    })
  }

  deleteVirtualIP(record){
    this.setState({
      currentItem: record,
      deleteVisible: true,
    })
  }

  confirmDelete(){
    const { deleteopenstackLbVips } = this.props
    const { currentItem } = this.state
    let { vadcID } = this.props
    const Noti = new NotificationHandler()
    this.setState({
      confirmLoading: true,
    })
    deleteopenstackLbVips(vadcID, currentItem.vipname, {
      success: {
        func: (res) => {
          if(!res.success){
            this.setState({
              confirmLoading: false,
            })
            let message = ''
            message = res.message || res.mes
            Noti.error('释放虚服务失败',message)
            return
          }
          Noti.success('释放虚服务成功')
          this.setState({
            confirmLoading: false,
            deleteVisible: false,
          })
          this.refreshVirtualIP()
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          this.setState({
            confirmLoading: false,
          })
          let message = ''
          message = res.message || res.mes
          Noti.error('删除虚服务失败',message)
        }
      }
    })

  }

  refreshVirtualIP(e){
    const { loadopenstackLbVipsList, location } = this.props
    // const { query } = location
    // const poolName = query.poolName
    const { vadcID } = this.props
    loadopenstackLbVipsList(vadcID, {
      finally: {
        func: () => {
          if (e) {
            this.setState({virtualIPSearch: ''})
          }
        }
      }
    })
  }

  renderServicePoolOption(){
    const { servicePoolList } = this.props
    return servicePoolList.map((item, index) => {
      return <Select.Option value={item.name} key={`servicePool${index}`}>{item.name}</Select.Option>
    })
  }

  changeProtocol(e) {
    this.setState({protocol: e})
  }

  render() {
    const { selectedRowKeys, updateVirtualIP,protocol } = this.state
    const { form, location, virtualIPList, virtualIPNameArray } = this.props
    const { getFieldProps } = form
    const { vadcID } = this.props
    const query = location.query
    const status = query.status || ""
    let poolName = query.poolName || ''
    let column = [
      {
        title: '虚服务名称',
        dataIndex: 'vipname',
        //width: '13%',
        width: '20%',
        render: (text) => <div>{text}</div>
      },{
        // title: 'IP地址',
        // dataIndex: 'vip',
        // width: '10%',
        // render: (text) => <div>{text}</div>
      },{
        title: '端点',
        dataIndex: 'vip',
        width: '20%',
        render: (text,record) => <div>{record.type}://{text}:{record.port}</div>
      },
      //{
      //  title: '类型',
      //  dataIndex: 'type',
      //  width: '10%',
      //  render: (text) => <div>{text}</div>
      //},
      {
        title: '关联服务池',
        dataIndex: 'pool',
        width: '10%',
      },{
        title: '连接复用',
        dataIndex: 'connmulti',
        //width: '12%',
        width: '15%',
        render: (text,record) => {
          if(record.connmulti === false) {
            return '否'
          }
          if(record.connmulti === true) {
            return '是'
          }
          return '-'
        }
      },{
        title: '会话保持',
        dataIndex: 'persist',
        width: '15%',
        render: (text) => {
          if (text) {
            return text
          }
          return '-'
        }
      },{
        title: '操作',
        width: '20%',
        render: (text,record,index) => <div>
          <Button type="primary" style={{marginRight:8}}
          onClick={this.editVirtualIP.bind(this, record)}>修改</Button>
          <Button onClick={this.deleteVirtualIP.bind(this, record)}>释放</Button>
        </div>
      },
    ]
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }
    const IPNameProps = getFieldProps('IP_name', {
      rules: [{
        validator: function(rule, value, callback){
          if(!value){
            return callback('虚服务名称不能为空')
          }
          if(value.length < 3 || value.length > 32){
            return callback('长度为3~32位字符')
          }
          const reg = new RegExp('^[A-Za-z_]{1}[A-Za-z0-9_]*$')
          if(!reg.test(value)){
            return callback("由字母、数字、下划线_组成")
          }
          for(let i = 0; i < virtualIPNameArray.length; i++){
            if(value.toLocaleUpperCase() == virtualIPNameArray[i].toLocaleUpperCase()){
              return callback('虚服务名称已存在')
            }
          }
          return callback()
        }
      }]
    })
    const IPAddressProps = getFieldProps("IP_address", {
      rules: [{
        validator: function(rule, value, callback){
          if(!value){
            return callback('虚服务IP地址不能为空')
          }
          const IPReg = new RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$')
          if(!IPReg.test(value)){
            return callback('请输入正确的虚服务IP地址')
          }
          return callback()
        }
      }]
    })
    const IPDealProps = getFieldProps('IP_deal', {
      rules: [{ required: true,message: '协议不能为空' }],
      onChange: (e)=> this.changeProtocol(e)
    })
    const IPPortProps = getFieldProps('IP_port', {
      rules: [{ required: true,message: '端口不能为空' }]
    })
    const IPServicePoolProps = getFieldProps('IP_service_pool', {
      rules: [{ required: true,message: '关联服务池不能为空' }],
      initialValue: poolName
    })
    const IPLinkProps = getFieldProps('IP_link', {
      rules: [{ required: protocol == 'http'? true : false,message: '连接复用不能为空' }]
    })
    const IPSessionProps = getFieldProps('IP_session', {
      rules: [{ required: protocol == 'http'? true : false,message: '会话保持不能为空' }]
    })
    return (
      <QueueAnim type="right">
        <Title title="虚服务"/>
        <div id='load_balancer_detail' key="load_balancer_virtual_IP_detail">
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
              <div className='name'>{ vadcID}</div>
              <div className='status'>运行状态: <span>{this.formatStatus(status)}</span></div>
              {/*<div className='type'>类型: <span>全局负载均衡</span></div>*/}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="detailBodyBox wrap-page">
            <div className='handleBox page-header'>
              <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateVirtualIPModal}>
                <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>
                创建虚服务
              </Button>
              <Button className='buttonMarign' size="large" onClick={()=> this.refreshVirtualIP(true)}>
                <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>
                刷新
              </Button>
              {/*<Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}*/}
                {/*disabled={!selectedRowKeys.length}>*/}
                {/*<i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>*/}
                {/*删除*/}
              {/*</Button>*/}
              <div className='searchDiv'>
                <Input placeholder='请输入名称搜索' onChange={(e)=> this.setState({virtualIPSearch: e.target.value})} onPressEnter={this.searchInput} className='searchBox' size="large" value={this.state.virtualIPSearch}/>
                <i className="fa fa-search btn-search" aria-hidden="true" onClick={this.searchInput}></i>
              </div>
              {
                virtualIPList.result.length>0
                  && <div className='totleNum'>
                    共计 { virtualIPList.result.length } 条
                  </div>
              }
            </div>
            <Table
              dataSource={virtualIPList.result}
              columns={column}
              loading={virtualIPList.isFecthing}
              className="reset-ant-table"
              pagination={{ simple: true }}
            />
          </div>

          <Modal
            title={updateVirtualIP ? "修改虚服务" : "创建虚服务"}
            visible={this.state.createVirtualIPVisible}
            onOk={this.confirmCreateVirtualIP}
            onCancel={() => this.setState({createVirtualIPVisible: false,protocol: 'none'})}
            width='570px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="addAlarmModal"
          >
            <Form>
              <Form.Item
                {...formItemLayout}
                label={<span>虚服务名称</span>}
              >
                <Input placeholder='请输入虚服务名称' {...IPNameProps} disabled={updateVirtualIP}/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>虚服务IP地址</span>}
              >
                <Input placeholder='请输入虚服务IP地址' {...IPAddressProps} disabled={updateVirtualIP}/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>协议【端口】</span>}
              >
                <Form.Item className='deal'>
                  <Select placeholder='请选择协议' {...IPDealProps} disabled={updateVirtualIP}>
                    <Select.Option value="http" key="http">HTTP</Select.Option>
                    <Select.Option value="tcp" key="tcp">TCP</Select.Option>
                    <Select.Option value="udp" key="tcp">UDP</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item className='port'>
                  <InputNumber min={1} max={65535} style={{width: '100%'}} placeholder='请输入端口' {...IPPortProps}
                    disabled={updateVirtualIP}/>
                </Form.Item>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>关联服务池</span>}
              >
                <Select placeholder='请选择关联服务池' {...IPServicePoolProps}>
                  { this.renderServicePoolOption() }
                </Select>
              </Form.Item>
              {
                protocol =='http'?
                [<Form.Item
                  {...formItemLayout}
                  label="连接复用"
                  key="12"
                >
                  <Select placeholder='请选择连接复用' {...IPLinkProps}>
                    <Select.Option value={true} key="yes">是</Select.Option>
                    <Select.Option value={false} key="no">否</Select.Option>
                  </Select>
                </Form.Item>,
                <Form.Item
                  key="13"
                  {...formItemLayout}
                  label={<span>会话保持 </span>}
                >
                  <Select placeholder='请选择会话保持' {...IPSessionProps}>
                    <Select.Option value="cookie" key="cookie">cookie</Select.Option>
                    <Select.Option value="srcip" key="srcip">srcip</Select.Option>
                  </Select>
                </Form.Item>]
              :null
              }
            </Form>
          </Modal>

          <Modal
            title="释放虚服务"
            visible={this.state.deleteVisible}
            closable={true}
            onOk={this.confirmDelete}
            onCancel={() => this.setState({deleteVisible: false})}
            width='570px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
          >
            <div className="alertRow" style={{wordBreak: 'break-all'}}>
              您确定释放 <span style={{color: '#58c2f6'}}>{this.state.currentItem.vipname}</span> 这个虚服务吗？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

DNSDetila = Form.create()(DNSDetila)

function mapStateToProp(state,props) {
  const { location } = props
  const { base_station } = state
  const { loadBanlacerServicePool, loadBanlacerVirtualIP } =  base_station
  const { pathname, query } = location
  const pathnameArray = pathname.split('/')
  const vadcID = pathnameArray[pathnameArray.length - 1]
  let servicePoolList = []
  let virtualIPList = {
    isFecthing: false,
    result: []
  }
  if(loadBanlacerServicePool[vadcID] && loadBanlacerServicePool[vadcID].result){
    servicePoolList = loadBanlacerServicePool[vadcID].result || []
  }
  if(loadBanlacerVirtualIP[vadcID] && loadBanlacerVirtualIP[vadcID].result){
    if (query.poolName) {
      virtualIPList.result = loadBanlacerVirtualIP[vadcID].result.filter((item)=> {
        if (item.pool === query.poolName) {
          return true
        }
        return false
      })
    } else {
      virtualIPList.result = loadBanlacerVirtualIP[vadcID].result
    }
    virtualIPList.isFecthing = loadBanlacerVirtualIP[vadcID].isFecthing
  }
  let virtualIPNameArray = virtualIPList.result.map(item => {
    return item.vipname
  })
  return {
    servicePoolList,
    vadcID,
    virtualIPList,
    virtualIPNameArray,
  }
}

export default connect(mapStateToProp,{
  loadopenstackLbVipsList,
  createopenstackLbVips,
  loadopenstackLbPoolsList,
  deleteopenstackLbVips,
  fetchUpdateopenstackLbVips,
  searchVips,
})(DNSDetila)