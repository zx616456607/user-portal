/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Button, Icon, Card, Table, Modal, Input, Tooltip, } from 'antd'
import './style/TeamManage.less'
import { Link } from 'react-router'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList } from '../../../actions/user'
import {
  createTeam, deleteTeam, createTeamspace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName,
} from '../../../actions/team'
import MemberTransfer from '../MemberTransfer'
import CreateTeamModal from '../CreateTeamModal'
import NotificationHandler from '../../../common/notification_handler'

const confirm = Modal.confirm;

let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
      sortMember: true,
      sortSpace: true,
      sortCluster: true,
      sortTeamName: true,
      addMember: false,
      targetKeys: [],
      sort: "a,teamName",
      filter: "",
      nowTeamID: ''
    }
  },
  handleChange(pagination, filters, sorter) {
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
  delTeam(teamID, teamName) {
    const {deleteTeam, loadUserTeamList} = this.props.scope.props
    const {page, pageSize, sort, filter} = this.props.scope.state
    confirm({
      title: '确认要删除团队 ' + teamName + ' ?',
      onOk() {
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
              notification.error(`删除 ${teamName} 失败`)
            }
          }
        })
      },
      onCancel() { }
    });
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
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'userCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortMember: !sortMember,
      sort,
    })
  },
  handleSortSpace() {
    const { loadUserTeamList } = this.props.scope.props
    const { sortSpace } = this.state
    let sort = this.getSort(!sortSpace, 'spaceCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortSpace: !sortSpace,
      sort,
    })
  },
  handleSortCluster() {
    const { loadUserTeamList } = this.props.scope.props
    const { sortCluster } = this.state
    let sort = this.getSort(!sortCluster, 'clusterCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortCluster: !sortCluster,
      sort,
    })
  },
  handleSortTeamName() {
    const { loadUserTeamList } = this.props.scope.props
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'teamName')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortTeamName: !sortTeamName,
      sort,
    })
  },
  addNewMember(teamID) {
    this.props.loadTeamUserList(teamID, ({ size: -1 }))
    this.setState({
      addMember: true,
      nowTeamID: teamID
    })
  },
  handleNewMemberOk() {
    const { addTeamusers, loadUserTeamList, rowKey } = this.props
    const { targetKeys, nowTeamID } = this.state
    const { page, size, sort, filter} = this.props.scope.state
    if (targetKeys.length !== 0) {
      addTeamusers(nowTeamID,
        targetKeys
        , {
          success: {
            func: () => {
              loadUserTeamList('default', {
                page: page,
                size: size,
                sort: sort,
                filter: filter,
              })
              this.setState({
                addMember: false,
              })

            },
            isAsync: true
          }
        })
    }
  },
  handleNewMemberCancel(e) {
    this.setState({
      addMember: false,
    })
  },
  handleChange(targetKeys) {
    this.setState({ targetKeys })
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys } = this.state
    const { searchResult, notFound, sort, filter } = this.props.scope.state
    const { data, scope, teamUserIDList } = this.props
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const pagination = {
      simple: {true},
      total: this.props.scope.props.total,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserTeamList('default', {
          page: current,
          size: pageSize,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: pageSize,
          current: 1,
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        scope.props.loadUserTeamList('default', {
          page: current,
          size: pageSize,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: pageSize,
          current: current,
        })
      },
    }
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
        width: '10%',
        className: 'teamName',
        render: (text, record, index) => (
          <Link to={`/account/team/${record.team}/${record.key}`}>{text}</Link>
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
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortCluster}>
            在用集群
            <div className="ant-table-column-sorter">
              <span className={this.state.sortCluster ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortCluster ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'cluster',
        key: 'cluster',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortSpace}>
            团队空间
            <div className="ant-table-column-sorter">
              <span className={this.state.sortSpace ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortSpace ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'space',
        key: 'space',
        width: '10%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '20%',
        render: (text, record, index) => (
          <div>
            <Button icon="plus" className="addBtn" onClick={() => this.addNewMember(record.key)}>添加成员</Button>
            <Modal title='添加成员'
              visible={this.state.nowTeamID === record.key && this.state.addMember}
              onOk={this.handleNewMemberOk}
              onCancel={this.handleNewMemberCancel}
              width="660px"
              wrapClassName="newMemberModal"
              >
              <MemberTransfer onChange={this.handleChange}
                targetKeys={targetKeys}
                teamID={record.key}
                teamUserIDList={teamUserIDList} />
            </Modal>
            <Button icon="delete" className="delBtn" onClick={() => this.delTeam(record.key, record.team)}>删除</Button>
          </div>
        )
      },
    ]
    return (
      <Table columns={columns}
        dataSource={searchResult.length === 0 ? data : searchResult}
        pagination={pagination}
        onChange={this.handleChange}
      />
    )
  },
})

class TeamManage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.teamOnSubmit = this.teamOnSubmit.bind(this)
    this.handleCreateTeamInt = this.handleCreateTeamInt.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      teamName: '',
      pageSize: 5,
      page: 1,
      current: 1,
      sort: 'a,teamName'
    }
  }
  showModal() {
    this.setState({
      visible: true,
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
  handleCreateTeamInt(e) {
    this.setState({
      teamName: e.target.value
    })
  }
  componentWillMount() {
    document.title = '团队管理 | 时速云'
    this.props.loadUserTeamList('default', {
      page: 1,
      size: 5,
      sort: "a,teamName",
      filter: "",
    })
  }
  render() {
    const scope = this
    const { visible } = this.state
    const {
      teams, addTeamusers, loadUserTeamList,
      teamUserIDList, loadTeamUserList, checkTeamName
    } = this.props
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
    }
    const funcs = {
      checkTeamName
    }
    return (
      <div id="TeamManage">
        <Alert message={`团队, 由若干个成员组成的一个集体, 可等效于公司的部门、项目组、或子公司，
          包含『团队空间』这一逻辑隔离层， 以实现对应您企业内部各个不同项目， 或者不同逻辑组在云平台上操作对象的隔离， 团队管理员可见对应团队的所有空间的应用等对象。`}
          type="info" />
        <Row className="teamOption">
          <Button type="primary" size="large" onClick={this.showModal} className="plusBtn">
            <i className='fa fa-plus' /> 创建团队
          </Button>
          <CreateTeamModal
            scope={scope}
            visible={visible}
            onSubmit={this.teamOnSubmit}
            funcs={funcs} />
          <Button className="viewBtn" style={{ display: "none" }}>
            <Icon type="picture" />
            查看成员&团队图例
          </Button>
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams} />
          <div className="total">共{this.props.total}个</div>
        </Row>
        <Row className="teamList">
          <Card>
            <TeamTable data={teams}
              scope={scope}
              addTeamusers={addTeamusers}
              loadUserTeamList={loadUserTeamList}
              loadTeamUserList={loadTeamUserList}
              teamUserIDList={teamUserIDList} />
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let teamsData = []
  let total = 0
  let data = []
  let teamUserIDList = []
  const team = state.team
  const teams = state.user.teams
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
      if (teamsData.length !== 0) {
        teamsData.map((item, index) => {
          data.push(
            {
              key: item.teamID,
              team: item.teamName,
              member: item.userCount,
              cluster: item.clusterCount,
              space: item.spaceCount,
            }
          )
        })
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
  return {
    teams: data,
    total,
    teamUserIDList: teamUserIDList,
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
})(TeamManage)