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
import { Row, Col, Alert, Menu, Dropdown, Button, Icon, Card, Table, Modal, Input, Tooltip, Transfer } from 'antd'
import './style/TeamManage.less'
import { Link } from 'react-router'
import SearchInput from '../../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList, loadUserList } from '../../../../actions/user'
import {
  createTeam, deleteTeam, createTeamspace,
  addTeamusers, removeTeamusers, loadTeamUserList,
  checkTeamName,loadTeamspaceList
} from '../../../../actions/team'
import { chargeTeamspace } from '../../../../actions/charge'
import { ROLE_SYS_ADMIN } from '../../../../../constants'

import MemberTransfer from '../../../AccountModal/MemberTransfer'
import CreateTeamModal from '../../../AccountModal/CreateTeamModal'
import NotificationHandler from '../../../../components/Notification'
import SpaceRecharge from '../Recharge/SpaceRecharge'
import Title from '../../../Title'

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
      sort: "a,teamName",
      filter: "",
      nowTeamID: '',
      tableSelected: [],
      rightModal: false,
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
    const { filter } = this.props.scope.state
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'userCount')
    loadUserTeamList('default', {
      page: this.state.page,
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
    const { filter } = this.props.scope.state
    const { creationTime } = this.state
    let sort = this.getSort(!creationTime, 'creationTime')
    loadUserTeamList('default', {
      page: this.state.page,
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
    const { filter } = this.props.scope.state
    const { sortCluster } = this.state
    let sort = this.getSort(!sortCluster, 'clusterCount')
    loadUserTeamList('default', {
      page: this.state.page,
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
    const { filter } = this.props.scope.state
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'teamName')
    loadUserTeamList('default', {
      page: this.state.page,
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
    this.props.loadTeamUserList(teamID, ({ size: 100 }),{
      success: {
        func: res => {
          let targetKeys = []
          res.users.map(item => {
            targetKeys.push(item.userID)
          })
          this.setState({
            targetKeys
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
            },
            isAsync: true
          }
        })
    }
    this.setState({
      addMember: false,
    })
    setTimeout(()=> {
      this.setState({
        targetKeys: [],
      })
    },500)
  },
  handleNewMemberCancel(e) {
    this.setState({
      addMember: false,
      targetKeys: [],
    })
  },
  handleUserChange(targetKeys) {
    this.setState({ targetKeys })
  },
  btnRecharge(teamID) {
    const parentScope = this.props.scope
    parentScope.props.loadTeamspaceList(teamID)
    parentScope.setState({spaceVisible: true})
  },
  render() {
    let { sortedInfo, filteredInfo, targetKeys, sort } = this.state
    const { searchResult, notFound, filter } = this.props.scope.state
    const { data, scope, teamUserIDList } = this.props
    filteredInfo = filteredInfo || {}
    sortedInfo = sortedInfo || {}
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: 10,
          current: 1,
        })
      },
      onChange(current) {
        const {pageSize} = scope.state
        scope.props.loadUserTeamList('default', {
          page: current,
          size: 10,
          sort,
          filter,
        })
        scope.setState({
          page: current,
          pageSize: 10,
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
        className: 'teamName',
        width:'15%',
        render: (text, record, index) => (
          <Link to={`/tenant_manage/team/${record.team}/${record.key}`}>{text}</Link>
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
          <div onClick={this.handleSortCluster}>
            参与项目
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
      },
      {
        title: '我是团队的',
        dataIndex: 'isCreator',
        key: 'isCreator',
        width:'10%',
        filters: [
          { text: '创建者', value: '创建者' },
          { text: '参与者', value: '参与者' },
        ],
        filteredValue: filteredInfo.isCreator,
        onFilter: (value, record) => record.isCreator.indexOf(value) === 0,
        render: (text, record)=>{
          return(
            <div>{record.isCreate ? <span style={{color:'#7dc57c'}}>创建者</span> :'参与者'}</div>
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        width:'15%',
        render: (text, record, index) =>{
          return (
            <div className="addusers">
              <div className="Deleterechargea">
                <Button type="primary" className="addBtn" onClick={() => this.addNewMember(record.key)}>添加团队成员</Button>
                <Button className="delBtn" onClick={() => this.setState({delTeamModal:true,teamID: record.key, teamName: record.team})}>删除</Button>
              </div>
            </div>
          )
        }
      },
    ]
    return (
      <div>
        <Modal title='添加成员'
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
        <div className="deleteTeamHint"><i className="fa fa-exclamation-triangle" aria-hidden="true" style={{marginRight:'8px'}}/>您是否确定要删除团队 {this.state.teamName} ?</div>
       </Modal>
     </div>
    )
  },
})

class DeleteTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: []
    }
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newSelected = selectedRowKeys.slice(0)
    if (newSelected.indexOf(record.key) < 0) {
      newSelected.push(record.key)
    } else {
      newSelected.splice(newSelected.indexOf(record.key),1)
    }
    this.setState({
      selectedRowKeys:newSelected
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
    const { dataSource } = this.props;
    let data = []
    const _this = this;
    dataSource.map((item,index)=>{
      data.push({
        key: item.teamID,
        teamName: item.teamName,
        userCount: item.userCount,
        spaceCount: item.spaceCount
      })
    })
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onSelect:(record)=> this.rowClick(record),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
    const columns = [
      {
        title: '团队名',
        dataIndex: 'teamName',
        key: 'teamName',
      },
      {
        title: '成员',
        dataIndex: 'userCount',
        key: 'userCount'
      },
      {
        title: '在用集群',
        dataIndex: 'clusterCount',
        key: 'clusterCount'
      },
      {
        title: '团队空间',
        dataIndex: 'spaceCount',
        key: 'spaceCount'
      }
    ]
    return (
      <div style={{height:'400px',overflow:'auto'}}>
        <Table
          dataSource={data}
          rowSelection={rowSelection}
          columns={columns}
          pagination={false}
          onRowClick={(record)=>this.rowClick(record)}
        />
      </div>
      )
  }
}
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
      spaceVisible: false, // space recharge
      teamName: '',
      pageSize: 10,
      page: 1,
      current: 1,
      sort: 'a,teamName',
      selected: [],
      deleteTeamModal: false,
      allTeamList: [],
      userList:[],
      targetKeys: [],
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
  handleCreateTeamInt(e) {
    this.setState({
      teamName: e.target.value
    })
  }
  componentWillMount() {
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
  deleteTeamModal() {
    const { loadUserTeamList, total } = this.props;
    const { sort } = this.state
    loadUserTeamList('default', {
      page: 1,
      current: 1,
      size: 0,
      sort,
      filter: '',
    },{
      success: {
        func: (res)=> {
          this.setState({
            deleteTeamModal: true,
            allTeamList:res.teams
          })
        },
        isAsync: true
      }
    })
  }
  deleteTeamConfirm() {
  
  }
  cancelRightModal() {
    this.setState({
      rightModal: false
    })
  }
  confirmRightModal() {
    this.setState({
      rightModal: false
    })
  }
  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  formatUserList(users) {
    for (let i = 0; i < users.length; i++) {
      Object.assign(users[i],{key:users[i].userID,title:users[i].namespace,chosen:false})
    }
  }
  openRightModal() {
    const { loadUserList } = this.props;
    loadUserList({
      size: 0
    },{
      success: {
        func: (res) => {
          this.formatUserList(res.users)
          this.setState({
            userList:res,
            targetKeys: [],
            rightModal: true
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
        
        },
        isAsync: true
      }
    })
  }
  render() {
    const scope = this
    const { visible, deleteTeamModal, allTeamList, userList, targetKeys } = this.state
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
      <div id="TeamsManage">
        <Title title="团队管理" />
        <Alert message={`团队，由若干个成员组成的一个集体，可等效于公司的部门、项目组、或子公司，
          包含『团队空间』这一逻辑隔离层，以实现对应您企业内部各个不同项目，或者不同逻辑组在云平台上操作对象的隔离，团队管理员可见对应团队的所有空间的应用等对象。`}
          type="info" />
        <Row className="teamOption">
          <Button type="primary" size="large" onClick={this.showModal} className="plusBtn">
            <i className='fa fa-plus' /> 创建团队
          </Button>
          <Button type="ghost" size="large" className="manageBtn" onClick={()=> this.openRightModal()}><i className="fa fa-mouse-pointer" aria-hidden="true"/> 哪些人可以创建项目</Button>
          <Button type="host" size="large" className="refreshBtn" onClick={this.refreshTeamTable.bind(this)}><i className="fa fa-refresh" aria-hidden="true" style={{marginRight:'5px'}}/>刷新</Button>
          {/*<Button type="host" size="large" className="deleteBtn" onClick={()=>this.deleteTeamModal()}><Icon type="delete" />删除</Button>*/}
          <CreateTeamModal
            scope={scope}
            visible={visible}
            onSubmit={this.teamOnSubmit}
            funcs={funcs} />
          <Modal
            title="批量删除团队"
            visible={deleteTeamModal}
            onCancel={()=>this.setState({deleteTeamModal:false})}
            onOk={()=>this.deleteTeamConfirm()}
          >
            {
              allTeamList.length > 0 &&
              <DeleteTable
                dataSource={allTeamList}
              />
            }
          </Modal>
          <Modal title="选择可以创建团队的成员" width={760} visible={this.state.rightModal}
                 onCancel = {()=> this.cancelRightModal()}
                 onOk = {()=> this.confirmRightModal()}
          >
            <div className="alertRow">可创建团队的成员能创建团队并有管理该团队的权限</div>
            <Transfer
              dataSource={userList.users}
              listStyle={{
                width: 300,
                height: 270,
              }}
              operations={['添加', '移除']}
              titles={['可选成员名','可创建项目成员']}
              searchPlaceholder="按成员名搜索"
              showSearch
              filterOption={this.filterOption.bind(this)}
              targetKeys={targetKeys}
              onChange={this.handleChange.bind(this)}
              render={item => item.title}
            />
          </Modal>
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
        {/* 团队空间充值  */}
        <Modal title="团队空间充值" visible={this.state.spaceVisible}
          onCancel={()=> this.setState({spaceVisible: false})}
          width={600}
          footer={null}
        >
          <SpaceRecharge parentScope={this} selected={this.state.selected} teamSpacesList={this.props.teamSpacesList}/>
        </Modal>
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
  const userDetail = state.entities.loginUser.info
  let teamSpacesList = []
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
              creationTime: item.creationTime,
              isCreator: item.isCreator
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
  if (team.teamspaces.result) {
    teamSpacesList = team.teamspaces.result.data
  }
  return {
    teams: data,
    total,
    teamUserIDList: teamUserIDList,
    teamSpacesList,
    userDetail
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
  loadUserList
})(TeamManage)