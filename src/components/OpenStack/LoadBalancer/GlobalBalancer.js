/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * glob balancer component
 *
 * v0.1 - 2018-1-22
 * @author baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Form, Select, Radio, Card } from 'antd'
import { connect } from 'react-redux'
// import './style/NewLoadBalancer.less'
import { Link, browserHistory } from 'react-router'
import NotificationHandler from '../../../common/notification_handler'
import {
  loadopenstackRealLBList,
  deleteopenstackRealLB
} from '../../../actions/openstack/lb_real'
// import { setOperationLogs } from '../../../actions/manage_monitor'
import CreateModal from './CreateLoadBalancer'

const loadType = 'gslb_'

class GlobalBalancer extends Component {
  constructor(props) {
    super()
  }
  state = {
    dataSource: [],
    selectedRowKeys: [],
    currentItem: {},
    createVisible: false,
  }
  componentWillMount() {
    this.renderData()
    // loadNetworksList()
    // this.props.setOperationLogs({
    //   operationType: 2,
    //   resourceType: 59,//负载均衡列表
    //   resourceName: 'loadBalancer',
    //   status: 200,
    // })
  }
  renderData() {
    const { loadList } = this.props
    let dataSource = []
    dataSource = Array.isArray(loadList) && loadList.filter(item => {
      if (/^gslb_/.test(item.name)) {
        return true
      }
      return false
    })
    this.setState({
      dataSource
    })
  }
  loadData() {
    this.props.loadopenstackRealLBList({},{
      success: {
        func: () => {
          this.renderData()
        },
        isAsync:true
      },
      finally: {
        func: () => {
          this.setState({searchValue: ''})
        }
      }
    })
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
          this.loadData()
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
        width: '25%',
      },{
        title: '状 态',
        dataIndex: 'vmList',
        key:'state',
        width: '15%',
        render: (text, record) =>{
          return(<div>{this.formatStatus(text[0].vmState)}</div>)
        }
      },{
        title: '管理IP地址',
        dataIndex: 'managementIp',
        key:'ip',
        width: '20%',
        render: text => {
          if (text) {
            return <a target="_blank" href={`http://${text}`}>{text}</a>
          }
          return '-'
        }
      },
      {
        title:'智能DNS',
        dataIndex:'dns',
        key:'dns',
        width: '15%',
        render:(text,record) => {
          return <Link to={`/base_station/load_balancer/dns/${record.name}?status=${record.vmList[0].vmState}`}>查看</Link>
        }
      },
      {
        title:'域名',
        dataIndex:'domain',
        key:'domain',
        width: '15%',
        render:(text,record) => {
          return <Link to={`/base_station/load_balancer/domain/${record.name}?status=${record.vmList[0].vmState}`}>查看</Link>
        }
      },
      {
        title: '操 作',
        width: '10%',
        render: (text, record) => <Button type="ghost" onClick={()=> this.openDeleteModal(record)}>删除</Button>
      }
    ]
    const func ={
      scope: this,
      loadData: ()=> this.loadData()
    }

    return (
      <div id='global-balancer' className="wrap-page">
        <div className='page-header'>
          <Button type="primary" className='buttonMarign' size="large" onClick={()=>this.openCreateModal()}>
            <i className="fa fa-plus" ></i>创建
          </Button>
          <Button className='buttonMarign' size="large" onClick={()=> this.loadData()}>
          <i className="fa fa-refresh" ></i>刷新
          </Button>
          <Input placeholder='请输入名称搜索'
            onChange={(e)=> this.setState({searchValue: e.target.value})}
            onPressEnter={()=> this.searchInput()} value={this.state.searchValue}
            size="large"
          />
          <i className="fa fa-search" onClick={()=> this.searchInput()} ></i>
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

// LoadBalancer = Form.create()(LoadBalancer)

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
      if (/^gslb_/.test(item.name)) {
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
  deleteopenstackRealLB
  // setOperationLogs
})(GlobalBalancer)