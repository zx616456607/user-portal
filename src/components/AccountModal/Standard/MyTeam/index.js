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
import { Row, Col, Alert, Button, Icon, Card, Table, Modal, Input, Tooltip, message, notification, Dropdown, Menu } from 'antd'
import './style/MyTeam.less'
import { Link } from 'react-router'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList } from '../../../../actions/user'
import {
  createTeam, deleteTeam, createTeamspace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName,
} from '../../../../actions/team'
import MemberTransfer from '../../MemberTransfer'
import CreateTeamModal from '../../CreateTeamModal'

const confirm = Modal.confirm;


let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,//筛选信息
      sortedInfo: null,//排序信息
      sortMember: true,//成员数排序
      sortBalance: true,//余额排序
      sortTeamName: true,//团队名排序
      addMember: false,//邀请新成员
      targetKeys: [],
      sort: "a,teamName",//默认排序规则
      filter: '',
      nowTeamID: ''
    }
  },
  //Table变化回调
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
  //删除团队
  delTeam(teamID) {
    const {deleteTeam, loadUserTeamList} = this.props.scope.props
    const {page, pageSize, sort, filter} = this.props.scope.state
    confirm({
      title: '您是否确认要删除这项内容',
      onOk() {
        deleteTeam(teamID)
        loadUserTeamList('default', {
          page: page,
          size: pageSize,
          sort,
          filter,
        })
      },
      onCancel() { },
    });
  },
  //排序规则
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  //团队成员数排序
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
  //团队余额排序
  handleSortBalance() {
    const { loadUserTeamList } = this.props.scope.props
    const { sortBalance } = this.state
    let sort = this.getSort(!sortBalance, 'spaceCount')
    loadUserTeamList('default', {
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortSpace: !sortBalance,
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
    console.log('click!!')
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
  handleDropMenuClick:function(e) {
    switch (e.key) {
      case 'deleteTeam':
        //this is delete the container
        //this.delTeam(teamID);
        console.log('delTeam !')
        break;
    }
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys } = this.state
    const { searchResult, notFound, sort, filter } = this.props.scope.state
    const { scope, teamUserIDList } = this.props
    let data = [
      {team:'test1',member:10,createTime:'20天前',balance:10,role:1,},
      {team:'test2',member:10,createTime:'20天前',balance:10,role:0,},
      {team:'test3',member:10,createTime:'20天前',balance:10,role:0,},
      {team:'test4',member:10,createTime:'20天前',balance:10,role:0,},
    ]
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    //分页器配置
    const pagination = {
      simple:{true},
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
    let dropdown = (
      <Menu style={{ width: '100px' }} onClick={this.handleDropMenuClick}>
        <Menu.Item key='deleteTeam'>
          <span>解散团队</span>
        </Menu.Item>
      </Menu>
    )
    //Table 行配置
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
            创建时间
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
        dataIndex: 'createTime',
        key: 'createTime',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            团队余额
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
        dataIndex: 'balance',
        key: 'balance',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            我的角色
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
        dataIndex: 'role',
        key: 'role',
        width: '10%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '20%',
        render: (text, record, index) => (
              record.role === 1 ?
                <Dropdown.Button
                  overlay={dropdown} type='ghost'
                  onClick={() => this.addNewMember(record.key)}
                  >
                  <Icon type="plus" />
                  <span style={{ marginLeft: '20px' }}>邀请新成员</span>
                  <Modal title='邀请新成员'
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
                </Dropdown.Button>
                :
            <Button icon="delete" className="delBtn" onClick={() => this.delTeam(record.key)}>删除</Button>
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

class MyTeam extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.teamOnSubmit = this.teamOnSubmit.bind(this)
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
  //创建团队
  teamOnSubmit(team) {
    const { createTeam, loadUserTeamList } = this.props
    const { pageSize, sort, filter } = this.state
    const hide = message.loading('正在执行中...', 0)
    createTeam(team, {
      success: {
        func: () => {
          hide()
          notification.success({
            message: `创建团队 ${team.teamName} 成功`,
          })
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
          hide()
          notification.error({
            message: `创建团队 ${team.teamName} 失败`,
            description: err.message.message,
            duration: 0
          })
        }
      }
    })
  }
  
  componentWillMount() {
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
    //搜索组件配置
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
      setStyle: {
        float: 'left',
        marginLeft: '10px',
        width: 200
      }
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
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams}/>
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
              createTime: 1,
              balance: 100,
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
})(MyTeam)