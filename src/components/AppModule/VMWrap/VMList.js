/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-18
 * @author ZhaoYanbei
 */

import React from 'react'
import {Button, Table, Row, Card, Modal, Icon, Input} from 'antd'
import { connect } from 'react-redux'
import './style/VMList.less'
import CommonSearchInput from '../../../components/CommonSearchInput'
import Title from '../../Title'
import { getVMinfosList, postVMinfoList, delVMInfoList, putVMInfoList} from '../../../actions/vm_wrap'
import reduce from '../../../reducers/vm_wrap'
import CreateVMListModal from './CreateVMListModal/createListModal'
import NotificationHandler from '../../../components/Notification'

class VMList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      projectList: [],
      visible: false,
      modalTitle: true,
    }
  }

  getInfo(){
    const { getVMinfosList } = this.props
    debugger
    getVMinfosList(null, {
      success: {
        func: res => {
          if(res.code === 200){
          }
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          //
        },
        isAsync: true,
      },
      finally: {
        func: res => {
          //
        },
        isAsync: true,
      },
    })
  }

  componentWillMount() {
    this.getInfo()
  }

  vmAddList(state){
    if(state && state.length>0){
      let curData = state
      const { postVMinfoList } = this.props
      let res = {
        host: curData.host,
        account: curData.account,
        password: curData.password
       }
       postVMinfoList(res, {
         success: {
           func: res => {
             if(res.indexOf('code') === -1){
               if(res.code === 200){
                 this.getInfo()
               }
             }
           },
           isAsync:true,
         },
         failed: {
           func: err => {
           }
         }
       })
    }
  }

  handleA(){
    this.setState({
      visible: true,
      modalTitle: true
    })
  }

  /**
   * 编辑信息
   */
  handleE(){
    this.setState({
      visible: true,
      modalTitle: false
    })
  }

  /**
   * 刷新信息
   */
  handleRefresh(){
    this.getInfo()
  }

  /**
   * 删除信息
   */
  handleDel(ID, Name){
    const { delVMInfoList } = this.props
    let notification = new NotificationHandler()
    notification.spin(`删除 ${Name} 中...`)
    delVMInfoList({
      vmID: ID
    },{
      success:{
        func: res => {
          if(res.code === 200){
            notification.close()
            notification.success(`删除 ${Name} 成功`)
            this.getInfo()
          }
        }
      }
    })
  }

  handleData(data){
    if(data && data.length>0){
      for(let i = 0; i < data.length; i++){

      }
    }
  }

  render() {
    const {data} = this.props
    const pagination = {
      simple: true,
      total:  this.state.projectList && this.state.projectList.length,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      pageSizeOptions: ['5', '10', '15', '20'],
    };
    const columns = [
      {
        title: '虚拟机IP',
        dataIndex: 'host',
        key: 'host',
        ID: 'vminfoId'
      },
      {
        title: '登录账号',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: '登录密码',
        dataIndex: 'password',
        key: 'password',
      },
      {
        title: (
          <div>
            服务数量
            <div className="ant-table-column-sorter">
              <span className={true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
               <i className="anticon anticon-caret-up" />
              </span>
              <span className={false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
               <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'serviceCount',
        key: 'serviceCount',
      },
      {
        title: (
          <div onClick={this.handleSortCreateTime}>
            创建时间
            <div className="ant-table-column-sorter">
              <span className={true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
               <i className="anticon anticon-caret-up" />
              </span>
              <span className={false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
               <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作',
        key: 'operation',
        ID: 'vminfoId',
        render: (text, record, index) =>{
          let fStyle = {
            marginRight:6+'%'
          }
          return (
            <div>
              <Button type="primary" className="tabBtn" onClick={this.handleE.bind(this)}>编辑信息</Button>
              <Button onClick={this.handleDel}>删除</Button>
            </div>
          )
        }
      },
    ]
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
      }),
    };
    const scope = this
    return (
      <div id="VMList">
        <Row>
          <Button type='primary' size='large'  className='addBtn' onClick={this.handleA.bind(this)}>
            <i className='fa fa-plus' /> 添加传统环境
          </Button>
          <Button type="ghost" size="large" className="manageBtn" ><i className='fa fa-refresh'/>刷新</Button>
          <Button type="ghost" icon="delete" size="large" className="manageBtn">删除</Button>
          <CommonSearchInput placeholder="请输入虚拟机IP搜索" size="large" onSearch=''/>
          <div className="total">共{this.state.projectList.length}个</div>
        </Row>
        <Row>
          <Card>
            <Table
              rowSelection={rowSelection}
              loading={false}
              pagination={pagination}
              columns={columns}
              dataSource={data}
            />
          </Card>
        </Row>
        <CreateVMListModal
          scope={scope}
          modalTitle={this.state.modalTitle}
          visible={this.state.visible}
          onSubmit={this.vmAddList}
        >

        </CreateVMListModal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  let data = []
  const wrap = state.vmWrap
  if(wrap.vminfosList){
    let curData = wrap.vminfosList.list
    if(curData&&curData.length > 0){
      for(let i=0; i<curData.length; i++){
        let curInfo = curData[i]
        data.push(curInfo)
      }
    }
  }
  return {
    data:data
  }
}

export default connect(mapStateToProps, {
  getVMinfosList,
  delVMInfoList
})(VMList)
