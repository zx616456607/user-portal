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
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree, Switch, Alert, Dropdown, Menu, form } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { browserHistory, Link} from 'react-router'
import { connect } from 'react-redux'
import { GetProjectsDetail, UpdateProjects, GetProjectsAllClusters, UpdateProjectsCluster, UpdateProjectsRelatedRoles, DeleteProjectsRelatedRoles, GetProjectsMembers } from '../../../../actions/project'
import { chargeProject } from '../../../../actions/charge'
import { loadNotifyRule, setNotifyRule } from '../../../../actions/consumption'
import { ListRole, CreateRole, GetWithMembers, ExistenceRole } from '../../../../actions/role'
import { PermissionAndCount } from '../../../../actions/permission'
import { parseAmount } from '../../../../common/tools'
import Notification from '../../../../components/Notification'
import TreeComponent from '../../../TreeForMembers'
import cloneDeep from 'lodash/cloneDeep'

let checkedKeysDetail = []
class ProjectDetail extends Component{
  constructor(props){
    super(props)
    this.state= {
      editComment: false,
      paySingle: false,
      switchState: false,
      balanceWarning: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
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
      allPermission: [],
      createRoleName: '',
      createRoleDesc: '',
      createRolePer: [],
      currentMembers: [],
      memberCount: 0,
      connectModal: false,
      memberArr: [],
      existentMember: [],
      roleMap: {}
    }
  }
  componentWillMount() {
    this.getProjectDetail();
    this.getClustersWithStatus();
    this.getProjectMember();
    // this.loadRoleList()
  }
  componentDidMount() {
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
    GetProjectsDetail({
      projectsName: name
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            if ((res.relatedRoles)) {
              this.getCurrentRole(res.relatedRoles[0].roleId)
            } else {
              this.setState({
                currentRolePermission: [],
                currentRoleInfo: {}
              })
            }
            this.setState({
              projectDetail:res,
              comment:res.description
            },()=>{
              this.loadRoleList()
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
  saveComment() {
    const { getFieldValue } = this.props.form;
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
  cancelModal() {
    this.setState({characterModal:false})
  }
  createModal() {
    const { CreateRole, ExistenceRole } = this.props;
    const { createRoleName, createRoleDesc, createRolePer } = this.state;
    let notify = new Notification()
    ExistenceRole({
      name: createRoleName
    },{
      success:{
        func: (res) => {
          if (res.data.statusCode === 200) {
            if (res.data.data) {
              return notify.info('该角色名称已经存在')
            }
            CreateRole({
              name: createRoleName,
              comment: createRoleDesc,
              permission: createRolePer
            },{
              success:{
                func: (res) => {
                  if (res.data.statusCode === 200) {
                    notify.success('创建角色成功')
                    this.getProjectDetail()
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
  changePayNumber(payNumber) {
    this.setState({payNumber})
  }
  clusterStatus(status) {
    return (
      <span className={`projectDetailClusterStatus projectDetailClusterStatus${status}`}>
        {status ===1 ? '申请中...' : ''}
        {status ===2 ? '已授权' : ''}
        {status ===3 ? '已拒绝' : ''}
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
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: `${key}`})
      children.push(key);
      checkedKeysDetail.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index].children&&(tns[index].children.length !== null)) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  getCurrentRole(id) {
    const { GetWithMembers } = this.props;
    const { currentRoleInfo } = this.state;
    if (currentRoleInfo.role && (id === currentRoleInfo.role.id)) {
      return
    }
    checkedKeysDetail.length=0
    this.setState({
      checkedKeys:[],
      expandedKeys: [],
      currentRoleInfo: {},
      currentRolePermission: [],
      currentMembers: []
    },()=>{
      GetWithMembers({
        id
      },{
        success: {
          func: (res) =>{
            if (res.data.statusCode === 200) {
              let result = res.data.data;
              this.generateDatas(result.permission.permission)
              let member = []
              let exist = []
              if (result.member.length > 0) {
                if (result.member[0].teams && result.member[0].users) {
                  member = result.member[0].teams.concat(result.member[0].users)
                  exist = result.member[0].teams.concat(result.member[0].users)
                }else if (result.member[0].teams) {
                  member = result.member[0].teams.slice(0)
                  exist = result.member[0].teams.slice(0)
                }else if (result.member[0].users) {
                  member = result.member[0].users.slice(0)
                  exist = result.member[0].users.slice(0)
                }else {
                  member = []
                  exist = []
                }
                this.formatArr(member)
                this.formatMember(exist)
              }
              this.setState({
                currentRoleInfo: result,
                currentRolePermission: result.permission.permission,
                currentMembers: member,
                existentMember: exist,
                memberCount:result.member.length > 0 ? result.member[0].count : 0,
                expandedKeys: checkedKeysDetail,
                checkedKeys: checkedKeysDetail
              })
            }
          },
          isAsync: true
        }
      })
    })
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
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].teamId) {
        Object.assign(arr[i],{id:arr[i].teamId},{teamName:arr[i].teamName},{userCount:arr[i].userCount},{children:arr[i].users})
        this.formatMember(arr[i].users)
      } else {
        Object.assign(arr[i],{id:arr[i].userID},{userName:arr[i].userName},{creationTime:arr[i].creationTime})
      }
    }
  }
  formatArr(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].teamId) {
        Object.assign(arr[i],{key:arr[i].teamId},{name:arr[i].teamName},{type:'团队'},{children:arr[i].users})
        this.formatArr(arr[i].users)
      } else {
        Object.assign(arr[i],{key:arr[i].userID},{name:arr[i].userName},{type:'成员'})
      }
    }
  }
  renderItem(item) {
    return(
      <Row key={item&&item.key}>
        <Col span={20}>{item&&item.name}</Col>
        <Col span={4}>{item&&item.count}</Col>
      </Row>
    )
  }
  openCreateModal() {
    const { PermissionAndCount } = this.props;
    PermissionAndCount({},{
      success:{
        func: (res)=>{
          if (res.data.statusCode === 200) {
            let result = res.data.data.permission;
            this.generateDatas(result)
            this.setState({
              allPermission:result,
              characterModal:true
            })
          }
        },
        isAsync: true
      }
    })
  }
  deleteRole(id){
    const { DeleteProjectsRelatedRoles } = this.props;
    const { projectDetail } = this.state;
    let deleteArr = []
    deleteArr.push(id)
    DeleteProjectsRelatedRoles({
      projectsName: projectDetail.projectName,
      body: {
        Roles: deleteArr
      }
    },{
      success: {
        func: (res) => {
          this.getProjectDetail()
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
    this.setState({
      connectModal: false
    })
  }
  updateCurrentMember(member) {
    const { currentRoleInfo, roleMap } = this.state;
    let map = cloneDeep(roleMap);
    console.log(currentRoleInfo)
    map[currentRoleInfo.role.id] = member;
    this.setState({
      roleMap:map
    })
  }
  render() {
    const { payNumber, projectDetail, projectClusters, dropVisible, editComment, comment, currentRolePermission, choosableList, targetKeys, allPermission, currentRoleInfo, currentMembers, memberCount, memberArr, existentMember, connectModal, roleMap } = this.state;
    const TreeNode = Tree.TreeNode;
    const { getFieldProps } = this.props.form;
    const columns = [{
      title: '成员名称',
      dataIndex: 'name',
      width: '60%'
    }, {
      title: '对象类型',
      dataIndex: 'type',
      width: '40%'
    }];
    const loopFunc = data => data.length >0 && data.map((item) => {
      if (item.users) {
        return (
          <TreeNode key={item.teamId} title={item.teamName}>
            {loopFunc(item.users)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.userID} title={item.userName}/>;
    });
    const projectRole = (role) => {
      if (role === 'admin') {
        return '系统管理员'
      }else if (role === 'manager') {
        return '管理员'
      } else if (role === 'creator') {
        return '创建者'
      } else {
        return '访客'
      }
    }
    const loop = data => data.map((item) => {
      if (item.children) {
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
    const applying = (
      [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 1) {
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
    )
    const applied = (
      [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 2) {
            return(
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
    )
    const reject = (
      [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 3) {
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
    )
    const menuBottom = (
      [
        projectClusters.length > 0 && projectClusters.map((item,index)=>{
          if (item.status === 0) {
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
    const roleList = projectDetail.roleUserMap && projectDetail.roleUserMap.map((item,index)=>{
      return (
        <li key={item.role.roleId} className={classNames({'active': currentRoleInfo.role && currentRoleInfo.role.id === item.role.roleId})} onClick={()=>this.getCurrentRole(item.role.roleId)}>{item.role.roleId}
        <Icon type="delete" className="pointer" onClick={()=>this.deleteRole(item.role.roleId)}/></li>
      )
    })
    return(
      <QueueAnim  type="right">
        <div className="projectDetailBox">
          <div className="goBackBox">
            <span className="goBackBtn pointer" onClick={()=> browserHistory.push('/tenant_manage/project_manage')}>返回</span>
            <i/>
            创建项目
          </div>
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
                        <Button type="primary" size="large" onClick={this.paySingle.bind(this)}>充值</Button>
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
                          <span className="pointer" onClick={()=>{this.toggleDrop()}}>编辑授权集群<i className="fa fa-caret-down pointer" aria-hidden="true"/></span>
                          <div className={classNames("dropDownInnerBox",{'hide':!dropVisible})}>
                            <dl className="dropDownTop">
                              <dt className="topHeader">已申请集群（0）</dt>
                              {applying}
                              {applied}
                              {reject}
                            </dl>
                            <dl className="dropDownBottom">
                              <dt className="bottomHeader">可申请集群（0）</dt>
                              {menuBottom}
                            </dl>
                          </div>
                        </div>
                      </div>
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
                        {projectRole(projectDetail.projectRole)}
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
                        {projectDetail&&projectDetail.creationTime}
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
                        {projectDetail&&projectDetail.updateTime}
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
                        <div className="example-input inlineBlock">
                          {
                            editComment ?
                              <div>
                                <Input size="large" placeholder="备注" {...getFieldProps('comment',{
                                  initialValue: comment
                                })}/>
                                <i className="anticon anticon-save pointer" onClick={()=> this.saveComment()}/>
                              </div>
                              :
                              <div>
                                <span>{projectDetail&&projectDetail.description}</span>
                                <i className="anticon anticon-edit pointer" onClick={()=> this.editComment()}/>
                              </div>
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
            title='管理角色'
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
              searchPlaceholde="请输入策略名搜索"
              titles={['包含权限（个）', '包含权限（个）']}
              operations={[ '添加','移除']}
              filterOption={this.filterOption.bind(this)}
              targetKeys={targetKeys}
              onChange={this.handleChange.bind(this)}
              rowKey={item => item.key}
              render={(item)=>this.renderItem(item)}
            />
          </Modal>
          <Modal title="创建角色" wrapClassName="createCharacterModal" visible={this.state.characterModal} width={570}
                 onCancel={()=> this.cancelModal()}
                 onOk={()=> this.createModal()}
          >
            <CreateCharacter allPermission={allPermission} scope={this}/>
          </Modal>
          <Modal title="关联对象" width={765} visible={connectModal}
                 onCancel={()=> this.closeMemberModal()}
                 onOk={()=> this.submitMemberModal()}
          >
            {
              memberArr.length > 0 &&
              <TreeComponent
                outPermissionInfo={memberArr}
                permissionInfo={[]}
                existMember={roleMap[currentRoleInfo.role && currentRoleInfo.role.id] || []}
                text='成员'
                connectModal={connectModal}
                getTreeRightData={this.updateCurrentMember.bind(this)}
              />
            }
          </Modal>
          <div className="projectMember">
            <Card title="项目中角色关联的对象" className="clearfix">
              <div className="connectLeft pull-left">
                <span className="leftTitle">已添加角色</span>
                <ul className={classNames("characterListBox",{'borderHide': projectDetail.relatedRoles === null})}>
                  {roleList}
                </ul>
                <Button type="primary" size="large" icon="plus" onClick={()=>this.setState({addCharacterModal:true})}> 管理角色</Button><br/>
                <Button type="ghost" size="large" icon="plus" onClick={()=>this.openCreateModal()}>创建新角色</Button>
              </div>
              <div className="connectRight pull-left">
                <p className="rightTitle">角色关联对象</p>
                <div className="rightContainer">
                  <div className="authBox inlineBlock">
                    <p className="authTitle">{currentRoleInfo.role && currentRoleInfo.role.name}共 <span style={{color:'#59c3f5'}}>{currentRoleInfo.role && currentRoleInfo.role.count}</span> 个权限</p>
                    <div className="treeBox">
                      {
                        currentRolePermission.length > 0 &&
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
                      <span>{currentRoleInfo.role && currentRoleInfo.role.name}已关联 <span className="themeColor">{memberCount}</span> 个对象</span>
                      {
                        currentMembers.length > 0 && <Button type="primary" size="large" onClick={()=> this.setState({connectModal:true})}>继续关联对象</Button>
                      }
                    </div>
                    <div className="memberTableBox">
                      {
                        currentMembers.length > 0 ?
                          <Table columns={columns} dataSource={currentMembers} pagination={false}/>
                          :
                          <Button type="primary" size="large" className="addMemberBtn" onClick={()=> this.setState({connectModal:true})}>关联对象</Button>
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

ProjectDetail = form.create()(ProjectDetail)
function mapStateToThirdProp(state, props) {
  const { query } = props.location
  const { name } = query;
  return {
    name
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
  GetWithMembers,
  ExistenceRole,
  PermissionAndCount,
  UpdateProjectsRelatedRoles,
  DeleteProjectsRelatedRoles,
  GetProjectsMembers
})(ProjectDetail)

class CreateCharacter extends Component{
  constructor(props) {
    super(props)
    this.state={
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      allPermission: []
    }
  }
  componentWillMount() {
  }
  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheckDetail(checkedKeys) {
    const { scope } = this.props;
    scope.setState({
      createRolePer:checkedKeys
    })
    this.setState({
      checkedKeys,
    });
  }
  onSelect(selectedKeys, info) {
    this.setState({ selectedKeys });
  }
  updateRoleName() {
    const { scope } = this.props;
    const { getFieldValue } = this.props.form;
    let createRoleName = getFieldValue('roleNameDetail')
    scope.setState({
      createRoleName:createRoleName
    })
  }
  updateRoleDesc() {
    const { scope } = this.props;
    const { getFieldValue } = this.props.form;
    let createRoleDesc = getFieldValue('roleDescDetail')
    scope.setState({
      createRoleDesc:createRoleDesc
    })
  }
  roleNameDetail(rule, value, callback) {
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
  roleDescDetail(rule, value, callback) {
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
  render() {
    const TreeNode = Tree.TreeNode;
    const { getFieldProps } = this.props.form;
    const { allPermission } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    };
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title}/>;
    });
    return(
      <div>
        <form className="createRoleForm" form={this.props.form}>
          <form.Item label="名称" {...formItemLayout}>
            <Input placeholder="请输入名称" {...getFieldProps(`roleNameDetail`, {
              rules: [
                { validator: (rules,value)=>this.roleNameDetail(rules,value,this.updateRoleName.bind(this))}
              ],
              initialValue:  '',
            }) }
            />
          </form.Item>
          <form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`roleDescDetail`, {
              rules: [
                { validator: (rules,value)=>this.roleDescDetail(rules,value,this.updateRoleDesc.bind(this))}
              ],
              initialValue: '',
            }) }/>
          </form.Item>
        </form>
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
                  onCheck={this.onCheckDetail.bind(this)} checkedKeys={this.state.checkedKeys}
                  onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                >
                  {loop(allPermission)}
                </Tree>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

CreateCharacter = form.create()(CreateCharacter)