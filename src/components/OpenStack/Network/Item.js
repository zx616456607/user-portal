/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * network list component
 *
 * v0.1 - 2017-7-18
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Card, Table,Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadNetworksList, deleteNetwork,searchNetworks, clearNetworkList } from '../../../actions/openstack/networks'
import { camelize } from 'humps'
import CreateModal from './CreateModal'
import { formatDate } from '../../../common/tools'
import NotificationHandler from '../../../common/notification_handler'
const notificat = new NotificationHandler()

class Network extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillUnmount() {
    this.props.clearNetworkList()
  }
  loadData = ()=>{
    this.props.loadNetworksList({
      finally: {
        func: () => {
          this.refs.networkName.refs.input.value = ""
        }
      }
    })
  }
  queryList() {
    if(!this.state.currentProject) {
      return
    }
    const name = this.refs.networkName.refs.input.value

    if (name == '') {
      this.loadData()
      return
    }
    this.props.searchNetworks(name)
  }
  Modalfunc =(e)=> {
    this.setState({create: e})
    setTimeout(()=> {
      this.setState({editer: false})
    },1000)
    if (!!e) {
      setTimeout(()=> {
        document.getElementById('netName').focus()
      },300)
    }
  }
  deleteAction(id) {
    this.setState({deleteMoal: true,id,editer: false})
  }
  editAction(id) {
    this.setState({editer: true,id, create: true})
  }
  deleteMoalfunc() {

    const { id }= this.state
    this.setState({actionLoading: true})
    this.props.deleteNetwork(id,{
      success:{
        func:()=> {
          notificat.success('删除成功')
          this.loadData()
        },
        isAsync: true
      },
      failed:{
        func:(err)=> {
          if (err.statusCode == 409) {
            notificat.warn('删除失败', '当前网络正在使用中，解绑后可删除')
            return
          }
          notificat.error('删除失败',err.message.NeutronError.message)
        }
      },
      finally:{
        func:()=> {
          this.setState({deleteMoal: false,actionLoading: false})
        }
      }
    })
  }
  getStatus(status) {
    if(!status) return ''
    switch (status) {
    case 'ACTIVE':
      return 'active'
    case 'BUILD':
      return 'build'
    case 'SHUTOFF':
      return 'shutoff'
    default:
      return 'unkonow'
    }
  }

  createBtn() {
    this.Modalfunc(true)
  }
  render() {
    const { networksList, isFetching } = this.props
    const columns = [
      {
        title: '专有网络名称',
        dataIndex: 'name',
        key: 'name',
        width:'25%',
        render: (text,row) => <Link to={`/OpenStack/net/${row.name}/${row.id}`}>{text}</Link>
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'self',
        width:'15%',
        render: text => {
          let status = this.getStatus(text)
          if (status == 'active') {
            return <div className="running"><i className="fa fa-circle"></i> 可用</div>
          }
          if(status == 'build') {
            return <div className="padding"><i className="fa fa-circle"></i> 创建中</div>
          }
          if(status == 'shutoff') {
            return <div className="stop"><i className="fa fa-circle"></i> 已停止</div>
          }
          return <div className="stop"><i className="fa fa-circle"></i> 未知</div>
        }
      }, {
        title: '创建时间',
        dataIndex: camelize('created_at'),
        key: 'created_at',
        width:'20%',
        render: text => formatDate(text)
      }, {
        title: '默认专有网络',
        dataIndex: camelize('router:external'),
        key: 'defaultwork',
        width:'15%',
        render: (text, row) => {
          if (!text && !row.shared) {
            return <div style={{paddingLeft:10}}>是</div>
          }
          return <div style={{paddingLeft:10}}>否</div>
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width:'15%',
        render: (text, row)=> {
          return <div>
            <Button type="ghost" onClick={()=> this.deleteAction(row.id)}>删除</Button>
          </div>
        }
      }
    ]
    const paginationOpts = {
      simple: true,
      pageSize: 10,
    }
    const funcCallback = {
      Modalfunc: this.Modalfunc
    }
    return (
      <div id="openstack">
        <div className="top-row">
          <Button type="primary" size="large" onClick={()=> this.createBtn()}><i className="fa fa-plus" aria-hidden="true"></i> 创建</Button>
          <Button type="ghost" size="large"  onClick={this.loadData}><i className='fa fa-refresh' /> 刷新</Button>
          <Input placeholder="请输入网络名搜索" ref="networkName" onPressEnter={()=> this.queryList()} size="large" style={{width:180,paddingRight:20}}/>
          <i className="fa fa-search btn-search" onClick={()=> this.queryList()} />
        </div>
        <Card key="net" id="host-body" className="host-list">
          <Table dataSource={networksList} columns={columns} pagination={ paginationOpts } loading={isFetching} className="strategyTable" />
          {networksList && networksList.length >0 ?
            <span className="pageCount">共计 {networksList.length} 条</span>
            :null
          }
        </Card>
        {this.state.create ?
          <CreateModal visible={this.state.create} id={this.state.id} editer={this.state.editer} data={networksList} func ={funcCallback} />
        :null
        }
        <Modal title="删除操作"
          visible={this.state.deleteMoal}
          onCancel={()=> this.setState({deleteMoal: false})}
          onOk={()=> this.deleteMoalfunc()}
          confirmLoading={this.state.actionLoading}
        >
          <div className="alertRow">确定要删除当前网络？</div>
        </Modal>

      </div>
    )
  }
}

function mapStateToProps(state,props) {
  const { networks } = state.openstack
  let networksList = []
  let isFetching
  if (networks && networks.result) {
    networksList = networks.result.networks
    isFetching = networks.isFetching
  }

  return {
    networksList,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  loadNetworksList,
  deleteNetwork,
  searchNetworks,
  clearNetworkList
})(Network)