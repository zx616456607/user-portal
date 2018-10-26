/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer Service Pool component
 *
 * v0.1 - 2017-7-21
 * @author ZhangChengZheng
 * update by baiyu 2017-12-21
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal, InputNumber, Transfer, Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'
import {
  loadopenstackLbPoolsList,
  loadopenstackLbHealthcheckList,
  createopenstackLbPools,
  deleteopenstackLbPools,
  fetchUpdateopenstackLbPools,
  searchPools,
  fetchDeleteopenstackLbPoolsMembers,
  fetchCreateopenstackLbPoolsCreateMembers,
} from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'
import QueueAnim from 'rc-queue-anim'
// import { getVMList } from '../../../actions/openstack/calculation_service'
import Title from '../../Title'
import { IP_REGEX } from '../../../../constants'
import { setTimeout } from 'timers';
const Noti = new NotificationHandler()

class ServicePoolDetail extends Component {
  constructor(props) {
    super(props)
    this.formatStatus = this.formatStatus.bind(this)
    // this.selectTableRow = this.selectTableRow.bind(this)
    this.openCreateServicePoolModal = this.openCreateServicePoolModal.bind(this)
    this.confirmCreateServicePool = this.confirmCreateServicePool.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.refreshLoadList = this.refreshLoadList.bind(this)
    this.getvadcID = this.getvadcID.bind(this)
    this.renderHealthCheckOption = this.renderHealthCheckOption.bind(this)
    // this.renderSercicePoolHealthCheck = this.renderSercicePoolHealthCheck.bind(this)
    // this.handleChange = this.handleChange.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.uuid = 0
    this.state = {
      selectedRowKeys: [],
      addAlarmVisible: false,
      addAlarmLoading: false,
      createServiceVisible: false,
      deleteVisible: false,
      currentItem: {},
      // targetKeys: [],
      updatePool: false,
    }
    this.MembersItem= [
      {value:'round_robin',text:'加权轮转'},
      {value:'random',text:'随机'},
      {value:'least_connection',text:'加权最小连接'},
      {value:'hash_source_address',text:'源IP地址哈希'},
      {value:'hash_source_port',text:'源IP地址和端口哈希'},
      {value:'hash_destination_address',text:'目的IP地址哈希'},
      {value:'bandwidth',text:'带宽'},
      {value:'max_bandwidth',text:'最大带宽'},
    ]
  }

  componentWillMount() {
    // const { getVMList } = this.props
    // getVMList(undefined, true)
    let vadcID =  this.getvadcID()
    this.refreshLoadList()
    this.setState({vadcID})
    this.props.loadopenstackLbHealthcheckList(undefined, vadcID,{
      failed:{
        func:(res)=> {
          Noti.info(res.message || res.mes)
        }
      }
    })
  }

  searchInput(){
    const { searchPools } = this.props
    let {vadcID,poolsSearch} = this.state
    searchPools(vadcID, poolsSearch)
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

  getvadcID(){
    const { location } = this.props
    const { pathname } = location
    const pathnameArray = pathname.split('/')
    let vadcID = pathnameArray[pathnameArray.length - 1]
    return vadcID
  }

  refreshLoadList(e){
    let vadcID = this.state.vadcID || this.getvadcID()
    this.props.loadopenstackLbPoolsList(undefined, vadcID, {
      failed:{
        func:(res)=> {
          Noti.info(res.message || res.mes)
        }
      },
      finally: {
        func: () => {
          if (e) {
            this.setState({poolsSearch: ''})
          }
        }
      }
    })
  }

  // selectTableRow(selectedRowKeys) {
  //   this.setState({
  //     selectedRowKeys,
  //   })
  // }
  // add pool modal
  openCreateServicePoolModal() {
    const { form } = this.props
    form.setFieldsValue({'keys':[]})
    form.setFieldsValue({'memberItem':[{address:'',port:'',weight:'100'}]})
    // form.resetFields()
    this.setState({
      confirmLoading: false,
      createServiceVisible: true,
      // targetKeys: [],
      updatePool: false,
    })
    setTimeout(()=> {
      document.getElementById('service_name').focus()
    },300)
  }
  poolCallback() {
    this.setState({
      confirmLoading: false,
      createServiceVisible: false,
    })
    this.uuid = 0
    this.refreshLoadList()
    this.props.form.resetFields()
  }
  deletePoolandCreatePool(vadcsID, poolName,members) {
    this.props.fetchDeleteopenstackLbPoolsMembers(vadcsID, poolName,{
      success:{
        func:(res)=> {
          let body = {
            pool:{members}
          }
          if (members.length==0) {
            this.poolCallback()
            return
          }
          this.props.fetchCreateopenstackLbPoolsCreateMembers(vadcsID, poolName,body,{
            success:{
              func:(res)=> {
                if(res.success) {
                  Noti.success('成员修改成员')
                  this.poolCallback()
                }
              },
              isAsync: true
            },
            failed:{
              func:()=> {
                this.setState({
                  confirmLoading: false
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed:{
        func:()=> {
          this.setState({
            confirmLoading: false
          })
        }
      }
    })
  }

  confirmCreateServicePool(){
    const { form, createopenstackLbPools, fetchUpdateopenstackLbPools, hostServers } = this.props
    const { updatePool, currentItem } = this.state
    let vadcsID = this.getvadcID()
    // edit pool
    if(updatePool){
      form.validateFields((errors, values) => {
        if(!!errors){
          return
        }
        // if(!targetKeys.length){
        //   this.setState({
        //     confirmLoading: false
        //   })
        //   Noti.info('请选择至少一个成员')
        //   return
        // }
        // const port = form.getFieldValue('service_port')
        // const members = targetKeys.map(item => {
        //   for(let i = 0; i < hostServers.length; i++){
        //     if(item == hostServers[i].id){
        //       return `${hostServers[i].addressIp}:${port}`
        //     }
        //   }
        // })

        let body = {
          "method": values.service_member,
          "health_check": values.service_health_exam,
        }
        this.setState({
          confirmLoading: true
        })
        const memberList = values.memberItem
        let members = values.keys.map(item => {
          return {
            address: values[`address${item}`] || memberList[item].address,
            port: values[`port${item}`] || memberList[item].port,
            weight: values[`weight${item}`] || memberList[item].weight,
          }
        })
        fetchUpdateopenstackLbPools(vadcsID, currentItem.name, {pool:body}, {
          success: {
            func: () => {
              Noti.success('服务池信息修改成功')
              this.deletePoolandCreatePool(vadcsID, currentItem.name,members)
              // this.setState({
              //   confirmLoading: false,
              //   createServiceVisible: false,
              // })
              // this.uuid = 0
              // this.refreshLoadList()
              // form.resetFields()
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
              Noti.error('服务池信息修改失败',message)
            }
          }
        })
      })
      return
    }
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      let repeat = false
      values.keys.forEach((key) => {
        values.keys.every(item => {
          if (key !== item) {
            if (values[`address${key}`] == values[`address${item}`] && values[`port${key}`] == values[`port${item}`]) {
              repeat = true
              form.setFields({
                [`address${key}`]:{errors:['IP地址重复'],value:values[`address${key}`]},
                [`port${key}`]:{errors:['端口重复'],value:values[`port${key}`]}
              })
              return false
            }
            return true
          }
          return false
        })
      })
      if (repeat) {
        return
      }
      let members = values.keys.map(item => {
        return {
          address: values[`address${item}`],
          port: values[`port${item}`],
          weight: values[`weight${item}`],
        }
      })
      // if(!targetKeys.length){
      //   Noti.info('请选择至少一个成员')
      //   return
      // }
      // const members = targetKeys.map(item => {
      //   for(let i = 0; i < hostServers.length; i++){
      //     if(item == hostServers[i].id){
      //       return {
      //         "address": hostServers[i].addressIp,
      //         "port": values.service_port,
      //         "weight": "100"
      //       }
      //     }
      //   }
      // })
      let body = {
        'name':values.service_name,
        "method": values.service_member,
        "health_check": values.service_health_exam,
        members
      }
      this.setState({
        confirmLoading: true
      })
      createopenstackLbPools(vadcsID, {pool:body}, {
        success: {
          func: () => {
            Noti.success('创建服务池成功')
            this.setState({
              confirmLoading: false,
              createServiceVisible: false,
            })
            this.uuid = 0
            this.refreshLoadList()
            form.resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            let message = res.message || res.mes
            this.setState({
              confirmLoading: false,
            })
            Noti.error('创建服务池失败',message)
          }
        }
      })
    })
  }
  // open edit modal
  editServicePool(record){
    const { form, hostServers } = this.props
    // this.setState({
    //   targetKeys: [],
    // })
    let port = record.members.length >0 ?record.members[0].port: '80'
    let keys=[]
    let memberItem = []
    record.members.map((item,ins)=> {
      keys.push(ins)
      memberItem[ins]= item
    })
    this.uuid = keys.length -1
    form.setFieldsValue({
      'service_name': record.name,
      'service_health_exam': record.healthCheck,
      'service_member': record.method,
      keys,
      memberItem
    })

    // const members = []
    // if(record.members && record.members.length){
    //   const membersArray = record.members.map(item => {
    //     let array = item.port
    //     return array[0]
    //   })
    //   for(let i = 0; i < membersArray.length; i++){
    //     for(let j =0; j < hostServers.length; j++){
    //       if(membersArray[i] == hostServers[j].addressIp){
    //         members.push(hostServers[j].id)
    //       }
    //     }
    //   }
    // }
    this.setState({
      currentItem: record,
      createServiceVisible: true,
      updatePool: true,
      confirmLoading: false,
      // targetKeys: members,
    })
  }

  deleteServicePool(record){
    this.setState({
      currentItem: record,
      deleteVisible: true,
    })
  }

  confirmDelete(){
    const { currentItem } = this.state
    const { deleteopenstackLbPools } = this.props
    const vadcsID = this.getvadcID()
    const poolName = currentItem.name
    this.setState({
      confirmLoading: true,
    })
    deleteopenstackLbPools(vadcsID, poolName, {
      success: {
        func: (res) => {
          if(res.success){
            Noti.success('删除服务池成功')
            this.setState({
              confirmLoading: false,
              deleteVisible: false,
            })
            this.refreshLoadList()
            return
          }
          this.setState({
            confirmLoading: false,
          })
          let message = ''
          message = res.message || res.mes
          Noti.error('删除服务池失败',message)
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
          Noti.error('删除服务池失败',message)
        }
      }
    })

  }

  // renderSercicePoolHealthCheck(value){
  //   const { healthCheckList } = this.props
  //   for(let i = 0; i < healthCheckList.length; i++){
  //     if(healthCheckList[i] == value){
  //       return healthCheckList[i].name
  //     }
  //   }
  // }

  renderHealthCheckOption(){
    const { healthCheckList } = this.props
    return healthCheckList.map(item => {
      return <Select.Option value={item.name} key={`healthCheck${item.name}`}>{item.name}</Select.Option>
    })
  }

  // manageMembers(record){
  //   this.setState({
  //     currentItem: record,
  //   })
  //   //console.log(record)
  // }

  // renderItem(item) {
  //   const customLabel = (
  //     <Tooltip title={<span>
  //         <div>主机名：{item.name}</div>
  //         <div>IP：{item.addressIp}</div>
  //         <div>区域：{item[`oSEXTAZ:availabilityZone`]}</div>
  //       </span>}
  //       placement="topLeft"
  //     >
  //       <span className='transfer_item'>
  //         <div className='renderItem_item' title={null}>{item.name}</div>
  //         <div className='renderItem_item' title={null}>{item.addressIp}</div>
  //         <div className='renderItem_item zone' title={null}>{item[`oSEXTAZ:availabilityZone`]}</div>
  //      </span>
  //     </Tooltip>
  //   )

  //   return {
  //     label: customLabel,  // for displayed item
  //     value: item.name,   // for title and filter matching
  //   }
  // }

  // handleChange(targetKeys, direction, moveKeys) {
  //   this.setState({ targetKeys });
  // }
  renderMembers() {
    // let { members } = this.state
    return this.MembersItem.map(item => {
      return <Select.Option value={item.value} key={item.value}>{item.text}</Select.Option>
    })
  }
  memberRemove(k) {
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      if(key !==k) {
        return true
      }
      return false
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
  }
  memberAdd() {
    const { form } = this.props
    let keys = form.getFieldValue('keys');
    let memberItem = form.getFieldValue('memberItem');
    const ruleMembers =[]
    keys.map(item => {
      ruleMembers.push(`address${item}`,`port${item}`,`weight${item}`)
    })
    form.validateFields(ruleMembers,(error,values)=> {
      if (error) return
      let repeat = false
      keys.every(key => {
        if (key !== this.uuid) {
          if (values[`address${key}`] == values[`address${this.uuid}`] && values[`port${key}`] == values[`port${this.uuid}`]) {
            repeat = true
            return false
          }
          return true
        }
        return true
      })
      if (repeat) {
        form.setFields({
          [`address${this.uuid}`]:{errors:['重复'],value:values[`address${this.uuid}`]},
          [`port${this.uuid}`]:{errors:['重复'],value:values[`port${this.uuid}`]}
        })
        return
      }
      this.uuid++
      keys = keys.concat(this.uuid)
      memberItem[this.uuid] ={}
      form.setFieldsValue({
        keys,
        memberItem
      });
    })
    // return
  }
  checkIpAddress(rule, value,callback) {
    if (!value) {
      return callback('请输入地址')
    }
    if (!IP_REGEX.test(value)) {
      return callback('IP地址输入无效')
    }
    callback()
  }
  cancelPool() {
    const { form } = this.props
    this.setState({createServiceVisible: false})
    setTimeout(()=> {
      this.uuid = 0
      form.setFieldsValue({'keys':[]})
      form.resetFields()
    },500)
  }
  render() {
    const { selectedRowKeys, updatePool } = this.state
    const { form, location, servicePoolList, servicePoolNameArray, hostServers } = this.props
    const query = location.query
    const status = query.status || ""
    const { getFieldProps, getFieldValue } = form
    const vadcID = this.getvadcID()
    getFieldProps('keys', {
      initialValue: [],
    })
    getFieldProps('memberItem', {
      initialValue: [],
    })
    const formItemLayoutService = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    }
    const memberItem = getFieldValue('memberItem')
    const keys = getFieldValue('keys')
    const formItems = keys.length >0 && keys.map((k) => {
      return (
        <div key={`key-${k}`}>
        <Form.Item key={k}>
          <Input placeholder="请输入地址" {...getFieldProps(`address${k}`, {
            rules: [
              {validator: this.checkIpAddress}
            ],
            initialValue: memberItem[k].address
          })}
          style={{ width: '90%' }}
          />
        </Form.Item>
        <Form.Item>
          <InputNumber min={1} step={1} max={65535}  placeholder="请输入端口"  {...getFieldProps(`port${k}`, {
            rules: [{required: true,message: '请输入端口'}],
            initialValue: memberItem[k].port
          })}
          style={{ width: '90%' }}
          />
        </Form.Item>
        <Form.Item>
          <Tooltip title="成员权重，1~255之间">
            <InputNumber min={1} step={1} max={255} size="large" placeholder="成员权重" {...getFieldProps(`weight${k}`, {
              rules: [{required: true,message: '请输入成员权重'}],
              initialValue: memberItem[k].weight || 100
            })} style={{ width: '50%' ,marginRight:'15px'}}
            />
          </Tooltip>
          <Button onClick={() => this.memberRemove(k)}>删除</Button>
        </Form.Item>
        </div>
      );
    });
    let column = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '20%',
        render: (text) => <div>{text}</div>
      },{
        // title: '协议',
        // dataIndex: 'protocol',
        // width: '13%',
        // render: (text) => <div>{text.toLocaleUpperCase()}</div>
      },{
        title: '成员选择方法',
        dataIndex: 'method',
        width: '15%',
        render: (text) => {
          let innerHteml = ''
          this.MembersItem.every(item => {
            if(item.value === text) {
              innerHteml = item.text
              return false
            }
            return true
          })
          return innerHteml
        }
      },{
        title: '关联健康检查',
        dataIndex: 'healthCheck',
        width: '15%',
      },{
        title: '成员数',
        dataIndex: 'members',
        width: '10%',
        render: (text, record) => <div>{text.length}</div>
      },{
        title: '关联虚服务',
        dataIndex: 'vips',
        width: '15%',
        render: vips => {
          if (Array.isArray(vips) && vips.length > 0) {
            return vips.map(vip => vip.vipname).join('，')
          }
          return '-'
        }
      },{
        title: '操作',
        width: '23%',
        render: (text,record) => <div>
          <Button type="primary" style={{marginRight:8}}
          onClick={this.editServicePool.bind(this, record)}>修改</Button>
          <Button onClick={this.deleteServicePool.bind(this, record)}>删除</Button>
        </div>
      },
    ]
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.selectTableRow
    // }

    const serviceNameProps = getFieldProps('service_name', {
      rules: [{
        validator(rule, value, callback){
          if(!value){
            return callback('服务池名称不能为空')
          }
          if(value.length < 3 || value.length > 32){
            return callback('长度为3～32个字符')
          }
          // const nameReg = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_]?[A-Za-z_]+$')
          if(!/^[a-zA-Z0-9]{1}[A-Za-z0-9_]{1,30}[a-zA-Z0-9]+$/.test(value)){
            return callback("以字母数字开头和结尾，中间可下划线")
          }
          if (!updatePool) {
            for(let i = 0; i < servicePoolNameArray.length; i++){
              if(servicePoolNameArray[i].toLocaleUpperCase() == value.toLocaleUpperCase()){
                return callback('服务池名称已存在')
              }
            }
          }
          return callback()
        }
      }]
    })
    // const serviceDealProps = getFieldProps('service_deal', {
    //   rules: [{ required: true,message: '协议不能为空' }]
    // })
    // const servicePortProps = getFieldProps('service_port', {
    //   rules: [{ required: true,message: '端口不能为空' }]
    // })
    const serviceHealthExamProps = getFieldProps('service_health_exam', {
      rules: [{ required: true,message: '关联健康检查不能为空' }]
    })
    const serviceMemberProps = getFieldProps('service_member', {
      rules: [{ required: true,message: '成员选择方式不能为空' }],
      initialValue:'round_robin'
    })
    return (
      <QueueAnim type='right'>
        <Title title="服务池"/>
        <div id='load_balancer_detail' key="load_balancer_service_pool_detail">
          <div className='detail_header'>
          <span className="back" onClick={() => {browserHistory.goBack()}}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
          </div>
          <div className='detailHeaderBox'>
            <div className='leftBox'>
              <img src={newworkImg} className='imgBox'/>
            </div>
            <div className='rightBox'>
              <div className='name'>{ vadcID }</div>
              <div className='status'>运行状态: <span>{this.formatStatus(status)}</span></div>
              {/*<div className='type'>类型: <span>全局负载均衡</span></div>*/}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="detailBodyBox wrap-page">
            <div className='handleBox page-header'>
              <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateServicePoolModal}>
                <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>
                创建服务池
              </Button>
              <Button className='buttonMarign' size="large" onClick={this.refreshLoadList}>
                <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>
                刷新
              </Button>
              <div className='searchDiv'>
                <Input placeholder='请输入名称搜索' onChange={(e)=> this.setState({poolsSearch: e.target.value})} onPressEnter={this.searchInput} className='searchBox' size="large" value={this.state.poolsSearch}/>
                <i className="fa fa-search btn-search" aria-hidden="true" onClick={this.searchInput}></i>
              </div>
              {/*<Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}*/}
              {/*disabled={!selectedRowKeys.length}>*/}
              {/*<i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>*/}
              {/*删除*/}
              {/*</Button>*/}

              {
                servicePoolList.result.length >0 &&
                  <div style={{position:'absolute',right:'160px',top:'43px'}}>
                    共计 { servicePoolList.result.length } 条
                  </div>
              }
            </div>

              <Table
                dataSource={servicePoolList.result}
                loading={servicePoolList.isFecthing}
                columns={column}
                //rowSelection={rowSelection}
                className="reset-ant-table"
                pagination={{ simple: true }}
              />
          </div>

          <Modal
            title={updatePool ? '修改服务池' : '创建服务池'}
            visible={this.state.createServiceVisible}
            onOk={this.confirmCreateServicePool}
            onCancel={() => this.cancelPool()}
            width='700px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="create_pool_service"
          >
            <Form>
              <Form.Item
                {...formItemLayoutService}
                label={<span>服务池名称</span>}
              >
                <Input placeholder='请输入服务池名称' {...serviceNameProps} disabled={updatePool}/>
              </Form.Item>
              {/* <Form.Item
                {...formItemLayoutService}
                label="端口"
              > */}
                {/* <Form.Item className='service_deal'>
                  <Select
                    {...serviceDealProps}
                    placeholder='请选择协议'
                    disabled={updatePool}
                  >
                    <Select.Option value="tcp" key="http">TCP</Select.Option>
                    <Select.Option value="udp" key="tcp">UDP</Select.Option>
                  </Select>
                </Form.Item> */}
                {/* <Form.Item className='service_port'>
                  <InputNumber min={1} max={65535} style={{width: "100%"}} placeholder='请输入端口' {...servicePortProps} disabled={updatePool}/>
                </Form.Item> */}
              {/* </Form.Item> */}
              <Form.Item
                {...formItemLayoutService}
                label={<span>关联健康检查</span>}
              >
                <Select {...serviceHealthExamProps} placeholder='请选择关联健康检查'>
                  { this.renderHealthCheckOption() }
                </Select>
              </Form.Item>
              <Form.Item
                {...formItemLayoutService}
                label={<span>成员选择方式</span>}
              >
                <Select {...serviceMemberProps} placeholder='请选择成员选择方式'>
                  {this.renderMembers()}
                </Select>
              </Form.Item>
              <Form.Item
                {...formItemLayoutService}
                label={<span>添加成员</span>}
              >
              </Form.Item>
              <div className="members">
                {formItems}
              <Form.Item
                {...formItemLayoutService}
                style={{marginBottom:0}}
              >
                <Button type="primary" onClick={()=> this.memberAdd()}>添加</Button>
              </Form.Item>
              </div>
            </Form>
            {/* <div>
              <Transfer
                dataSource={hostServers}
                listStyle={{
                  width: 300,
                  height: 300,
                }}
                targetKeys={this.state.targetKeys}
                onChange={this.handleChange}
                render={this.renderItem}
                rowKey={record => record.id}
                titles={['未选成员', '已选成员']}
                notFoundContent={"成员列表为空"}
              />
            </div> */}
          </Modal>

          <Modal
            title="删除服务池"
            visible={this.state.deleteVisible}
            closable={true}
            onOk={this.confirmDelete}
            onCancel={() => this.setState({deleteVisible: false})}
            width='570px'
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
          >
            <div className="alertRow" style={{wordBreak: 'break-all'}}>
              您确定删除 <span style={{color: '#58c2f6'}}>{this.state.currentItem.name}</span> 这个服务池吗？
            </div>
          </Modal>
        </div>
      </QueueAnim>

    )
  }
}

ServicePoolDetail = Form.create()(ServicePoolDetail)

function mapStateToProp(state,props) {
  const { location } = props
  const { base_station } = state
  const { loadBanlacerHealthCheck, loadBanlacerServicePool } =  base_station
  const { pathname } = location
  const pathnameArray = pathname.split('/')
  let hostList = []
  let servicePoolList = {
    isFecthing: false,
    result: []
  }
  let healthCheckList = []
  const vadcID = pathnameArray[pathnameArray.length - 1]
  if(loadBanlacerHealthCheck[vadcID]){
    healthCheckList = loadBanlacerHealthCheck[vadcID].result || []
  }
  if(loadBanlacerServicePool[vadcID]){
    servicePoolList = loadBanlacerServicePool[vadcID]
  }
  if(base_station.host && base_station.host.servers){
    hostList = base_station.host.servers
  }
  const servicePoolNameArray = servicePoolList.result.map(item => {
    return item.name
  })
  // let hostServers = []
  // for(let i = 0; i < hostList.length; i++){
  //   if(hostList[i].addresses && hostList[i].addresses.shareNet && hostList[i].addresses.shareNet[0] && hostList[i].addresses.shareNet[0].addr){
  //     hostList[i].addressIp = hostList[i].addresses.shareNet[0].addr
  //     hostServers.push(hostList[i])
  //   }
  // }
  return {
    healthCheckList,
    servicePoolList,
    servicePoolNameArray,
    // hostServers,
  }
}

export default connect(mapStateToProp,{
  loadopenstackLbPoolsList,
  loadopenstackLbHealthcheckList,
  createopenstackLbPools,
  deleteopenstackLbPools,
  fetchUpdateopenstackLbPools,
  // getVMList,
  searchPools,
  fetchDeleteopenstackLbPoolsMembers,
  fetchCreateopenstackLbPoolsCreateMembers,
})(ServicePoolDetail)