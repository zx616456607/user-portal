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
import { getVMinfosList, postVMinfoList, delVMinfoList, putVMinfoList, checkVMUser} from '../../../actions/vm_wrap'
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
      editRows: [],
      isModal: false,
      isAdd: false,
    }
  }

  getInfo(){
    const { getVMinfosList } = this.props
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
    debugger
    const { postVMinfoList, putVMinfoList } = this.props
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
              this.getInfo()
            }
          },
          isAsync:true,
        },
        failed: {
          func: err => {
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
              this.getInfo()
            }
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
   * 刷新信息
   */
  handleRefresh(){
    this.getInfo()
  }

  /**
   * 删除信息
   */
  handleDel(ID, Name){
    debugger
    const { delVMinfoList } = this.props
    let notification = new NotificationHandler()
    notification.spin(`删除 ${Name} 中...`)
    delVMinfoList({
      vmID: ID
    },{
      success:{
        func: res => {
          debugger
          if(res.code === 200){
            notification.close()
            notification.success(`删除 ${Name} 成功`)
            this.getInfo()
          }
        }
      }
    })
  }

  render() {
    const {data} = this.props
    const pagination = {
      simple: true,
      total:  data.length,
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
        /*key: 'createTime',*/
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
          <Button type='primary' size='large'  className='addBtn' onClick={this.handleA.bind(this)}>
            <i className='fa fa-plus' /> 添加传统环境
          </Button>
          <Button type="ghost" size="large" className="manageBtn" ><i className='fa fa-refresh'/> 刷新</Button>
          {/*<Button type="ghost" icon="delete" size="large" className="manageBtn">删除</Button>*/}
          <CommonSearchInput placeholder="请输入虚拟机IP搜索" size="large" onSearch=''/>
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
              check=""
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
  putVMinfoList
})(VMList)
