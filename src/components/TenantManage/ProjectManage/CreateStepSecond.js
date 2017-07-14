/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateStepSecond
 *
 * v0.1 - 2017-07-12
 * @author zhangxuan
 */
import React, { Component } from 'react'
import './style/ProjectManage.less'
import { Row, Col, Button, Input, Modal, Transfer, Tree, Form } from 'antd'
import { connect } from 'react-redux'
import { ListRole, CreateRole, ExistenceRole } from '../../../actions/role'
import { PermissionAndCount } from '../../../actions/permission'
import Notification from '../../../components/Notification'
class CreateStepSecond extends Component{
  constructor(props){
    super(props)
    this.state={
      targetKeys: [],
      characterModal: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      selectedList: [],
      choosableList: [],
      allPermission: []
    }
  }
  componentWillMount() {
    this.loadRoleList()
    this.getPermission()
  }
  componentWillReceiveProps(nextProps) {
    const { allPermission } = this.state;
    const { step, form, scope } = nextProps;
    this.loadRoleList()
    if (!allPermission) {
      this.getPermission()
    }
    if (!step) {
      form.resetFields()
    }
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
      if (tns[index].children.length !== 0) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  loadRoleList() {
    const { ListRole, scope } = this.props;
    const targetKeys = [];
    const roleList = [];
    ListRole({
      success: {
        func: (res)=> {
          if (res.data.statusCode === 200) {
            let result = res.data.data.items;
            for (let i = 0 ; i < result.length; i++) {
              const data = {
                key: `${result[i].id},${result[i].name}`,
                title: result[i].name,
                description: result[i].comment,
                chosen: false,
              };
              const newData = Object.assign({},result[i],data);
              if (newData.chosen) {
                targetKeys.push(data.key);
              }
              roleList.push(newData)
            }
            if (scope.state.RoleKeys.length > 0) {
              this.setState({
                targetKeys: scope.state.RoleKeys.slice(0)
              })
            } else {
              this.setState({
                choosableList:roleList,
                targetKeys
              })
            }
          }
        },
        isAsync: true
      }
    })
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
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys,d,m) {
    const { updateRole } = this.props;
    this.setState({ targetKeys });
    updateRole(targetKeys)
  }
  cancelModal() {
    this.setState({characterModal:false})
  }
  okCreateModal() {
    const { CreateRole, ExistenceRole } = this.props;
    const { checkedKeys } = this.state;
    const { getFieldValue } = this.props.form;
    let notify = new Notification()
    let roleDesc = getFieldValue('roleDesc')
    let roleName = getFieldValue('roleName')
    ExistenceRole({
      name: roleName
    },{
      success:{
        func: (res) => {
          if (res.data.statusCode === 200) {
            if (res.data.data) {
              return notify.info('该角色名称已经存在')
            }
            CreateRole({
              name: roleName,
              comment: roleDesc,
              permission: checkedKeys
            },{
              success:{
                func: (res) => {
                  if (res.data.statusCode === 200) {
                    notify.success('创建角色成功')
                    this.loadRoleList()
                    this.setState({characterModal:false})
                  }
                },
                isAsync: true
              }
            })
          }
        },
        isAsync: true
      }
    })
  }
  openCreateModal() {
    this.setState({
      characterModal:true
    })
  }
  getPermission() {
    const { PermissionAndCount } = this.props;
    PermissionAndCount({},{
      success:{
        func: (res)=>{
          if (res.data.statusCode === 200) {
            let result = res.data.data.permission;
            this.generateDatas(result)
            this.setState({
              allPermission:result
            })
          }
        },
        isAsync: true
      }
    })
  }
  roleName(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  }
  roleDesc(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入描述'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  }
  renderItem(item) {
    return(
      <Row key={item&&item.key}>
        <Col span={20}>{item&&item.name}</Col>
        <Col span={4}>{item&&item.count}</Col>
      </Row>
    )
  }
  render() {
    const TreeNode = Tree.TreeNode;
    const { scope } = this.props;
    const { choosableList, targetKeys, allPermission } = this.state;
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    };
    const projectNameLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15, offset: 1 },
    };
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} />;
    });
    return (
      <div id="projectCreateStepSecond" className="projectCreateStepSecond">
        <Modal title="创建角色" wrapClassName="createCharacterModal" visible={this.state.characterModal} width={570}
               onCancel={()=> this.cancelModal()}
               onOk={()=> this.okCreateModal()}
        >
          <Form className="createRoleForm" form={this.props.form}>
            <Form.Item label="名称" {...formItemLayout}>
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
          <div className="authChoose">
            <span>权限选择 :</span>
            <div className="authBox inlineBlock">
              <div className="authTitle clearfix">可选权限 <div className="pull-right"><span style={{color:'#59c3f5'}}>14</span> 个权限</div></div>
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
        <div className="inputBox">
          <Form.Item label="项目名称" {...projectNameLayout}>
            <Input disabled {...getFieldProps(`projectName`, {
              initialValue:  scope.state.projectName,
            }) }
            />
          </Form.Item>
        </div>
        <div className="inputBox">
          <span>角色</span>
          <Button type="primary" size="large" onClick={()=>this.openCreateModal()}>创建新角色</Button>
        </div>
        <Transfer
          dataSource={choosableList}
          className="roleTrans"
          showSearch
          listStyle={{
            width: 300,
            height: 255,
          }}
          searchPlaceholde="请输入策略名搜索"
          titles={['包含权限（个）', '包含权限（个）']}
          operations={[ '添加','移除']}
          filterOption={this.filterOption.bind(this)}
          targetKeys={targetKeys}
          onChange={this.handleChange.bind(this)}
          rowKey={item => item.key}
          render={(item)=>this.renderItem(item)}
        />
      </div>
    )
  }
}

CreateStepSecond = Form.create()(CreateStepSecond)
function mapStateToSecondProp(state, props) {
  
  return {
  
  }
}

export default CreateStepSecond = connect(mapStateToSecondProp, {
  ListRole,
  CreateRole,
  PermissionAndCount,
  ExistenceRole,
})(CreateStepSecond)