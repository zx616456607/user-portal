/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/4
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, } from 'antd'
import './style/TeamDetail.less'
import { Link } from 'react-router'
import {
  deleteTeam, createTeamspace, addTeamusers, removeTeamusers,
  loadTeamspaceList, loadTeamUserList, loadAllClustersList,
  deleteTeamspace, requestTeamCluster, checkTeamSpaceName,
} from '../../../../actions/team'
import { connect } from 'react-redux'
import MemberTransfer from '../../MemberTransfer'
import CreateSpaceModal from '../../CreateSpaceModal'
import NotificationHandler from '../../../../common/notification_handler'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import { parseAmount } from '../../../../common/tools'
import SpaceRecharge  from '../Recharge/SpaceRecharge'

let MemberList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      sortUserOrder: true,
      sortUser: "a,userName",
      current: 1,
      userPageSize: 5,
      userPage: 1,
      filter: ''
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
  render: function () {
    let { filteredInfo, current} = this.state
    const { teamUserList, teamUsersTotal } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      total: teamUsersTotal,
      showSizeChanger: true,
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
            <Button icon="delete" className="delBtn" onClick={()=> this.setState({userId: record.key, UserModal: true, userName: record.name}) }>
              移除
            </Button>
          </div>
        )
      },
    ]
    return (
      <div id='MemberList'>
        <Table columns={columns}
          dataSource={teamUserList}
          pagination={pagination}
          loading={this.state.loading}
          rowKey={record => record.key}
          onChange={this.onTableChange}
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
let TeamList = React.createClass({
  getInitialState() {
    return {
      sortSpaceOrder: true,
    }
  },
  getSpaceSort(order, column) {
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  sortSpaceName() {
    const { loadTeamspaceList, teamID, onChange, spacePageSize, spacePage} = this.props
    const {sortSpaceOrder} = this.state
    let sort = this.getSpaceSort(!sortSpaceOrder, 'spaceName')
    loadTeamspaceList(teamID, {
      sort,
      size: spacePageSize,
      page: spacePage,
    })
    onChange({
      sortSpace: sort,
    })
    this.setState({
      sortSpaceOrder: !sortSpaceOrder,
    })
  },
  sortSpaceApp() {
    const { sortSpaceOrder, onChange } = this.props
    this.setState({
      sortSpaceOrder: !sortSpaceOrder,
    })
  },
  onShowSizeChange(current, pageSize) {
    const { loadTeamspaceList, teamID, sortSpace, onChange } = this.props
    loadTeamspaceList(teamID, {
      page: 1,
      size: pageSize,
      sort: sortSpace,
    })
    onChange({
      spacePageSize: pageSize,
      spacePage: 1,
      spaceCurrent: 1,
    })
  },
  onChange(current) {
    const { loadTeamspaceList, teamID, sortSpace, spacePageSize, onChange } = this.props
    loadTeamspaceList(teamID, {
      page: current,
      size: spacePageSize,
      sort: sortSpace,
    })
    onChange({
      spacePageSize: spacePageSize,
      spacePage: current,
      spaceCurrent: current,
    })
  },
  delTeamSpace() {
    const { deleteTeamspace, teamID, loadTeamspaceList, sortSpace, spacePage, spacePageSize, onChange } = this.props
    this.setState({TeamModal: false})
    deleteTeamspace(teamID, this.state.spaceID, {
      success: {
        func: () => {
          loadTeamspaceList(teamID, {
            sort: sortSpace,
            page: 1,
            size: spacePageSize,
          })
          onChange({
            spaceCurrent: 1
          })
        },
        isAsync: true
      }
    })

  },
  render: function () {
    const { teamSpacesList, teamSpacesTotal, current, scope } = this.props
    const {sortSpaceOrder} = this.state
    const pagination = {
      total: teamSpacesTotal,
      showSizeChanger: true,
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
          <div onClick={this.sortSpaceName}>
            空间名
            <div className="ant-table-column-sorter">
              <span className={sortSpaceOrder ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!sortSpaceOrder ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'spaceName',
        key: 'spaceName',
        className: 'tablePadding',
      },
      {
        title: '应用',
        /*(
          <div onClick={this.sortSpaceApp}>
            应用
            <div className="ant-table-column-sorter">
              <span className={this.state.sortOrder ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortOrder ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),*/
        dataIndex: 'appCount',
        key: 'appCount',
      },
      {
        title: '余额',
        dataIndex: 'balance',
        key: 'balance',
        render: (text) => parseAmount(text, 4).fullAmount
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        render: (text, record, index) => (
          <div><Button icon="delete" className="delBtn" onClick={()=> this.setState({TeamModal: true, spaceID: record.spaceID, teamName: record.spaceName})}>
            删除
          </Button>
          {(this.props.scope.props.userDetail.role == ROLE_SYS_ADMIN) ?
            <Button className="addBtn" onClick={()=> scope.btnRecharge(index)}>充值
            </Button>
          :null
          }
          </div>
        )
      },
    ]
    return (
      <div id='TeamList'>
        <Table columns={columns} dataSource={teamSpacesList} pagination={pagination} />
         <Modal title="删除团队操作" visible={this.state.TeamModal}
          onOk={()=> this.delTeamSpace()} onCancel={()=> this.setState({TeamModal: false})}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除该团队空间 {this.state.teamName ? this.state.teamName : ''} ?</div>
        </Modal>
      </div>
    )
  }
})
let ClusterState = React.createClass({
  getInitialState() {
    return {

    }
  },
  applyClusterState() {
    const {requestTeamCluster, clusterID, teamID, loadAllClustersList} = this.props
    requestTeamCluster(teamID, clusterID, {
      success: {
        func: () => {
          loadAllClustersList(teamID)
        },
        isAsync: true
      }
    })
  },
  // componentWillMount() {
  //   const {requestTeamCluster, clusterID, teamID, loadAllClustersList} = this.props
  //   loadAllClustersList(teamID)
  // },
  render: function () {
    const {state} = this.props
    if (state === 'authorized') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#5fb55e' }}>已授权</span>
        </div>
      )
    } else if (state === 'notAuthorized') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#f85050' }}>未授权</span>
          <Button type="primary" onClick={this.applyClusterState} style={{ backgroundColor: '#00a1e9' }} className="applyBtn">立即申请</Button>
        </div>
      )
    } else if (state === 'pending') {
      return (
        <div id='ClusterState'>
          <span style={{ color: '#82c4f4' }}>授权中...</span>
          {/*<Button type="primary" onClick={this.applyClusterState} style={{backgroundColor:'#5db75d',borderColor:'#5db75d'}} className="applyBtn">重复申请</Button>*/}
        </div>
      )
    }
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
    }
  }
  addNewMember() {
    this.setState({
      addMember: true,
    })
  }
  handleNewMemberOk() {
    const { addTeamusers, teamID, loadTeamUserList } = this.props
    let nofity = new NotificationHandler()
    const { targetKeys, sortUser } = this.state
    if (targetKeys.length !== 0) {
      addTeamusers(teamID,
        targetKeys
        , {
          success: {
            func: () => {
              loadTeamUserList(teamID, {
                sort: sortUser,
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
    const { loadAllClustersList, loadTeamUserList, loadTeamspaceList, teamID, } = this.props
    loadAllClustersList(teamID)
    loadTeamUserList(teamID, { sort: 'a,userName', size: 5, page: 1 })
    loadTeamspaceList(teamID, { sort: 'a,spaceName', size: 5, page: 1 })
  }
  btnRecharge(index) {
    // button rechange
    this.setState({spaceVisible: true,selected: [index] })
  }
  render() {
    const scope = this
    const {
      clusterList, teamUserList, teamUserIDList,
      teamSpacesList, teamName, teamID,
      teamUsersTotal, teamSpacesTotal, removeTeamusers,
      loadTeamUserList, loadTeamspaceList, deleteTeamspace,
      requestTeamCluster, loadAllClustersList, checkTeamSpaceName,
    } = this.props
    const { targetKeys, sortSpace, spaceCurrent, spacePageSize, spacePage, sortSpaceOrder } = this.state
    const funcs = {
      checkTeamSpaceName
    }
    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20,height:50,paddingTop:'20px' }}>
          <Link className="back" to="/account/team">
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </Link>
          <span className="title">{teamName}</span>
        </Row>

        <Row className="content">
          <Alert message="这里展示了该团队在用的集群列表，集群包含了平台管理员分配到该团队所用的节点计算资源，且对该团队的所有团队空间有效。" />
          <Row className="clusterList" gutter={30}>
            {clusterList.map((item, index) => {
              return (
                <Col span="8" className="clusterItem">
                  <Card title={(
                    <Row>
                      <Col span={8}>集群名</Col>
                      <Col span={16}>{item.clusterName}</Col>
                    </Row>
                  )}>
                    <Row className="cardItem" style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>
                      <Col span={8}>集群ID:</Col>
                      <Col span={16} className='clusterIDCol' title={item.clusterID}>{item.clusterID}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>访问地址</Col>
                      <Col span={16}>{item.apiHost}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>授权状态</Col>
                      <Col span={16}>
                        <ClusterState state={item.clusterStatus} requestTeamCluster={requestTeamCluster} loadAllClustersList={loadAllClustersList} clusterID={item.clusterID} teamID={teamID} />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Row>
        <Row className="content">
          <Col span={11}>
            <Row style={{ marginBottom: 20 }}>
              <Col span={6} style={{ height: 36, lineHeight: '36px' }}>
                <Icon type="user" />
                成员数({teamUsersTotal})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus"
                  onClick={this.addNewMember}>
                  添加新成员
                </Button>
                <Modal title="添加新成员"
                  visible={this.state.addMember}
                  onOk={this.handleNewMemberOk}
                  onCancel={this.handleNewMemberCancel}
                  width="660px"
                  wrapClassName="newMemberModal"
                  >
                  <MemberTransfer onChange={this.handleChange}
                    targetKeys={targetKeys}
                    teamUserIDList={teamUserIDList} />
                </Modal>
              </Col>
            </Row>
            <Row>
              <MemberList teamUserList={teamUserList}
                teamID={teamID}
                removeTeamusers={removeTeamusers}
                loadTeamUserList={loadTeamUserList}
                teamUsersTotal={teamUsersTotal} />
            </Row>
          </Col>
          <Col span={3} />
          <Col span={10}>
            <Row style={{ marginBottom: 20 }}>
              <Col span={6} style={{ height: 36, lineHeight: '36px' }}>
                <Icon type="user" />
                团队空间 ({teamSpacesTotal})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus"
                  onClick={this.addNewSpace}>
                  创建新空间
                </Button>
                <CreateSpaceModal
                  scope={scope}
                  visible={this.state.createSpaceModalVisible}
                  onSubmit={this.spaceOnSubmit}
                  teamID={teamID}
                  funcs={funcs} />
              </Col>
            </Row>
            <Row>
              <TeamList teamSpacesList={teamSpacesList}
                loadTeamspaceList={loadTeamspaceList}
                teamID={teamID}
                sortSpace={sortSpace}
                current={spaceCurrent}
                spacePageSize={spacePageSize}
                spacePage={spacePage}
                teamSpacesTotal={teamSpacesTotal}
                deleteTeamspace={deleteTeamspace}
                scope = {this}
                onChange={this.handleSpaceChange} />
            </Row>
          </Col>
        </Row>
        {/* 团队空间充值  */}
        <Modal title="团队空间充值" visible={this.state.spaceVisible}
          onCancel={()=> this.setState({spaceVisible: false})}
          width={600}
          footer={null}
        >
          <SpaceRecharge parentScope={this} selected={this.state.selected} teamID={teamID} teamSpacesList={teamSpacesList}/>
        </Modal>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
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
})(TeamDetail)