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

const memberListdata = [
  {name: 'pupumeng',tel: '11111111',email: '123@123.com',style: '创业者'},
  {name: 'pupumeng',tel: '11111111',email: '123@123.com',style: '创业者'},
  {name: 'pupumeng',tel: '11111111',email: '123@123.com',style: '创业者'},
  {name: 'pupumeng',tel: '11111111',email: '123@123.com',style: '创业者'},
  {name: 'pupumeng',tel: '11111111',email: '123@123.com',style: '创业者'},
]
const teamListData = [
  {teamName: '奔驰外包开发',remark: '外包团队使用的空间',app: '2333',},
  {teamName: '民生测试开发',remark: '测试金融changing',app: '0',},
]
let MemberList = React.createClass({
  getInitialState(){
    return {
      pagination: {},
      loading: false,
      sortOrder: true,
    }
  },
  handleEdit(e){
    
  },
  handleDel(e){
    
  },
  onRowClick(){
    const { sortOrder } = this.state
    this.setState({
      sortOrder: !sortOrder,
    })
    //req
  },
  componentDidMount() {
  },
  render: function(){
    let { sortedInfo, filteredInfo } = this.state
    const { teamUserList } = this.props
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    /*const menu = (
      <Menu onClick={this.handleDel}>
        <Menu.Item key="1" style={{left:730,width:105}}>
          <Icon type="delete" />
          删除
        </Menu.Item>
      </Menu>
    )*/
    const columns = [
      {
        title: (
          <div onClick={this.onRowClick}>
            成员名
            <div className="ant-table-column-sorter">
              <span className= {this.state.sortOrder?'ant-table-column-sorter-up on':'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up"/>
              </span>
              <span className= {!this.state.sortOrder?'ant-table-column-sorter-down on':'ant-table-column-sorter-down off'} title="↓">
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
        render:() => (
          <div className="cardBtns">
            {/*<Dropdown.Button onClick={this.handleEdit} overlay={menu} trigger={['click']} getPopupContainer={
              () => document.getElementsByClassName('cardBtns')
            }>
              <Icon type="edit" />
              修改
            </Dropdown.Button>*/}
            <Button icon="delete" className="delBtn">
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
    }
  },
  onRowClick(){
    const { sortOrder } = this.state
    this.setState({
      sortOrder: !sortOrder,
    })
    //req
  },
  render: function(){
    let { sortedInfo, filteredInfo } = this.state
    const { teamSpacesList } = this.props
    filteredInfo = filteredInfo || {}
    const columns = [
      {
        title: '空间名',
        dataIndex: 'teamName',
        key: 'teamName',
        className: 'tablePadding',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: (
          <div onClick={this.onRowClick}>
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
        ),
        dataIndex: 'app',
        key: 'app',
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
    this.state = {
      addMember: false,
      addSpace: false,
      targetKeys:[],
    }
  }
  addNewMember(){
    
    this.setState({
      addMember: true,
    })
  }
  handleNewMemberOk(){
    const { addTeamusers, teamID } = this.props
    const { targetKeys } = this.state
    if(targetKeys.length !== 0){
      addTeamusers(teamID,{
        
      },{
        success: {
          func:() => {
            this.setState({
              addMember: false,
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
    const { createTeamspace, teamID } = this.props
    createTeamspace(teamID,{
      
    },{
      success: {
        func:() => {
          this.setState({
            addSpace: true,
          })
        },
        isAsync: true
      }
    })
  }
  handleNewSpaceOk(){
    const {createTeamspace, teamID, loadTeamspaceList} = this.props
    createTeamspace(teamID,{
      
    },{
      success:{
        func:() => {
          console.log('create !');
          loadTeamspaceList()
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
  componentDidMount() {
  }
  componentWillMount(){
    const { loadTeamClustersList, loadTeamUserList, loadTeamspaceList, teamID, } = this.props
    loadTeamClustersList(teamID)
    // loadTeamUserList(teamID)
    // loadTeamspaceList(teamID)
  }
  
  render(){
    const { clusterList, teamUserList, teamSpacesList } = this.props
    const { targetKeys } = this.state
    return (
      <div id='TeamDetail'>
        <Row style={{marginBottom:20}}>
          <Link className="back" to="/setting/team">返回</Link>
        </Row>
        <Row className="title">
          研发Team
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
                  <MemberTransfer onChange={this.handleChange} targetKeys={targetKeys}/>
                </Modal>
              </Col>
            </Row>
            <Row>
              <MemberList teamUserList={teamUserList}/>
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
                      <Input placeholder="新空间名称"/>
                    </Col>
                  </Row>
                  <Row className="addSpaceItem">
                    <Col span={3}>备注</Col>
                    <Col span={21}>
                      <Input type="textarea" rows={5}/>
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
  let userList = []
  let teamSpacesList = []
  const { team_id } = props.params
  console.log('state',state);
  const team = state.team
  const users = state.user.users
  if(team.teamusers){
    team.teamusers.map((item,index) => {
      teamUserList.push(
        {
          key: index,
          title: '',
          description: '',
          name: 'pupumeng',
          tel: '11111111',
          email: '123@123.com',
          style: '创业者',
        }
      )
    })
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
    teamSpaces.map((item,index) => {
      teamSpacesList.push(
        {
          key: index,
          
        }
      )
    })
  }
  if(users){
    
  }
  
  return {
    teamID: team_id,
    clusterList: clusterList,
    teamUserList: teamUserList,
    userList: userList,
    teamSpacesList: teamSpacesList,
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