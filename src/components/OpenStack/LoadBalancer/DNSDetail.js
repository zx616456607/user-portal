/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer DNS Detial component
 *
 * v0.1 - 2017-7-21
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal, Card } from 'antd'
import { connect } from 'react-redux'
// import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'
import { IP_REGEX, HOST_REGEX } from '../../../../constants'
import { loadLbDns,createLbDns,deleteLbDns } from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'
const notification = new NotificationHandler

class DNSDetail extends Component {
  constructor(props) {
    super(props)
    this.openCreateDNSModal = this.openCreateDNSModal.bind(this)
    this.confirmCreateDNS = this.confirmCreateDNS.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.state = {
      selectedRowKeys: [],
      createDNSVisible: false,
      confirmLoading: false,
      currentItem: {},
      dnsListeners: []
    }
    this.uuid = 0
  }
  componentWillMount() {
    this.loadData()
  }
  formatStatus() {
    let { status } = this.props.location.query
    switch(status.toUpperCase()){
      case 'ERROR':
        return <span className='stop'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 错误</span>
      case 'ACTIVE':
        return <span className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已启动</span>
      case 'CONNECTED':
        return <span className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已连接</span>
      case 'BUILDING': {
        return <span className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 创建中</span>
      }
      case 'SHUTOFF':
        return <span className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 停止</span>
      case 'UNKNOWN':
      default:
        return <span style={{color: '#999'}}><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 未知</span>
    }
  }
  loadData() {
    let { name }= this.props.params
    this.setState({isFetching: true})
    this.props.loadLbDns(name,{
      success:{
        func:(res)=> {
          this.setState({
            dnsListeners:res.dnsListeners || [],
            isFetching:false
          })
        }
      }
    })
  }

  openCreateDNSModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      confirmLoading: false,
      createDNSVisible: true,
    })
    setTimeout(()=> {
      this.refs.names.refs.input.focus()
    },400)
  }

  confirmCreateDNS(){
    const { form,params } = this.props

    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      const body = {
        "dns_listener":{
          "dnsname": values.name,
          "dns": values.address,
        }
      }
      this.setState({
        confirmLoading: true
      })
      this.props.createLbDns(params.name,body,{
        success:{
          func:()=> {
            this.setState({
              createDNSVisible: false,
            })
            notification.success('创建成功')
            this.loadData()
          },
          isAsync: true
        },
        finally:{
          func:()=> {
            this.setState({
              confirmLoading: false,
            })

          }
        }
      })
    })
  }

  deleteDNS(record){
    this.setState({
      confirmLoading: false,
      deleteVisible: true,
      currentItem: record,
    })
  }

  confirmDelete(){
    const { currentItem } = this.state
    const body = {
      name: this.props.params.name,
      domain:currentItem.dnsname
    }
    this.setState({
      confirmLoading: true,
    })
    this.props.deleteLbDns(body,{
      success:{
        func:()=> {
          notification.success('删除成功')
          this.setState({deleteVisible: false})
          this.loadData()
        },
        isAsync: true
      },
      finally:{
        func:()=> {
          this.setState({confirmLoading: false})
        }
      }
    })
  }
  checkDns(rule,value,callback) {
    if (!value) {
      return callback('请输入DNS服务地址')
    }
    if (!IP_REGEX.test(value)) {
      return callback('DNS格式错误')
    }
    callback()
  }
  checkOrg(rule,value,callback) {
    if (!value) {
      return callback('请输入域名')
    }
    if (!HOST_REGEX.test(value)) {
      return callback('域名输入有误')
    }
    callback()
  }

  checkName(rule,value,callback) {
    if (!value) {
      return callback('DNS名称不能为空')
    }
    if (value.length >32) {
      return callback('名称最多可输入32位字符')
    }
    if (!/^[\w|\d-_]+$/.test(value)) {
      return callback('名称支持字母、数字、下划线和中划线')
    }
    callback()
  }
  render() {
    const { selectedRowKeys,dnsListeners } = this.state
    const { form,params } = this.props
    const { getFieldProps, getFieldValue } = form

    getFieldProps('keys', {
      initialValue: [],
    })
    let column = [
      {
        title: '智能DNS名称',
        dataIndex: 'dnsname',
        width: '35%',
      },{
        title: 'DNS服务地址',
        dataIndex: 'dns',
        width: '35%',
      },{
        title: '操作',
        width: '23%',
        render: (text,record,index) => <div>
          {/* <Button type="primary" style={{marginRight:'8px'}} onClick={this.editDNS.bind(this, record)}>修改</Button>
          <Button onClick={this.deleteDNS.bind(this, record)}>释放</Button> */}
          <Button onClick={()=> this.setState({currentItem:record,deleteVisible:true})}>删除</Button>
        </div>
      },
    ]
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    }
    const DNSNameProps = getFieldProps('name', {
      rules: [{ validator: this.checkName }]
    })
    const DNSAddressProps = getFieldProps('address', {
      rules: [{ validator: this.checkDns }]
    })
    // const domainProps = getFieldProps('domain', {
    //   rules: [{ validator: this.checkOrg}]
    // })
    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div className="ant-row-flex ant-row-flex-end">
          <Form.Item key={k} className="ant-col-19">
            <Input placeholder='请输入域名' {...getFieldProps(`domain${k}`, {
              rules: [
                {validator: this.checkOrg}
              ],
            })} />
            <Select tags
              placeholder="请输入IP，输完回车"
              style={{marginTop:10}}
              onSelect={(v)=> this.checkIP(v)}
            >
            </Select>
          </Form.Item>
        </div>
      );
    });
    return (
      <div id='load_balancer_detail'>
        <div className='detail_header'>
          <span className="back" onClick={() => {browserHistory.push(`/base_station/load_balancer?activeKey=global`)}}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
        </div>
        <div className='detailHeaderBox'>
          <div className='leftBox'>
            <img src={newworkImg} className='imgBox'/>
          </div>
          <div className='rightBox'>
            <div className='name'>{params.name}</div>
            <div className='status'>运行状态: {this.formatStatus()} </div>
            <div className='type'>类型: <span>全局负载均衡</span></div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className="detailBodyBox wrap-page">
          <div className='page-header'>
            <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateDNSModal}>
              <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>创建DNS
            </Button>
            <Button className='buttonMarign' size="large" onClick={()=> this.loadData()}>
              <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>刷新
            </Button>
            {/* <Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}
              disabled={!selectedRowKeys.length}>
              <i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>删除
            </Button> */}
          </div>
          { dnsListeners && dnsListeners.length >0?
            <div className='table-pagination'>
              共计 {dnsListeners.length} 条
            </div>
            :null
          }
          <Table
            dataSource={dnsListeners}
            columns={column}
            pagination={{ simple: true }}
            // rowSelection={rowSelection}
            className="reset-ant-table"
            loading={this.state.isFetching}
          />
        </div>
        {
          this.state.createDNSVisible &&
          <Modal
            title="创建智能DNS"
            visible={true}
            onOk={this.confirmCreateDNS}
            onCancel={() => this.setState({createDNSVisible: false})}
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="reset_form_item_label_style"
          >
            <Form>
              <Form.Item
                {...formItemLayout}
                label={<span>智能DNS名称</span>}
              >
                <Input placeholder='请输入服务池名称' {...DNSNameProps} ref="names" />
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>DNS服务地址</span>}
              >
                <Input placeholder='请输入DNS服务地址' {...DNSAddressProps}/>
              </Form.Item>
              {/* <Form.Item
                {...formItemLayout}
                label={<span>添加域名</span>}
              >
                <Input placeholder='请输入域名' {...domainProps}/>
                <Select tags
                  placeholder="请输入IP，输完回车"
                  style={{marginTop:10}}
                  onSelect={(v)=> this.checkIP(v)}
                >
                </Select>
              </Form.Item> */}
              {/* { formItems }
              <Form.Item {...formItemLayout} label="&nbsp;">
                <Button onClick={()=> this.addRows()} type="primary">添加</Button>
              </Form.Item> */}
            </Form>

          </Modal>

        }

        <Modal
          title="释放智能DNS"
          visible={this.state.deleteVisible}

          onOk={this.confirmDelete}
          onCancel={() => this.setState({deleteVisible: false})}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="alertRow">
            您确定释放 <span style={{color: '#58c2f6'}}>{this.state.currentItem.dnsname}</span> 这个智能DNS吗？
          </div>
        </Modal>

      </div>
    )
  }
}

DNSDetail = Form.create()(DNSDetail)

function mapStateToProp(state,props) {

  return {}
}

export default connect(mapStateToProp,{
  loadLbDns,
  createLbDns,
  deleteLbDns
})(DNSDetail)