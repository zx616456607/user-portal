/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host list component
 *
 * v0.1 - 2017-7-14
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Card, Table, Dropdown,Menu,Modal, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import '../style/OpenStack.less'
import HostModal from './HostModal'
import ResiseModal from './Resise'
import ReHostname from './Rename'
import { getVMList, updateVM, deleteVM, clrearVMList, editVM } from '../../../actions/openstack/calculation_service'

import NotificationHander from '../../../common/notification_handler'
const Option = Select.Option
const notification = new NotificationHander()

class Host extends Component {
  constructor(props) {
    super()
    this.state = {
      hostModal: false,
      disableResize: false,
      selectedRowKeys:[],
      disableVNC: true
    }
  }
  componentWillMount() {

  }
  componentWillUnmount() {
    this.props.clrearVMList()
  }
  loadData = (query, needLoading, callback) => {
    const noti = new NotificationHander()

    let fetchQuery = {
      project: this.state.currentProject
    }
    let fetchLoading = true
    if(query){
      fetchQuery = query
    }
    if(typeof needLoading == 'boolean'){
      fetchLoading = needLoading
    }
    this.props.getVMList(fetchQuery, fetchLoading, {
      finally: {
        func: () => {
          this.setState({operating: false})
          document.getElementById('searchInput').value = ""
        }
      }
    })
  }

  searchVM() {
    const noti = new NotificationHander()
    if(!this.state.currentProject) {
      return
    }
    const searchInput = this.searchInput
    const searchName = document.getElementById('searchInput').value

    if(!searchName) {
      this.props.getVMList('', false)
      return
    }
    this.props.getVMList({
      name: searchName,
      project: this.state.currentProject
    }, false)
  }

  hostModalfunc = (visible) => {
    this.setState({hostModal: visible})
  }
  resiseModalfunc = (e) => {
    this.setState({resiseModal: e})
  }
  deleteMoalfunc() {
  }
  getVMStatus(status) {
    if(!status) return ''
    switch (status) {
    case 'ACTIVE':
      return 'active'
    case 'BUILD':
      return 'build'
    case 'SHUTOFF':
      return 'shutoff'
    case 'ERROR':
      return 'error'
    case 'VERIFY_RESIZE':
      return 'confirm'
    case 'RESIZE':
      return 'resize'
    default:
      return 'unkonow'
    }
  }
  showConfirmModal(item, row) {
    if(item.key == 'delete'){
      this.setState({
        deleteMoal: true,
        currentEntity: row,
        action: item.key || item,
      })
      return
    }
    if(item.key == 'resize') {
      this.setState({
        currentHost: row,
        resiseModal: true
      })
      return
    }
    if (item.key ==='editor') {
      this.setState({
        currentHost: row,
        editModal: true
      })
      return
    }
    this.setState({
      confirmModal: true,
      currentEntity: row,
      action: item.key || item
    })
  }
  hideConfirmModal() {
    this.setState({
      confirmModal: false
    })
  }
  operateVM(){
    const { action, currentEntity, currentProject } = this.state
    if(this.state.operating) return
    this.setState({
      operating: true
    })

    if(action == 'start') {
      if(['active', 'build'].indexOf(this.getVMStatus(currentEntity.status)) >= 0) {
        notification.info('当前云主机正处于运行或启动状态')
        this.setState({
          operating: false
        })
        return
      }
    }
    if(action == 'stop') {
      if (['shutoff'].indexOf(this.getVMStatus(currentEntity.status)) >= 0) {
        notification.info('当前云主机正处于停止或正在停止状态')
        this.setState({
          operating: false
        })
        return
      }
    }
    if(action == 'delete') {
      const { deleteVM } = this.props
      notification.spin(`删除云主机请求提交中`)
      const self = this
      deleteVM(currentEntity.id, {project: currentProject}, {
        success: {
          func: () => {
            self.setState({
              operating: false,
              deleteMoal: false,
              confirmModal: false
            })
            notification.close()
            notification.success(`删除云主机请求已提交`)
            setTimeout(() => self.loadData('', false), 2000)
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              operating: false
            })
            notification.close()
            let message = `删除云主机失败`
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                message = `删除云主机失败`
              }
            }
            notification.error(message)
          }
        }
      })
      return
    }
    const { updateVM } = this.props
    notification.spin(`${action == 'start' ? '启动' : '停止'}云主机中`)
    const self = this
    updateVM(currentEntity.id, action,{ project: currentProject}, {
      success: {
        func: () => {
          this.setState({
            operating: false,
            confirmModal: false
          })
          notification.close()
          notification.success(`云主机${action == 'start' ? '启动' : '停止'}请求已提交`)
          setTimeout(() => self.loadData('', false), 2000)
          return
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.setState({
            operating: false
          })
          notification.close()
          let message = `${action == 'start' ? '启动' : '停止'}云主机失败`
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              message = `${action == 'start' ? '启动' : '停止'}云主机失败`
            }
          }
          notification.error(message)
        }
      }
    })
  }
  confirmUpdate(currentEntity) {
    const noti = new NotificationHander()

    const { updateVM } = this.props

    noti.spin(`确认请求提交中`)
    if(this.state.operating) {
      return
    }
    this.setState({
      operating: true
    })
    updateVM(currentEntity.id, 'confirm', {project: this.state.currentProject}, {
      success: {
        func: () => {
          this.setState({
            operating: false
          })
          noti.close()
          noti.success(`确认请求已提交`)
          setTimeout(() => this.loadData('', false), 2000)
          return
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.setState({
            operating: false
          })
          noti.close()
          let message = `确认请求提交失败`
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {

            }
          }
          noti.error(message)
        }
      }
    })
  }

  revertUpdate(currentEntity) {
    const noti = new NotificationHander()

    const { updateVM } = this.props

    if(this.state.operating) {
      return
    }
    noti.spin(`撤销请求提交中`)
    this.setState({
      operating: true
    })
    updateVM(currentEntity.id, 'revert', {project: this.state.currentProject},{
      success: {
        func: () => {
          this.setState({
            operating: false
          })
          noti.close()
          noti.success(`撤销请求已提交`)
          setTimeout(() => this.loadData('', false), 2000)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.setState({
            operating: false
          })
          noti.close()
          let message = `撤销请求提交失败`
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {

            }
          }
          noti.error(message)
        }
      }
    })
  }
  menu (row){
    const disabled = this.getVMStatus(row.status)
    return <Menu onClick={(item) => this.showConfirmModal(item, row)} style={{width:80}}>
        {/*<Menu.Item key="start">启动</Menu.Item>*/}
        {/*<Menu.Item key="stop">停止</Menu.Item>*/}
        <Menu.Item key="editor">编辑</Menu.Item>
        <Menu.Item key="delete">删除</Menu.Item>
      <Menu.Item key="resize" disabled={disabled != 'active' }>升降配</Menu.Item>

    </Menu>
  }

  resizeCallback() {
    return () => {
      const noti = new NotificationHander()

      this.setState({
        resiseModal:false
      })
      this.loadData()
    }
  }
  resisModalFunc() {
    return (arg) => {
      const noti = new NotificationHander()

      this.setState({
        resiseModal: arg
      })
    }
  }

  VNCLogin(){
    const noti = new NotificationHander()
    const currentHost = this.state.currentHost
    if(!currentHost) {
      return
    }
    const { updateVM } = this.props
    updateVM(currentHost.id, 'getvnc', {project: this.state.currentProject},{
      success: {
        func: (res) => {
          if(res.console.url) {
            window.open(res.console.url)
          }
        }
      },
      failed: {
        func: (res) => {

          let message = `VNC登录失败`
          if (res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              message = `VNC登录失败`
            }
          }
          notification.error(message)
        }
      }
    })
  }
  handleEdit(newName) {

    this.setState({edithosting: true})
    this.props.editVM(this.state.currentHost.id,newName,{
      success:{
        func:(res)=> {
          notification.success('云主机名称修改成功')
          this.loadData()
          this.setState({editModal: false,edithosting: false})
        },
        isAsync: true
      },
      failed:{
        func:()=> {
          this.setState({edithosting: false})
          notification.warn('云主机名称修改失败')
        }
      }
    })
  }
  render() {
    const { servers, project,puhua } = this.props
    const columns = [
      {
        title: '云主机名称',
        dataIndex: 'name',
        key: 'name',
        render: (text,row) => <Link to={`/OpenStack/calculate/${row.id}/${row.name}?project=${this.state.currentProject}`}>{text}</Link>,
        width: '25%'
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: '15%',
        render: (text, row) => {
          const status = this.getVMStatus(text)
          if (status == 'active') {
            return <div className="running"><i className="fa fa-circle"></i> 运行中</div>
          }
          if(status == 'build') {
            return <div className="padding"><i className="fa fa-circle"></i> 创建中</div>
          }
          if(status == 'shutoff') {
            return <div className="stop"><i className="fa fa-circle"></i> 已停止</div>
          }
          if(status == 'resize') {
            return <div className="padding"><i className="fa fa-circle"></i> 配置更改中</div>
          }
          if(status == 'confirm') {
            return <div className="padding"><i className="fa fa-circle"></i>更改确认 <Button type="primary" size="small" onClick={() => this.confirmUpdate(row)}>确认</Button><Button type="ghost" size="small" onClick={() => this.revertUpdate(row)}>取消</Button></div>
          }
          if(status == 'error') {
            return <div className="stop"><i className="fa fa-circle"></i> 异常</div>
          }
          return <div className="stop"><i className="fa fa-circle"></i> 未知</div>
        }
      }, {
        title: '配置信息',
        dataIndex: 'flavor',
        key: 'flavor',
        width: '20%',
        render: flavor => {
          const memory = flavor.ram / 1024
          const cpus = flavor.vcpus
          return `${cpus}U${memory}G`
        }
      }, {
        title: '所属区域',
        dataIndex: 'oSEXTAZ:availabilityZone',
        key: 'oSEXTAZ:availabilityZone',
        width: '20%',
      }, {/*
        title: '所属应用',
        dataIndex: 'app',
        key: 'app',
        render: () => {
          return project.name
        }
      */}, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: '20%',
        render: (text, row)=> {
          const status = this.getVMStatus(row.status)
          if (status == 'active') {
            return <Dropdown.Button overlay={this.menu(row)} onClick={() => this.showConfirmModal('stop', row)} type="ghost" trigger={['click']}>停止</Dropdown.Button>
          } if(status == 'shutoff') {
            return <Dropdown.Button overlay={this.menu(row)} type="ghost" onClick={() => this.showConfirmModal('start', row)}  trigger={['click']}>启动</Dropdown.Button>
          }
          return  <Dropdown.Button overlay={this.menu(row)} type="ghost" onClick={() => this.showConfirmModal('delete', row)}  trigger={['click']}>删除</Dropdown.Button>
        }
      }
    ]
    const paginationOpts = {
      simple:true,
      pageSize: 10,
    }
    const funcCallback = {
      hostModalfunc: this.hostModalfunc
    }
    const resiseCallback = {
      resiseModalfunc: this.resiseModalfunc
    }
    const self = this
    const rowSelection = {
      selectedRowKeys:this.state.selectedRowKeys,
      onChange:function(selectName, selectRows) {
        self.setState({selectedRowKeys: selectName})
        if(selectName.length == 1 || selectName.length == 0) {
          self.setState({
            currentHost: selectRows[0]
          })
          if (selectRows[0]) {
            const status = self.getVMStatus(selectRows[0].status)
            if (status == 'active') {
              self.setState({
                disableVNC: false,
                disableResize: false
              })
            } else {
              self.setState({
                disableVNC: true,
                disableResize: true
              })
            }
          } else {
            self.setState({
              disableVNC: true,
              disableResize: false
            })
          }
          return
        }
        self.setState({
          disableVNC: true,
          disableResize: false,
          currentHost: selectRows[selectRows.length-1]
        })
      },
    }
    return (
      <QueueAnim id="openstack">
        <div key="host" id="host-body">
          <div className="top-row">
            <Button type="primary" size="large" onClick={()=> this.hostModalfunc(true)}><i className="fa fa-plus" aria-hidden="true"></i> 创建云主机</Button>
            <Button type="ghost" size="large" icon="arrow-salt" className="resise" disabled={this.state.disableResize} onClick={()=> this.resiseModalfunc(true)}>升降配</Button>
            <Button type="ghost" size="large" className="resise" disabled={this.state.disableVNC} onClick={()=> this.VNCLogin()}>VNC登录</Button>
            <Button type="ghost" size="large" onClick={() => this.loadData()}><i className='fa fa-refresh' /> 刷新</Button>
            <Input placeholder="请输入名称进行搜索" size="large" id="searchInput" style={{width:180}} ref={(instance) => this.searchInput = instance} onPressEnter={() => this.searchVM()}/>
            <i className='fa fa-search btn-search' onClick={() => this.searchVM()}></i>
          </div>
          <Card className="host-list">
            <Table
              rowKey={record => record.id}
              rowSelection={rowSelection}
              dataSource={servers.servers}
              columns={columns}
              pagination={ paginationOpts }
              loading={servers.isFetching}
              className="strategyTable"
            />
            {servers.servers && servers.servers.length >0 ?
              <span className="pageCount" style={{position:'absolute',right:'160px',top:'37px'}}>共计 {servers.servers.length} 条</span>
              :null
            }
          </Card>

        </div>
        <HostModal visible={this.state.hostModal} func={funcCallback} getListCallback={this.props.getVMList.bind(this, '', false)} hideHotModal={() => this.setState({hostModal: false})} servers={servers.servers} currentProject={this.state.currentProject}/>
        {
          this.state.resiseModal && <ResiseModal visible={this.state.resiseModal} func={resiseCallback} resizeCallback={this.resizeCallback()} currentHost={this.state.currentHost} currentProject={this.state.currentProject}/>
        }
        <Modal title="删除操作"
          visible={this.state.deleteMoal}
          onCancel={()=> this.setState({deleteMoal: false})}
          onOk={()=> this.operateVM()}
        >
          <div className="alertRow" style={{wordBreak: 'break-all'}}>{ `确定要删除 ${this.state.currentEntity ? this.state.currentEntity.name : ''} 吗?`}</div>
        </Modal>
        <Modal title={`${this.state.action == 'start' ? '启动' : '停止'}操作`}
          visible={this.state.confirmModal}
          onCancel={()=> this.hideConfirmModal()}
          onOk={()=> this.operateVM()}
          >
          <div className="alertRow" style={{wordBreak: 'break-all'}}>{`确定${this.state.action == 'start' ? '启动' : '停止'}云主机 ${this.state.currentEntity ? this.state.currentEntity.name : ''} ?`}</div>
        </Modal>
        {
          this.state.editModal &&
          <Modal title="编辑云主机" visible={true}
          onCancel={()=> this.setState({editModal: false})}
          footer={null}
          >
            <ReHostname
              value={this.state.currentHost.name}
              handleEdit={this.handleEdit.bind(this)}
              onCancel= {()=> this.setState({editModal: false})}
              loading={this.state.edithosting}
              servers={servers.servers}
             />
          </Modal>
        }
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  const { currentProject, puhua } = state.entities.loginUser.info
  const project = currentProject ? currentProject : ''
  let { host, networks } = state.openstack
  let defaultServers = {
    isFetching: false,
    servers: []
  }
  let defaultYCProjects = {
    isFetching: false,
    projects:[]
  }

  return {
    project,
    puhua: puhua || {},
    servers: host,
  }
}

export default connect(mapStateToProps,{
  getVMList,
  updateVM,
  deleteVM,
  editVM,
  clrearVMList
})(Host)
