/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Project Detail
 *
 * v0.1 - 2017-06-06
 * @author zhangxuan
 */

import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectDetail.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree, Switch, Alert, Dropdown, Menu, Form } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { browserHistory, Link} from 'react-router'
import { connect } from 'react-redux'
import { GetProjectsDetail, UpdateProjects, GetProjectsAllClusters, UpdateProjectsCluster, UpdateProjectsRelatedRoles, DeleteProjectsRelatedRoles, GetProjectsMembers } from '../../../../actions/project'
import { chargeProject } from '../../../../actions/charge'
import { loadNotifyRule, setNotifyRule } from '../../../../actions/consumption'
import { ListRole, CreateRole, ExistenceRole, GetRole, roleWithMembers, usersAddRoles, usersLoseRoles } from '../../../../actions/role'
import { parseAmount } from '../../../../common/tools'
import Notification from '../../../../components/Notification'
import TreeComponent from '../../../TreeForMembers'
import cloneDeep from 'lodash/cloneDeep'
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import CreateRoleModal from  '../CreateRole'
import { TEAM_VISISTOR_ROLE_ID, TEAM_MANAGE_ROLE_ID } from '../../../../../constants'

let checkedKeysDetail = []
class ProjectDetail extends Component{
  constructor(props){
    super(props)
    this.state= {
      editComment: false,
      paySingle: false,
      switchState: false,
      balanceWarning: false,
      addCharacterModal: false,
      mockData: [],
      targetKeys: [],
      characterModal: false,
      payNumber: 10,
      projectDetail: {},
      projectClusters: [],
      dropVisible: false,
      UnRequest: 0,
      comment: '',
      currentRoleInfo: {},
      currentRolePermission: [],
      choosableList: [],
      createRoleName: '',
      createRoleDesc: '',
      createRolePer: [],
      currentMembers: [],
      memberCount: 0,
      connectModal: false,
      memberArr: [],
      existentMember: [],
      selectedMembers: [],
      selectedKeys: [],
      deleteRoleModal: false,
      currentDeleteRole: {},
      deleteClusterModal: false,
      totalMemberCount: 0,
      roleMember: 0
    }
  }
  componentWillMount() {
    this.getProjectDetail();
    this.getClustersWithStatus();
    // this.getProjectMember();
    // this.loadRoleList()
  }
  getClustersWithStatus() {
    const { name } = this.props.location.query;
    const { GetProjectsAllClusters } = this.props;
    GetProjectsAllClusters({
      projectsName: name
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            this.setState({
              projectClusters:res.data.clusters,
            })
          }
        },
        isAsync:true
      }
    })
  }
  loadRoleList() {
    const { ListRole } = this.props;
    const { projectDetail } = this.state;
    const targetKeys = [];
    const roleList = [];
    ListRole({
      size: 0
    },{
      success: {
        func: (res)=> {
          if (res.data.statusCode === 200) {
            let result = res.data.data.items;
            let relatedRoles = projectDetail.relatedRoles;
            for (let i = 0 ; i < result.length; i++) {
              let flag = false;
              if (relatedRoles && relatedRoles.length > 0) {
                for (let j = 0 ; j < relatedRoles.length; j++) {
                  if (result[i].id === relatedRoles[j].roleId) {
                    flag = true;
                  }
                }
              }
              const data = {
                key: `${result[i].id},${result[i].name}`,
                title: result[i].name,
                description: result[i].name,
                chosen: flag,
              };
              const newData = Object.assign({},result[i],data);
              if (newData.chosen) {
                targetKeys.push(data.key);
              }
              roleList.push(newData)
            }
            this.setState({
              choosableList:roleList,
              targetKeys
            })
          }
        },
        isAsync: true
      }
    })
  }
  getProjectDetail() {
    const { name } = this.props.location.query;
    const { GetProjectsDetail } = this.props;
    const { currentRoleInfo } = this.state;
    GetProjectsDetail({
      projectsName: name
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            if (!isEmpty(currentRoleInfo)) {
              this.getCurrentRole(currentRoleInfo.id)
            } else {
              this.setState({
                currentRolePermission: [],
                currentRoleInfo: {}
              })
            }
            this.setState({
              projectDetail:res.data,
              comment:res.data.description
            },()=>{
              const { projectDetail } = this.state;
              this.loadRoleList()
              this.getCurrentRole(projectDetail.relatedRoles && projectDetail.relatedRoles[0].roleId)
            })
          }
        },
        isAsync: true
      }
    })
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  editComment() {
    this.setState({editComment:true})
  }
  cancelEdit() {
    const { setFieldsValue } = this.props.form
    const { projectDetail } = this.state;
    let oldComment = projectDetail.description;
    this.setState({editComment:false},()=>{
      setFieldsValue({'comment': oldComment})
    })
  }
  saveComment() {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const { UpdateProjects } = this.props;
    const { projectDetail } = this.state;
    let notify = new Notification()
    let comment = getFieldValue('comment');
    let oldComment = projectDetail.description;
    if (!comment || (comment === oldComment)) {return this.setState({editComment:false})}
    UpdateProjects({
      projectName: projectDetail.projectName,
      body: {
        description: comment
      }
    },{
      success: {
        func: (res) =>{
          if (res.statusCode === 200) {
            notify.success('修改备注成功')
            this.getProjectDetail()
            this.setState({editComment:false})
          }
        },
        isAsync: true
      }
    })
  }
  paySingle() {
    this.setState({paySingle: true})
  }
  paySingleCancel() {
    this.setState({paySingle: false})
  }
  paySingleOk() {
    const { chargeProject } = this.props;
    const { projectDetail, payNumber } = this.state;
    let notify = new Notification()
    chargeProject({
      namespaces:[projectDetail.projectName],
      amount: payNumber
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            this.getProjectDetail()
            this.setState({paySingle: false})
            notify.success('充值成功')
          }
        },
        isAsync: true
      }
    })
  }
  switchChange(checked) {
    this.setState({switchState:checked})
  }
  warningCancel() {
    this.setState({balanceWarning:false})
  }
  warningSubmit() {
    this.setState({balanceWarning:false})
  }
  onExpand = (expandedKeys) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys) => {
    this.setState({
      checkedKeys,
    });
  }
  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  }
  addCharacterOk() {
    const { UpdateProjectsRelatedRoles } = this.props;
    const { projectDetail, targetKeys } = this.state;
    let notify = new Notification()
    let updateRoles = []
    for (let i = 0; i < targetKeys.length; i++) {
      let key = targetKeys[i].split(',')[0]
      updateRoles.push(key)
    }
    UpdateProjectsRelatedRoles({
      projectsName: projectDetail.projectName,
      body: {
        roles: updateRoles
      }
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            this.getProjectDetail()
            notify.success('操作成功')
            this.setState({addCharacterModal:false,targetKeys: []})
          }
        },
        isAsync: true
      }
    })
  }
  addCharacterCancel() {
    this.setState({addCharacterModal:false})
  }
  changePayNumber(payNumber) {
    this.setState({payNumber})
  }
  clusterStatus(status,flag) {
    return (
      <span className={`projectDetailClusterStatus projectDetailClusterStatus${status}`}>
        {status ===1 ? flag ? '（申请中...）' : '申请中...' : ''}
        {status ===2 ? flag ? '（已授权）' : '已授权' : ''}
        {status ===3 ? flag ? '（已拒绝）' : '已拒绝' : ''}
      </span>
    )
  }
  toggleDrop() {
    this.setState({
      dropVisible:!this.state.dropVisible
    })
  }
  updateProjectClusters(id,status) {
    const { UpdateProjectsCluster } = this.props;
    const { name } = this.props.location.query;
    UpdateProjectsCluster({
      projectsName:name,
      body: {
        clusters: {
          [id]:status
        }
      }
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            this.getClustersWithStatus()
          }
        },
        isAsync: true
      }
    })
  }
  generateDatas(_tns){
    if (!_tns) return
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: `${key}`})
      children.push(key);
      checkedKeysDetail.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index]['children'] !== undefined) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  getCurrentRole(id) {
    if (!id) return
    const { GetRole, roleWithMembers } = this.props;
    const { projectDetail } = this.state;
    checkedKeysDetail.length=0
    this.setState({
      checkedKeys:[],
      expandedKeys: [],
      currentRoleInfo: {},
      currentRolePermission: [],
      currentMembers: []
    },()=>{
      GetRole({
        roleId: id
      },{
        success: {
          func: (res) =>{
            if (res.data.statusCode === 200) {
              let result = res.data.data;
              this.generateDatas(result.permissions)
              this.setState({
                currentRoleInfo: result,
                currentRolePermission: result.permissions,
                expandedKeys: checkedKeysDetail,
                checkedKeys: checkedKeysDetail
              })
            }
          },
          isAsync: true
        }
      })
      roleWithMembers({
        roleID: id,
        scope: 'project',
        scopeID: `${projectDetail.pid}`
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
  getProjectMember() {
    const { GetProjectsMembers } = this.props;
    GetProjectsMembers({type: 'user'},{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            let newArr = res.data.iteams
            this.formatMember(newArr)
            this.setState({
              memberArr: newArr,
              totalMemberCount: res.data.listMeta.total,
              connectModal:true
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
  renderItem(item) {
    return(
      <Row key={item&&item.key}>
        <Col span={20}>{item&&item.name}</Col>
        {/*<Col span={4}>{item&&item.count}</Col>*/}
      </Row>
    )
  }
  openCreateModal() {
    this.setState({
      characterModal:true
    })
  }
  deleteRole(e,item){
    e.stopPropagation()
    this.setState({
      currentDeleteRole:item
    },()=>{
      this.setState({
        deleteRoleModal: true
      })
    })
  }
  cancelDeleteRole() {
    this.setState({
      deleteRoleModal: false
    })
  }
  confirmDeleteRole() {
    const { DeleteProjectsRelatedRoles } = this.props;
    const { projectDetail, currentDeleteRole, currentRoleInfo } = this.state;
    let deleteArr = []
    let notify = new Notification()
    deleteArr.push(currentDeleteRole.roleId)
    DeleteProjectsRelatedRoles({
      projectsName: projectDetail.projectName,
      body: {
        Roles: deleteArr
      }
    },{
      success: {
        func: () => {
          this.setState({
            deleteRoleModal: false,
            currentRoleInfo: currentRoleInfo.id === currentDeleteRole.roleId ? {} : currentRoleInfo
          },()=>{
            this.getProjectDetail()
            notify.success('删除角色成功')
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('删除角色失败')
          this.setState({
            deleteRoleModal: false
          })
        },
        isAsync: true
      }
    })
  }
  closeMemberModal() {
    this.setState({
      connectModal: false
    })
  }
  submitMemberModal() {
    const { selectedMembers, existentMember } = this.state;
    let diff = xor(existentMember,selectedMembers);
    let del = intersection(existentMember,diff)
    let add = intersection(selectedMembers,diff)
    if (!del.length && !add.length) {
      this.setState({
        connectModal: false
      })
    } else if (del.length && !add.length) {
      this.delMember(del,true)
    } else if (!del.length && add.length) {
      this.addMember(add,true)
    } else {
      this.addMember(add)
      this.delMember(del,true)
    }
  }
  addMember(add,flag) {
    const { currentRoleInfo, projectDetail } = this.state;
    const { usersAddRoles } = this.props;
    let notify = new Notification()
    usersAddRoles({
      roleID: currentRoleInfo.id,
      scope: 'project',
      scopeID: `${projectDetail.pid}`,
      body: {
        userIDs:add
      }
    },{
      success: {
        func: () => {
          if (flag) {
            this.getCurrentRole(currentRoleInfo.id)
            notify.success('关联对象操作成功')
            this.setState({
              connectModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            notify.error('关联对象操作失败')
            this.setState({
              connectModal: false
            })
          }
        },
        isAsync: true
      }
    })
  }
  delMember(del,flag) {
    const { currentRoleInfo, projectDetail } = this.state;
    const { usersLoseRoles } = this.props;
    let notify = new Notification()
    usersLoseRoles({
      roleID: currentRoleInfo.id,
      scope: 'project',
      scopeID: `${projectDetail.pid}`,
      body: {
        userIDs:del
      }
    },{
      success: {
        func: () => {
          if (flag) {
            this.getCurrentRole(currentRoleInfo.id)
            notify.success('关联对象操作成功')
            this.setState({
              connectModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            notify.success('关联对象操作成功')
            this.setState({
              connectModal: false
            })
          }
        },
        isAsync: true
      }
    })
  }
  updateCurrentMember(member) {
    this.setState({
      selectedMembers: member
    })
  }
  relateMember() {
    const { memberArr } = this.state;
    if (!memberArr.length) {
      this.getProjectMember()
    } else {
      this.setState({connectModal:true})
    }
  }
  render() {
    const { payNumber, projectDetail, projectClusters, dropVisible, editComment, comment, currentRolePermission, choosableList, targetKeys,
      currentRoleInfo, currentMembers, memberCount, memberArr, existentMember, connectModal, characterModal, currentDeleteRole, totalMemberCount } = this.state;
    const TreeNode = Tree.TreeNode;
    const { form, roleNum } = this.props;
    const { getFieldProps } = form;
    const loopFunc = data => data.length >0 && data.map((item) => {
      return <TreeNode key={item.key} title={item.userName} disableCheckbox={true}/>;
    });
    const projectRole = (role) => {
      if (!role) return
      if (role.includes('no-participator')) {
        return '非项目成员'
      } else if (role.includes('manager') || role.includes('creator')) {
        return '创建者'
      } else {
        return '参与者'
      }
    }
    const disabledArr = [TEAM_VISISTOR_ROLE_ID, TEAM_MANAGE_ROLE_ID]
    const loop = data => data.map((item) => {
      if (item['children'] !== undefined) {
        return (
          <TreeNode key={item.key} title={item.title} disableCheckbox={true}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} disableCheckbox={true}/>;
    });
    let alertMessage = (
      <div style={{ color: '#137bb8', lineHeight: '28px', }}>
        <Icon type="smile" style={{ marginRight: 10 }} /> 温馨提示: <br />
        <p>1. 每个有权限管理该项目的人都可设置该项目的余额预警提醒，该设置的提醒只针对设置者本人，以对设置者发邮件的方式提醒，方便及时为项目充值。</p>
        <p>2. 当项目余额小于该值时，每天邮件提醒一次。</p>
      </div>
    )
    const applying = (flag)=> {
      return [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 1) {
            if (flag) {
              return (
                <div className="clusterStatus applyingStatus" key={`${item.cluster.clusterID}-status`}>
                  <span>{item.cluster.clusterName}</span>
                  {this.clusterStatus(item.status,true)}
                </div>
              )
            }
            return(
              <dd className="topList" key={item.cluster.clusterID}>
                <span>{item.cluster.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  <Icon type="cross-circle-o" className="pull-right pointer" style={{marginLeft:'10px'}} onClick={()=>this.updateProjectClusters(item.cluster.clusterID,0)}/>
                </div>
              </dd>
            )
          }
        })
      ]
    }
    const applied = (flag)=> {
      return [
        projectClusters.length > 0 && projectClusters.map((item, index) => {
          if (item.status === 2) {
            if (flag) {
              return (
                <div className="clusterStatus appliedStatus" key={`${item.cluster.clusterID}-status`}>
                  <span>{item.cluster.clusterName}</span>
                  {this.clusterStatus(item.status,true)}
                  {
                    roleNum !== 3 &&
                      <Tooltip title="移除集群">
                        <i className="anticon anticon-cross" onClick={()=>this.setState({deleteClusterModal: true})}/>
                      </Tooltip>
                  }
                  <Modal title="移除集群" visible={this.state.deleteClusterModal}
                         onCancel={()=>this.setState({deleteClusterModal:false})}
                         onOk={()=>{this.updateProjectClusters(item.cluster.clusterID, 0);this.setState({deleteClusterModal: false})}}
                  >
                    <div className="modalColor">
                      <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
                      移除集群后，该集群下的资源也将被移除，此操作不可逆，是否确定移除已授权的集群{item.cluster.clusterName}？
                    </div>
                  </Modal>
                </div>
              )
            }
            return (
              <dd className="topList" key={item.cluster.clusterID}>
                <span>{item.cluster.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  {/*<Icon type="cross-circle-o" className="pull-right pointer" style={{marginLeft:'10px'}} onClick={()=>this.updateProjectClusters(item.cluster.clusterID,0)}/>*/}
                </div>
              </dd>
            )
          }
        })
      ]
    }
    const reject = (flag)=> {
      return [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 3) {
            if (flag) {
              return (
                <div className="clusterStatus rejectStatus" key={`${item.cluster.clusterID}-status`}>
                  <span>{item.cluster.clusterName}</span>
                  {this.clusterStatus(item.status,true)}
                </div>
              )
            }
            return(
              <dd className="topList" key={item.cluster.clusterID}>
                <span>{item.cluster.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  <Tooltip placement="top" title='重新申请'>
                    <i className="fa fa-pencil-square-o pull-right fa-lg pointer" aria-hidden="true" onClick={()=>this.updateProjectClusters(item.cluster.clusterID,1)}/>
                  </Tooltip>
                  <Icon type="cross-circle-o" className="pull-right pointer" style={{marginLeft:'10px'}} onClick={()=>this.updateProjectClusters(item.cluster.clusterID,0)}/>
                </div>
              </dd>
            )
          }
        })
      ]
    }
    let bottomLength = 0
    const menuBottom = (
      [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 0) {
            bottomLength ++
            return(
              <dd className="topList lastList pointer" key={item.cluster.clusterID} onClick={()=>this.updateProjectClusters(item.cluster.clusterID,1)}>
                <span>{item.cluster.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                </div>
              </dd>
            )
          }
        })
      ]
    )
    const roleList = projectDetail.relatedRoles && projectDetail.relatedRoles.map((item,index)=>{
      return (
        <li key={item.roleId} className={classNames({'active': currentRoleInfo && currentRoleInfo.id === item.roleId})} onClick={()=>this.getCurrentRole(item.roleId)}>{item.roleName}
          {
            roleNum !== 3 && !includes(disabledArr,item.roleId) &&
              <Tooltip placement="top" title="移除角色">
                <Icon type="delete" className="pointer" onClick={(e)=>this.deleteRole(e,item)}/>
              </Tooltip>
          }
        </li>
      )
    })
    const appliedLenght = projectClusters.length - bottomLength
    return(
      <QueueAnim>
        <div key='projectDetailBox' className="projectDetailBox">
          <div className="goBackBox">
            <span className="goBackBtn pointer" onClick={()=> browserHistory.push('/tenant_manage/project_manage')}>返回</span>
            <i/>
            创建项目
          </div>
          <Modal title="删除角色" visible={this.state.deleteRoleModal}
            onCancel = {()=> this.cancelDeleteRole()}
            onOk = {()=> this.confirmDeleteRole()}
          >
            <div className="modalColor">
              <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
              是否确定从项目{projectDetail&&projectDetail.projectName}中移除角色{currentDeleteRole.roleName}？
            </div>
          </Modal>
          <Modal title="项目充值" visible={this.state.paySingle} width={580}
             onCancel = {()=> this.paySingleCancel()}
             onOk = {()=> this.paySingleOk()}
          >
            <dl className="paySingleList">
              <dt>项目名</dt><dd>{projectDetail&&projectDetail.projectName}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>余额</dt><dd>{parseAmount(projectDetail&&projectDetail.balance,4).fullAmount}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>充值金额</dt>
              <dd className="payBtn">
                <span className={classNames('btnList',{'active': payNumber === 10})} onClick={()=>{this.changePayNumber(10)}}>10T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList',{'active': payNumber === 20})} onClick={()=>{this.changePayNumber(20)}}>20T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList',{'active': payNumber === 50})} onClick={()=>{this.changePayNumber(50)}}>50T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList',{'active': payNumber === 100})} onClick={()=>{this.changePayNumber(100)}}>100T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <InputNumber value={payNumber} onChange={(value)=>this.setState({payNumber:value})} size="large" min={10}/>
                <b>T</b>
              </dd>
            </dl>
          </Modal>
          <Modal visible={this.state.balanceWarning}
                 title='设置提醒'
                 wrapClassName='remindModal'
                 onOk={this.warningSubmit.bind(this)}
                 onCancel={this.warningCancel.bind(this)}
                 width='610px' >
            <div>
              <Alert message={alertMessage} type="info" />
              <Row style={{ color: '#333333', height: 35 }}>
                <Icon type="pay-circle-o" style={{ marginRight: 10 }} />
                余额不足提醒
              </Row>
              <Row style={{ paddingLeft: '22px', height: 35 }}>
                <Col span={4} style={{ color: '#7a7a7a' }}>提醒规则</Col>
                <Col span={20} style={{ color: '#666666' }}>我的空间可用余额小于&nbsp;
                  <InputNumber/>
                  <span> T</span>
                  &nbsp;时发送提醒
                </Col>
              </Row>
              <Row style={{ paddingLeft: '22px', height: 28 }}>
                <Col span={4} style={{ color: '#7a7a7a' }}>提醒方式</Col>
                <Col span={20}>
                  <Checkbox  style={{ color: '#7a7a7a', fontSize: '14px' }} >邮件(123456@qq.com)</Checkbox>
                </Col>
              </Row>
            </div>
          </Modal>
          <Card title="基本信息" bordered={false} style={{ width: '100%' }}>
            <Row>
              <Col span={12}>
                <div className="basicInfoLeft">
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        项目名称
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail&&projectDetail.projectName}
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        余额
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        <span style={{marginRight:'30px'}}>{parseAmount(projectDetail&&projectDetail.balance,4).fullAmount}</span>
                        {
                          roleNum === 1 && <Button type="primary" size="large" onClick={this.paySingle.bind(this)}>充值</Button>
                        }
                      </div>
                    </Col>
                  </Row>
                  {/*<Row gutter={16}>*/}
                    {/*<Col className='gutter-row' span={4}>*/}
                      {/*<div className="gutter-box">*/}
                        {/*余额预警*/}
                      {/*</div>*/}
                    {/*</Col>*/}
                    {/*<Col className='gutter-row' span={20}>*/}
                      {/*<div className="gutter-box">*/}
                        {/*<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={false}  onChange={(checked)=>this.switchChange(checked)}/>*/}
                        {/*{*/}
                          {/*this.state.switchState ?*/}
                            {/*<span>*/}
                              {/*<span className="balanceTip">项目余额小于 <span className="themeColor">2T</span> 时预警</span>*/}
                              {/*<span className="alertBtn themeColor pointer" onClick={()=>this.setState({balanceWarning:true})}>修改</span>*/}
                            {/*</span>*/}
                            {/*: ''*/}
                        {/*}*/}
                      {/*</div>*/}
                    {/*</Col>*/}
                  {/*</Row>*/}
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        授权集群
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        <div className="dropDownBox">
                          <span className="pointer" onClick={()=>{ roleNum === 3 ? null : this.toggleDrop()}}>编辑授权集群<i className="fa fa-caret-down pointer" aria-hidden="true"/></span>
                          <div className={classNames("dropDownInnerBox",{'hide':!dropVisible})}>
                            <dl className="dropDownTop">
                              <dt className="topHeader">{`已申请集群（${appliedLenght}）`}</dt>
                                {applying(false)}
                                {applied(false)}
                                {reject(false)}
                              {
                                !appliedLenght &&
                                  <dd className="topList" style={{color:'#999'}}>已申请集群为空</dd>
                              }
                            </dl>
                            <dl className="dropDownBottom">
                              <dt className="bottomHeader">{`可申请集群（${bottomLength}）`}</dt>
                              {menuBottom}
                              {
                                !bottomLength &&
                                  <dd className="topList lastList" style={{color:'#999'}}>可申请集群为空</dd>
                              }
                            </dl>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={19} offset={4}>
                      {
                        appliedLenght > 0 &&
                        <div className="clusterWithStatus">
                          {applying(true)}
                          {applied(true)}
                          {reject(true)}
                        </div>
                      }
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col span={12}>
                <div className="basicInfoRight">
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        项目角色
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectRole(projectDetail.outlineRoles)}
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        创建时间
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail && projectDetail.createTime && projectDetail.createTime.replace(/T/g,' ').replace(/Z/g, '')}
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        更新时间
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail && projectDetail.updateTime && projectDetail.updateTime.replace(/T/g, ' ').replace(/Z/g, '')}
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        备注
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        <div className="example-input commonBox">
                          <Input size="large" disabled={editComment ? false : true} type="textarea" placeholder="备注" {...getFieldProps('comment',{
                            initialValue: comment
                          })}/>
                          {
                            editComment ?
                              [
                                <Tooltip title="取消">
                                  <i className="anticon anticon-minus-circle-o pointer" onClick={()=> this.cancelEdit()}/>
                                </Tooltip>,
                                <Tooltip title="保存">
                                  <i className="anticon anticon-save pointer" onClick={()=> this.saveComment()}/>
                                </Tooltip>
                              ] :
                                roleNum !== 3 &&
                                <Tooltip title="编辑">
                                  <i className="anticon anticon-edit pointer" onClick={()=> this.editComment()}/>
                                </Tooltip>
                          }
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
          <div className="projectResource">
            <Card title="项目资源">
              <Row gutter={16}>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock appNum"/>
                    <span>应用数：{projectDetail&&projectDetail.appCount}个</span>
                  </div>
                </Col>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock serverNum"/>
                    <span>服务数：{projectDetail&&projectDetail.serviceCount}个</span>
                  </div>
                </Col>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock containerNum"/>
                    <span>容器数：{projectDetail&&projectDetail.containerCount}个</span>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
          <Modal
            visible={this.state.addCharacterModal}
            title='添加已有角色'
            wrapClassName='addCharacterModal'
            onOk={this.addCharacterOk.bind(this)}
            onCancel={this.addCharacterCancel.bind(this)}
            width='760px'
          >
            <Transfer
              dataSource={choosableList}
              className="projectDetailRoleTrans"
              showSearch
              listStyle={{
                width: 300,
                height: 255,
              }}
              searchPlaceholder="请输入搜索内容"
              titles={['可选角色', '已选角色']}
              operations={[ '添加','移除']}
              filterOption={this.filterOption.bind(this)}
              targetKeys={targetKeys}
              onChange={this.handleChange.bind(this)}
              rowKey={item => item.key}
              render={(item)=>this.renderItem(item)}
            />
          </Modal>
          <CreateRoleModal
            form={form}
            scope={this}
            characterModal={characterModal}
            loadData={this.loadRoleList.bind(this)}
          />
          <Modal title="关联对象" width={765} visible={connectModal}
                 onCancel={()=> this.closeMemberModal()}
                 onOk={()=> this.submitMemberModal()}
          >
            {
              memberArr.length > 0 &&
              <TreeComponent
                outPermissionInfo={memberArr}
                permissionInfo={[]}
                existMember={existentMember.length > 0 ? existentMember.slice(0) : []}
                text='对象'
                memberCount={totalMemberCount}
                roleMember={memberCount}
                connectModal={connectModal}
                getTreeRightData={this.updateCurrentMember.bind(this)}
              />
            }
          </Modal>
          <div className="projectMember">
            <Card title="项目中角色关联的对象" className="clearfix connectCard">
              <div className="connectLeft pull-left">
                <span className="leftTitle">已添加角色</span>
                <ul className={classNames("characterListBox",{'borderHide': projectDetail.relatedRoles === null})}>
                  {roleList}
                </ul>
                {
                  roleNum !== 3 &&
                  [
                    <Button type="primary" size="large" icon="plus" onClick={()=>this.setState({addCharacterModal:true})}> 添加已有角色</Button>,
                    <br/>,
                    <Button type="ghost" size="large" icon="plus" onClick={()=>this.openCreateModal()}>创建新角色</Button>
                  ]
                }
              </div>
              <div className="connectRight pull-left">
                <p className="rightTitle">角色关联对象</p>
                <div className="rightContainer">
                  <div className="authBox inlineBlock">
                    <p className="authTitle">该角色共 <span style={{color:'#59c3f5'}}>{currentRoleInfo && currentRoleInfo.total || 0}</span> 个权限</p>
                    <div className="treeBox">
                      {
                        currentRolePermission &&
                        <Tree
                          checkable
                          onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                          autoExpandParent={this.state.autoExpandParent}
                          onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                          onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                        >
                          {loop(currentRolePermission)}
                        </Tree>
                      }
                    </div>
                  </div>
                  <div className="memberBox inlineBlock">
                    <div className="memberTitle">
                      <span>该角色已关联 <span className="themeColor">{memberCount}</span> 个对象</span>
                      {
                        roleNum !== 3 && currentMembers.length > 0 && <Button type="primary" size="large" onClick={()=> this.relateMember()}>继续关联对象</Button>
                      }
                    </div>
                    <div className="memberTableBox">
                      {
                        currentMembers.length > 0 ?
                          <Tree
                            checkable multiple
                            checkedKeys={currentMembers.map(item => `${item.key}`)}
                          >
                            {loopFunc(currentMembers)}
                          </Tree>
                          :
                          roleNum !== 3 && <Button type="primary" size="large" className="addMemberBtn" onClick={()=> this.relateMember()}>关联对象</Button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </QueueAnim>
    )

  }
}

ProjectDetail = Form.create()(ProjectDetail)
function mapStateToThirdProp(state, props) {
  const { query } = props.location
  const { name } = query;
  const { loginUser } = state.entities
  const { globalRoles } = loginUser.info || { globalRoles: [] }
  let roleNum = 0
  if (globalRoles.length) {
    for (let i = 0; i < globalRoles.length; i++) {
      if (globalRoles[i] === 'admin') {
        roleNum = 1;
        break
      } else if (globalRoles[i] === 'project-creator') {
        roleNum = 2;
        break
      } else {
        roleNum = 3
      }
    }
  }
  return {
    name,
    roleNum
  }
}

export default ProjectDetail = connect(mapStateToThirdProp, {
  GetProjectsDetail,
  UpdateProjects,
  GetProjectsAllClusters,
  UpdateProjectsCluster,
  chargeProject,
  ListRole,
  CreateRole,
  ExistenceRole,
  UpdateProjectsRelatedRoles,
  DeleteProjectsRelatedRoles,
  GetProjectsMembers,
  GetRole,
  roleWithMembers,
  usersAddRoles,
  usersLoseRoles
})(ProjectDetail)
