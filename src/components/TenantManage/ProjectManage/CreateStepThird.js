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
import classNames from 'classnames'
import { GetProjectsMembers } from '../../../actions/project'
import { GetRole, roleWithMembers } from '../../../actions/role'
import TreeComponent from '../../TreeForMembers'
import cloneDeep from 'lodash/cloneDeep'
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
      currentRolePermission: [],
      memberArr: [],
      roleMap: {},
      existentMember: []
    }
  }
  componentDidMount() {
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
          if (res.statusCode === 200) {
            let newArr = res.data.teamList && res.data.teamList.concat(res.data.userList)
            this.formatMember(newArr)
            this.setState({
              memberArr: newArr
            })
          }
        },
        isAsync: true
      }
    })
  }
  formatMember(arr) {
    arr.forEach(item => {
      if (item.teamId) {
        Object.assign(item,{id:item.teamId},{children: item.users.map(record => {return Object.assign(record,{parent:item.teamId})})})
        this.formatMember(item.users)
      } else {
        Object.assign(item,{id:item.userID ? item.userID : item.userId})
      }
    })
  }
  formatArr(arr) {
    arr.forEach(item => {
      Object.assign(item,{key: item.userId},{name: item.userName})
    })
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
    const { roleMap } = this.state;
    const { scope, updateRoleWithMember } = this.props;
    scope.setState({
      roleWithMember:roleMap
    },()=>{
      this.setState({connectModal: false})
    })
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
  updateCurrentMember(member,list) {
    const { currentRoleInfo, roleMap } = this.state;
    const { updateRoleWithMember } = this.props;
    let map = cloneDeep(roleMap);
    let currentId = currentRoleInfo.role.id
    map[currentId] = member;
    this.setState({
      roleMap:map,
      [`member${currentId}`]: list
    })
    updateRoleWithMember(map)
  }
  getCurrentRole(id) {
    const { GetRole, roleWithMembers } = this.props;
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
      roleWithMembers({
        roleID: id,
        scope: 'global',
        scopeID: 'global'
      },{
        success: {
          func: res => {
            let member = []
            let exist = []
            if (res.data.data && res.data.data.length > 0) {
              res.data.data.forEach(item => {
                exist.push(item.userId)
              })
              member = res.data.data.slice(0)
            }
            this.formatArr(member)
            this.setState({
              currentMembers: member,
              existentMember: exist,
              memberCount: member.length > 0 ? member.length : 0
            })
          },
          isAsync: true
        },
        failed: {
          func: res => {
        
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
  numberToString(arr) {
    let a = []
    for (let i = 0; i < arr.length; i++) {
      a[i] = `${arr[i]}`
    }
    return a
  }
  render() {
    const { scope, form } = this.props;
    const TreeNode = Tree.TreeNode;
    const { currentRolePermission, currentRoleInfo, memberArr, connectModal, roleMap } = this.state;
    let currentId = currentRoleInfo.role && currentRoleInfo.role.id
    const { getFieldProps } = form;
    const projectNameLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15, offset: 1 },
    };
    const roleList = scope.state.RoleKeys.length > 0 ? scope.state.RoleKeys.map((item)=>{
      return (
        <li onClick={()=>this.getCurrentRole.call(this,item.split(',')[0])} key={item.split(',')[1]}
          className={classNames({'active': currentId === item.split(',')[0]})}>
          {item.split(',')[1]}
          <Icon type="delete" onClick={(e)=>this.deleteRole(e,item)} className="pointer"/>
        </li>
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
    const loopFunc = data => data.length >0 && data.map((item) => {
      return <TreeNode key={item.id} title={item.userName} disableCheckbox={true}/>;
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
              <div className="memberBox inlineBlock">
                <div className="memberTitle">
                  <span>{currentRoleInfo.role && currentRoleInfo.role.name}已关联 <span className="themeColor">{this.state[`member${currentId}`] && this.state[`member${currentId}`].length || 0}</span> 个对象</span>
                  {
                    this.state[`member${currentId}`] && this.state[`member${currentId}`].length > 0 && <Button type="primary" size="large" onClick={()=> this.setState({connectModal:true})}>继续关联对象</Button>
                  }
                </div>
                <div className="memberTableBox">
                  {
                    this.state[`member${currentId}`] && this.state[`member${currentId}`].length > 0 ?
                      <Tree
                        checkable multiple
                        checkedKeys={this.numberToString(this.state.roleMap[currentId])}
                      >
                        {loopFunc(this.state[`member${currentId}`])}
                      </Tree>
                      :
                      <Button type="primary" size="large" className="addMemberBtn" onClick={()=> this.setState({connectModal:true})}>关联对象</Button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal title="关联对象" width={765} visible={connectModal}
               onCancel={()=> this.closeModal()}
               onOk={()=> this.submitModal()}
        >
          <TreeComponent
             outPermissionInfo={memberArr}
             permissionInfo={[]}
             existMember={roleMap[currentRoleInfo.role && currentRoleInfo.role.id] || []}
             text='成员'
             connectModal={connectModal}
             getTreeRightData={this.updateCurrentMember.bind(this)}
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
  GetProjectsMembers,
  roleWithMembers
})(Form.create()(CreateStepThird))