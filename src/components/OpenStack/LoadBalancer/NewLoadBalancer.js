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
import { Button, Input, Table, Modal, Form, Select, Radio, Card } from 'antd'
import { connect } from 'react-redux'
import './style/NewLoadBalancer.less'
import { Link, browserHistory } from 'react-router'
import NotificationHandler from '../../../common/notification_handler'
import {
  loadopenstackRealLBList,
  createopenstackRealLB,
  deleteopenstackRealLB,
} from '../../../actions/openstack/lb_real'
// import { loadNetworksList } from '../../../actions/openstack/networks'
// import { setOperationLogs } from '../../../actions/manage_monitor'
import Title from '../../Title'
import CreateModal from './CreateLoadBalancer'
const Option = Select.Option
const loadType = 'slb_'

class LoadBalancer extends Component {
  constructor(props) {
    super()
    this.searchInput = this.searchInput.bind(this)
    this.formatStatus = this.formatStatus.bind(this)
    this.comfirmCreate = this.comfirmCreate.bind(this)
    this.openCreateModal = this.openCreateModal.bind(this)
    this.refreshLoadBalancer = this.refreshLoadBalancer.bind(this)
    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      currentItem: {},
      createVisible: false,
      loadingCreate: false,
    }
  }

  componentWillMount() {
    // const { loadNetworksList } = this.props
    this.refreshLoadBalancer()
    // loadNetworksList()
    // this.props.setOperationLogs({
    //   operationType: 2,
    //   resourceType: 59,//负载均衡列表
    //   resourceName: 'loadBalancer',
    //   status: 200,
    // })
  }
  searchInput() {
    const { loadList } = this.props
    const { searchValue } = this.state
    if(!searchValue){
      this.setState({
        dataSource: loadList
      })
      return
    }
    const newList = loadList.filter( list => {
      const search = new RegExp(searchValue)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      dataSource: newList
    })
  }

  refreshLoadBalancer(reload) {
    const { loadopenstackRealLBList } = this.props
    loadopenstackRealLBList({}, {
      success: {
        func: (res) => {
          let list = []
          if(res.vnfs){
            list = res.vnfs.filter(item => {
              if (!/^gslb_/.test(item.name)) {
                return true
              }
              return false
            })
          }
          this.setState({
            dataSource: list
          })
        }
      },
      finally: {
        func: () => {
          if (reload) {
            this.setState({searchValue: ''})
          }
        }
      }
    })
  }
  openDeleteModal(record){
    this.setState({
      currentItem: record,
      showDeleteModal: true,
      deleting: false,
    })
  }
  formatStatus(status) {
    switch(status.toUpperCase()){
      case 'ERROR':
        return <div className='stop'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 错误</div>
      case 'ACTIVE':
        return <div className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已启动</div>
      case 'CONNECTED':
        return <div className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已连接</div>
      case 'BUILDING': {
        return <div className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 创建中</div>
      }
      case 'SHUTOFF':
        return <div className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 停止</div>
      case 'UNKNOWN':
      default:
        return <div style={{color: '#999'}}><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 未知</div>
    }
  }
  openCreateModal() {
    const { form } = this.props
    this.setState({
      createVisible: true
    })
    setTimeout(()=> {
      document.getElementById('name').focus()
    },300)
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
          let message = ''
          message = res.message || res.mes
          notification.error('负载均衡删除失败请求',message)
          this.setState({
            deleting: false
          })
        }
      }
    })
  }
  comfirmCreate() {
    const { form } = this.props
    this.setState({
      loadingCreate: true
    })
    form.validateFields((errors,value) => {
      if(!!errors){
        this.setState({
          loadingCreate: false
        })
        return
      }
      this.setState({
        loadingCreate: false
      })
    })
  }

  render() {
    const { dataSource,selectedRowKeys } = this.state
    const { form,loadList,isFetching } = this.props
    // const { getFieldProps,getFieldValue } = form
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '20%',
        // render: (text,record) =>
        // <Link to={`/base_station/load_balancer/detail/${text}?status=${record.vmList[0].vmState}`}>{text}</Link>
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
        width: '15%',
        render: text => {
          if (text) {
            return <a target="_blank" href={`http://${text}`}>{text}</a>
          }
          return '-'
        }
      },{
        title: '健康检查',
        dataIndex: 'extension.healthChecks',
        width: '14%',
        render: (text,record) => <div>{text && text.length >0
          ?
          <div className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/health_examination/${record.name}?status=${record.vmList[0].vmState}`)}>管理</div>
          :<div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/health_examination/${record.name}?status=${record.vmList[0].vmState}`)}>配置</span> )</div>
        }</div>
      },{
        title: '服务池',
        dataIndex: 'extension.pools',
        key:'pools',
        width: '14%',
        render: (text,record) => <div>{text && text.length>0
          ?
          <div className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/service_pool/${record.name}?status=${record.vmList[0].vmState}`)}>管理</div>
          :<div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/service_pool/${record.name}?status=${record.vmList[0].vmState}`)}>配置</span> )</div>
        }</div>
      },{
        // title: 'DNS',
        // dataIndex: 'extension',
        // key:'dns',
        // width: '10%',
        // render: (text,record) => <div>{text.dns
        //   ?
        //   <div>已配置</div>
        //   :<div>未配置 ( <span className='configuration' onClick={() => browserHistory.push(`/base_station/load_balancer/DNS/${record.key}`)}>配置</span> )</div>
        // }</div>
      },
      {
        title:'虚服务',
        dataIndex:'extension.vips',
        key:'vips',
        render:(vips,record) => {
          if (vips && vips.length >0) {
            return <Link to={`/base_station/load_balancer/detail/${record.name}?status=${record.vmList[0].vmState}`}>管理</Link>
          }
          return <div>未配置 ( <Link to={`/base_station/load_balancer/detail/${record.name}?status=${record.vmList[0].vmState}`}>配置</Link> ) </div>
        }
      },
      {
        title: '操 作',
        width: '12%',
        render: (text, record) => <Button type="ghost" onClick={()=> this.openDeleteModal(record)}>删除</Button>
      }
    ]
    const func ={
      scope: this,
      loadData: this.refreshLoadBalancer
    }
    return (
      <div id='load-balancer' className="wrap-page">
        <Title title="负载均衡" />
        <div className='page-header'>
          <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
            <i className="fa fa-plus" ></i>创建
          </Button>
          <Button className='buttonMarign' size="large" onClick={()=> this.refreshLoadBalancer(true)}>
          <i className="fa fa-refresh" ></i>刷新
          </Button>
          <Input placeholder='请输入名称搜索'
            onChange={(e)=> this.setState({searchValue: e.target.value})}
            onPressEnter={this.searchInput} value={this.state.searchValue}
            size="large"
          />
          <i className="fa fa-search" onClick={this.searchInput} ></i>
        </div>
        { dataSource && dataSource.length >0?
          <div className='table-pagination'>
            共计 {dataSource.length} 条
          </div>
          :null
        }
        <Card>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{ simple: true }}
            loading={isFetching}
            className="reset-ant-table"
          />
        </Card>
        { this.state.createVisible &&
           <CreateModal func={func} type={loadType} data={loadList || []} />
        }
        <Modal
          title="删除负载均衡"
          maskClosable={false}
          visible={this.state.showDeleteModal}
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

LoadBalancer = Form.create()(LoadBalancer)

function mapStateToProp(state, props) {
  const { base_station,entities } = state
  let networksList  = []
  if(base_station.networks.result && base_station.networks.result.networks){
    networksList = base_station.networks.result.networks
  }
  let defaultLoadList = {
    isFetching: true,
    result: []
  }
  let { loadlist }  = base_station
  let isFetching = loadlist.isFetching
  if (base_station.loadlist.result) {
    loadlist = loadlist.result.filter(item => {
      if (!/^gslb_/.test(item.name)) {
        return true
      }
      return false
    })
  }
  const { puhua } = entities.loginUser.info
  return {
    networksList,
    loadList: loadlist || defaultLoadList,
    isFetching,
    puhua: puhua || {}
  }
}

export default connect(mapStateToProp, {
  // loadNetworksList,
  loadopenstackRealLBList,
  deleteopenstackRealLB,
  createopenstackRealLB,
  // setOperationLogs
})(LoadBalancer)