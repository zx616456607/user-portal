/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: service list
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Button, Table, Menu, Dropdown, Pagination, Modal  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import CommonSearchInput from '../../CommonSearchInput'
import './style/VMServiceList.less'
import { getVMserviceList, vmServiceDelete, serviceDeploy } from '../../../actions/vm_wrap'
import { UPDATE_INTERVAL } from '../../../constants'
import NotificationHandler from '../../../components/Notification'
import TenxStatus from '../../TenxStatus/index'
import Title from '../../Title'

class VMServiceList extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      selectedRowKeys: [],
      service: [],
      current: 1,
      name: '',
      loading: false,
      searchValue: "",
      isShowRePublishModal: false,
      currApp: {},
      reConfirmLoading: false,
    }
  }
  componentWillMount() {
    const { searchValue } = this.state
    this.pageAndSerch(searchValue,1,true)
  }
  componentDidMount() {
    this.updateServiceStatus = setInterval(()=>{
      this.pageAndSerch(null,1,false)
    },UPDATE_INTERVAL)
  }
  componentWillUnmount() {
    clearInterval(this.updateServiceStatus)
  }
  addKey(arr) {
    for (let i = 0; i < arr.length; i++) {
      Object.assign(arr[i],{key:arr[i].serviceId})
    }
  }
  handleButtonClick(record) {
    this.setState({
      reConfirmLoading: true,
    }, () => {
      const { serviceDeploy } = this.props;
      const { searchValue } = this.state;
      let notify = new NotificationHandler()
      serviceDeploy(record.serviceId,{
        success: {
          func: res => {
            this.pageAndSerch(searchValue,1,true)
            notify.success('重新部署成功')
            this.setState({
              isShowRePublishModal: false,
              currApp: {},
            })
          },
          isAsync: true
        },
        failed:{
          func: res => {
            if (res.statusCode === 400){
              this.pageAndSerch(searchValue,1,true)
              notify.warn('传统应用环境已被删除（或无法连接），请重新添加部署环境\n')
              return
            }
            this.pageAndSerch(searchValue,1,true)
            notify.error('重新部署失败')
          },
          isAsync: true
        },
        finally: {
          func: () => {
            this.setState({
              reConfirmLoading: false,
            })
          }
        }
      })
    })
  }

  handleMenuClick(e,record) {
    if (e.key === 'delete') {
      this.setState({
        currentVM: record,
        deleteVisible: true
      })
    }
  }

  cancelModal = () => {
    this.setState({
      deleteVisible: false
    })
  }

  confirmModal = () => {
    const { vmServiceDelete } = this.props;
    const { currentVM, searchValue } = this.state
    let notify = new NotificationHandler()
    notify.spin('删除中')
    this.setState({
      confirmLoading: true
    })
    vmServiceDelete({
      serviceId: currentVM.serviceId
    },{
      success: {
        func: () => {
          notify.close()
          this.pageAndSerch(searchValue,1,true)
          notify.success('删除应用成功')
          this.setState({
            deleteVisible: false,
            confirmLoading: false
          })
        },
        isAsync:true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('删除应用失败')
          this.setState({
            deleteVisible: false,
            confirmLoading: false
          })
        }
      }
    })
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
  }

  pageAndSerch(name,n,flag) {
    const { getVMserviceList } = this.props;
    let notify = new NotificationHandler()
    if (flag) {
      this.setState({
        loading: true
      })
    }
    getVMserviceList({
      page: n || 1,
      size:10,
      name
    },{
      success: {
        func: (res) => {
          this.addKey(res.results)
          this.setState({
            service:res.results,
            total:res.count,
            name,
            loading: false
          })
        },
        isAsync:true
      },
      failed: {
        func: res => {
          this.setState({
            service: [],
            loading: false
          })
          if (res.statusCode >= 500) {
            notify.warn('传统应用环境服务端异常', '请联系管理员检查后端相关服务')
          }
        }
      }
    })
  }
  getServiceStatus(status) {
    let phase,progress = {status: false};
    if (status === 0) {
      phase = 'Deploying'
      progress = {status: true}
    } else if (status === 1) {
      phase = 'UploadPkgAndEnvFailed'
    } else if (status === 2) {
      phase = 'UploadPkgAndEnvSuccess'
    } else if (status === 3) {
      phase = 'ServiceInitFailed'
    } else if (status === 4) {
      phase = 'ServiceNormalFailed'
    } else {
      phase = 'Running'
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  onPublishOk = () => {
    this.handleButtonClick(this.state.currApp)
  }
  render() {
    const { service, loading, deleteVisible,
      confirmLoading, searchValue, isShowRePublishModal,
      currApp, reConfirmLoading } = this.state;

    const columns = [{
      title: '应用名',
      dataIndex: 'serviceName',
      key: 'serviceName'
    }, {
      title: '描述',
      width: '15%',
      dataIndex: 'description',
      key: 'description',
      render:text => text || '',
    }, {
      title: '状态',
      width: '15%',
      dataIndex: 'serviceStatus',
      key: 'serviceStatus',
      render:(text,record) => this.getServiceStatus(text)
    }, {
      title: '部署包（版本标签）',
      width: '10%',
      dataIndex: 'packages',
      key: 'packages',
      render:text => text.length ? text : '-',
    },{
      title: '部署环境IP',
      dataIndex: 'host',
      key: 'host',
      width: '10%'
    },{
      title: '环境实例',
      dataIndex: 'tomcatInstance',
      key: 'tomcatInstance',
      width: '10%',
      // render: tomcats => <div>{tomcats.map(item => item.name).join('<br />')}</div>
    },{
      title: '服务地址',
      dataIndex: 'healthCheck',
      width: '15%',
      render: text => <a href={text} target="_blank">{text}</a>
    },{
      title: '最后修改人',
      dataIndex: 'updateUserName',
      key: 'updateUserName'
    },{
      title: '操作',
      render: (text,record)=>{
        const menu = (
          <Menu onClick={(e)=>this.handleMenuClick(e,record)}>
            <Menu.Item key="delete">&nbsp;删除应用&nbsp;&nbsp;</Menu.Item>
          </Menu>
        )
        return (
          <Dropdown.Button onClick={() => this.setState({ isShowRePublishModal: true, currApp: record })} overlay={menu} type="ghost">
            重新部署
          </Dropdown.Button>
        )
      }
    }];

    const pageOption = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: service.total,
      onChange: (n)=>this.pageAndSerch(null,n,true)
    }
    return (
      <QueueAnim>
        <div key='vmServiceList' className="vmServiceList">
          <Modal
            title="删除传统应用"
            visible={deleteVisible}
            confirmLoading={confirmLoading}
            onCancel={this.cancelModal}
            onOk={this.confirmModal}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle"/>
              确定删除该传统应用？
            </div>
          </Modal>
          {
            isShowRePublishModal ?
              <Modal
                title="重新部署"
                visible={isShowRePublishModal}
                confirmLoading={reConfirmLoading}
                onOk={this.onPublishOk}
                onCancel={() => this.setState({ isShowRePublishModal: false, currApp: {} })}
              >
                <div className="deleteRow">
                  <i className="fa fa-exclamation-triangle"/>
                  确定重新部署应用 {currApp.serviceName} ？
                </div>
              </Modal>
              :
              null
          }
          <Title title="传统应用"/>
          <div className="serviceListBtnBox">
            <Button type="primary" size="large" onClick={()=>browserHistory.push('/app_manage/vm_wrap/create')}><i className="fa fa-plus" /> 创建传统应用</Button>
            {/* <Button type="ghost" size="large" onClick={()=>browserHistory.push('/app_manage/vm_wrap/import')}>导入传统应用</Button> */}
            <Button size="large" className="refreshBtn" onClick={()=>this.pageAndSerch(searchValue,1,true)}><i className='fa fa-refresh'/> 刷 新</Button>
            {/*<Button size="large" icon="delete" className="deleteBtn">删除</Button>*/}
            <CommonSearchInput onChange={searchValue => this.setState({searchValue})} onSearch={(value)=>{this.pageAndSerch(value,1,true)}} size="large" placeholder="请输入应用名搜索"/>
            { service.total >0 &&
              <div style={{position:'absolute',right:'20px',top:'30px'}}>
              <Pagination {...pageOption}/>
              <span className="pull-right totalNum">共计 {service.total} 条</span>
              </div>
            }
          </div>
          <Table loading={loading} pagination={false} columns={columns} dataSource={service} onRowClick={(record)=>this.rowClick(record)}/>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, {
  getVMserviceList,
  vmServiceDelete,
  serviceDeploy
})(VMServiceList)