/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer component
 *
 * v0.1 - 2017-7-14
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Select, Radio, InputNumber,Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/LoadBalancer.less'
import { browserHistory } from 'react-router'
import NotificationHandler from '../../../common/notification_handler'
import {
  loadopenstackRealLBList,
  createopenstackRealLB,
  deleteopenstackRealLB,
} from '../../../actions/openstack/lb_real'
import { loadNetworksList } from '../../../actions/openstack/networks'
import Title from '../../Title'
import CreateModal from './CreateLoadBalancer'

const Option = Select.Option

class LoadBalancer extends Component {
  constructor(props) {
    super(props)
    this.searchInput = this.searchInput.bind(this)
    this.selectTableRow = this.selectTableRow.bind(this)
    this.deleteLoadBalancer = this.deleteLoadBalancer.bind(this)
    this.refreshLoadBalancer = this.refreshLoadBalancer.bind(this)
    // this.comfirmCreate = this.comfirmCreate.bind(this)
    this.renderSelectOption = this.renderSelectOption.bind(this)
    this.openCreateModal = this.openCreateModal.bind(this)
    this.openDeleteModal = this.openDeleteModal.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      selectedRow:[],
      createVisible: false,
      // loadingCreate: false,
      currentName: [],
      currentItem: {},
      searchValue: '',
    }
  }

  componentWillMount() {
    const { loadNetworksList } = this.props
    this.refreshLoadBalancer()
    loadNetworksList()
  }

  searchInput() {
    const { searchValue } = this.state
    const { loadList } = this.props
    if(!searchValue){
      this.setState({
        dataSource: loadList.result
      })
      return
    }
    const newList = loadList.result.filter( list => {
      const search = new RegExp(searchValue)
      if (search.test(list.vadcID)) {
        return true
      }
      return false
    })
    this.setState({
      dataSource: newList
    })
  }

  searchChange(e){
    let value = e.target.value
    this.setState({
      searchValue: value,
    })
  }

  selectTableRow(selectedRowKeys, rows) {
    const selectedRow = rows.map(item => item.name)
    this.setState({
      selectedRow,
      selectedRowKeys
    })
  }

  openDeleteModal(record){
    this.setState({
      currentItem: record,
      showDeleteModal: true,
      deleting: false,
    })
  }

  refreshLoadBalancer(reload) {
    const { loadopenstackRealLBList } = this.props
    loadopenstackRealLBList({}, {
      success: {
        func: (res) => {
          let list = []
          if(res.vnfs){
            list = res.vnfs
          }
          this.setState({
            dataSource: list
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            searchValue: ''
          })
          if (reload) {
            document.getElementById('loadBalancerSearch').value = ""
          }
        }
      }
    })
  }

  deleteLoadBalancer() {
    this.setState({
      showDeleteModal: true
    })
  }
  deleteLB() {
    const { deleteopenstackRealLB } = this.props
    const { currentItem } = this.state
    this.setState({
      deleting: true
    })
    const notification = new NotificationHandler()
    notification.spin('删除负载均衡中')
    deleteopenstackRealLB(currentItem.name, {
      success: {
        func: () => {
          notification.close()
          notification.success('负载均衡删除成功')
          this.refreshLoadBalancer()
          this.setState({
            showDeleteModal: false,
            deleting: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          notification.close()
          let message = '负载均衡删除失败请求,请重试'
          if(res.message){
            message = res.message
          }
          notification.error(message)
          this.setState({
            deleting: false
          })
        }
      }
    })
  }

  formatStatus(status) {
    switch(status.toUpperCase()){
      case 'ERROR':
        return <div className='stop'><i className="fa fa-circle circleIcon" aria-hidden="true"></i>错误</div>
      case 'ACTIVE':
        return <div className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i>已启动</div>
      case 'CONNECTED':
        return <div className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i>已连接</div>
      case 'BUILDING': {
        return <div className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i>创建中</div>
      }
      case 'SHUTOFF':
        return <div className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i>停止</div>
      case 'UNKNOWN':
      default:
        return <div style={{color: '#999'}}><i className="fa fa-circle circleIcon" aria-hidden="true"></i>未知</div>
    }
  }

  setConfiguration(record) {
  }

  openCreateModal() {
    this.setState({
      createVisible: true,
      // loadingCreate: false,
    })
    setTimeout(()=> {
      document.getElementById('name').focus()
    },300)
  }

  // comfirmCreate() {
  //   const { form, createopenstackRealLB } = this.props
  //   this.setState({
  //     loadingCreate: true
  //   })
  //   const validataArray = [
  //     'name',
  //     'network',
  //     'cpu',
  //     'ram',
  //     'desc',
  //   ]
  //   form.validateFields(validataArray, (errors,values) => {
  //     if(!!errors){
  //       this.setState({
  //         loadingCreate: false
  //       })
  //       return
  //     }
  //     let name = values.name
  //     let body = {
  //       "device":{
  //         "mem": parseInt(values.ram) * 1024,
  //         "cpu": parseInt(values.cpu),
  //         "desc": values.desc
  //       },
  //       "networks":{
  //         "info":[
  //           {
  //             "id": values.network
  //           }
  //         ]
  //       }
  //     }

  //     const notify =  new NotificationHandler()
  //     notify.spin('创建负载均衡中')
  //     createopenstackRealLB(name, body, {
  //       success: {
  //         func:() => {
  //           notify.close()
  //           notify.success('创建负载均衡成功')
  //           this.refreshLoadBalancer()
  //           this.setState({
  //             loadingCreate: false,
  //             createVisible: false
  //           })
  //         },
  //         isAsync: true
  //       },
  //       failed: {
  //         func: (res) => {
  //           notify.close()
  //           let message = '创建负载均衡失败，请稍后重试'
  //           if(res.message){
  //             let initialMessage = res.message
  //             if(initialMessage.substring(0, 15) == "Invalid network"){
  //               message = '网络不可用，请重新选择网络'
  //             } else {
  //               message = res.message
  //             }
  //           }
  //           notify.error(message)
  //           this.setState({
  //             loadingCreate: false
  //           })
  //         },
  //         isAsync: true
  //       }
  //     })
  //   })
  // }

  renderSelectOption() {
    const { networksList } = this.props
    return networksList.map((item, index) => {
      return <Option key={'select' + index} value={item.id}>{item.name}</Option>
    })
  }
  render() {
    const { selectedRowKeys, dataSource } = this.state
    const { form, allnames, loadList } = this.props
    // const { getFieldProps,getFieldValue } = form
    const isFetching = loadList.isFetching
    const columns = [
      {
        title: '负载均衡ID／名称',
        dataIndex: 'name',
        width: '18%',
        render: (text,record) => <div>{text}</div>,
        //render: (text, record) => <div
        //  onClick={() => { browserHistory.push(`/base_station/load_balancer/detail/${text}?status=${record.device.status}`)}}
        //  className='loadBalancerName'>{text}</div>
      },{
        title: '状 态',
        dataIndex: 'vmList',
        key:'state',
        width: '10%',
        render: (text, record) =>{
          return(<div>{this.formatStatus(text[0].vmState)}</div>)

        }
      },{
        title: '管理IP地址',
        dataIndex: 'managementIp',
        key:'ip',
        width: '16%',
        render: text => {
          if (text) {
            return <a target="_blank" href={`http://${text}`}>{text}</a>
          }
          return '-'
        }
      },{
        //title: '主可用区',
        title: 'CPU利用率 (%)',
        dataIndex: 'vmList',
        key:'cpu',
        width: '12%',
        render: (text) => {
          if (!text[0].vmCpuUsedRatio) {
            return '-'
          }
          return <div>{text[0].vmCpuUsedRatio}</div>
        }

      },{
        //title: '备可用区',
        title: '内存利用率 (%)',
        dataIndex: 'vmList',
        width: '12%',
        key:'mem',
        render: text => {
          if (!text[0].vmRamUsedRatio) {
            return '-'
          }
          return <div>{text[0].vmRamUsedRatio}</div>
        }

      },{
        title: '网卡绑定关系',
        dataIndex: 'vmList',
        width: '20%',
        kty:'descript',
        render:(text,record)=> {
          let bindtext = '主机IP地址：'
          text.forEach(item=> {
            bindtext += item.hostIp
            item.ports.map(port => {
             return bindtext += port.vmPortName +':'+ port.hostNic +'(' + ( port.vmPortIp || '--' )+',' + (port.vmPortIpMask ||'--') +') '
            })
            // return bindtext
          })
          return <div style={{width:'220px'}}><Tooltip title={bindtext}><div className="textoverflow">{bindtext}</div></Tooltip></div>
        }
      },{
      //   title: '端口／健康检查',
      //   dataIndex: 'healthchecksExists',
      //   width: '12%',
      //   key:'port',
      //   render: (text,record,index) => <div>{
      //     text
      //     ? <div className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/health_examination/${record.vadcID}?status=${record.device.status}`)}>管理</div>
      //     : <div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/health_examination/${record.vadcID}?status=${record.device.status}`)}>配置</span> )</div>
      //   }</div>
      // },
      // // {
      //   title: '服务池',
      //   dataIndex: 'poolsExists',
      //   width: '12%',
      //   render: (text,record,index) => <div>{
      //     text
      //     ? <div className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/service_pool/${record.vadcID}?status=${record.device.status}`)}>管理</div>
      //     : <div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/service_pool/${record.vadcID}?status=${record.device.status}`)}>配置</span> )</div>
      //   }</div>
      },{
        title: '操 作',
        width: '12%',
        render: (text, record) => <Button type="ghost" onClick={this.openDeleteModal.bind(this, record)}>删除</Button>
      }

      //{
      //  title: '服务地址',
      //  dataIndex: 'address',
      //  width: '13%',
      //  render: (text) => <div>{text}</div>
      //},
        //render: (text,record,index) => <div>{text == 'none'
        //  ?
        //  <div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/service_pool/${record.key}`)}>配置</span> )</div>
        //  : <div>已配置</div>
        //}</div>

      //{
      //  title: 'DNS',
      //  dataIndex: 'dns',
      //  width: '12%',
        //render: (text,record,index) => <div>{text == 'none'
        //  ?
        //  <div>未配置 ( <span className='configuration' onClick={this.setConfiguration.bind(this,record)}>配置</span> )</div>
        //  : <div>已配置</div>
        //}</div>
      //  render: (text,record,index) => <div>{text == 'none'
      //    ?
      //    <div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/DNS/${record.key}`)}>配置</span> )</div>
      //    : <div>已配置</div>
      //  }</div>
      //}
    ]
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.selectTableRow
    // }
    // const formItemLayout = {
    //   labelCol: { span: 5 },
    //   wrapperCol: { span: 17 }
    // }
    // const loadBalancerNameProps = getFieldProps('name',{
    //   rules: [{ validator: function(rule, value, callback) {
    //     if(!value) return callback('负载均衡名称不能为空')
    //     if (value.length < 3 || value.length > 32) return callback('长度为3~32位字符')
    //     if (!/^[a-zA-Z0-9]{1}[A-Za-z0-9_\-]{1,61}[a-zA-Z0-9]+$/.test(value)) {
    //       return callback('名称为字母数字开头和结尾，中间可中划线、下划线')
    //     }
    //     if(allnames.indexOf(value) >= 0) return callback('该名称已存在')
    //     return callback()
    //   }}]
    // })
    // const loadBalancerNetworkProps = getFieldProps('network',{
    //   rules: [{ required: true,message: '网络不能为空' }]
    // })
    // const keepTimeProps = getFieldProps('keepTime',{
    //   initialValue: 'service'
    // })
    // let keepTime = getFieldValue('keepTime')
    // let mainProductOneProps
    // let mainProductTwoProps
    // let secondProductOneProps
    // let secondProductTwoProps
    // if(keepTime == 'service'){
    //   mainProductOneProps = getFieldProps('mainProductOne',{
    //     rules: [{ required: true,message: '主可用区不能为空' }]
    //   })
    //   mainProductTwoProps = getFieldProps('mainProductTwo',{
    //     rules: [{ required: true,message: '主可用区不能为空' }]
    //   })
    //   secondProductOneProps = getFieldProps('secondProductOne',{
    //     rules: [{ required: true,message: '备可用区不能为空' }]
    //   })
    //   secondProductTwoProps = getFieldProps('secondProductTwo',{
    //     rules: [{ required: true,message: '备可用区不能为空' }]
    //   })
    // }
    // const CPUProps = getFieldProps('cpu',{
    //   rules: [{
    //     validator: function(rule, value, callback) {
    //       if(!value) return callback('CPU核数不能为空')
    //       if(!/^[0-9]+$/.test(value)) {
    //         return callback('请填入数字')
    //       }
    //       return callback()
    //     }
      // }]
    // })
    // const RAMProps = getFieldProps('ram', {
    //   rules: [{
    //     validator: function (rule, value, callback) {
    //       if(!value) {
    //         return callback('内存不能为空')
    //       }
    //       if (!/^[0-9]+$/.test(value)) {
    //         return callback('请填入数字')
    //       }
    //       return callback()
    //     }
    //   }]
    // })
    const func ={
      scope: this,
      loadData: this.refreshLoadBalancer
    }
    return (
      <div id='load_balancer'>
        <Title title="负载均衡" />
        <div className='handleBox'>
          <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
            <i className="fa fa-plus " aria-hidden="true"></i> 创建
          </Button>
          <Button className='buttonMarign' size="large" onClick={()=> this.refreshLoadBalancer(true)}>
            <i className="fa fa-refresh " aria-hidden="true"></i> 刷新
          </Button>
          <div className='searchDiv'>
            <Input placeholder='请输入负载均衡名搜索' onPressEnter={this.searchInput} onChange={this.searchChange} className='searchBox' size="large" id="loadBalancerSearch"/>
            <i className="fa fa-search btn-search" aria-hidden="true" onClick={this.searchInput}></i>
          </div>
          {
            dataSource.length
            ? <div className='totleNum'>
              共计 { dataSource.length } 条
            </div>
            : null
          }

        </div>
        <div className='tableBox'>
          <Table
            columns={columns}
            dataSource={dataSource}
            //rowSelection={rowSelection}
            pagination={{ simple: true }}
            loading={isFetching}
            className="strategyTable"
          />
        </div>

        { this.state.createVisible && <CreateModal func={func} />}

        <Modal
          title="删除负载均衡"
          visible={this.state.showDeleteModal}
          closable={true}
          onOk={() => this.deleteLB()}
          onCancel={() => this.setState({ showDeleteModal: false })}
          confirmLoading={this.state.deleting}
          wrapClassName="createLoadBalancer"
        >
          <div className="alertRow">
            确定要删除 <span style={{color: '#2DB7F5'}}>{ this.state.currentItem.name }</span> 吗？
          </div>
        </Modal>
      </div>
    )
  }
}

// LoadBalancer = Form.create()(LoadBalancer)

function mapStateToProp(state, props) {
  const { base_station,entities } = state
  let networksList  = []
  if(base_station.networks.result && base_station.networks.result.networks){
    networksList = base_station.networks.result.networks
  }
  let loadList = {
    isFetching: true,
    result: []
  }
  let allnames = []
  if(base_station.loadlist && base_station.loadlist.result){
    loadList = base_station.loadlist
    allnames = base_station.loadlist.result.map(item => {
      return item.vadcID
    })
  }
  const { puhua } = entities.loginUser.info
  return {
    allnames,
    networksList,
    loadList,
    puhua: puhua || {}
  }
}

export default connect(mapStateToProp, {
  loadopenstackRealLBList,
  createopenstackRealLB,
  deleteopenstackRealLB,
  loadNetworksList,
})(LoadBalancer)