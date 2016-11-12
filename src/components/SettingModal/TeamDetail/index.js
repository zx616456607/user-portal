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
import { deleteTeam, createTeamspace, addTeamusers, removeTeamusers, 
         loadTeamspaceList, loadTeamUserList, loadTeamClustersList } from '../../../actions/team'
import { connect } from 'react-redux'
import MemberTransfer from '../MemberTransfer'

const confirm = Modal.confirm;

let MemberList = React.createClass({
  getInitialState(){
    return {
      pagination: {},
      loading: false,
      sortUserOrder: true,
      sortUser: "a,userName",
    }
  },
  getUserSort(order, column) {
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  MemberNameSort(){
    const { sortUserOrder } = this.state
    const { loadTeamUserList, teamID} = this.props
    let sort = this.getUserSort(!sortUserOrder, 'userName')
    loadTeamUserList(teamID,{
      sort,
    })
    console.log('sortUser !');
    this.setState({
      sortUserOrder: !sortUserOrder,
      sortUser: sort,
    })
  },
  delTeamMember(userID){
    const { removeTeamusers,teamID, loadTeamUserList } = this.props
    const { sortUser } = this.state
    confirm({
      title: '您是否确认要删除这项内容',
      onOk() {
        removeTeamusers(teamID,userID,{
          success: {
            func: () => {
              console.log('delte!!');
              loadTeamUserList(teamID,{sort:sortUser})
            },
            isAsync: true
          }
        })
      },
      onCancel() {},
    });
    
  },
  render: function(){
    let { filteredInfo } = this.state
    const { teamUserList } = this.props
    filteredInfo = filteredInfo || {}
    const columns = [
      {
        title: (
          <div onClick={this.MemberNameSort}>
            成员名
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortUserOrder?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortUserOrder?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
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
          { text: '创建者', value: '创建者' },
          { text: '从属者', value: '从属者' },
        ],
        filteredValue: filteredInfo.style,
        onFilter: (value, record) => record.style.indexOf(value) === 0,
      },
      {
        title: '操作',
        dataIndex: 'edit',
        key: 'edit',
        render:(text,record,index) => (
          <div className="cardBtns">
            <Button icon="delete" className="delBtn" onClick={() => this.delTeamMember(record.key)}>
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
               onChange={this.handleTableChange}
               pagination={this.state.pagination}
               loading={this.state.loading}
               rowKey={record => record.registered}
        />
      </div>
    )
  }
})
let TeamList = React.createClass({
  getInitialState(){
    return {
      pagination: {},
      loading: false,
      sortOrder: true,
      sortSpace: true,
    }
  },
  handleAppSort(){
    const { sortOrder } = this.state
    this.setState({
      sortOrder: !sortOrder,
    })
    //req
  },
  handleSortSpace(){
    const { sortSpace } = this.state
    this.setState({
      sortSpace: !sortSpace,
    })
    //req
  },
  render: function(){
    let { filteredInfo } = this.state
    const { teamSpacesList } = this.props
    const { searchResult, notFound, sort, filter } = this.state
    filteredInfo = filteredInfo || {}
    /*const pagination = {
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
          current: current,
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
    }*/
    const columns = [
      {
        title: (
          <div onClick={this.handleSortSpace}>
            空间名
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
        dataIndex: 'spaceName',
        key: 'spaceName',
        className: 'tablePadding',
      },
      {
        title: '备注',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '应用',
          /*(
          <div onClick={this.handleAppSort}>
            应用
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortOrder?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortOrder?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down"/>
              </span>
            </div>
          </div>
        ),*/
        dataIndex: 'appCount',
        key: 'appCount',
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        render:() => (
          <Button icon="delete" className="delBtn">
            删除
          </Button>
        )
      },
    ]
    return (
      <div id='TeamList'>
        <Table columns={columns} dataSource={teamSpacesList}/>
      </div>
    )
  }
})
class TeamDetail extends Component{
  constructor(props){
    super(props)
    this.addNewMember = this.addNewMember.bind(this)
    this.handleNewMemberOk = this.handleNewMemberOk.bind(this)
    this.handleNewMemberCancel = this.handleNewMemberCancel.bind(this)
    this.addNewSpace = this.addNewSpace.bind(this)
    this.handleNewSpaceOk = this.handleNewSpaceOk.bind(this)
    this.handleNewSpaceCancel = this.handleNewSpaceCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleNewSpaceName = this.handleNewSpaceName.bind(this)
    this.handleNewSpaceDes = this.handleNewSpaceDes.bind(this)
    this.state = {
      addMember: false,
      addSpace: false,
      targetKeys:[],
      newSpaceName: '',
      newSpaceDes: '',
      sortUser: "a,userName",
    }
  }
  addNewMember(){
    this.setState({
      addMember: true,
    })
  }
  handleNewMemberOk(){
    const { addTeamusers, teamID, loadTeamUserList } = this.props
    const { targetKeys, sortUser } = this.state
    if(targetKeys.length !== 0){
      addTeamusers(teamID,
        targetKeys
      ,{
        success: {
          func:() => {
            loadTeamUserList(teamID,{sort: sortUser})
            this.setState({
              addMember: false,
              targetKeys: [],
            })
          },
          isAsync: true
        }
      })
    }
  }
  handleNewMemberCancel(e){
    this.setState({
      addMember: false,
    })
  }
  handleChange(targetKeys) {
    console.log('targetKeys',targetKeys);
    this.setState({ targetKeys })
  }
  addNewSpace(){
    this.setState({
      addSpace: true,
    })
  }
  handleNewSpaceOk(){
    const {createTeamspace, teamID, loadTeamspaceList} = this.props
    const {newSpaceName,newSpaceDes} = this.state
    createTeamspace(teamID,{
      spaceName: newSpaceName,
      description: newSpaceDes,
    },{
      success:{
        func:() => {
          loadTeamspaceList(teamID)
          this.setState({
            addSpace: false,
          })
        },
        isAsync: true
      }
    })
  }
  handleNewSpaceCancel(e){
    this.setState({
      addSpace: false,
    })
  }
  handleNewSpaceName(e){
    this.setState({
      newSpaceName: e.target.value
    })
  }
  handleNewSpaceDes(e){
    this.setState({
      newSpaceDes: e.target.value
    })
  }
  componentWillMount(){
    const { loadTeamClustersList, loadTeamUserList, loadTeamspaceList, teamID, } = this.props
    loadTeamClustersList(teamID)
    loadTeamUserList(teamID,{sort: 'a,userName'})
    loadTeamspaceList(teamID)
  }
  
  render(){
    const { clusterList, teamUserList, teamUserIDList, teamSpacesList, teamName,teamID,removeTeamusers,loadTeamUserList } = this.props
    const { targetKeys } = this.state
    return (
      <div id='TeamDetail'>
        <Row style={{marginBottom:20}}>
          <Link className="back" to="/setting/team">返回</Link>
        </Row>
        <Row className="title">
          {teamName}
        </Row>
        <Row className="content">
          <Alert message="这里展示了该团队在用的集群列表,资源配置是超级管理员在企业版后台,分配到该团队所用的计算等资源,以下集群对该团队的团队空间有效."/>
          <Row className="clusterList" gutter={30}>
            {clusterList.map((item,index) => {
              return (
                <Col span="8" className="clusterItem">
                  <Card title={(
                    <Row>
                      <Col span={8}>集群名</Col>
                      <Col span={16}>{item.clusterName}</Col>
                    </Row>
                  )}>
                    <Row className="cardItem" style={{whiteSpace:'pre-line',wordWrap:'break-word'}}>
                      <Col span={8}>集群ID:</Col>
                      <Col span={16}>{item.clusterID}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>访问地址</Col>
                      <Col span={16}>{item.apiHost}</Col>
                    </Row>
                    <Row className="cardItem">
                      <Col span={8}>授权状态</Col>
                      <Col span={16}><span>已授权</span></Col>
                    </Row>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Row>
        <Row className="content">
          <Col span={11}>
            <Row style={{marginBottom: 20}}>
              <Col span={6} style={{height: 36, lineHeight: '36px'}}>
                <Icon type="user" />
                成员数({teamUserList.length})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus" className="addBtn"
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
                                  teamUserIDList={teamUserIDList}/>
                </Modal>
              </Col>
            </Row>
            <Row>
              <MemberList teamUserList={teamUserList}
                          teamID={teamID}
                          removeTeamusers={removeTeamusers}
                          loadTeamUserList={loadTeamUserList}/>
            </Row>
          </Col>
          <Col span={3}/>
          <Col span={10}>
            <Row style={{marginBottom: 20}}>
              <Col span={6} style={{height: 36, lineHeight: '36px'}}>
                <Icon type="user" />
                团队空间 ({teamSpacesList.length})
              </Col>
              <Col span={6}>
                <Button type="primary" size="large" icon="plus" className="addBtn"
                        onClick={this.addNewSpace}>
                  创建新空间
                </Button>
                <Modal title="创建新空间" visible={this.state.addSpace}
                       onOk={this.handleNewSpaceOk} onCancel={this.handleNewSpaceCancel} wrapClassName="addSpaceModal">
                  <Row className="addSpaceItem">
                    <Col span={3}>名称</Col>
                    <Col span={21}>
                      <Input placeholder="新空间名称" onChange={this.handleNewSpaceName}/>
                    </Col>
                  </Row>
                  <Row className="addSpaceItem">
                    <Col span={3}>备注</Col>
                    <Col span={21}>
                      <Input type="textarea" rows={5} onChange={this.handleNewSpaceDes}/>
                    </Col>
                  </Row>
                </Modal>
              </Col>
            </Row>
            <Row>
              <TeamList teamSpacesList={teamSpacesList}/>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}
function mapStateToProp(state,props) {
  let clusterData = []
  let clusterList = []
  let teamUserList = []
  let teamSpacesList = []
  let teamUserIDList = []
  const { team_id, team_name } = props.params
  const team = state.team
  if(team.teamusers){
    if(team.teamusers.result){
      const teamusers = team.teamusers.result.users
      teamusers.map((item,index) => {
        teamUserList.push(
          {
            key: item.userID,
            name: item.userName,
            tel: item.phone,
            email: item.email,
            style: item.role === 0?'普通成员':'系统管理员',
          }
        )
        teamUserIDList.push(item.userID)
      })
    }
  }
  if(team.teamClusters){
    const cluster = team.teamClusters
    if (cluster.result) {
      if (cluster.result.data) {
        clusterData = cluster.result.data
        if(clusterData.length !== 0){
          clusterData.map((item,index) => {
            clusterList.push(
              {
                key: index,
                apiHost: item.apiHost,
                clusterID:item.clusterID,
                clusterName:item.clusterName,
              }
            )
          })
        }
      }
    }
  }
  if(team.teamspaces){
    const teamSpaces = team.teamspaces
    if(teamSpaces.result){
      if(teamSpaces.result.data){
        teamSpaces.result.data.map((item,index) => {
          teamSpacesList.push(
            {
              key: item.spaceID,
              spaceName: item.spaceName,
              description: item.description,
              appCount: item.balance,
            }
          )
        })
      }
    }
  }
  return {
    teamID: team_id,
    teamName: team_name,
    clusterList: clusterList,
    teamUserList: teamUserList,
    teamSpacesList: teamSpacesList,
    teamUserIDList: teamUserIDList,
  }
}
export default connect(mapStateToProp, {
  deleteTeam,
  createTeamspace,
  addTeamusers,
  removeTeamusers,
  loadTeamspaceList,
  loadTeamUserList,
  loadTeamClustersList,
})(TeamDetail)