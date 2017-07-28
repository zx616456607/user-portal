/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Popover, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, } from 'antd'
import './style/TeamDetail.less'
import { Link, browserHistory } from 'react-router'
import { setCurrent } from '../../../../actions/entities'
import {
  deleteTeam, createTeamspace, addTeamusers, removeTeamusers,
  loadTeamspaceList, loadTeamUserList, loadAllClustersList,
  deleteTeamspace, requestTeamCluster, checkTeamSpaceName,
  loadTeamClustersList,getTeamDetail
} from '../../../../actions/team'
import { connect } from 'react-redux'
import MemberTransfer from '../../../AccountModal/MemberTransfer'
import NotificationHandler from '../../../../components/Notification'
import CommonSearchInput from '../../../../components/CommonSearchInput'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import Root from "../../../../containers/Root";

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
    const { removeTeamusers, teamID, loadTeamUserList } = this.props
    const { sortUser, userPageSize, userPage, filter } = this.state
    let self = this
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
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
  },
  selectAll(selectedRows) {
    let arr = []
    for (let i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i].key)
    }
    this.setState({
      selectedRowKeys: arr
    })
  },
  render: function () {
    let { filteredInfo, current, selectedRowKeys} = this.state
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
    const rowSelection = {
      selectedRowKeys,
      onSelect:(record)=> this.rowClick(record),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
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
            <Button className="delBtn" onClick={()=> this.setState({userId: record.key, UserModal: true, userName: record.name}) }>
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
          rowSelection={rowSelection}
          onRowClick={(record)=>this.rowClick(record)}
          />
        <Modal title="移除成员操作" visible={this.state.UserModal}
          onOk={()=> this.delTeamMember()} onCancel={()=> this.setState({UserModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要移除成员 {this.state.userName ? this.state.userName : ''} ?</div>
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
    this.addNewSpace = this.addNewSpace.bind(this)
    this.spaceOnSubmit = this.spaceOnSubmit.bind(this)
    this.handleNewSpaceCancel = this.handleNewSpaceCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleNewSpaceName = this.handleNewSpaceName.bind(this)
    this.handleNewSpaceDes = this.handleNewSpaceDes.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.state = {
      addMember: false,
      deleteMember: false,
      createSpaceModalVisible: false,
      targetKeys: [],
      newSpaceName: '',
      newSpaceDes: '',
      sortUser: "a,userName",
      sortSpace: 'a,spaceName',
      spaceCurrent: 1,
      spacePageSize: 5,
      spacePage: 1,
      spaceVisible:false, // space Recharge modal
      teamDetail: {},
      allTeamUser: {},
      selectedRowKeys: []
    }
  }
  componentDidMount() {
  
  }
  addNewMember() {
    const { teamUserIDList } = this.props;
    this.setState({
      addMember: true,
      targetKeys: teamUserIDList
    })
  }
  removeMember() {
    const { loadTeamUserList, teamID } = this.props;
    loadTeamUserList(teamID,{
      size:0
    },{
      success: {
        func: (res) => {
          this.addKey(res.users)
          this.setState({
            allTeamUser: res,
            deleteMember: true
          })
        },
        isAsync: true
      }
    })
  }
  addKey(arr) {
    for (let i = 0; i < arr.length; i++) {
      Object.assign(arr[i],{key:arr[i].userID})
    }
  }
  handleNewMemberOk() {
    const { addTeamusers, teamID, loadTeamUserList } = this.props
    let nofity = new NotificationHandler()
    const { targetKeys, sortUser } = this.state
    if (targetKeys.length !== 0) {
      addTeamusers(teamID,{
          users:targetKeys,
        },{
          success: {
            func: () => {
              loadTeamUserList(teamID, {
                // sort: sortUser,
              })
              this.setState({
                addMember: false,
                targetKeys: [],
              })
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              if (err.statusCode === 409) {
                nofity.info('成员已添加')
              }
            }
          }
        })
    }
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
  addNewSpace() {
    setTimeout(function(){
      document.getElementById('spacename').focus()
    },500)
    this.setState({
      createSpaceModalVisible: true,
    })
  }
  spaceOnSubmit(space) {
    const { createTeamspace, teamID, loadTeamspaceList } = this.props
    const { newSpaceName, newSpaceDes, sortSpace, spacePageSize } = this.state
    let notification = new NotificationHandler()
    notification.spin("空间创建中...")
    createTeamspace(teamID, space, {
      success: {
        func: () => {
          notification.close()
          notification.success(`创建空间 ${space.spaceName} 成功`)
          loadTeamspaceList(teamID, {
            sort: sortSpace,
            size: spacePageSize,
            page: 1,
          })
          this.setState({
            createSpaceModalVisible: false,
            spaceCurrent: 1
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建空间 ${space.spaceName} 失败`, err.message.message)
        }
      }
    })
  }
  handleNewSpaceCancel(e) {
    this.setState({
      createSpaceModalVisible: false,
    })
  }
  handleNewSpaceName(e) {
    this.setState({
      newSpaceName: e.target.value
    })
  }
  handleNewSpaceDes(e) {
    this.setState({
      newSpaceDes: e.target.value
    })
  }
  handleSpaceChange(query) {
    const { sortSpace, spacePageSize, spaceCurrent, spacePage } = this.state
    this.setState({
      sortSpace: query.sortSpace ? query.sortSpace : sortSpace,
      spaceCurrent: query.spaceCurrent ? query.spaceCurrent : spaceCurrent,
      spacePageSize: query.spacePageSize ? query.spacePageSize : spacePageSize,
      spacePage: query.spacePage ? query.spacePage : spacePage,
    })
  }
  componentWillMount() {
    const { loadAllClustersList, loadTeamUserList, loadTeamspaceList, getTeamDetail, teamID } = this.props
    loadAllClustersList(teamID)
    loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
    loadTeamspaceList(teamID, { sort: 'a,spaceName', size: 5, page: 1 })
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
  btnRecharge(index) {
    // button rechange
    this.setState({spaceVisible: true,selected: [index] })
  }
  removeMemberOk() {
    const { removeTeamusers,loadTeamUserList, teamID } = this.props;
    const { selectedRowKeys } = this.state;
    let notify = new NotificationHandler()
    removeTeamusers(teamID,selectedRowKeys,{
      success: {
        func: (res) => {
          loadTeamUserList(teamID,{})
          notify.success('移除成员成功')
        },
        isAsync: true
      }
    })
    this.setState({
      deleteMember: false
    })
    
  }
  removeMemberCancel() {
    this.setState({
      deleteMember: false
    })
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
  }
  selectAll(selectedRows) {
    let arr = []
    for (let i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i].key)
    }
    this.setState({
      selectedRowKeys: arr
    })
  }
  render() {
    const scope = this
    const {
      clusterList, teamUserList, teamUserIDList,
      teamSpacesList, teamName, teamID,
      teamUsersTotal, teamSpacesTotal, removeTeamusers,loadTeamClustersList,
      loadTeamUserList, loadTeamspaceList, deleteTeamspace,
      requestTeamCluster, loadAllClustersList, checkTeamSpaceName, teamClusters,creationTime
    } = this.props
    const { targetKeys, sortSpace, spaceCurrent, spacePageSize, spacePage, sortSpaceOrder, teamDetail, allTeamUser, selectedRowKeys} = this.state
    const funcs = {
      checkTeamSpaceName
    }
    const rowSelection = {
      selectedRowKeys,
      onSelect:(record)=> this.rowClick(record),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
    const columns = [{
      title: '成员名',
      dataIndex: 'userName',
      key: 'userName',
    },{
      title: '手机/邮箱',
      dataIndex: 'phone',
      key: 'phone',
      render: (text, record) => (
        <Row>
          <Col>{record.phone}</Col>
          <Col>{record.email}</Col>
        </Row>
      )
    },{
      title: '类型',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        <div>
          {record.role === ROLE_SYS_ADMIN ? '系统管理员' : (record.role === ROLE_TEAM_ADMIN ? '团队管理员' : '普通成员')}
        </div>
      )
    }]
    return (
      <div id='tenantTeamDetail'>
        <Row className="teamDetailHeader">
          <Link className="back" to="/tenant_manage/team">
            <span className="backjia"/>
            <span className="btn-back">返回</span>
          </Link>
          <span className="title">{teamName}</span>
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
            <Col span={22}>
              {teamName}
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
                  <Button type="primary" size="large" icon="plus" className="addMemberBtn"
                          onClick={this.addNewMember}>
                    添加成员
                  </Button>
                  <Button type="ghost" size="large" icon="delete" className="deleteMemberBtn"
                          onClick={this.removeMember.bind(this)}>
                    移除成员
                  </Button>
                  <CommonSearchInput size="large" placeholder="搜索"/>
                  <div className="userTotalBox">共计 {teamUsersTotal} 条</div>
                  <Modal title="添加新成员"
                     visible={this.state.addMember}
                     onOk={this.handleNewMemberOk}
                     onCancel={this.handleNewMemberCancel}
                     width="660px"
                     wrapClassName="newMemberModal"
                  >
                    <MemberTransfer
                      onChange={this.handleChange}
                      targetKeys={targetKeys}
                    />
                  </Modal>
                  <Modal title="移除成员"
                         visible={this.state.deleteMember}
                         onOk={this.removeMemberOk.bind(this)}
                         onCancel={this.removeMemberCancel.bind(this)}
                         width="660px"
                         wrapClassName="removeMemberModal"
                  >
                    <Table
                         dataSource={allTeamUser.users}
                         columns={columns}
                         pagination={false}
                         rowSelection={rowSelection}
                         onRowClick={(record)=>this.rowClick(record)}
                    />
                  </Modal>
                </Col>
              </Row>
              <Row>
                <MemberList teamUserList={teamUserList}
                            teamID={teamID}
                            removeTeamusers={removeTeamusers}
                            loadTeamUserList={loadTeamUserList}
                            loadTeamClustersList={loadTeamClustersList}
                            teamUsersTotal={teamUsersTotal} />
              </Row>
            </Col>
            <Col span={3} />
          </Row>
        </Card>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { teamClusters } = state.team
  let clusterData = []
  let clusterList = []
  let teamUserList = []
  let teamSpacesList = []
  let teamUserIDList = []
  let teamUsersTotal = 0
  let teamSpacesTotal = 0
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
        teamUserIDList.push(item.userID)
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
  return {
    teamID: team_id,
    teamName: team_name,
    clusterList: clusterList,
    teamUserList: teamUserList,
    teamSpacesList: teamSpacesList,
    teamUserIDList: teamUserIDList,
    teamUsersTotal: teamUsersTotal,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    teamSpacesTotal: teamSpacesTotal,
    userDetail
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
  getTeamDetail
})(TeamDetail)