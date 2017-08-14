/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateRole
 *
 * v0.1 - 2017-07-28
 * @author zhangxuan
 */

import React, { Component } from 'react'
import { Input, Modal, Tree, Form } from 'antd'
import { connect } from 'react-redux'
import { CreateRole, ExistenceRole } from '../../../actions/role'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { Permission } from '../../../actions/permission'
import Notification from '../../../components/Notification'

class CreateRoleModal extends Component{
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      allPermission: [],
      permissionCount: 0
    }
  }
  componentWillMount() {
    this.getPermission()
  }
  componentWillUnmount() {
    clearTimeout(this.roleNameTime)
  }
  componentWillReceiveProps(nextProps) {
    const { allPermission } = this.state;
    const { form, characterModal } = nextProps;
    if (!allPermission) {
      this.getPermission()
    }
    if (!characterModal && this.props.characterModal) {
      form.resetFields()
    }
  }
  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
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
  onSelect(selectedKeys, info) {
    this.setState({ selectedKeys });
  }
  generateDatas(_tns ) {
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: tns[i].id})
      children.push(key);
    }
    children.forEach((key, index) => {
      if (tns[index]['children'] !== undefined) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  getPermission() {
    const { Permission } = this.props;
    Permission({},{
      success:{
        func: (res)=>{
          if (res.data.statusCode === 200) {
            let result = res.data.data.permissions;
            this.generateDatas(result)
            this.setState({
              allPermission:result,
              permissionCount:res.data.data.total
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
    callback()
  }
  cancelModal() {
    const { scope } = this.props;
    scope.setState({characterModal:false})
  }
  okCreateModal() {
    const { CreateRole, loadData, scope, form } = this.props;
    const { checkedKeys } = this.state;
    const { getFieldValue, validateFields } = form;
    let notify = new Notification()
    validateFields((errors,values)=>{
      if (!!errors) {
        return
      }
      let roleDesc = values.roleDesc
      let roleName = values.roleName
      CreateRole({
        name: roleName,
        comment: roleDesc,
        permission: checkedKeys
      },{
        success:{
          func: (res) => {
            if (res.data.statusCode === 200) {
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
  render() {
    const TreeNode = Tree.TreeNode;
    const { allPermission, permissionCount } = this.state;
    const { characterModal, form } = this.props;
    const { getFieldProps, isFieldValidating, getFieldError } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    };
    const loop = data => data.map((item) => {
      if (item['children'] !== undefined) {
        return (
          <TreeNode key={item.key} title={item.title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} />;
    });
    return (
      <Modal title="创建角色" wrapClassName="createCharacterModal" visible={characterModal} width={570}
             onCancel={()=> this.cancelModal()}
             onOk={()=> this.okCreateModal()}
      >
        <Form className="createRoleForm" form={this.props.form}>
          <Form.Item label="名称" {...formItemLayout}
                     hasFeedback
                     help={isFieldValidating('roleName') ? '校验中...' : (getFieldError('roleName') || []).join(', ')}
          >
            <Input placeholder="请输入名称" {...getFieldProps(`roleName`, {
              rules: [
                { validator: (rules,value,callback)=>this.roleName(rules,value,callback)}
              ],
            }) }
            />
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`roleDesc`, {
              rules: [
                { validator: (rules,value,callback)=>this.roleDesc(rules,value,callback)}
              ],
            }) }/>
          </Form.Item>
        </Form>
        <div className="authChooseProject">
          <span>权限选择 :</span>
          <div className="authBox inlineBlock">
            <div className="authTitle clearfix">所有权限 <div className="pull-right">共<span style={{color:'#59c3f5'}}>{permissionCount}</span> 个</div></div>
            <div className="treeBox">
              {
                allPermission.length > 0 &&
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


function mapStateToSecondProp(state, props) {
  
  return {
  
  }
}

export default CreateRoleModal = connect(mapStateToSecondProp, {
  CreateRole,
  Permission,
  ExistenceRole,
})(CreateRoleModal)