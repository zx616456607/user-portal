/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-07-29
 * @author ZhaoYanBei
 */

import React, { Component } from 'react'
import { Row, Col, Button, Input, Modal, Transfer, Tree, Form } from 'antd'
import { connect } from 'react-redux'
import { UpdateRole, CreateRole, ExistenceRole, RemovePermissionRole, AddPermissionRole } from '../../../../actions/role'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import { Permission } from '../../../../actions/permission'
import NotificationHandler from '../../../../components/Notification'
import './style/index.less'
import { REG } from '../../../../constants'

class CreateRoleModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      key: [],
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      allPermission: [],
      permissionCount: 0,
      rowDate: [],
      rowPermissionID: [],
    }
  }
  componentWillMount() {
    this.getPermission()
    this.fetchRowDate()
  }
  componentWillUnmount() {
    clearTimeout(this.roleNameTime)
  }
  // componentWillReceiveProps(nextProps) {
  //   const { allPermission } = this.state;
  //   const { form, characterModal } = nextProps;
  //   if (!allPermission) {
  //     //this.getPermission()
  //   }
  //   if (!characterModal && this.props.characterModal) {
  //     form.resetFields()
  //   }
  // }
  fetchRowDate(){
    const { scope, roleId } = this.props
    scope.props.GetRole({ roleId },{
      success: {
        func: res => {
          if(REG.test(res.data.code)){
            let result = res.data.data.permissions
            let aryID = []
            this.RowData(result)
            debugger
            for(let i = 0;i < result.length; i++){
              aryID.push(`${result[i].id}`)
            }
            //this.generateDatas(result)
            this.setState({
              rowDate: res.data.data,
              checkedKeys: aryID,
              rowPermissionID: aryID,
            })
          }
        }
      }
    })
  }

  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys
    });
  }
  onSelect(selectedKeys) {
    this.setState({ selectedKeys });
  }
  generateDatas(_tns ) {
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      //tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: tns[i].id})
      children.push(key);
    }
    debugger
    children.forEach((key, index) => {
      if(tns[index]["children"] !== undefined){
        if (tns[index].children.length !== 0) {
          return this.generateDatas(tns[index].children);
        }
      }
    })
  }
  getPermission() {
    const { Permission } = this.props;
    Permission(null,{
      success:{
        func: (res)=>{
          if (REG.test(res.data.code)) {
            let result = res.data.data.permissions
            this.setState({
              allPermission: result
            })
          }
        },
        isAsync: true
      }
    })
  }
  roleName(rule, value, callback) {
    const { ExistenceRole } = this.props;
    if (!value) {
      callback(new Error('请输入名称'))
      return
    }
    this.roleNameTime = setTimeout(()=>{
      ExistenceRole({
        name:value
      },{
        success: {
          func: res => {
            if (res.data.data) {
              return callback(new Error('该角色名称已经存在'))
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            return callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  roleDesc(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入描述'))
      return
    }
    callback()
  }
  cancelModal() {
    const { scope } = this.props;
    scope.setState({characterModal:false})
  }
  okCreateModal() {
    const { isAdd } = this.props
    isAdd ? this.addInfo() : this.editInfo()
  }
  addInfo(){
    const { CreateRole, loadData, scope, form } = this.props;
    const { getFieldValue, validateFields } = form;
    const { checkedKeys } = this.state;
    let notify = new Notification()
    let ary = checkedKeys.map((item, index) => {
      return Number(item)
    })
    validateFields((errors,values)=>{
      if (!!errors) {
        return
      }
      let roleDesc = values.roleDesc
      let roleName = values.roleName
      CreateRole({
        name: roleName,
        comment: roleDesc,
        pids: ary
      },{
        success:{
          func: (res) => {
            if (REG.test(res.data.statusCode)) {
              notify.success('创建角色成功')
              loadData && loadData()
              scope.setState({characterModal:false})
            }
          },
          isAsync: true
        },
        failed:{
          func: (res) => {
            notify.error('创建角色失败')
            scope.setState({characterModal:false})
          }
        }
      })
    })
  }
  editInfo(){
    const { UpdateRole, AddPermissionRole, loadData, scope, form, roleId } = this.props;
    const { getFieldValue, validateFields } = form;
    const { rowPermissionID, checkedKeys } = this.state;
    let notification = new NotificationHandler()
    let idKey = []
    this.screenInfo()
    validateFields((error,values) => {
      if(!!error) return
      let body = {
        name: values.roleName,
        comment: values.roleDesc
      }
      UpdateRole({
        id: roleId,
        body
      },{
        success:{
          func: (res) => {
            if(REG.test(res.data.code)){
            }
          }
        },
        failed: {
        func: (err) => {
          notification.close()
          notification.error(err)
        },
        isAsync: true
      }
      })
      if(rowPermissionID && rowPermissionID.length > 0){
        checkedKeys.map((item) => {
          if(rowPermissionID.indexOf(item) === -1){
            idKey.push(item)
          }
        })
      }
      let aryKey = idKey.map((item, index) => {
        return Number(item)
      })

      if(aryKey && aryKey.length > 0){
        let bodys = {
          pids: aryKey
        }
        AddPermissionRole({
          id: roleId,
          bodys
        },{
          success:{
            func: (res) =>{
              if(REG.test(res.code)){
                notification.success(`更新成功`)
                loadData()
                scope.setState({
                  characterModal: false
                })
              }
            }
          },
          failed:{
            func: (err) => {
              notification.error(`更新失败`)
            }
          }
        })
      }
    })
  }
  /**
   *
   */
  screenInfo(){
    let notification = new NotificationHandler()
    const { RemovePermissionRole } = this.props;
    const { rowPermissionID, checkedKeys } = this.state
    let ary = []
    let arys = []
    checkedKeys.map((item) => {
      if(rowPermissionID.indexOf(item) !== -1){
        ary.push(item)
      }
    })
    rowPermissionID.map((item) => {
      if(ary.indexOf(item) === -1){
        arys.push(item)
      }
    })
    if(arys && arys.length > 0){
      let aryKey = arys.map((item, index) => {
        return Number(item)
      })
      let bodys = {
        pids: aryKey
      }
      RemovePermissionRole({
        id: this.props.roleId,
        bodys
      },{
        success: {
          func: (res) => {
            debugger
            if(REG.test(res.data.code)){
              //setTimeout(notification.spin('更新中...'),1000)
            }
          }
        }
      })
    }
  }
  render() {
    const TreeNode = Tree.TreeNode;
    const { allPermission, permissionCount, rowDate, rowPermission } = this.state;
    const { characterModal, form, isAdd } = this.props;
    const { getFieldProps, isFieldValidating, getFieldError } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    };
    const loop = data => data.map((item) => {
      if (item["children"] !== undefined) {
        return (
          <TreeNode key={item.id} title={item.name}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={item.name} />;
    });

    return (
      <Modal title={this.props.title} wrapClassName="createCharacterModal" visible={characterModal} width={570}
        onCancel={()=> this.cancelModal()}
        onOk={()=> this.okCreateModal()}
      >
        <Form className="createRoleForm" form={this.props.form}>
          <Form.Item label="名称"
            {...formItemLayout}
            hasFeedback
            help={isFieldValidating('roleName') ? '校验中...' : (getFieldError('roleName') || []).join(', ')}
          >
            <Input placeholder="请输入名称" {...getFieldProps(`roleName`, {
              rules: [
                { validator: (rules,value,callback)=>this.roleName(rules,value,callback)}
              ],
              initialValue: isAdd ? undefined : rowDate.name
            })}
            />
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`roleDesc`, {
              initialValue: isAdd ? undefined : rowDate.comment
            })}/>
          </Form.Item>
        </Form>
        <div className="authChoose">
          <span className="desc">权限选择 :</span>
          <div className="authBox">
            {
              this.props.isAdd ?
              <div className="authTitle">所有权限 <div className="pull-right">共<span style={{color:'#59c3f5'}}>
                {allPermission.length}</span> 个</div>
              </div> :
              <div className="authTitle">共<span style={{color:'#59c3f5'}}>{allPermission.length}</span>个<div className="pull-right">已选<span style={{color:'#59c3f5'}}>
                {this.state.checkedKeys.length}</span> 个</div>
              </div>
            }
            <div className="treeBox">
              {
                (allPermission.length > 0 ) &&
                <Tree
                  checkable
                  onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                  autoExpandParent={this.state.autoExpandParent}
                  onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                  onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                >
                  {loop(allPermission)}
                </Tree>
              }
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

CreateRoleModal = Form.create()(CreateRoleModal)
function mapStateToSecondProp(state, props) {
  return {}
}
export default CreateRoleModal = connect(mapStateToSecondProp, {
  UpdateRole,
  CreateRole,
  Permission,
  ExistenceRole,
  AddPermissionRole,
  RemovePermissionRole,
})(CreateRoleModal)