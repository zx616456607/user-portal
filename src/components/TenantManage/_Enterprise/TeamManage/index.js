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
import { Row, Alert, Menu, Dropdown, Button, Icon, Card, Table, Modal, Transfer } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/TeamManage.less'
import { Link, browserHistory } from 'react-router'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import { loadUserTeamList, loadUserList } from '../../../../actions/user'
import {
  createTeam, deleteTeam, createTeamspace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName,loadTeamspaceList
} from '../../../../actions/team'
import { usersAddRoles, roleWithMembers, usersLoseRoles } from '../../../../actions/role'
import { chargeTeamspace } from '../../../../actions/charge'
import { CREATE_TEAMS_ROLE_ID, ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN, ROLE_USER } from '../../../../../constants'
import MemberTransfer from '../../../AccountModal/MemberTransfer'
import CreateTeamModal from '../../../AccountModal/CreateTeamModal'
import NotificationHandler from '../../../../components/Notification'
import Title from '../../../Title'
import { formatDate } from '../../../../common/tools'
import TenxIcon from '@tenx-ui/icon/es/_old'
import TimeHover from '@tenx-ui/time-hover/lib'

let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
      sortMember: true,
      creationTime: true,
      sortCluster: true,
      sortTeamName: true,
      addMember: false,
      targetKeys: [],
      originalKeys: [],
      sort: "a,teamName",
      filter: "",
      nowTeamID: '',
      tableSelected: [],
      rightModal: false,
    }
  },
  handleChange(pagination, filters, sorter) {
    const { scope, roleNum } = this.props
    const { loadUserTeamList } = scope.props
    const { sort } = this.state
    let newFilter = ''
    if (filters.role && filters.role.length) {
      if (roleNum === 1) {
        if (filters.role.length === 1) {
          newFilter = `role,${filters.role[0]}`
        } else if (filters.role.length === 2) {
          newFilter = `role,${filters.role[0]}|${filters.role[1]}`
        } else {
          newFilter = ''
        }
      } else {
        if (filters.role.length === 1) {
          newFilter = `role,${filters.role[0]}`
        } else if (filters.role.length === 2) {
          newFilter = ''
        }
      }
    }
    scope.setState({
      filter: newFilter,
      page: pagination.current
    }, () => {
      const { filter } = scope.state
      loadUserTeamList('default', {
        page: pagination.current,
        size: 10,
        sort,
        filter,
      })
    })
    this.setState({
      filteredInfo: filters,
    })
  },
  handleBack() {
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delTeam() {
    const {deleteTeam, loadUserTeamList} = this.props.scope.props
    const {page, pageSize, sort, filter} = this.props.scope.state
    const { teamName, teamID } = this.state
    this.setState({delTeamModal: false})
    let notification = new NotificationHandler()
    notification.spin(`删除 ${teamName} 中...`)
    deleteTeam(teamID, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除 ${teamName} 成功`)
          loadUserTeamList('default', {
            page: page,
            size: pageSize,
            sort,
            filter,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          if (err.message.code == 403) {
            notification.error(`删除${teamName}失败：请先删除该团队下的团队空间后, 再删除团队`)
            return
          }
          notification.error(`删除 ${teamName} 失败: ` + err.message.message)
        }
      }
    })

  },
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleSortMember() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page } = this.props.scope.state
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'userCount')
    loadUserTeamList('default', {
      page: page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortMember: !sortMember,
      sort,
    })
  },
  handleSortCreateTime() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page } = this.props.scope.state
    const { creationTime } = this.state
    let sort = this.getSort(!creationTime, 'creationTime')
    loadUserTeamList('default', {
      page: page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      creationTime: !creationTime,
      sort,
    })
  },
  handleSortCluster() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page } = this.props.scope.state
    const { sortCluster } = this.state
    let sort = this.getSort(!sortCluster, 'clusterCount')
    loadUserTeamList('default', {
      page: page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortCluster: !sortCluster,
      sort,
    })
  },
  handleSortTeamName() {
    const { loadUserTeamList } = this.props.scope.props
    const { filter, page } = this.props.scope.state
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'teamName')
    loadUserTeamList('default', {
      page: page,
      size: this.state.pageSize,
      sort,
      filter,
    })
    this.setState({
      sortTeamName: !sortTeamName,
      sort,
    })
  },
  addNewMember(teamID) {
    this.props.loadTeamUserList(teamID, ({ size: 0 }),{
      success: {
        func: res => {
          let targetKeys = []
          res.users.map(item => {
            targetKeys.push(item.userID)
          })
          this.setState({
            targetKeys,
            originalKeys: targetKeys,
            addMember: true,
            nowTeamID: teamID
          })
        },
        isAsync: true
      }
    })
  },
  handleNewMemberOk() {
    const { loadUserTeamList } = this.props
    const { targetKeys, originalKeys } = this.state
    const { page, size, sort, filter} = this.props.scope.state
    let notify = new NotificationHandler()
    let diff = xor(targetKeys, originalKeys)
    let add = intersection(targetKeys, diff)
    let del = intersection(originalKeys, diff)
    if (add.length && del.length) {
      Promise.all([this.addTeamUsers(add), this.delTeamUsers(del)]).then(() => {
        loadUserTeamList('default', {page, size, sort, filter})
        notify.success('操作成功')
      }).catch((res) => {
        if (res.statusCode === 401) {
          notify.error('移除团队管理者前请先移交团队')
        } else {
          notify.error('操作失败')
        }
      })
    } else if (add.length && !del.length) {
      this.addTeamUsers(add).then(() => {
        loadUserTeamList('default', {page, size, sort, filter})
        notify.success('操作成功')
      }).catch(() => {
        notify.error('操作失败')
      })
    } else if (!add.length && del.length) {
      this.delTeamUsers(del).then(() => {
        loadUserTeamList('default', {page, size, sort, filter})
        notify.success('操作成功')
      }).catch((res) => {
        if (res.statusCode === 401) {
          notify.error('移除团队管理者前请先移交团队')
        } else {
          notify.error('操作失败')
        }
      })
    }
    this.setState({
      addMember: false,
      targetKeys: [],
      originalKeys: []
    })
  },
  addTeamUsers(add) {
    const { nowTeamID } = this.state
    const { addTeamusers } = this.props
    const newtargetKeys = add.map(item=> {
      return {
        userID: item
      }
    })
    const targetKeysMap = {"users":newtargetKeys}
    return new Promise((resolve, reject) => {
      addTeamusers(nowTeamID,targetKeysMap,{
        success: {
          func: () => {
            resolve()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            reject()
          }
        }
      })
    })
  },
  delTeamUsers(del) {
    const { nowTeamID } = this.state
    const { removeTeamusers } = this.props
    return new Promise((resolve, reject) => {
      removeTeamusers(nowTeamID, del.toString(), {
        success: {
          func: () => {
            resolve()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            reject(err)
          }
        }
      })
    })
  },
  handleNewMemberCancel(e) {
    this.setState({
      addMember: false,
      targetKeys: [],
      originalKeys: []
    })
  },
  handleUserChange(targetKeys) {
    this.setState({ targetKeys })
  },
  handleMenuClick(e, record) {
    switch(e.key) {
      case 'delete':
        this.setState({delTeamModal:true,teamID: record.key, teamName: record.team})
        break
      case 'manage':
        this.addNewMember(record.key)
        break
      default:
        return
    }
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys, sort } = this.state
    const { searchResult, filter } = this.props.scope.state
    const { data, scope, roleNum, roleCode } = this.props

    filteredInfo = filteredInfo || {}
    sortedInfo = sortedInfo || {}
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      current: scope.state.page,
      defaultPageSize: 10,
      defaultCurrent: scope.state.page,
    }
    const filterRole = roleNum === 1 ? [
      { text: '管理者', value: 'manager' },
      { text: '参与者', value: 'participator' },
      { text: '非团队成员', value: 'no-participator' }
    ] : [
      { text: '管理者', value: 'manager' },
      { text: '参与者', value: 'participator' }
    ]
    const columns = [
      {
        title: (
          <div onClick={this.handleSortTeamName}>
            团队名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortTeamName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortTeamName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        className: 'teamName',
        width:'10%',
        render: (text, record, index) => (
          <Link to={`/tenant_manage/team/${record.key}?teamPage=${scope.state.page}`}>{text}</Link>
        )
      },
      {
        title: (
          <div onClick={this.handleSortMember}>
            成员
            <div className="ant-table-column-sorter">
              <span className={this.state.sortMember ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortMember ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'member',
        key: 'member',
        width:'10%',
      },
      {
        title: (
          <div onClick={this.handleSortCreateTime}>
            创建时间
            <div className="ant-table-column-sorter">
              <span className={this.state.creationTime ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.creationTime ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'creationTime',
        key: 'creationTime',
        width:'20%',
        render: text => <TimeHover time={text} />
      },
      {
        title: '我是该团队的',
        dataIndex: 'role',
        key: 'role',
        width:'10%',
        filters: filterRole,
        render: text => <div>{ text === 'manager' ? '管理者' : (text === 'participator' ? '参与者' : '非团队成员')}</div>
      },
      {
        title: '操作',
        key: 'operation',
        width:'15%',
        render: (text, record) =>{
          const menu = (
            <Menu onClick={(e) => this.handleMenuClick(e, record)}>
              <Menu.Item disabled={roleNum !==1 && record.role === 'participator'} key="delete">
                删除团队
              </Menu.Item>
              <Menu.Item disabled={roleNum !==1 && record.role === 'participator'} key="manage">
                管理团队成员
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button
              disabled={roleNum !== 1 && record.role === 'participator'}
              onClick={() => {browserHistory.push(`/tenant_manage/team/${record.key}?teamPage=${scope.state.page}`)}} overlay={menu} type="ghost">
              查看详情
            </Dropdown.Button>
          )
        }
      },
    ]

    return (
      <div>
        <Modal title='管理团队成员'
               visible={this.state.addMember}
               onOk={this.handleNewMemberOk}
               onCancel={this.handleNewMemberCancel}
               width="660px"
               wrapClassName="newMemberModal"
        >
          <MemberTransfer
            onChange={this.handleUserChange}
            targetKeys={targetKeys}
          />
        </Modal>
        <Table columns={columns}
               dataSource={searchResult.length === 0 ? data : searchResult}
               pagination={pagination}
               onChange={this.handleChange}
        />
        <Modal title="删除团队操作" visible={this.state.delTeamModal} wrapClassName="deleteSingleModal"
               onOk={()=> this.delTeam()} onCancel={()=> this.setState({delTeamModal: false})}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            您是否确定要删除团队 {this.state.teamName} ?
          </div>
        </Modal>
      </div>
    )
  },
})

class TeamManage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.teamOnSubmit = this.teamOnSubmit.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      teamName: '',
      pageSize: 10,
      page: 1,
      current: 1,
      sort: 'a,teamName',
      selected: [],
      userList:[],
      targetKeys: [],
      originalKeys: []
    }
  }
  showModal() {
    this.setState({
      visible: true,
    },()=>{
      document.getElementById('teamInput').focus()
    })
  }
  teamOnSubmit(team) {
    const { createTeam, loadUserTeamList } = this.props
    const { pageSize, sort, filter } = this.state
    let notification = new NotificationHandler()
    notification.spin(`创建团队 ${team.teamName}中...`)
    createTeam(team, {
      success: {
        func: () => {
          notification.close()
          notification.success(`创建团队 ${team.teamName} 成功`)
          loadUserTeamList('default', {
            page: 1,
            current: 1,
            size: pageSize,
            sort,
            filter,
          })
          this.setState({
            visible: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建团队 ${team.teamName} 失败`, err.message.message)
        }
      }
    })
  }
  componentWillMount() {
    const { teamPage, loadUserTeamList } = this.props
    if (teamPage) {
      loadUserTeamList('default', {
        page: teamPage,
        size: 10,
        sort: "a,teamName",
        filter: "",
      })
      this.setState({
        page: Number(teamPage)
      })
      browserHistory.replace('/tenant_manage/team')
      return
    }
    this.props.loadUserTeamList('default', {
      page: 1,
      size: 10,
      sort: "a,teamName",
      filter: "",
    })
  }
  refreshTeamTable() {
    const { loadUserTeamList } = this.props;
    const { pageSize, sort } = this.state
    loadUserTeamList('default', {
      page: 1,
      current: 1,
      size: pageSize,
      sort,
      filter: '',
    },{
      success: {
        func: (res)=> {

        },
        isAsync: true
      }
    })
  }
  cancelRightModal() {
    this.setState({
      rightModal: false
    })
  }
  confirmRightModal() {
    const { targetKeys, originalKeys } = this.state;
    let diff = xor(originalKeys,targetKeys)
    let add = intersection(targetKeys,diff)
    let del = intersection(originalKeys,diff)
    if (!del.length && !add.length) {
      this.setState({
        rightModal: false
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
    const { usersAddRoles } = this.props;
    let notify = new NotificationHandler()
    usersAddRoles({
      roleID:CREATE_TEAMS_ROLE_ID,
      scope: 'global',
      scopeID: 'global',
      body: {
        userIDs:add
      }
    },{
      success: {
        func: () => {
          if (flag) {
            notify.success('操作成功')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            notify.error('操作失败')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      }
    })
  }
  delMember(del,flag) {
    const { usersLoseRoles } = this.props;
    let notify = new NotificationHandler()
    usersLoseRoles({
      roleID:CREATE_TEAMS_ROLE_ID,
      scope: 'global',
      scopeID: 'global',
      body: {
        userIDs:del
      }
    },{
      success: {
        func: () => {
          if (flag) {
            notify.success('操作成功')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            notify.error('操作失败')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      }
    })
  }
  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    const { systemRoleID, originalKeys } = this.state
    let diff = xor(originalKeys,targetKeys)
    let del = intersection(originalKeys,diff)
    const result = systemRoleID.some(item => del.includes(item))
    let notify = new NotificationHandler()
    if (result) {
      return notify.info('禁止移除系统管理员')
    }
    this.setState({ targetKeys });
  }
  formatUserList(users) {
    for (let i = 0; i < users.length; i++) {
      Object.assign(users[i],{key:users[i].userID},{title:users[i].namespace,chosen:false})
    }
  }
  getSystemAdmin(users) {
    let adminIdArr = []
    users.forEach(item => {
      item.role === ROLE_SYS_ADMIN && adminIdArr.push(item.userID)
    })
    return adminIdArr
  }
  openRightModal() {
    const { loadUserList, roleWithMembers } = this.props;
    loadUserList({
      size: 0
    },{
      success: {
        func: (res) => {
          this.formatUserList(res.users)
          const systemRoleID = this.getSystemAdmin(res.users)
          this.setState({
            userList:res.users,
            systemRoleID
          })
          roleWithMembers({
            roleID:CREATE_TEAMS_ROLE_ID,
            scope:'global',
            scopeID:'global'
          },{
            success: {
              func: res => {
                this.setState({
                  targetKeys:res.data.data ? res.data.data.map(item => {
                    return item.userId
                  }) : [],
                  originalKeys: res.data.data ? res.data.data.map(item => {
                    return item.userId
                  }) : [],
                  rightModal: true
                })
                this.setState((prevState) => {
                  return {
                    targetKeys: Array.from(new Set(prevState.targetKeys.concat(systemRoleID))),
                    originalKeys: Array.from(new Set(prevState.targetKeys.concat(systemRoleID))),
                  }
                })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }
  render() {
    const scope = this
    const { visible, userList, targetKeys, filter } = this.state
    const {
      teams, addTeamusers, loadUserTeamList, roleNum, removeTeamusers,
      teamUserIDList, loadTeamUserList, checkTeamName,roleCode
    } = this.props
    const isAble = roleCode === ROLE_SYS_ADMIN || roleCode === ROLE_PLATFORM_ADMIN || roleCode === ROLE_BASE_ADMIN;
    const canCreateTeam = roleCode === ROLE_SYS_ADMIN || roleCode === ROLE_PLATFORM_ADMIN

    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
    }

    const funcs = {
      checkTeamName
    }
    return (
      <QueueAnim>
        <div key='TeamsManage' id="TeamsManage">
          <Title title="团队管理" />
          <Alert message={`团队由若干个成员组成的一个集体。系统管理员可将普通成员设置为『可以创建团队』的人，团队创建者为该团队的管理者，团队能移交给团队内成员作为新的团队管理者。`}
                 type="info" />
          <Row className="teamOption">
            {
              ( roleNum == 1 || roleNum == 2 ) &&
              <Button type="primary" size="large" onClick={this.showModal} className="plusBtn">
                <i className='fa fa-plus' /> 创建团队
              </Button>
            }
            {
              canCreateTeam ?
              <Button type="ghost" size="large" className="manageBtn" onClick={()=> this.openRightModal()}>
                <TenxIcon type="mouse-point"/>
                 哪些人可以创建团队
              </Button>
                :
                ""
            }
            <Button type="host" size="large" className="refreshBtn" onClick={this.refreshTeamTable.bind(this)}><i className="fa fa-refresh" aria-hidden="true" style={{marginRight:'5px'}}/>刷新</Button>
            <CreateTeamModal
              scope={scope}
              visible={visible}
              onSubmit={this.teamOnSubmit}
              funcs={funcs} />
            <Modal title="选择可以创建团队的成员" width={760} visible={this.state.rightModal}
                   onCancel = {()=> this.cancelRightModal()}
                   onOk = {()=> this.confirmRightModal()}
            >
              <div className="alertRow">可创建团队的成员能创建团队并有管理该团队的权限</div>
              {
                userList && userList.length > 0 &&
                <Transfer
                  dataSource={userList}
                  listStyle={{
                    width: 300,
                    height: 270,
                  }}
                  operations={['添加', '移除']}
                  titles={['可选成员名','可创建团队成员']}
                  searchPlaceholder="按成员名搜索"
                  showSearch
                  filterOption={this.filterOption.bind(this)}
                  targetKeys={targetKeys}
                  onChange={this.handleChange.bind(this)}
                  render={item => item && item.title}
                />
              }
            </Modal>
            <Button className="viewBtn" style={{ display: "none" }}>
              <Icon type="picture" />
              查看成员&团队图例
            </Button>
            <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams} />
            { this.props.total !== 0 && <div className="total">共{this.props.total}个</div>}
          </Row>
          <Row className="teamList">
            <Card>
              <TeamTable data={teams}
                         roleNum={roleNum}
                         scope={scope}
                         addTeamusers={addTeamusers}
                         removeTeamusers={removeTeamusers}
                         loadUserTeamList={loadUserTeamList}
                         loadTeamUserList={loadTeamUserList}
                         teamUserIDList={teamUserIDList} />
            </Card>
          </Row>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {
  let teamsData = []
  let total = 0
  let data = []
  let roleNum = 0
  let teamUserIDList = []
  const team = state.team
  const teams = state.user.teams
  const userDetail = state.entities.loginUser.info
  const { loginUser } = state.entities
  const { locationBeforeTransitions } = state.routing
  const { query } = locationBeforeTransitions
  const { teamPage } = query
  const { globalRoles, userID, role } = loginUser.info || { globalRoles: [], userID: '', role: 0 }
  const roleCode = userDetail.role
  let teamSpacesList = []
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
      if (teamsData.length !== 0) {
        for (let i = 0; i < teamsData.length; i++) {
          let role = ''
          let item = teamsData[i]
          if (item.outlineRoles) {
            if (role === '' && (item.outlineRoles.includes('manager'))) {
              role = 'manager'
            } else if (role === '' && item.outlineRoles.includes('participator')) {
              role = 'participator'
            } else if (role === '' && item.outlineRoles.includes('no-participator')){
              role = 'no-participator'
            }
          }
          data.push(
            {
              key: item.teamID,
              team: item.teamName,
              member: item.userCount,
              creationTime: item.creationTime,
              outlineRoles: item.outlineRoles,
              role
            }
          )
        }
      }
    }
    if (teams.result.total) {
      total = teams.result.total
    }
    if (team.teamusers) {
      if (team.teamusers.result) {
        const teamusers = team.teamusers.result.users

        teamusers.map((item, index) => {

          teamUserIDList.push(item.userID)
        })
      }
    }
  }
  if (team.teamspaces.result) {
    teamSpacesList = team.teamspaces.result.data
  }
  if (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN ) {
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
  return {
    teams: data,
    total,
    teamUserIDList: teamUserIDList,
    teamSpacesList,
    userDetail,
    roleNum,
    userID,
    teamPage,
    roleCode
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  createTeam,
  deleteTeam,
  createTeamspace,
  addTeamusers,
  removeTeamusers,
  loadTeamUserList,
  checkTeamName,
  loadTeamspaceList,
  chargeTeamspace,
  loadUserList,
  usersAddRoles,
  roleWithMembers,
  usersLoseRoles
})(TeamManage)
