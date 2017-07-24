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
import {Button, Table, Row, Card, Modal, Icon, Input, Pagination } from 'antd'
import { connect } from 'react-redux'
import './style/VMList.less'
import CommonSearchInput from '../../../components/CommonSearchInput'
import Title from '../../Title'
import { getVMinfosList, postVMinfoList, delVMinfoList, putVMinfoList, checkVMUser} from '../../../actions/vm_wrap'
import reduce from '../../../reducers/vm_wrap'
import CreateVMListModal from './CreateVMListModal/createListModal'
import NotificationHandler from '../../../components/Notification'

class VMList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      visible: false,
      modalTitle: true,
      editRows: [],
      isModal: false,
      isAdd: false,
      isPrompt: '',
      name: '',
    }
  }

  getInfo(value){
    debugger
    const { getVMinfosList } = this.props
    const names = {
      page: 1,
      size: 10,
      name: value,
    }

    getVMinfosList(
      value !== null ? names : null
      , {
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
      }
    })
  }

  componentWillMount() {
    this.getInfo()
  }

  vmAddList(state){
    const { postVMinfoList, putVMinfoList } = this.props
    let notification = new NotificationHandler()
    let res = {
        /*vmInfoName: 'root',*/
        vmInfoID: this.state.editRows.vminfoId !==null ? this.state.editRows.vminfoId : '',
        host: state.host,
        account: state.account,
        password: state.password
       }
    if(this.state.isAdd ){
      postVMinfoList(res, {
        success: {
          func: res => {
            if(res.code === 200){
              notification.success(`添加成功`)
              notification.close()
              this.getInfo.bind(this)
            }
          },
          isAsync:true,
        },
        failed: {
          func: err => {
            notification.error(`添加失败`)
          }
        }
      })
    }else {
      putVMinfoList(res, {
        success: {
          func: res => {
            debugger
            if(res.code === 200){
              notification.success(`修改成功`)
              notification.close()
              this.getInfo.bind(this)
            }
          },
          isAsync:true,
        },
        failed: {
          func: err => {
            notification.error(`修改失败`)
          }
        }
      })
    }
  }

  handleA(){
    this.setState({
      visible: true,
      modalTitle: true,
      isModal: true,
      isAdd: true
    })
  }

  /**
   * 编辑信息
   */
  handleE(row){
    this.setState({
      editRows: row,
      visible: true,
      modalTitle: false,
      isModal: true,
      isAdd: false
    })
  }

  /**
   * 分页
   */
  handlePage(page, name){
    let par = {
      page: page || 1,
      size: 10
    }
    this.getInfo(par)
  }

  /**
   * 删除信息
   */
  handleDel(ID, Name){
    const { delVMinfoList } = this.props
    let notification = new NotificationHandler()
    notification.spin(`删除 ${Name} 中...`)
    delVMinfoList({
      vmID: ID
    },{
      success:{
        func: res => {
          if(res.code === 200){
            this.getInfo.bind(this)
            notification.close()
            notification.success(`删除 ${Name} 成功`)
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('删除失败！')
        }
      }
    })
  }

  /**
   * 信息验证
   * @param check
   */
  vmCheck(check){
    const { checkVMUser } = this.props
    checkVMUser({
      host: check.host,
      account: check.account,
      password: check.password
    },{
      success: {
        func: res => {
          debugger
          if(res.code === 200){
            return res.code
          }
        }
      },
      failed: {
        func: err => {
          return err
        }
      }
    })
  }

  /**
   * 查询
   * @param values
   */
  handleSearch(values){
    debugger
    this.setState({
      name: values
    })
    this.getInfo(values)
  }

  render() {
     const {data} = this.props
     const pagination = {
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: data.length,
      onChange: (n) => this.handlePage(n)
    }
    /*const pagination = {
      total: data.length,
      defaultCurrent: 1,
      PageSize: 8,
      pageSizeOptions: 5,
      onChange: (current) => this.handlePage(current),
    };*/
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
        type: 'password'
      },
      {
        title: '服务数量',
        dataIndex: 'serviceCount',
        key: 'serviceCount',
        sorter: (a, b) => a.serviceCount - b.serviceCount,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        sorter: (a, b) => a.createTime - b.createTime,
      },
      {
        title: '操作',
        /*key: 'operation',*/
        ID: 'vminfoId',
        render: (text, record, index) =>{
          let fStyle = {
            marginRight:6+'%'
          }
          return (
            <div>
              <Button type="primary" className="tabBtn" onClick={this.handleE.bind(this,record)}>编辑信息</Button>
              <Button onClick={this.handleDel.bind(this,record.vminfoId,record.user)}>删除</Button>
            </div>
          )
        }
      },
    ]
    const rowSelection = {
      onSelect:(record)=> this.handleDel(record.vminfoId, record.user),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
    const scope = this
    return (
      <div id="VMList">
        <Row>
          <Button type='primary' size='large'  className='addBtn' onClick={ () => this.handleA() }>
            <i className='fa fa-plus' /> 添加传统环境
          </Button>
          <Button type="ghost" size="large" className="manageBtn" onClick={ () => this.getInfo() } ><i className='fa fa-refresh'/> 刷新</Button>
          {/*<Button type="ghost" icon="delete" size="large" className="manageBtn">删除</Button>*/}
          <CommonSearchInput placeholder="请输入虚拟机IP搜索" size="large" onSearch={this.handleSearch.bind(this)}/>
          {/*<Pagination {...pagination}/>*/}
          <div className="total">共{data.length}个</div>
        </Row>
        <Row>
          <Table
            /*rowSelection={rowSelection}*/
            loading={false}
            pagination={pagination}
            columns={columns}
            dataSource={data}
          />
        </Row>
        {
          this.state.isModal ?
            <CreateVMListModal
              scope={scope}
              modalTitle={this.state.modalTitle}
              visible={this.state.visible}
              onSubmit={this.vmAddList.bind(this)}
              Rows={this.state.editRows}
              isAdd={this.state.isAdd}
              Check={this.vmCheck.bind(this)}
            >

            </CreateVMListModal> : ''
        }
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
        curInfo.createTime = curInfo.createTime.replace('T',' ')
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
  delVMinfoList,
  postVMinfoList,
  putVMinfoList,
  checkVMUser
})(VMList)
