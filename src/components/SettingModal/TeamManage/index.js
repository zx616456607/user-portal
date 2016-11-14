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
import { Row, Col, Alert, Button, Icon, Card, Table, Modal, Input, Tooltip } from 'antd'
import './style/TeamManage.less'
import { Link } from 'react-router'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList } from '../../../actions/user'
import { createTeam, deleteTeam, createTeamspace, addTeamusers, removeTeamusers,loadTeamUserList } from '../../../actions/team'
import MemberTransfer from '../MemberTransfer'

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
      targetKeys:[],
      sort: "a,teamName",
      filter: "",
      nowTeamID:''
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
    })
  },
  handleBack(){
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delTeam(teamID){
    const {deleteTeam,loadUserTeamList} = this.props.scope.props
    const {page,pageSize,sort, filter} = this.props.scope.state
    confirm({
      title: '您是否确认要删除这项内容',
      onOk() {
        deleteTeam(teamID)
        loadUserTeamList('default',{
          page: page,
          size: pageSize,
          sort,
          filter,
        })
      },
      onCancel() {},
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
  handleSortMember(){
    const { loadUserTeamList } = this.props.scope.props
    const { sortMember } = this.state
    let sort = this.getSort(!sortMember, 'userCount')
    loadUserTeamList('default',{
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
  handleSortSpace(){
    const { loadUserTeamList } = this.props.scope.props
    const { sortSpace } = this.state
    let sort = this.getSort(!sortSpace, 'spaceCount')
    loadUserTeamList('default',{
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
  handleSortCluster(){
    const { loadUserTeamList } = this.props.scope.props
    const { sortCluster } = this.state
    let sort = this.getSort(!sortCluster, 'clusterCount')
    loadUserTeamList('default',{
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
  handleSortTeamName(){
    const { loadUserTeamList } = this.props.scope.props
    const { sortTeamName } = this.state
    let sort = this.getSort(!sortTeamName, 'teamName')
    loadUserTeamList('default',{
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
  addNewMember(teamID){
    this.props.loadTeamUserList(teamID,({size:-1}))
    this.setState({
      addMember: true,
      nowTeamID:teamID
    })
  },
  handleNewMemberOk(){
    const { addTeamusers,loadUserTeamList,rowKey } = this.props
    const { targetKeys,nowTeamID } = this.state
    const { page,size,sort ,filter} = this.props.scope.state
    if(targetKeys.length !== 0){
      addTeamusers(nowTeamID,
        targetKeys
      ,{
        success: {
          func:() => {
            console.log('done');
            loadUserTeamList('default',{
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
  handleNewMemberCancel(e){
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
      total: this.props.scope.props.total,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent:1,
      current:this.props.scope.state.current,
      pageSizeOptions: ['5','10','15','20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserTeamList('default',{
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
        console.log('Current: ', current);
        scope.props.loadUserTeamList('default',{
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
              <span className= {this.state.sortTeamName?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortTeamName?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        width: '20%',
        className: 'teamName',
        render: (text,record,index) => (
          <Link to={`/setting/team/${record.team}/${record.key}`}>{text}</Link>
        )
      },
      {
        title: (
          <div onClick={this.handleSortMember}>
            成员
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortMember?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortMember?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'member',
        key: 'member',
        width: '20%',
      },
      {
        title: (
          <div onClick={this.handleSortCluster}>
            在用集群
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortCluster?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortCluster?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'cluster',
        key: 'cluster',
        width: '20%',
      },
      {
        title: (
          <div onClick={this.handleSortSpace}>
            团队空间
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortSpace?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortSpace?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),
        dataIndex: 'space',
        key: 'space',
        width: '20%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '20%',
        render: (text,record,index) => (
          <div>
            <Button icon="plus" className="addBtn" onClick={()=>this.addNewMember(record.key)}>添加成员</Button>
            <Modal title='添加成员'
                   visible={this.state.nowTeamID===record.key && this.state.addMember}
                   onOk={this.handleNewMemberOk}
                   onCancel={this.handleNewMemberCancel}
                   width="660px"
                   wrapClassName="newMemberModal"
            >
              <MemberTransfer onChange={this.handleChange}
                              targetKeys={targetKeys}
                              teamID={record.key}
                              teamUserIDList={teamUserIDList}/>
            </Modal>
            <Button icon="delete" className="delBtn" onClick={() => this.delTeam(record.key)}>删除</Button>
          </div>
        )
      },
    ]
    return (
      <Table columns={columns}
             dataSource={searchResult.length === 0?data : searchResult}
             pagination={pagination}
             onChange={this.handleChange}
      />
    )
  },
})

class TeamManage extends Component {
  constructor(props){
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
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
  handleOk() {
    this.props.createTeam(
      {
        teamName: this.state.teamName
      },{
      success: {
        func: () => {
          console.log('create done');
          this.props.loadUserTeamList('default',{
            page: 1,
            current: 1,
            size: this.state.pageSize,
            sort: this.state.sort,
            filter: this.state.filter,
          })
          this.setState({
            visible: false,
          })
        },
        isAsync: true,
      }
    })
  }
  handleCancel(e) {
    e.preventDefault();
    this.setState({
      visible: false,
    })
  }
  handleCreateTeamInt(e){
    console.log('input value',e.target.value);
    this.setState({
      teamName: e.target.value
    })
  }
  componentWillMount(){
    this.props.loadUserTeamList('default',{
      page: 1,
      size: 5,
      sort: "a,teamName",
      filter: "",
    })
  }
  render(){
    const scope = this
    const { visible } = this.state
    const { teams,addTeamusers,loadUserTeamList, teamUserIDList,loadTeamUserList } = this.props
    
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
    }
    return (
      <div id="TeamManage">
        <Alert message="团队, 由若干个成员组成的一个集体, 可等效于公司的部门、项目组、或子公司，
        包含『团队空间』这一逻辑隔离层， 以实现对应您企业内部各个不同项目， 或者不同逻辑组在云平台上操作对象的隔离， 团队管理员可见对应团队的所有空间的应用等对象。"
               type="info"/>
        <Row className="teamOption">
          <Button icon="plus" type="primary" size="large" onClick={this.showModal} className="plusBtn">
            创建团队
          </Button>
            <Modal title="创建团队" visible={visible}
                   onOk={this.handleOk} onCancel={this.handleCancel}
                   wrapClassName="NewTeamForm"
                   width="463px">
              <Row className="NewTeamItem">
                <Col span={4}>名称</Col>
                <Col span={20}>
                  <Input placeholder="新团队名称" onChange={this.handleCreateTeamInt} defaultValue=""/>
                </Col>
              </Row>
            </Modal>
          <Button className="viewBtn">
            <Icon type="picture" />
            查看成员&团队图例
          </Button>
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={teams}/>
        </Row>
        <Row className="teamList">
          <Card>
            <TeamTable data={teams}
                       scope={scope}
                       addTeamusers={addTeamusers}
                       loadUserTeamList={loadUserTeamList}
                       loadTeamUserList={loadTeamUserList}
                       teamUserIDList={teamUserIDList}/>
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  let teamsData = []
  let total = 0
  let data = []
  let teamUserIDList = []
  const team = state.team
  const teams = state.user.teams
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
      if(teamsData.length !== 0){
        teamsData.map((item,index) => {
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
})(TeamManage)