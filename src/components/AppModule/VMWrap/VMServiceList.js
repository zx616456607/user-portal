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
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Table, Menu, Dropdown, Pagination  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import CommonSearchInput from '../../CommonSearchInput'
import './style/VMServiceList.less'
import { getVMserviceList, vmServiceDelete, serviceDeploy } from '../../../actions/vm_wrap'
import NotificationHandler from '../../../components/Notification'
import TenxStatus from '../../TenxStatus/index'

class VMServiceList extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      selectedRowKeys: [],
      service: [],
      current: 1,
      name: '',
      loading: false
    }
  }
  componentWillMount() {
    this.pageAndSerch(null,1)
  }
  addKey(arr) {
    for (let i = 0; i < arr.length; i++) {
      Object.assign(arr[i],{key:arr[i].serviceId})
    }
  }
  handleButtonClick(record) {
    const { serviceDeploy } = this.props;
    let notify = new NotificationHandler()
    serviceDeploy(record.serviceId,{
      success: {
        func: res => {
          this.pageAndSerch(null,1)
          notify.success('重新部署成功')
        },
        isAsync: true
      },
      failed:{
        func: res => {
          this.pageAndSerch(null,1)
          notify.error('重新部署失败')
        },
        isAsync: true
      }
    })
  }
  
  handleMenuClick(e,record) {
    const { vmServiceDelete } = this.props;
    let notify = new NotificationHandler()
    if (e.key === 'delete') {
      vmServiceDelete({
        serviceId: record.serviceId
      },{
        success: {
          func: (res) => {
            this.pageAndSerch()
            notify.success('删除应用成功')
          },
          isAsync:true
        },
        failed: {
          func: res => {
            notify.error('删除应用失败')
          },
          isAsync: true
        }
      })
    }
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
  selectAll(selectedRows) {
    let arr = []
    for (let i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i].key)
    }
    this.setState({
      selectedRowKeys: arr
    })
  }
  pageAndSerch(name,n) {
    const { getVMserviceList } = this.props;
    this.setState({
      loading: true
    })
    getVMserviceList({
      page: n || 1,
      size:10,
      name
    },{
      success: {
        func: (res) => {
          this.addKey(res.body.services)
          this.setState({
            service:res.body,
            name,
            loading: false
          })
        },
        isAsync:true
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
      phase = 'Succeeded'
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  render() {
    const { selectedRowKeys, service, loading } = this.state;
    
    const columns = [{
      title: '应用名',
      dataIndex: 'serviceName',
      render: text => <a href="#">{text}</a>,
    }, {
      title: '状态',
      width: '15%',
      dataIndex: 'serviceStatus',
      render:(text,record) => this.getServiceStatus(text)
    }, {
      title: '部署包（版本标签）',
      width: '15%',
      dataIndex: 'packages',
    },{
      title: '部署环境IP',
      dataIndex: 'host'
    },{
      title: '最后修改人',
      dataIndex: 'updateUserName'
    },{
      title: '操作',
      render: (text,record)=>{
        const menu = (
          <Menu onClick={(e)=>this.handleMenuClick(e,record)}>
            <Menu.Item key="delete">&nbsp;删除应用&nbsp;&nbsp;</Menu.Item>
          </Menu>
        )
        return (
          <Dropdown.Button onClick={()=>this.handleButtonClick(record)} overlay={menu} type="ghost">
            重新部署
          </Dropdown.Button>
        )
      }
      
      
    }];

// 通过 rowSelection 对象表明需要行选择
//     const rowSelection = {
//       selectedRowKeys,
//       onSelect:(record)=> this.rowClick(record),
//       onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
//     };
    const pageOption = {
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: service.total,
      onChange: (n)=>this.pageAndSerch(null,n)
    }
    return (
      <div className="vmServiceList">
        <div className="serviceListBtnBox">
          <Button type="primary" size="large" onClick={()=>browserHistory.push('/app_manage/app_create/vm_wrap')}><i className="fa fa-plus" /> 创建传统应用</Button>
          <Button size="large" className="refreshBtn" onClick={()=>this.pageAndSerch(null,1)}><i className='fa fa-refresh'/> 刷新</Button>
          {/*<Button size="large" icon="delete" className="deleteBtn">删除</Button>*/}
          <CommonSearchInput onSearch={this.pageAndSerch.bind(this)} size="large" placeholder="请输入服务名搜索"/>
          <Pagination {...pageOption}/>
          <span className="pull-right totalNum">共计 {service.total} 条</span>
        </div>
        <Table loading={loading} pagination={false} columns={columns} dataSource={service.services} onRowClick={(record)=>this.rowClick(record)}/>
      </div>
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