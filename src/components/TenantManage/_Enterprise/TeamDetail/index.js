/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */
'use strict'
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Popover, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, Form, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/TeamDetail.less'
import { Link, browserHistory } from 'react-router'
import { setCurrent } from '../../../../actions/entities'
import {
  deleteTeam, createTeamspace, addTeamusers, removeTeamusers,
  loadTeamspaceList, loadTeamUserList, loadAllClustersList,
  deleteTeamspace, requestTeamCluster, checkTeamSpaceName,
  loadTeamClustersList,getTeamDetail, updateTeamDetail, loadTeamAllUser
} from '../../../../actions/team'
import { usersExcludeOneTeam } from '../../../../actions/user'
import { usersAddRoles, roleWithMembers, usersLoseRoles } from '../../../../actions/role'
import { connect } from 'react-redux'
import MemberTransfer from '../../../AccountModal/MemberTransfer'
import NotificationHandler from '../../../../components/Notification'
import CommonSearchInput from '../../../../components/CommonSearchInput'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import Root from "../../../../containers/Root";
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import includes from 'lodash/includes'

let MemberList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      sortUserOrder: true,
      sortUser: "a,userName",
      current: 1,
      userPageSize: 5,
      userPage: 1,
      filter: '',
      selectedRowKeys: []
    }
  },
  getUserSort(order, column) {
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  sortMemberName() {
    const { sortUserOrder, userPageSize, userPage, filter } = this.state
    const { loadTeamUserList, teamID} = this.props
    let sort = this.getUserSort(!sortUserOrder, 'userName')
    loadTeamUserList(teamID, {
      sort,
      page: userPage,
      size: userPageSize,
      filter,
    })
    this.setState({
      sortUserOrder: !sortUserOrder,
      sortUser: sort,
    })
  },

  delTeamMember() {
    const { removeTeamusers, teamID, loadTeamUserList, scope, loadTeamAllUser } = this.props
    const { sortUser, userPageSize, filter, transferHint, userId } = this.state
    let self = this
    if (transferHint) {
      this.setState({
        UserModal: false,
        transferHint: false
      },()=>{
        scope.setState({
          transferStatus: true,
          selectLeader: [userId],
          originalLeader: [userId]
        })
      })
      return
    }
    this.setState({UserModal: false})
    let notification = new NotificationHandler()
    removeTeamusers(teamID, this.state.userId, {
      success: {
        func: () => {
          notification.success("移除用户成功")
          loadTeamUserList(teamID, {
            sort: sortUser,
            page: 1,
            size: userPageSize,
            filter,
          })
          loadTeamAllUser(teamID,{size: 0, sort: 'a,userName'})
          self.setState({
            current: 1,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if (err.statusCode == 401) {
            notification.error("没有权限从团队中移除创建者")
          } else {
            notification.error(err.message.message)
          }
        }
      }
    })

  },
  onShowSizeChange(current, pageSize) {
    let { sortUser, filter } = this.state
    const { loadTeamUserList, teamID } = this.props
    loadTeamUserList(teamID, {
      page: 1,
      size: pageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: pageSize,
      userPage: 1,
      current: 1,
    })
  },
  onChange(current) {
    if (current === this.state.current) {
      return
    }
    let { sortUser, userPageSize, filter} = this.state
    const { loadTeamUserList, teamID } = this.props
    loadTeamUserList(teamID, {
      page: current,
      size: userPageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: userPageSize,
      userPage: current,
      current: current,
    })
  },
  onTableChange(pagination, filters, sorter) {
    // 点击分页、筛选、排序时触发
    if (!filters.style) {
      return
    }
    let styleFilterStr = filters.style.toString()
    if (styleFilterStr === this.styleFilter) {
      return
    }
    const { loadTeamUserList, teamID } = this.props
    let { sortUser, userPageSize, userPage } = this.state
    const query = {
      page: userPage,
      size: userPageSize,
      sort: sortUser,
    }
    let filter
    if (filters.style.length === 1) {
      filter = `role,${filters.style[0]}`
      query.filter = filter
    }
    this.setState({
      filter
    })
    loadTeamUserList(teamID, query)
    this.styleFilter = styleFilterStr
  },
  removeMember(e,record) {
    e.stopPropagation()
    if (record.key === 105) {
      this.setState({
       transferHint: true
     },()=>{
        this.setState({userId: record.key, UserModal: true, userName: record.name})
     })
    } else {
      this.setState({
        transferHint: false
      },()=>{
        this.setState({userId: record.key, UserModal: true, userName: record.name})
      })
    }
  },
  render: function () {
    let { filteredInfo, current, selectedRowKeys, userName, transferHint} = this.state
    const { teamUserList, teamUsersTotal } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      total: teamUsersTotal,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange: this.onShowSizeChange,
      onChange: this.onChange,
    }
    const columns = [
      {
        title: (
          <div onClick={this.sortMemberName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortUserOrder ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortUserOrder ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'tablePadding',
      },
      {
        title: '手机/邮箱',
        dataIndex: 'tel',
        key: 'tel',
        render: (text, record) => (
          <Row>
            <Col>{record.tel}</Col>
            <Col>{record.email}</Col>
          </Row>
        )
      },
      {
        title: '类型',
        dataIndex: 'style',
        key: 'style',
        filters: [
          { text: '普通成员', value: 0 },
          { text: '系统管理员', value: 1 },
        ],
      },
      {
        title: '操作',
        dataIndex: 'edit',
        key: 'edit',
        render: (text, record, index) => (
          <div className="cardBtns">
            <Button className="delBtn" onClick={(e)=> this.removeMember(e,record) }>
              移除成员
            </Button>
          </div>
        )
      },
    ]
    return (
      <div id='MemberList'>
        <Table
          columns={columns}
          dataSource={teamUserList}
          pagination={pagination}
          loading={this.state.loading}
          rowKey={record => record.key}
          onChange={this.onTableChange}
          />
        <Modal title="移除成员操作" visible={this.state.UserModal} okText={transferHint ? '去移交团队' : '确定'}
          onOk={()=> this.delTeamMember()} onCancel={()=> this.setState({UserModal: false})}
        >
          <div className="deleteMemberHint">
            <i className="fa fa-exclamation-triangle" style={{marginRight: '8px'}}/>
            {
              transferHint ? `${userName}为改团队的管理员，将团队移交给其他成员后方可移除该成员` :
              `您是否确定要移除成员 ${userName} ?`
            }
          </div>
        </Modal>
      </div>
    )
  }
})
class TeamDetail extends Component {
  constructor(props) {
    super(props)
    this.addNewMember = this.addNewMember.bind(this)
    this.handleNewMemberOk = this.handleNewMemberOk.bind(this)
    this.handleNewMemberCancel = this.handleNewMemberCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      addMember: false,
      targetKeys: [],
      originalKeys: [],
      sortUser: "a,userName",
      teamDetail: {},
      transferStatus: false,
      leaderList: [],
      selectLeader: [],
      editTeamName: false,
      originalLeader: [],
      currentOption: 'team',
      delLeaderHint: false,
      delLeaderName: ''
    }
  }
  componentWillMount() {
    const { loadAllClustersList, loadTeamUserList, loadTeamspaceList, teamID, loadTeamAllUser } = this.props
    loadAllClustersList(teamID)
    loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
    loadTeamAllUser(teamID, {size: 0, sort: 'a,userName'})
    this.loadTeamDetail()
    this.getTeamLeader(false)
  }
  addNewMember() {
    const { loadTeamAllUser, teamID } = this.props;
    loadTeamAllUser(teamID,{size: 0, sort: 'a,userName'},{
      success: {
        func: () => {
          const { teamAllUserIDList } = this.props;
          this.setState({
            addMember: true,
            targetKeys: teamAllUserIDList,
            originalKeys: teamAllUserIDList
          })
        },
        isAsync: true
      }
    })
  }
  handleNewMemberOk() {
    const { targetKeys, originalKeys } = this.state
    let diff = xor(targetKeys,originalKeys)
    let add = intersection(targetKeys,diff)
    let del = intersection(originalKeys,diff)
    if (add.length && del.length) {
      this.delTeamUser(del, true).then(() => {
        this.addTeamUser(add, false, true)
      })
    } else if (add.length && !del.length) {
      this.addTeamUser(add, true, true)
    } else if (!add.length && del.length) {
      this.delTeamUser(del, true)
    } else {
      this.setState({
        addMember: false
      })
    }
  }
  addTeamUser(add, flag, isSet) {
    const { addTeamusers, teamID, loadTeamUserList, loadTeamAllUser } = this.props
    let notify = new NotificationHandler()
    const { sortUser } = this.state
    const newtargetKeys = add.map(item=> {
      return {
        userID: item
      }
    })
    const targetKeysMap = {"users":newtargetKeys}
    return new Promise((resolve,reject) => {
    addTeamusers(teamID,targetKeysMap,{
      success: {
        func: () => {
          resolve()
          if (flag) {
            notify.success('操作成功')
          }
          loadTeamUserList(teamID,{sort: sortUser, size: 5, page: 1})
          loadTeamAllUser(teamID,{size: 0, sort: 'a,userName'})
        },
        isAsync: true
      },
      failed: {
        func: () => {
          reject()
          if (flag) {
            notify.error('操作失败')
          }
        },
        isAsync: true
      }
    })
      if (isSet) {
        this.setState({
          addMember: false,
          targetKeys: [],
        })
      }
    })
  }
  delTeamUser(del,flag) {
    const { teamID, loadTeamUserList, removeTeamusers, loadTeamAllUser } = this.props
    let notify = new NotificationHandler()
    const { sortUser, originalLeader } = this.state
    return new Promise((resolve,reject) => {
      if (includes(del, originalLeader[0])) {
        this.setState({
          delLeaderHint: true
        })
        return
      }
      removeTeamusers(teamID, del, {
        success: {
          func: () => {
            if (flag) {
              notify.success('操作成功')
            }
            loadTeamUserList(teamID,{sort: sortUser, size: 5, page: 1})
            loadTeamAllUser(teamID,{size: 0, sort: 'a,userName'})
            resolve()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            if (flag) {
              notify.error('操作失败')
            }
            reject()
          },
          isAsync: true
        }
      })
      this.setState({
        addMember: false,
        targetKeys: [],
      })
    })
  }
  handleNewMemberCancel(e) {
    this.setState({
      addMember: false,
      targetKeys: [],
    })
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys })
  }
  loadTeamDetail() {
    const { getTeamDetail, teamID } = this.props
    getTeamDetail(teamID,{
      success: {
        func: (res) => {
          this.setState({
            teamDetail: res.result.teams[0]
          })
        },
        isAsync: true
      }
    })
  }
  loadTeamUser(value) {
    const { loadTeamUserList, teamID } = this.props;
    loadTeamUserList(teamID,{
      sort: 'a,userName',
      page: 1,
      size: 5,
      filter: `userName,${value}`
    })
  }
  transferTeamLeader() {
    const { teamAllUserList } = this.props;
    this.setState({
      leaderList: teamAllUserList.map(item => {
        return Object.assign(item,{userName:item.name})
      })
    },()=>{
      this.getTeamLeader(true)
    })
  }
  getTeamLeader(flag) {
    const { roleWithMembers, teamID } = this.props;
    const { originalLeader } = this.state;
    if (originalLeader.length) {
      this.setState({
        transferStatus: true
      })
      return
    }
    roleWithMembers({
      roleID:'RID-i5rFhJowkzjo',
      scope: 'team',
      scopeID: teamID
    },{
      success: {
        func: res => {
          let arr = [res.data.data[0].userId]
          this.setState({
            selectLeader: arr,
            originalLeader: arr,
            delLeaderName: res.data.data[0].userName
          })
          if (flag) {
            this.setState({
              transferStatus: true
            })
          }
        },
        isAsync: true
      }
    })
  }
  getTeamUsers(value) {
    const { teamID, loadTeamAllUser } = this.props;
    let opt = value === null ? {sort: 'a,userName', size: 0} : {sort: 'a,userName', size: 0, filter: `userName,${value}`}
    loadTeamAllUser(teamID, opt,{
      success: {
        func: res => {
          res.users.forEach((item) => {
            Object.assign(item,{key:item.userID})
          })
          this.setState({
            leaderList: res.users,
          })
        },
        isAsync: true
      }
    })
  }
  getExcludeTeamUsers(value) {
    const { usersExcludeOneTeam, teamID } = this.props;
    let opt = value === null ? {excludeTID: teamID} : {excludeTID: teamID,userName: value}
    usersExcludeOneTeam(opt,{
      success: {
        func: res => {
          res.data.users.forEach((item) => {
            Object.assign(item,{key:item.userID})
          })
          this.setState({
            leaderList: res.data.users,
          })
        },
        isAsync: true
      }
    })
  }
  confirmTransferLeader() {
    const { teamUserList } = this.props;
    const { selectLeader, originalLeader } = this.state;
    let notify = new NotificationHandler()
    if (selectLeader[0] === originalLeader[0]) {
      notify.info('该成员已是当前团队管理者，请选择其他成员')
      return
    }
    let flag = false
    for (let i = 0; i < teamUserList.length; i++) {
      if (teamUserList[i].key === selectLeader[0]) {
        flag = true
        break
      }
    }
    if (!flag) {
      this.addTeamUser(selectLeader,false,false).then(() => {
        this.getExcludeTeamUsers(null)
      })
      this.delTeamLeader().then(() => {
        this.transferFunc()
      })
    } else {
      this.delTeamLeader().then(() => {
        this.transferFunc()
      })
    }
  }
  transferFunc() {
    const { usersAddRoles, teamID } = this.props;
    const { selectLeader } = this.state;
    let notify = new NotificationHandler()
    usersAddRoles({
      roleID:'RID-i5rFhJowkzjo',
      scope: 'team',
      scopeID: teamID,
      body: {
        userIDs:selectLeader
      }
    },{
      success: {
        func: () => {
          notify.success('移交团队成功')
          this.loadTeamDetail()
          this.setState({
            transferStatus: false,
            originalLeader: selectLeader,
            currentOption: 'team'
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('移交团队失败')
          this.setState({
            transferStatus: false,
            currentOption: 'team'
          })
        }
      }
    })
  }
  delTeamLeader() {
    const { teamID, usersLoseRoles } = this.props;
    const { originalLeader } = this.state;
    let notify = new NotificationHandler()
    let opt = {
      roleID:'RID-i5rFhJowkzjo',
      scope: 'team',
      scopeID: teamID
    }
    return new Promise((resolve,reject) => {
      usersLoseRoles({
        ...opt,
        body: {
          userIDs: originalLeader
        }
      },{
        success: {
          func: res => {
            resolve(res.data.code)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.error('移交团队失败')
          },
          isAsync: true
        }
      })}
    )
  }
  cancelTransferLeader() {
    const { originalLeader } = this.state;
    this.setState({
      transferStatus: false,
      selectLeader: originalLeader,
      currentOption: 'team'
    })
  }
  leaderRowClick(record) {
    this.setState({
      selectLeader: [record.key]
    })
  }
  editTeamName() {
    this.setState({
      editTeamName: true
    })
  }
  cancelEdit() {
    const { setFieldsValue } = this.props.form;
    const { teamDetail } = this.state;
    let oldTeamName = teamDetail.teamName;
    this.setState({
      editTeamName: false
    },()=>{
      setFieldsValue({'teamName': oldTeamName})
    })
  }
  saveTeamName() {
    const { getFieldValue } = this.props.form;
    const { updateTeamDetail } = this.props;
    const { teamDetail } = this.state;
    let notify = new NotificationHandler()
    let teamName = getFieldValue('teamName');
    let oldTeamName = teamDetail.teamName;
    if (!teamName || (teamName === oldTeamName)) {return this.setState({editTeamName:false})}
    updateTeamDetail({
      teamID: teamDetail.teamID,
      body: {
        teamName: teamName
      }
    },{
      success: {
        func: () =>{
          notify.success('修改团队名称成功')
          this.loadTeamDetail()
          this.setState({
            editTeamName: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('修改团队名称失败')
          this.setState({
            editTeamName: false
          })
        },
        isAsync: true
      }
    })
  }
  filterUsers(value) {
    const { currentOption } = this.state;
    if(currentOption === 'team') {
      this.getTeamUsers(value)
    } else {
      this.getExcludeTeamUsers(value)
    }
  }
  getOption(value) {
    const { teamUserList } = this.props;
    this.setState({
      currentOption: value
    })
    if(value === 'team') {
      this.setState({
        leaderList: teamUserList.map(item => {
          return Object.assign(item,{userName:item.name})
        })
      },()=>{
        this.getTeamLeader(true)
      })
      return
    }
    this.getExcludeTeamUsers(null)
  }
  delBeforeTrans() {
    this.setState({delLeaderHint: false,addMember: false},()=>{
      this.transferTeamLeader(true)
    })
  }
  render() {
    const {
      teamUserList, teamID,
      teamUsersTotal, removeTeamusers,loadTeamClustersList,
      loadTeamUserList, form, loadTeamAllUser
    } = this.props
    const { getFieldProps } = form
    const { targetKeys, teamDetail, selectLeader, editTeamName, delLeaderName } = this.state
    const leaderRowSelction = {
      selectedRowKeys: selectLeader,
      onSelect: (record) => this.leaderRowClick(record)
    }
    const leaderColumns = [{
      title: '成员名',
      dataIndex: 'userName',
      key: 'userName',
      width: '40%'
    },{
      title: '类型',
      dataIndex: 'role',
      key: 'role',
      width: '50%',
      render: (text, record) => (
        <div>
          {record.role === ROLE_SYS_ADMIN ? '系统管理员' : (record.role === ROLE_TEAM_ADMIN ? '团队管理员' : '普通成员')}
        </div>
      )
    }]
    const selectProps = {
      selectOptions: [
        { key: 'team', value: '该团队成员' },
        { key: 'excludeTeam', value: '非该团队成员' }
      ],
      selectWidth: '110px',
      defaultValue:'team'
    }
    return (
      <QueueAnim>
        <div key="tenantTeamDetail" id='tenantTeamDetail'>
          <Row className="teamDetailHeader">
            <Link className="back" to="/tenant_manage/team">
              <span className="backjia"/>
              <span className="btn-back">返回</span>
            </Link>
            <span className="title">{teamDetail.teamName}</span>
          </Row>
          <Card
            title="团队基本信息"
            bordered={false}
            className="detailInfo"
          >
            <Row>
              <Col span={2}>
                团队名称
              </Col>
              <Col span={22} className="teamNameBox">
                <div className="teamName">
                  <Input size="large" disabled={editTeamName ? false : true} type="textarea" placeholder="团队名称" {...getFieldProps('teamName',{
                    initialValue: teamDetail.teamName
                  })}/>
                  {
                    editTeamName ?
                      [
                        <Tooltip title="取消">
                          <i className="anticon anticon-minus-circle-o pointer" onClick={()=> this.cancelEdit()}/>
                        </Tooltip>,
                        <Tooltip title="保存">
                          <i className="anticon anticon-save pointer" onClick={()=> this.saveTeamName()}/>
                        </Tooltip>
                      ] :
                        <Tooltip title="编辑">
                          <i className="anticon anticon-edit pointer" onClick={()=> this.editTeamName()}/>
                        </Tooltip>
                  }
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                创建时间
              </Col>
              <Col span={22}>
                {teamDetail && teamDetail.creationTime}
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                我是团队的
              </Col>
              <Col span={22}>
                {teamDetail && teamDetail.isCreator ? '创建者' : '参与者'}
              </Col>
            </Row>
          </Card>
          <Card
            title={
              <div>
                成员数（<span className="modalColor">{teamUsersTotal}</span>）
              </div>
            }
            bordered={false}
          >
            <Row className="content">
              <Col span={24}>
                <Row style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Button type="primary" size="large" className="addMemberBtn"
                            onClick={this.addNewMember}>
                      <i className='fa fa-plus' /> 编辑团队成员
                    </Button>
                    <Button type="ghost" size="large" className="transferTeamLeader"
                      onClick={this.transferTeamLeader.bind(this)}
                    >
                      移交团队</Button>
                    <CommonSearchInput onSearch={this.loadTeamUser.bind(this)} size="large" placeholder="按成员名搜索"/>
                    <div className="userTotalBox">共计 {teamUsersTotal} 条</div>
                    <Modal title="移除成员操作" visible={this.state.delLeaderHint} okText={'去移交团队'}
                           onOk={()=> this.delBeforeTrans()} onCancel={()=> this.setState({delLeaderHint: false})}
                    >
                      <div className="deleteMemberHint">
                        <i className="fa fa-exclamation-triangle" style={{marginRight: '8px'}}/>
                        {`该操作中成员${delLeaderName}为改团队的管理员，请先将团队移交再移除该成员`}
                      </div>
                    </Modal>
                    <Modal title="移交团队"
                      visible={this.state.transferStatus}
                      onOk={this.confirmTransferLeader.bind(this)}
                      onCancel={this.cancelTransferLeader.bind(this)}
                      width="610px"
                      wrapClassName="transferLeaderModal"
                    >
                      <div className="alertRow">移交团队后没有管理该团队的权限，可将团队管理员身份移交给以下成员中的一个</div>
                      <CommonSearchInput
                        selectProps={selectProps}
                        wrapperWidth="300px"
                        onSearch={this.filterUsers.bind(this)}
                        size="large"
                        placeholder="按成员名搜索"
                        getOption={this.getOption.bind(this)}
                        modalStatus={this.state.transferStatus}
                      />
                      <Table
                        className='leaderListTable'
                        scroll={{ y: 240 }}
                        dataSource={this.state.leaderList}
                        columns={leaderColumns}
                        pagination={false}
                        rowSelection={leaderRowSelction}
                        onRowClick={(record)=>this.leaderRowClick(record)}
                      />
                    </Modal>
                    <Modal title="编辑团队成员"
                       visible={this.state.addMember}
                       onOk={this.handleNewMemberOk}
                       onCancel={this.handleNewMemberCancel}
                       width="660px"
                       wrapClassName="newMemberModal"
                    >
                      <MemberTransfer
                        onChange={this.handleChange}
                        teamID={teamID}
                        modalStatus={this.state.addMember}
                        targetKeys={targetKeys}
                      />
                    </Modal>
                  </Col>
                </Row>
                <Row>
                  <MemberList teamUserList={teamUserList}
                              scope={this}
                              teamID={teamID}
                              removeTeamusers={removeTeamusers}
                              loadTeamUserList={loadTeamUserList}
                              loadTeamAllUser={loadTeamAllUser}
                              loadTeamClustersList={loadTeamClustersList}
                              teamUsersTotal={teamUsersTotal} />
                </Row>
              </Col>
              <Col span={3} />
            </Row>
          </Card>
      </div>
      </QueueAnim>
    )
  }
}
function mapStateToProp(state, props) {
  const { teamClusters } = state.team
  let clusterData = []
  let clusterList = []
  let teamUserList = []
  let teamSpacesList = []
  let teamAllUserIDList = []
  let teamAllUserList = []
  let teamUsersTotal = 0
  let teamSpacesTotal = 0
  let roleNum = 0
  const { team_id, team_name } = props.params
  const team = state.team
  if (team.teamusers) {
    if (team.teamusers.result) {
      const teamusers = team.teamusers.result.users
      teamUsersTotal = team.teamusers.result.total
      teamusers.map((item, index) => {
        teamUserList.push(
          {
            key: item.userID,
            name: item.userName,
            tel: item.phone,
            email: item.email,
            style: item.role === ROLE_SYS_ADMIN ? '系统管理员' : (item.role === ROLE_TEAM_ADMIN ? '团队管理员' : '普通成员'),
          }
        )
      })
    }
  }
  if (team.teamAllusers) {
    if (team.teamAllusers.result) {
      const users = team.teamAllusers.result.users
      users.map((item, index) => {
        teamAllUserIDList.push(item.userID)
        teamAllUserList.push(
          {
            key: item.userID,
            name: item.userName,
            style: item.role === ROLE_SYS_ADMIN ? '系统管理员' : (item.role === ROLE_TEAM_ADMIN ? '团队管理员' : '普通成员'),
          }
        )
      })
    }
  }
  if (team.allClusters) {
    const cluster = team.allClusters
    if (cluster.result) {
      if (cluster.result.data) {
        clusterData = cluster.result.data
        if (clusterData.length !== 0) {
          clusterData.map((item, index) => {
            clusterList.push(
              {
                key: index,
                apiHost: item.apiHost,
                clusterID: item.clusterID,
                clusterName: item.clusterName,
                clusterStatus: item.status,
              }
            )
          })
        }
      }
    }
  }
  if (team.teamspaces) {
    const teamSpaces = team.teamspaces
    if (teamSpaces.result) {
      teamSpacesTotal = teamSpaces.result.total
      if (teamSpaces.result) {
        teamSpacesList = teamSpaces.result.data
      }
    }
  }
  const userDetail = state.entities.loginUser.info
  const { roles } = userDetail.info || { roles: [] }
  if (roles.length) {
    for (let i = 0; i < roles.length; i++) {
      if (roles[i] === 'admin') {
        roleNum = 1;
        break
      } else if (roles[i] === 'project-creator') {
        roleNum = 2;
        break
      } else {
        roleNum = 3
      }
    }
  }
  return {
    teamID: team_id,
    teamName: team_name,
    clusterList: clusterList,
    teamUserList: teamUserList,
    teamSpacesList: teamSpacesList,
    teamUsersTotal: teamUsersTotal,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    teamSpacesTotal: teamSpacesTotal,
    userDetail,
    teamAllUserIDList,
    teamAllUserList,
    roleNum
  }
}
export default connect(mapStateToProp, {
  deleteTeam,
  createTeamspace,
  addTeamusers,
  removeTeamusers,
  loadTeamspaceList,
  loadTeamUserList,
  loadAllClustersList,
  deleteTeamspace,
  requestTeamCluster,
  checkTeamSpaceName,
  loadTeamClustersList,
  setCurrent,
  getTeamDetail,
  usersExcludeOneTeam,
  usersAddRoles,
  updateTeamDetail,
  roleWithMembers,
  usersLoseRoles,
  loadTeamAllUser
})(Form.create()(TeamDetail))