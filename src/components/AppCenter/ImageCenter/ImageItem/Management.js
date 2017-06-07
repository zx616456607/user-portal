/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Management component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal,Form, Table, Button, Popover, Card, Input,Radio,Icon } from 'antd'

const RadioGroup = Radio.Group

class AddUserModal extends Component {
  constructor(props) {
    super()
  }
  cancel() {
    const { func,form } = this.props
    func.handCancel()
    form.resetFields()
  }
  handModalOk() {
    const { form } =this.props
    console.log('hand ok...',this.props)
    form.validateFields((error,values)=> {
      if (error) {
        return
      }
      console.log('values',values)
    })
  }
  render() {
    const formItemLayout= {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
    }
    const { form, func} = this.props
    const nameProps= form.getFieldProps('username',{
      rules: [
        { required: true,min:2, message: '请输入姓名' },
      ],
    })
    const radioProps= form.getFieldProps('role',{
      initialValue:'1'
    })
    return (
      <Modal title="添加成员" visible={this.props.visible}
        onCancel={()=> this.cancel()}
        onOk={()=>this.handModalOk()}
      >
        <br/>
        <Form className="itemCreateFrom">
          <Form.Item  {...formItemLayout} label="姓名" className="createForm">
            <Input placeholder="请输入姓名" {...nameProps} />
          </Form.Item>
          <Form.Item  {...formItemLayout} label="角色" className="createForm">
            <RadioGroup {...radioProps}>
              <Radio value="1">项目管理员</Radio>
              <Radio value="2">开发人员</Radio>
              <Radio value="3">访客</Radio>
            </RadioGroup>
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}

AddUserModal = Form.create()(AddUserModal)

class Management extends Component {
  constructor(props) {
    super()
    this.handCancel = this.handCancel.bind(this)
    this.state = {
      filteredInfo: null,
      selected: null,
      deleteUser: false,
      addUser: false,
      userList:[]// deleete user list
    }
  }
  handSelected(currentRole,selected) {
    if (currentRole == selected) return
    this.setState({selected})
  }
  handCancel() {
    this.setState({addUser:false})
  }
  goAddUser() {
    this.setState({addUser: true})
    setTimeout(()=> {
      document.getElementById('username').focus()
    },300)
  }
  handDeleteUser() {
    console.log('sfsff')
  }
  render() {
    let { filteredInfo } = this.state
    filteredInfo = filteredInfo || {}
    const dataSource = [
      {
        name: 'shallwan',
        role: 2,
        createTime: '2017-7-7',
      },
      {
        name: 'demo-2',
        role: 2,
        createTime: '2015-6-0',
      },
      {
        name: 'demo-33',
        role: 1,
        createTime: '2017-9-0',
      }
    ]
    const columns = [
      {
        title: '成员名',
        dataIndex: 'name',
        key: 'name',
        width:'25%'
      }, {
        title: '项目角色',
        dataIndex: 'role',
        key: 'role',
        width:'25%',
        filters: [
          { text: '项目管理员', value: '1' },
          { text: '开发人员', value: '2' },
          { text: '访客', value: '3' },
        ],
        filteredValue: filteredInfo.type,
        onFilter: (value, record) => record.type.indexOf(value) == 1,
        render: (text, row) => {
          if (row.role==1) {
            return '项目管理员'
          }
          if (row.role==2) {
            return '开发人员'
          }
          return '访客'
        }
      }, {
        title: '添加时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width:'25%'
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width:'25%',
        render: (text, row) => {
          // this role == row.role
          if (row.role==1) {
            return '无需切换'
          }
          const content= (
            <div className="menu">
              <div className={row.role==1 ? 'menu-item menu-disabled':'menu-item'} onClick={()=> this.handSelected(row.role,1)}>
                项目管理员 <span className="icon">{this.state.selected ==1?<Icon type="check-circle-o" />:null}</span>
              </div>
              <div className={row.role==2 ? 'menu-item menu-disabled':'menu-item'}  onClick={()=> this.handSelected(row.role,2)}>
                开发人员 <span className="icon">{this.state.selected ==2?<Icon type="check-circle-o" />:null}</span>
              </div>
              <div className={row.role==3 ? 'menu-item menu-disabled':'menu-item'}  onClick={()=> this.handSelected(row.role,3)}>
                访客 <span className="icon">{this.state.selected ==3?<Icon type="check-circle-o" />:null}</span>
              </div>
            </div>
          )
          return (
            <div className="action">
              <Popover content={content} placement="left" title="切换角色" trigger="click"
                getTooltipContainer={()=>document.getElementsByClassName('imageProject')[0]}
                onVisibleChange={()=> this.setState({selected:null})}
              >
                <Button type="primary">切换角色</Button>
              </Popover>
              <Button onClick={()=> this.setState({deleteUser:true,userList:[row]})}>删除</Button>
            </div>
          )
        }
      }
    ]
    const func = {
      handCancel: this.handCancel,
    }
    const _this = this
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        _this.setState({userList:selectedRows})
      }
    }
    return (
      <div className="management">
        <div className="topRow">
          <Button type="primary" size="large" icon="plus" onClick={()=> this.goAddUser()}>添加成员</Button>
          <Button type="ghost" size="large" icon="delete" disabled={this.state.userList.length ==0} onClick={()=> this.setState({deleteUser:true})}>删除</Button>

          <Input placeholder="搜索" className="search" size="large" />
          <i className="fa fa-search"></i>
          <span className="totalPage">共计：{dataSource.length} 条</span>
        </div>
        <Table className="myImage " dataSource={dataSource} columns={columns} rowSelection={rowSelection} pagination={{ simple: true }} />
        <Modal title="删除成员" visible={this.state.deleteUser}
          onCancel={()=> this.setState({deleteUser:false})}
          onOk={()=> this.handDeleteUser()}
        >
          <div className="confirmText">您确认删除成员 {this.state.userList.map(list=>list.name).join(',')}？</div>
        </Modal>
        {/* add user modal */}
        <AddUserModal visible={this.state.addUser} func={func}/>

      </div>
    )
  }
}

export default Management