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
import { Row, Col, Card, Button, Table, Modal, Input, Form, Tooltip, Icon } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/TeamDetail.less'
import { browserHistory } from 'react-router'
import {
  deleteTeam, addTeamusers, removeTeamusers,
  loadTeamUserList, loadAllClustersList,
  getTeamDetail, updateTeamDetail, loadTeamAllUser,
  checkTeamName
} from '../../../../actions/team'
import { usersExcludeOneTeam, teamtransfer } from '../../../../actions/user'
import { roleWithMembers } from '../../../../actions/role'
import { connect } from 'react-redux'
import MemberTransfer from '../../../AccountModal/MemberTransfer'
import NotificationHandler from '../../../../components/Notification'
import CommonSearchInput from '../../../../components/CommonSearchInput'
import { TEAM_MANAGE_ROLE_ID, ROLE_SYS_ADMIN } from '../../../../../constants'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import includes from 'lodash/includes'
import { formatDate } from '../../../../common/tools'
import TenxIcon from '@tenx-ui/icon/es/_old'

let MemberList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      sortUserOrder: true,
      sortUser: "a,userName",
      userPageSize: 5,
      userPage: 1,
      filter: '',
      selectedRowKeys: []
    }
  },
  componentWillReceiveProps(newProps) {
    this.setState({
      filter: newProps.searchFilter,
    })
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
    const { sortUser, userPageSize, filter, transferHint } = this.state
    let self = this
    if (transferHint) {
      this.setState({
        UserModal: false,
        transferHint: false
      },()=>{
        scope.transferTeamLeader()
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
          loadTeamAllUser(teamID,{size: -1, sort: 'a,userName'})
          scope.setState({
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
    const { loadTeamUserList, teamID, scope } = this.props
    loadTeamUserList(teamID, {
      page: 1,
      size: pageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: pageSize,
      userPage: 1,
    })
    scope.setState({
      current: 1,
    })
  },
  onChange(current) {
    if (current === this.state.current) {
      return
    }
    let { sortUser, userPageSize, filter} = this.state
    const { loadTeamUserList, teamID, scope } = this.props

    loadTeamUserList(teamID, {
      page: current,
      size: userPageSize,
      sort: sortUser,
      filter,
    })
    this.setState({
      userPageSize: userPageSize,
      userPage: current,
    })
    scope.setState({ current })
  },
  onTableChange(pagination, filters, sorter) {
    const { loadTeamUserList, teamID, scope } = this.props
    let { sortUser, userPageSize } = this.state
    // 点击分页、筛选、排序时触发
    const query = {
      page: pagination.current,
      size: userPageSize,
      sort: sortUser,
    }
    let filter
    if (filters.globalStyle) {
      if (filters.globalStyle.length === 1) {
        filter = `${filters.globalStyle[0]}`
        query.filter = filter
      }
    }
    this.setState({
      filter,
      filteredInfo: filters,
      userPage: pagination.current
    })
    scope.setState({
      current: pagination.current
    })
    loadTeamUserList(teamID, query)
  },
  removeMember(e,record) {
    e.stopPropagation()
    if (record.partialStyle === '管理者') {
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
    let { filteredInfo, selectedRowKeys, userName, transferHint} = this.state
    const { teamUserList, teamUsersTotal, roleNum, isNotManager, scope } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      simple: true,
      total: teamUsersTotal,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
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
        width: '20%'
      },
      {
        title: '手机/邮箱',
        dataIndex: 'tel',
        key: 'tel',
        width: '20%',
        render: (text, record) => (
          <Row>
            <Col>{record.tel}</Col>
            <Col>{record.email}</Col>
          </Row>
        )
      },
      {
        title: '账号类型',
        dataIndex: 'globalStyle',
        key: 'globalStyle',
        width: '20%',
        filters: [
          { text: '普通成员', value: 'role__neq,2' },
          { text: '系统管理员', value: 'role__eq,2' },
        ]
      },
      {
        title: '我是团队的',
        dataIndex: 'partialStyle',
        width: '20%',
      },
      {
        title: '操作',
        dataIndex: 'edit',
        key: 'edit',
        width: '20%',
        render: (text, record, index) => (
          <div className="cardBtns">
            <Button disabled={roleNum !== 1 && isNotManager}
              className="delBtn" onClick={(e)=> this.removeMember(e,record) }>
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
              transferHint ? `${userName}为该团队的管理员，将团队移交给其他成员后方可移除该成员` :
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
      editTeamDes: false,
      originalLeader: [],
      delLeaderHint: false,
      delLeaderName: '',
      value: '',
      current: 1,
      searchFilter: '',
    }
  }
  componentWillMount() {
    const { loadAllClustersList, loadTeamUserList, teamID, loadTeamAllUser, roleNum, teamPage } = this.props
    roleNum && (roleNum !== 3) && loadAllClustersList(teamID)
    loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
    loadTeamAllUser(teamID, {size: 0})
    this.loadTeamDetail()
    this.getTeamLeader(false)
    this.setState({
      teamPage
    }, () => {
      browserHistory.replace(`/tenant_manage/team/${teamID}`)
    })
  }
  addNewMember() {
    const { loadTeamAllUser, teamID } = this.props;
    loadTeamAllUser(teamID,{size: -1},{
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
          loadTeamAllUser(teamID,{size: -1, sort: 'a,userName'})
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
            loadTeamAllUser(teamID,{size: -1, sort: 'a,userName'})
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
    const { originalLeader } = this.state
    let notify = new NotificationHandler()
    if (originalLeader[0] && !targetKeys.includes(originalLeader[0])) {
      notify.info('移除团队管理者前请先移交团队')
      return
    }
    this.setState({ targetKeys })
  }
  loadTeamDetail() {
    const { getTeamDetail, teamID } = this.props
    getTeamDetail(teamID,{
      success: {
        func: (res) => {
          const teamDetail = res.result.teams[0]
          this.setState({
            teamDetail,
            isNotManager: !teamDetail.outlineRoles.includes('manager') && !teamDetail.outlineRoles.includes('no-participator')
          })
        },
        isAsync: true
      }
    })
  }
  loadTeamUser(value) {
    const { loadTeamUserList, teamID } = this.props;
    const filter = `userName,${value}`
    loadTeamUserList(teamID,{
      sort: 'a,userName',
      page: 1,
      size: 5,
      filter: `userName,${value}`
    })
    this.setState({
      current: 1,
      filter,
    })
  }
  transferTeamLeader() {
    const { loadTeamAllUser, teamID } = this.props;
    loadTeamAllUser(teamID, {size: -1, sort: 'a,userName'}, {
      success: {
        func: () => {
          const { teamAllUserList } = this.props
          this.setState({
            leaderList: teamAllUserList.map(item => {
              return Object.assign(item,{userName:item.name})
            })
          },()=>{
            this.getTeamLeader(true)
          })
        },
        isAsync: true
      }
    })
  }
  getTeamLeader(flag) {
    const { roleWithMembers, teamID } = this.props;
    roleWithMembers({
      roleID:TEAM_MANAGE_ROLE_ID,
      scope: 'team',
      scopeID: teamID
    },{
      success: {
        func: res => {
          let arr = [res.data.data && res.data.data[0].userId]
          this.setState({
            selectLeader: arr,
            originalLeader: arr,
            delLeaderName: res.data.data && res.data.data[0].userName
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
    let opt = value === null ? {sort: 'a,userName', size: -1} : {sort: 'a,userName', size: -1, filter: `userName,${value}`}
    loadTeamAllUser(teamID, opt,{
      success: {
        func: res => {
          res.users.forEach((item) => {
            Object.assign(item,{
              key:item.userID,
              globalStyle: item.role === 2 ? '系统管理员' : '普通成员',
              partialStyle: includes(item.partialRoles,'manager') ? '管理者' : '参与者'
            })
          })
          this.setState({
            leaderList: res.users,
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
    this.transferFunc()
  }
  transferFunc() {
    const { teamID, teamtransfer, loadTeamUserList, loadTeamAllUser, loginUser } = this.props;
    const { selectLeader,  originalLeader } = this.state;
    let notify = new NotificationHandler()
    teamtransfer(originalLeader[0] || loginUser.userID, {
      userTeams: [{
        userID: selectLeader[0],
        teamID
      }]
    },{
      success: {
        func: () => {
          notify.success('移交团队成功')
          this.loadTeamDetail()
          this.getTeamLeader(null)
          loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
          loadTeamAllUser(teamID, {size: -1, sort: 'a,userName'})
          this.setState({
            transferStatus: false,
            value: '',
            current: 1
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          if (err.statusCode === 403) {
            notify.error('当前用户不是团队管理员，没有权限移交该团队')
          } else {
            notify.error('移交团队失败')
          }
          this.setState({
            transferStatus: false,
            value: ''
          })
        }
      }
    })
  }
  cancelTransferLeader() {
    const { originalLeader } = this.state;
    this.setState({
      transferStatus: false,
      selectLeader: originalLeader,
      value: ''
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
  editTeamDes() {
    this.setState({
      editTeamDes: true
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
  cancelDesEdit() {
    const { setFieldsValue } = this.props.form
    const { teamDetail } = this.state
    let oldDes = teamDetail.description
    this.setState({
      editTeamDes: false
    }, () => {
      setFieldsValue({'teamDes': oldDes})
    })
  }
  saveTeamDes() {
    const { form, updateTeamDetail } = this.props
    const { getFieldValue } = form;
    const { teamDetail } = this.state;
    let notify = new NotificationHandler()
    let teamDes = getFieldValue('teamDes');
    let oldTeamDes = teamDetail.description;
    if (teamDes === oldTeamDes) {return this.setState({editTeamDes:false})}
    updateTeamDetail({
      teamID: teamDetail.teamID,
      body: {
        description: teamDes
      }
    },{
      success: {
        func: () =>{
          notify.success('修改团队备注成功')
          this.loadTeamDetail()
          this.setState({
            editTeamDes: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('修改团队备注失败')
          this.setState({
            editTeamDes: false
          })
        },
        isAsync: true
      }
    })
  }
  saveTeamName() {
    const { form, updateTeamDetail } = this.props
    const { getFieldValue, validateFields } = form;
    const { teamDetail } = this.state;
    let notify = new NotificationHandler()
    let teamName = getFieldValue('teamName');
    let oldTeamName = teamDetail.teamName;
    if (teamName === oldTeamName) {return this.setState({editTeamName:false})}
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
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
    })
  }
  teamExists(rule, value, callback) {
    if (!value) {
      callback([new Error('请输入团队名')])
      return
    }
    if (value.length <5 || value.length > 40) {
      callback(new Error('请输入5~40位字符'))
      return
    }
    const { checkTeamName } = this.props
    clearTimeout(this.teamExistsTimeout)
    this.teamExistsTimeout = setTimeout(() => {
      checkTeamName(value, {
        success: {
          func: (result) => {
            if (result.data) {
              callback(new Error('团队名称已被占用，请修改后重试'))
              return
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            return callback(new Error('团队名校验失败'))
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  delBeforeTrans() {
    this.setState({delLeaderHint: false,addMember: false},()=>{
      this.transferTeamLeader(true)
    })
  }
  render() {
    const {
      teamUserList, teamID,
      teamUsersTotal, removeTeamusers,
      loadTeamUserList, form, loadTeamAllUser, roleNum
    } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const {
      targetKeys, teamDetail, selectLeader,
      editTeamName, delLeaderName, value,
      isNotManager, editTeamDes, teamPage,
      filter,
    } = this.state
    const leaderRowSelction = {
      type: 'radio',
      selectedRowKeys: selectLeader,
      onSelect: (record) => this.leaderRowClick(record)
    }
    const leaderColumns = [{
      title: '成员名',
      dataIndex: 'userName',
      key: 'userName',
      width: '40%'
    },{
      title: '团队权限',
      dataIndex: 'partialStyle',
      key: 'partialStyle',
      width: '50%',
    }]
    return (
      <QueueAnim>
        <div key="tenantTeamDetail" id='tenantTeamDetail'>
          <Row className="teamDetailHeader">
            <div className="goBackBox">
              <span className="back"
                  onClick={() => browserHistory.push(`/tenant_manage/team?teamPage=${teamPage}`)}>
                <span className="backjia"></span>
                <span className="btn-back">返回</span>
              </span>
              <i />
              团队详情
            </div>
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
                  {
                    editTeamName ?
                      <Form.Item
                        hasFeedback
                        help={isFieldValidating('teamName') ? '校验中...' : (getFieldError('teamName') || []).join(', ')}
                        key='nameInputForm'
                      >
                        <Input key='nameInput' autoComplete='off' placeholder="团队名称" className="teamInput"
                         {...getFieldProps('teamName',{
                           rules: [
                             { validator: this.teamExists.bind(this) },
                           ],
                           initialValue: teamDetail.teamName
                         })}
                        />
                      </Form.Item>
                      :
                      <span>{teamDetail.teamName}</span>
                  }

                  {
                    editTeamName ?
                      [
                        <Tooltip title="取消" key="teamNameCancel">
                          <i className="anticon anticon-minus-circle-o pointer cancel" onClick={()=> this.cancelEdit()}/>
                        </Tooltip>,
                        <Tooltip title="保存" key="teamNameSave">
                          <i className="anticon anticon-save pointer confirm" onClick={()=> this.saveTeamName()}/>
                        </Tooltip>
                      ] :
                        (roleNum === 1 || !isNotManager) &&
                        <Tooltip title="编辑">
                          <i className="anticon anticon-edit pointer edit" onClick={()=> this.editTeamName()}/>
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
                {teamDetail && teamDetail.creationTime && formatDate(teamDetail.creationTime)}
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                我是该团队的
              </Col>
              <Col span={22}>
                {teamDetail && teamDetail.outlineRoles && teamDetail.outlineRoles.length &&
                  (includes(teamDetail.outlineRoles,'manager') ? '管理者' : '') ||
                  (includes(teamDetail.outlineRoles,'no-participator') ? '非团队成员' : includes(teamDetail.outlineRoles,'participator') ? '参与者' : '')
                }
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                备注
              </Col>
              <Col span={22} className="teamNameBox">
                <div className="teamName">
                  {
                    editTeamDes ?
                      <Form.Item
                        hasFeedback
                        help={isFieldValidating('teamName') ? '校验中...' : (getFieldError('teamName') || []).join(', ')}
                        key='nameInputForm'
                      >
                        <Input key='nameInput' autoComplete='off' placeholder="备注" className="teamInput"
                               {...getFieldProps('teamDes',{
                                 initialValue: teamDetail && teamDetail.description
                               })}
                        />
                      </Form.Item>
                      :
                      <span>{teamDetail && teamDetail.description || '-'}</span>
                  }
                  {
                    editTeamDes ?
                      [
                        <Tooltip title="取消" key="desCancel">
                          <i className="anticon anticon-minus-circle-o pointer cancel" onClick={()=> this.cancelDesEdit()}/>
                        </Tooltip>,
                        <Tooltip title="保存" key="desSave">
                          <i className="anticon anticon-save pointer confirm" onClick={()=> this.saveTeamDes()}/>
                        </Tooltip>
                      ] :
                      (roleNum === 1 || !isNotManager) &&
                      <Tooltip title="编辑">
                        <i className="anticon anticon-edit pointer edit" onClick={()=> this.editTeamDes()}/>
                      </Tooltip>
                  }
                </div>
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
            className="teamUserListBox"
          >
            <Row className="content">
              <Col span={24}>
                <Row style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    {
                      (roleNum === 1 || !isNotManager) &&
                      [
                        <Button key="addMemberBtn" type="primary" size="large" className="addMemberBtn"
                              onClick={this.addNewMember}>
                          <Icon type="edit" /> 管理团队成员
                        </Button>,
                        <Button key="transferTeamLeader" type="ghost" size="large" className="transferTeamLeader"
                              onClick={this.transferTeamLeader.bind(this)}>
                          <TenxIcon type="transfer-leader"/>
                        移交团队</Button>
                      ]
                    }
                    <CommonSearchInput onSearch={this.loadTeamUser.bind(this)} size="large" placeholder="按成员名搜索"/>
                    { teamUsersTotal !== 0 && <div className="userTotalBox">共计 {teamUsersTotal} 条</div>}
                    <Modal title="移除成员操作" visible={this.state.delLeaderHint} okText={'去移交团队'}
                           onOk={()=> this.delBeforeTrans()} onCancel={()=> this.setState({delLeaderHint: false})}
                    >
                      <div className="deleteMemberHint">
                        <i className="fa fa-exclamation-triangle" style={{marginRight: '8px'}}/>
                        {`该操作中成员${delLeaderName}为该团队的管理员，请先将团队移交再移除该成员`}
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
                        style={{width: 300}}
                        onSearch={this.getTeamUsers.bind(this)}
                        size="large"
                        placeholder="按成员名搜索"
                        modalStatus={this.state.transferStatus}
                        value={value}
                        onChange={value => this.setState({value})}
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
                    <Modal title="管理团队成员"
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
                            isNotManager={isNotManager}
                            teamID={teamID}
                            roleNum={roleNum}
                            removeTeamusers={removeTeamusers}
                            loadTeamUserList={loadTeamUserList}
                            loadTeamAllUser={loadTeamAllUser}
                            teamUsersTotal={teamUsersTotal}
                            searchFilter={filter} />
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
  const { locationBeforeTransitions } = state.routing
  const { query } = locationBeforeTransitions
  const { teamPage } = query
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
            globalStyle: item.role === 2? '系统管理员' : '普通成员',
            partialStyle: includes(item.partialRoles,'manager') ? '管理者' : '参与者'
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
            role : item.role,
            globalStyle: item.role === 2 ? '系统管理员' : '普通成员',
            partialStyle: includes(item.partialRoles,'manager') ? '管理者' : '参与者'
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
  const { globalRoles, role } = userDetail || { globalRoles: [], role: 0 }
  if (role === ROLE_SYS_ADMIN) {
    roleNum = 1
  } else if (globalRoles.length) {
    for (let i = 0; i < globalRoles.length; i++) {
      if (globalRoles[i] === 'team-creator') {
        roleNum = 2;
        break
      } else {
        roleNum = 3
      }
    }
  }
  const { loginUser } = state.entities
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
    roleNum,
    teamPage,
    loginUser: loginUser.info,
  }
}
export default connect(mapStateToProp, {
  deleteTeam,
  addTeamusers,
  removeTeamusers,
  loadTeamUserList,
  loadAllClustersList,
  getTeamDetail,
  usersExcludeOneTeam,
  updateTeamDetail,
  roleWithMembers,
  loadTeamAllUser,
  checkTeamName,
  teamtransfer
})(Form.create()(TeamDetail))
