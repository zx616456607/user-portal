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
import { Input, Modal, Tree, Form, Radio, Col } from 'antd'
import { connect } from 'react-redux'
import { CreateRole, ExistenceRole } from '../../../actions/role'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { Permission } from '../../../actions/permission'
import Notification from '../../../components/Notification'
import './style/CreateRole.less'


class CreateRoleModal extends Component{
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      allPermission: [],
      permissionCount: 0,
      permissionPolicyType: 1,
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
      //form.resetFields(['roleName', 'roleDesc'])
      form.resetFields(['roleName'])
      this.setState({
        expandedKeys: [],
        checkedKeys: [],
        selectedKeys: [],
        permissionPolicyType: 1, //1 所有权限 （原） 2 指定权限（新）
      })
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
  onCheck(key, e) {
    const { checkedKeys } = this.state
    const categoryKey = this.fetchNode(e.node.props.category)

    categoryKey.forEach(item => {
      if (checkedKeys.length === 0) {
        key.push(item)
      } else {
        if (checkedKeys.indexOf(item) === -1) {
          key.push(item)
        }
      }
    })

    this.setState({
      checkedKeys: key
    })
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
        name:encodeURIComponent(value)
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
    const { ExistenceRole } = this.props;
    if (!value) {
      callback(new Error('请输入描述'))
      return
    }
    callback()
  }
  cancelModal() {
    const { scope } = this.props;
    let tempState = {permissionPolicyType: 1}

    if(scope.state.characterModal === true)tempState.characterModal = false
    else tempState.isShowperallEditModal = false

    scope.setState(tempState);
    this.props.form.resetFields();
  }
  okCreateModal() {
    const { CreateRole, loadData, scope, form } = this.props;
    const { checkedKeys, permissionPolicyType } = this.state;
    const { validateFields } = form;
    let notify = new Notification()
    validateFields([ 'roleName' ], (errors,values)=>{
    // validateFields([ 'roleName', 'roleDesc' ], (errors,values)=>{
      if (!!errors) {
        return
      }
      //let roleDesc = values.roleDesc
      let roleName = values.roleName
      let params = {
        name: roleName,
        //comment: roleDesc,
        permissionPolicyType: permissionPolicyType,
      };
      if(permissionPolicyType === 1) {
        if(checkedKeys.length === 0){
          notify.warn('请至少选择一个权限');
          return;
        }
        params.pids = checkedKeys.map(item => Number(item));
      }
      CreateRole(params,{
        success:{
          func: (res) => {
            if (res.data.statusCode === 200) {
              notify.success('创建角色成功')
              loadData && loadData(res.data.data.roleID)
              // targetKeys = _.deepClone(scope.state.targetKeys);
              // targetKeys.push(res.data.data.roleID);
              scope.setState({characterModal:false}, () => {
                scope.addCharacterOk(res.data.data.roleID);
              })
            }
          },
          isAsync: true
        },
        failed:{
          func: (res) => {
            if(err.statusCode === 403){
              notification.warn(`创建角色失败, 用户没有权限修改角色`)
            }
            else{
              notification.warn(`创建角色失败`)
            }
            scope.setState({characterModal:false})
          }
        }
      })
    })

  }
  fetchNode(category) {
    const { allPermission } = this.state
    let childrenKey = []
    this.fetchCategory(allPermission, childrenKey, category)
    return childrenKey
  }
  fetchCategory(data, childrenKey, category) {
    const children = []
    for (let i = 0; i < data.length; i++) {
      let RowData = data[i]
      if (RowData.id === category) {
        if (RowData.children) {
          RowData.children.forEach((item, index) => {
            if (item.name.indexOf('查看') !== -1) {
              if (item.children) {
                item.children.forEach((item, index) => {
                  childrenKey.push(item.id)
                })
              } else {
                childrenKey.push(item.id)
              }
            }
          })
        }
      }
      children.push(RowData.id)
    }

    children.forEach((key, index) => {
      if (data[index]["children"] !== undefined) {
        if (data[index].children.length !== 0) {
          return this.fetchCategory(data[index].children, childrenKey, category);
        }
      }
    })
  }
  typeClick = (e) => {
    const value = e.target.value;
    if(this.state.permissionPolicyType === value) return;
    let tempState = {permissionPolicyType: e.target.value}
    if(value === 2){
      tempState.checkedKeys = [];
      tempState.selectedKeys = [];
    }
    this.setState(tempState);
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
                { validator: (rules,value,callback)=>this.roleName(rules,value,callback)},
              ],
            }) }
            />
          </Form.Item>

          {/*<Form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`roleDesc`, {

            }) }/>*/}
            {/*rules: [
              { validator: (rules,value,callback)=>this.roleDesc(rules,value,callback)},
            ],*/}
          {/*</Form.Item>*/}
          <Form.Item label="授权方式" {...formItemLayout}>
            <Radio.Group {...getFieldProps('permissionPolicyType', { initialValue: 1,
              validate: [{
                rules: [
                  { required: true, message: '请选择授权方式' },
                ],
                trigger: ['onClick'],
              }],
              onChange: this.typeClick
              })}>
              <Radio key="a" value={1}>所有资源统一授权</Radio>
              <Radio key="b" value={2}>指定具体资源授权</Radio>
            </Radio.Group>
          </Form.Item>
          {/*<FormItem
            {...formItemLargeLayout}
            label="角色模板"
          >
            <Select {...getFieldProps('xxx', {
              initialValue: '',
              validate: [{
                rules: [
                  //{ required: true, message: '请选择数据中心' },
                ],
                trigger: ['onChange'],
              }],
              })} placeholder="选择角色模板" style={{width: "100%", }}>
              {
                xxxList.map((item, i) => {
                  return <Select.Option key={i} value={item}>{item}</Select.Option>
                })
              }
            </Select>
          </FormItem>*/}
        </Form>
        { this.state.permissionPolicyType === 1 ?
          <div className="authChooseProject">
            <span className="authChooseText">权限选择 :</span>
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
          :

          <div className="bottomDesc">
            <Col className="gutter-row" span={24}>角色创建好后，可以给项目内指定的资源进行授权</Col>
            <div style={{clear: "both"}}></div>
          </div>
        }
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