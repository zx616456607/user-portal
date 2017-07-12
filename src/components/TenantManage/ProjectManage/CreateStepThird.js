/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateStepThird
 *
 * v0.1 - 2017-07-12
 * @author zhangxuan
 */
import React, { Component } from 'react'
import './style/ProjectManage.less'
import { Button, Input, Icon, Modal, Transfer, Tree, Form } from 'antd'
import { browserHistory, Link } from 'react-router'
import { connect } from 'react-redux'
import { GetProjectsMembers } from '../../../actions/project'
import { GetRole } from '../../../actions/role'

let checkedKeysThird = []
class CreateStepThird extends Component{
  constructor(props){
    super(props)
    this.state={
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      connectModal: false,
      mockData: [],
      targetKeys: [],
      currentRoleInfo: {},
      currentRolePermission: []
    }
  }
  componentDidMount() {
    this.getMock();
    this.getProjectMember()
  }
  componentWillReceiveProps(nextProps) {
    const { scope, step, form } = nextProps;
    let RoleKeys = scope.state.RoleKeys;
    if ((RoleKeys.length > 0)) {
      this.getCurrentRole(RoleKeys[0].split(',')[0])
    } else {
      this.setState({
        currentRolePermission: [],
        currentRoleInfo: {}
      })
    }
    if (!step) {
      form.resetFields()
    }
  }
  getProjectMember() {
    const { GetProjectsMembers } = this.props;
    GetProjectsMembers({},{
      success: {
        func: (res) => {
        
        },
        isAsync: true
      }
    })
  }
  getMock() {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck(checkedKeys){
    this.setState({
      checkedKeys,
    });
  }
  onSelect(selectedKeys, info) {
    this.setState({ selectedKeys });
  }
  closeModal() {
    this.setState({connectModal: false})
  }
  submitModal() {
    this.setState({connectModal: false})
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  generateDatas (_tns){
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: `${key}`})
      children.push(key);
      checkedKeysThird.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index].children&&(tns[index].children.length !== null)) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  getCurrentRole(id) {
    const { GetRole } = this.props;
    const { currentRoleInfo } = this.state;
    if (currentRoleInfo.role && (id === currentRoleInfo.role.id)) {
      return
    }
    checkedKeysThird.length=0
    this.setState({
      checkedKeys:[],
      expandedKeys: [],
      currentRoleInfo: {},
      currentRolePermission: []
    },()=>{
      GetRole({
        id
      },{
        success: {
          func: (res) =>{
            if (res.data.statusCode === 200) {
              let result = res.data.data;
              this.generateDatas(result.permission.permission)
              this.setState({
                currentRoleInfo: result,
                currentRolePermission: result.permission.permission,
                expandedKeys: checkedKeysThird,
                checkedKeys: checkedKeysThird
              })
            }
          },
          isAsync: true
        }
      })
    })
  }
  deleteRole(e,item) {
    checkedKeysThird.length = 0
    e.stopPropagation()
    const { scope, updateRole} = this.props;
    let roleList = scope.state.RoleKeys.slice(0);
    let roleSet = new Set(roleList);
    roleSet.delete(item);
    updateRole(Array.from(roleSet))
  }
  render() {
    const { scope, form } = this.props;
    const TreeNode = Tree.TreeNode;
    const { currentRolePermission, currentRoleInfo } = this.state;
    const { getFieldProps } = form;
    const projectNameLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15, offset: 1 },
    };
    const roleList = scope.state.RoleKeys.length > 0 ? scope.state.RoleKeys.map((item)=>{
      return (
        <li onClick={()=>this.getCurrentRole.call(this,item.split(',')[0])} key={item.split(',')[1]}>{item.split(',')[1]}<Icon type="delete" onClick={(e)=>this.deleteRole(e,item)} className="pointer"/></li>
      )
    }) : <li className="pointer" onClick={()=>browserHistory.replace('/tenant_manage/project_manage?step=second')}>请选择角色</li>
    
    const loop = data => data.length >0 && data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title} disableCheckbox={true}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} disableCheckbox={true}/>;
    });
    return (
      <div id="projectCreateStepThird">
        <div className="inputBox">
          <Form.Item label="项目名称" {...projectNameLayout}>
            <Input disabled {...getFieldProps(`projectName`, {
              initialValue:  scope.state.projectName,
            }) }
            />
          </Form.Item>
        </div>
        <div className="clearfix characterWrapper">
          <span className="pull-left">已添加角色</span>
          <div className="pull-left characterBox">
            <ul className="characterListBox pull-left">
              {roleList}
            </ul>
            <div className="inlineBlock pull-left rightBox">
              <div className="authBox inlineBlock">
                <p className="authTitle">{currentRoleInfo.role && currentRoleInfo.role.name || '--' }共 <span style={{color:'#59c3f5'}}>{currentRoleInfo.role && currentRoleInfo.role.count}</span> 个权限</p>
                <div className="treeBox">
                  {
                    currentRolePermission.length > 0 && (
                      <Tree
                        checkable
                        onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                        onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                      >
                        {loop(currentRolePermission)}
                      </Tree>
                    )
                  }
                </div>
              </div>
              <div className="connectMemberBox inlineBlock">
                <Button type="primary" size="large" onClick={()=> this.setState({connectModal:true})}>关联对象</Button>
              </div>
            </div>
          </div>
        </div>
        <Modal title="关联对象" width={765} visible={this.state.connectModal}
               onCancel={()=> this.closeModal()}
               onOk={()=> this.submitModal()}
        >
          <Transfer
            dataSource={this.state.mockData}
            showSearch
            listStyle={{
              width: 300,
              height: 290,
            }}
            searchPlaceholde="请输入搜索内容"
            titles={['可选对象（个）', '已选对象（个）']}
            operations={['移除', '添加']}
            filterOption={this.filterOption.bind(this)}
            targetKeys={this.state.targetKeys}
            onChange={this.handleChange.bind(this)}
            rowKey={item => item.key}
            render={item => item.title}
          />
        </Modal>
      </div>
    )
  }
}

function mapStateToThirdProp(state, props) {
  
  return {
  
  }
}

export default CreateStepThird = connect(mapStateToThirdProp, {
  GetRole,
  GetProjectsMembers
})(Form.create()(CreateStepThird))