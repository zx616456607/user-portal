/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Snapshot list component
 *
 * v0.1 - 2017-7-17
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Card, Table, Dropdown,Menu,Modal, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Title from '../../Title'
import CreateSnapshot from './CreateSnapshot'
import { getSnapshotList, deleteSnapshot, clearSnapshot } from '../../../actions/openstack/snapshot'
import { formatDate } from '../../../common/tools'
import '../style/OpenStack.less'
import NotificationHandler from '../../../common/notification_handler'
const Option = Select.Option
const Noti = new NotificationHandler()

class Snapshot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      confirmLoading: false,
      currentItem: {}
    }
  }
  componentWillMount() {
  }
  loadData(e) {

    const { getSnapshotList } = this.props
    getSnapshotList({project: this.state.currentProject}, {
      success: {
        func: (res) => {
          let snapshotsList = res.snapshots
          this.setState({
            dataSource: snapshotsList
          })
        }
      },
      finally:{
        func:()=> {
          if (e) {
            this.setState({searchValue: ''})
          }
        }
      }
    })
  }
  Modalfunc = (visible) => {
    this.setState({visible: visible})
  }
  resiseModalfunc = (e) => {
    this.setState({resiseModal: e})
  }
  deleteMoalfunc = () => {
    if(!this.state.currentProject) {
      return
    }
    const { deleteSnapshot } = this.props
    const { currentItem } = this.state

    let snapshot = {
      id: currentItem.id
    }
    this.setState({
      confirmLoading: true,
    })
    deleteSnapshot(snapshot,{project: this.state.currentProject}, {
      success: {
        func: () => {
          Noti.success('删除快照成功')
          this.loadData()
          this.setState({
            deleteMoal: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          let message = '删除快照失败，请重试'
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              message = '创建对象目录失败，请重试'
            }
          }
          Noti.error(message)
        }
      },
      finally: {
        func: () => {
          this.setState({
            confirmLoading: false,
          })
        }
      }
    })
  }

  searchInputChange = e => {
    let value = e.target.value
    this.setState({
      searchValue: value
    })
  }

  searchInput = () => {
    const { snapshotsList } = this.props
    const { searchValue } = this.state
    let result = snapshotsList.result
    if(!this.state.currentProject) {
      return
    }
    if(!searchValue){
      this.setState({
        dataSource: result
      })
    }
    const newList = snapshotsList.result.filter( list => {
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

  formatSnapshotStatus = status => {
    switch(status){
      case 'deleting':
        return <div className="stop"><i className="fa fa-circle"></i> 删除中</div>
      case 'available':
        return <div className="running"><i className="fa fa-circle"></i> 可用的</div>
      case 'creating':
        return <div className="padding"><i className="fa fa-circle"></i> 创建中</div>
      default:
        return  <div className="stop"><i className="fa fa-circle"></i> 未知的</div>
    }
  }
  changeProejct(value) {
    this.setState({
      currentProject: value
    })
    setTimeout(() => {
      this.loadData()
    }, 0)
  }
  render() {
    const { dataSource } = this.state
    const { snapshotsList } = this.props
    let isFetching = snapshotsList.isFetching
    const columns = [
      {
        title: '快照名称',
        dataIndex: 'name',
        key: 'imageName',
      }, {
        title: '云硬盘名称',
        dataIndex: 'volume',
        key: 'name',
        render: (text) => {
          if (text && text.name) {
            return <div>{text.name}</div>
          }
          return '-'
        }
      }, {
        title: '磁盘容量',
        dataIndex: 'size',
        key: 'size',
        render: (text) => <div>{text} G</div>
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'cretateTime',
        render: (text) => <div>{formatDate(text)}</div>
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: text => <div>{this.formatSnapshotStatus(text)}</div>
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, row)=> {
          return <Button type="ghost" onClick={()=> this.setState({deleteMoal: true, confirmLoading: false, currentItem: row})}>删除</Button>
        }
      }
    ]
    const paginationOpts = {
      simple: true,
      showTotal: total => `共计： ${total} 条`,
    }
    const funcCallback = {
      Modalfunc: this.Modalfunc
    }
    const resiseCallback = {
      resiseModalfunc: this.resiseModalfunc
    }
    return (
      <QueueAnim id="host">
        <Card key="snapshot" id="snapshot" style={{margin:20}}>
        <div id="host-body">
          <Title title="快照" />
          <div className="top-row" style={{paddingLeft: '0', marginTop: 0}} size="large">

            {/*<Button type="primary" size="large" icon="plus" onClick={()=> this.Modalfunc(true)}>创建快照</Button>*/}
            <Button type="ghost" size="large" onClick={()=> this.loadData(true)}><i className='fa fa-refresh' /> 刷新</Button>
            {/* <Button type="ghost" icon="delete">删除</Button> */}
            <Input size="large" placeholder="请输入快照名进搜索" style={{width:180}} value={this.state.searchValue} onPressEnter={this.searchInput} onChange={this.searchInputChange}/>
            <i className="fa fa-search btn-search" onClick={this.searchInput}/>
          </div>
          <div className="host-list" style={{paddingBottom: 26}}>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={ paginationOpts }
              loading={isFetching}
              className='reset_antd_Table_header_style'
            />
            {dataSource && dataSource.length >0?
              <span className="pageCount" style={{position:'absolute',right:'160px',top:'-40px'}}>共计 {dataSource.length} 条</span>
              :null
            }
          </div>

        </div>
        </Card>
        <CreateSnapshot visible={this.state.visible} func={funcCallback} project={this.state.currentProject}/>
        <Modal title="删除操作"
          visible={this.state.deleteMoal}
          onCancel={()=> this.setState({deleteMoal: false})}
          onOk={()=> this.deleteMoalfunc()}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="alertRow">确定要删除快照 <span style={{color: '#2DB7F5'}}>{this.state.currentItem.name}</span> 吗？</div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  const { base_station } = state
  let snapshotsList = {
    isFetching: true,
    result: []
  }
  if(base_station.snapshotsList){
    snapshotsList = base_station.snapshotsList
  }

  return {
    snapshotsList,
  }
}

export default connect(mapStateToProps, {
  getSnapshotList,
  deleteSnapshot,
})(Snapshot)