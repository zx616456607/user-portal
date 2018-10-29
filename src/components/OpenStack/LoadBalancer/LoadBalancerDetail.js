/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer detail component
 *
 * v0.1 - 2017-7-14
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal } from 'antd'
import { connect } from 'react-redux'
import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'

class LoadBalancerDetail extends Component {
  constructor(props) {
    super(props)
    this.formatStatus = this.formatStatus.bind(this)
    this.renderTableData = this.renderTableData.bind(this)
    this.selectTableRow = this.selectTableRow.bind(this)
    this.confirmAddAlarm = this.confirmAddAlarm.bind(this)
    this.openAddModal = this.openAddModal.bind(this)
    this.renderHandleButtonText = this.renderHandleButtonText.bind(this)
    this.confirmCreateService = this.confirmCreateService.bind(this)
    this.state = {
      selectedRowKeys: [],
      addAlarmVisible: false,
      addAlarmLoading: false,
      createServiceVisible: false,
    }
  }

  formatStatus(status) {
    switch(status){
      case 'stop':
        return <span className='stopStatus'>不可用</span>
      case 'run':
        return <span className='runStatus'>可用</span>
      default:
        return <span>---</span>
    }
  }

  renderTableData() {
    let arr = []
    for(let i = 0; i < 10; i++){
      let item = {
        key: i,
        name: '12341231',
        deal: '312312',
        time: '5分钟',
        num: '5',
        health: '30分钟',
        service: 'fuwuchi'
      }
      arr.push(item)
    }
    return arr
  }

  selectTableRow(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    })
  }

  confirmAddAlarm() {
    const { form } = this.props
    this.setState({
      addAlarmLoading: true
    })
    form.validateFields((errors,values) => {
      if(!!errors){
        this.setState({
          addAlarmLoading: false
        })
        return
      }
      console.log('values=',values)
    })
  }

  openAddModal() {
    const { form, location } = this.props
    const from = location.query.from
    form.resetFields()
    this.setState({
      confirmLoading: false,
    })
    switch(from){
      case 'service':
        return this.setState({
          createServiceVisible: true,
        })
    }
    this.setState({
      addAlarmVisible: true
    })
  }

  confirmCreateService(){
    const { form } = this.props
    const validataArray = [
      'service_name',
      'service_deal',
      'service_port',
      'service_health_exam',
      'service_member'
    ]
    this.setState({
      confirmLoading: true
    })
    form.validateFields(validataArray, (errors, values) => {
      if(!!errors){
        this.setState({
          confirmLoading: false
        })
        return
      }
      console.log('values=',values)
      this.setState({
        confirmLoading: false,
        createServiceVisible: false,
      })
    })

  }
  
  renderHandleButtonText(){
    const { location } = this.props
    const from = location.query.from
    switch(from){
      case 'service':
        return <span>创建服务池</span>
      default:
        return <span></span>
    }
  }

  render() {
    const { selectedRowKeys } = this.state
    const { form, location } = this.props
    const { getFieldProps } = form
    const from = location.query.from
    let column = [{
      title: '名称',
      dataIndex: 'name',
      width: '15%',
      render: (text) => <div>{text}</div>
    },{
      title: '协议',
      dataIndex: 'deal',
      width: '11%',
      render: (text) => <div>{text}</div>
    },{
      title: '响应超时时间',
      dataIndex: 'time',
      width: '15%',
      render: (text) => <div>{text}</div>
    },{
      title: '重复次数',
      dataIndex: 'num',
      width: '10%',
      render: (text) => <div>{text}</div>
    },{
      title: '健康检查间隔',
      dataIndex: 'health',
      width: '15%',
      render: (text) => <div>{text}</div>
    },{
      title: '服务池',
      dataIndex: 'service',
      width: '11%',
      render: (text) => <div>{text}</div>
    },{
      title: '操作',
      width: '23%',
      render: (text,record,index) => <div>
        <Button type="primary" className='editButton'>修改</Button>
        <Button>删除</Button>
      </div>
    }
    ]
    if(from == 'service'){
      column = [
        {
          title: '名称',
          dataIndex: 'name',
          width: '13%',
          render: (text) => <div>{text}</div>
        },{
          title: '协议',
          dataIndex: 'deal',
          width: '13%',
          render: (text) => <div>{text}</div>
        },{
          title: '成员选择方法',
          dataIndex: 'method',
          width: '15%',
          render: (text) => <div>{text}</div>
        },{
          title: '关键健康检查',
          dataIndex: 'exam',
          width: '13%',
          render: (text) => <div>{text}</div>
        },{
          title: '成员',
          dataIndex: 'member',
          width: '13%',
          render: (text) => <div>{text}</div>
        },{
          title: '虚拟IP',
          dataIndex: 'IP',
          width: '10%',
          render: (text) => <div>{text}</div>
        },{
          title: '操作',
          width: '23%',
          render: (text,record,index) => <div>
            <Button type="primary" className='editButton'>修改</Button>
            <Button>删除</Button>
          </div>
        },
      ]
    }
    if(from == 'dns'){
      column = [{
        title: '名称',
        dataIndex: 'name',
        width: '15%',
        render: (text) => <div>{text}</div>
      },{
        title: '协议',
        dataIndex: 'deal',
        width: '11%',
        render: (text) => <div>{text}</div>
      },{
        title: '响应超时时间',
        dataIndex: 'time',
        width: '15%',
        render: (text) => <div>{text}</div>
      },{
        title: '重复次数',
        dataIndex: 'num',
        width: '10%',
        render: (text) => <div>{text}</div>
      },{
        title: '健康检查间隔',
        dataIndex: 'health',
        width: '15%',
        render: (text) => <div>{text}</div>
      },{
        title: '服务池',
        dataIndex: 'service',
        width: '11%',
        render: (text) => <div>{text}</div>
      },{
        title: '操作',
        width: '23%',
        render: (text,record,index) => <div>
          <Button type="primary" className='editButton'>修改</Button>
          <Button>删除</Button>
        </div>
      }
      ]
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectTableRow
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }
    const formItemLayoutService = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    }
    const healthNameProps = getFieldProps('healthName',{
      rules: [{ required: true,message: '健康检查名称不能为空' }]
    })
    const timeoutProps = getFieldProps('timeout',{
      rules: [{ required: true,message: '响应超时时间不能为空' }]
    })
    const repetitionCountProps = getFieldProps('repetitionCount',{
      rules: [{ required: true,message: '重复次数不能为空' }]
    })
    const testintervalProps = getFieldProps('testinterval',{
      rules: [{ required: true,message: '健康检查间隔不能为空' }]
    })
    const loadBalancerProps = getFieldProps('loadBanlancer',{
      rules: [{ required: true,message: '虚拟负载均衡不能为空' }]
    })
    const portProps = getFieldProps('port',{
      rules: [{ required: true,message: '端口不能为空' }]
    })
    const serviceNameProps = getFieldProps('service_name', {
      rules: [{ required: true,message: '服务池名称不能为空' }]
    })
    const serviceDealProps = getFieldProps('service_deal', {
      rules: [{ required: true,message: '协议不能为空' }]
    })
    const servicePortProps = getFieldProps('service_port', {
      rules: [{ required: true,message: '端口不能为空' }]
    })
    const serviceHealthExamProps = getFieldProps('service_health_exam', {
      rules: [{ required: true,message: '关联健康检查不能为空' }]
    })
    const serviceMemberProps = getFieldProps('service_member', {
      rules: [{ required: true,message: '成员选择方式不能为空' }]
    })
    console.log('this.props=',this.props)
    return (
      <div id='load_balancer_detail'>
        <div className='detail_header'>
          <span className="back" onClick={() => {browserHistory.push(`/base_station/load_balancer`)}}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
        </div>
        <div className='detailHeaderBox'>
          <div className='leftBox'>
            <img src={newworkImg} className='imgBox'/>
          </div>
          <div className='rightBox'>
            <div className='name'>fadfwerufljsdkfjliutohlsajkfjdf</div>
            <div className='status'>运行状态: <span>{this.formatStatus('run')}</span></div>
            <div className='type'>类型: <span>全局负载均衡</span></div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className="detailBodyBox">
          <div className='handleBox'>
            <Button type="primary" className='buttonMarign' size="large" onClick={this.openAddModal}>
              <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>
              { this.renderHandleButtonText() }
            </Button>
            <Button className='buttonMarign' size="large" onClick={this.refreshLoadBalancer}>
              <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>
              刷新
            </Button>
            <Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}
              disabled={!selectedRowKeys.length}>
              <i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>
              删除
            </Button>
          </div>
          <div className="tableBox">
            <Table
              dataSource={this.renderTableData()}
              columns={column}
              rowSelection={rowSelection}
            />
          </div>
        </div>
        <Modal
          title="添加监听"
          visible={this.state.addAlarmVisible}
          closable={true}
          onOk={this.confirmAddAlarm}
          onCancel={() => this.setState({ addAlarmVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.addAlarmLoading}
          wrapClassName="addAlarmModal"
        >
          <Form>
            <Form.Item
              {...formItemLayout}
              label={<span>健康检查名称<span className='star'>*</span></span>}
            >
              <Input placeholder='健康检查' {...healthNameProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>前端协议【端口】<span className='star'>*</span></span>}
            >
              <Form.Item className='deal'>
                <Select
                  placeholder='请选择虚拟负载均衡'
                  {...loadBalancerProps}
                >
                  <Option key="1" value="1">12313</Option>
                  <Option key="2" value="2">12313</Option>
                  <Option key="3" value="3">12313</Option>
                </Select>
              </Form.Item>
              <Form.Item className='port'>
                <Input placeholder='请输入' {...portProps}/>
              </Form.Item>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>响应超时时间(秒)）<span className='star'>*</span></span>}
            >
              <Input placeholder='请输入响应超时时间' {...timeoutProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>重复次数<span className='star'>*</span></span>}
            >
              <Input placeholder='请输入重复次数' {...repetitionCountProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label={<span>健康检查间隔(秒)<span className='star'>*</span></span>}
            >
              <Input placeholder='请输入健康检查间隔' {...testintervalProps}/>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
        	title="创建服务池"
        	visible={this.state.createServiceVisible}
        	closable={true}
        	onOk={this.confirmCreateService}
        	onCancel={() => this.setState({createServiceVisible: false})}
        	width='620px'
        	maskClosable={false}
        	confirmLoading={this.state.confirmLoading}
        	wrapClassName="create_service"
        >
        	<Form>
            <Form.Item
              {...formItemLayoutService}
              label={<span>服务池名称<span className='star'>*</span></span>}
            >
              <Input placeholder='请输入服务池名称' {...serviceNameProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayoutService}
              label={<span>协议【端口】<span className='star'>*</span></span>}
            >
              <Form.Item className='service_deal'>
                <Select
                  {...serviceDealProps}
                  placeholder='请选择协议'
                >
                  <Select.Option value="http" key="http">HTTP</Select.Option>
                  <Select.Option value="tcp" key="tcp">TCP</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item className='service_port'>
                <Input placeholder='请输入端口' {...servicePortProps}/>
              </Form.Item>
            </Form.Item>
            <Form.Item
              {...formItemLayoutService}
              label={<span>关联健康检查<span className='star'>*</span></span>}
            >
              <Select {...serviceHealthExamProps} placeholder='请选择关联健康检查'>
                <Select.Option value="1" key="1">健康检查1</Select.Option>
                <Select.Option value="2" key="2">健康检查2</Select.Option>
                <Select.Option value="3" key="3">健康检查3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              {...formItemLayoutService}
              label={<span>成员选择方式<span className='star'>*</span></span>}
            >
              <Select {...serviceMemberProps} placeholder='请选择成员选择方式'>
                <Select.Option value="1" key="1">成员选择方式1</Select.Option>
                <Select.Option value="2" key="2">成员选择方式2</Select.Option>
                <Select.Option value="3" key="3">成员选择方式3</Select.Option>
              </Select>
            </Form.Item>
          </Form>

        </Modal>

      </div>
    )
  }
}

LoadBalancerDetail = Form.create()(LoadBalancerDetail)

function mapStateToProp(state,props) {

  return {}
}

export default connect(mapStateToProp,{})(LoadBalancerDetail)