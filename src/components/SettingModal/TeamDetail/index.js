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
      
    }
  },
  handleEdit(e){
    
  },
  handleDel(e){
    
  },
  
  render: function(){
    let { sortedInfo, filteredInfo } = this.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const menu = (
      <Menu onClick={this.handleDel}>
        <Menu.Item key="1" style={{left:730,width:105}}>
          <Icon type="delete" />
          删除
        </Menu.Item>
      </Menu>
    )
    const columns = [
      {
        title: '成员名',
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
        <Table columns={columns} dataSource={memberListdata}/>
      </div>
    )
  }
})
let TeamList = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function(){
    let { sortedInfo, filteredInfo } = this.state
    sortedInfo = sortedInfo || {}
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
        title: '应用',
        dataIndex: 'app',
        key: 'app',
        sorter: (a, b) => a.app - b.app,
        sortOrder: sortedInfo.columnKey === 'app' && sortedInfo.order,
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
        <Table columns={columns} dataSource={teamListData}/>
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
      mockData: [],
      targetKeys: [],
    }
  }
  addNewMember(){
    this.setState({
      addMember: true,
    })
  }
  handleNewMemberOk(){
    this.setState({
      addMember: false,
    })
  }
  handleNewMemberCancel(e){
    this.setState({
      addMember: false,
    })
  }
  addNewSpace(){
    this.setState({
      addSpace: true,
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
    this.getMock();
  }
  componentWillMount(){
    const { loadTeamClustersList, loadTeamUserList, loadTeamspaceList, teamID, } = this.props
    loadTeamClustersList(teamID)
    console.log('loadTeamClustersList',loadTeamClustersList(teamID));
  }
  getMock() {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
      };
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  render(){
    const { loadTeamClustersList, teamID, } = this.props
    const cardTitle = (
      <Row>
        <Col span={8}>集群名</Col>
        <Col span={16}>开发测试集群Cluster</Col>
      </Row>
    )
    return (
      <div id='TeamDetail'>
        <Row style={{marginBottom:20}}>
          <Link className="back" to="/setting/team">返回</Link>
        </Row>
        <Row className="title">
          研发Team
        </Row>
        <Row className="content">
          <div className="balance">余额: &nbsp;<span>5998 T币</span></div>
        </Row>
        <Row className="content">
          <Alert message="这里展示了该团队在用的集群列表,资源配置是超级管理员在企业版后台,分配到该团队所用的计算等资源,以下集群对该团队的团队空间有效."/>
          <Row className="clusterList" gutter={30}>
            <Col span="8" className="clusterItem">
              <Card title={cardTitle}>
                <Row className="cardItem">
                  <Col span={8}>集群ID:</Col>
                  <Col span={16}>1231xxvsdf-qweqwe</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>访问地址</Col>
                  <Col span={16}>129.168.1.100</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>授权状态</Col>
                  <Col span={16}><span>已授权</span></Col>
                </Row>
              </Card>
            </Col>
            <Col span="8" className="clusterItem">
              <Card title={cardTitle}>
                <Row className="cardItem">
                  <Col span={8}>集群ID:</Col>
                  <Col span={16}>1231xxvsdf-qweqwe</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>访问地址</Col>
                  <Col span={16}>129.168.1.100</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>授权状态</Col>
                  <Col span={16}><span>已授权</span></Col>
                </Row>
              </Card>
            </Col>
            <Col span="8" className="clusterItem">
              <Card title={cardTitle}>
                <Row className="cardItem">
                  <Col span={8}>集群ID:</Col>
                  <Col span={16}>1231xxvsdf-qweqwe</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>访问地址</Col>
                  <Col span={16}>129.168.1.100</Col>
                </Row>
                <Row className="cardItem">
                  <Col span={8}>授权状态</Col>
                  <Col span={16}><span>已授权</span></Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Row>
        <Row className="content">
          <Col span={11}>
            <Row style={{marginBottom: 20}}>
              <Col span={6} style={{height: 36, lineHeight: '36px'}}>
                <Icon type="user" />
                成员数(3)
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
                  <Row className="listTitle">
                    <Col span={10}>成员名</Col>
                    <Col span={12}>所属团队</Col>
                  </Row>
                  <Row className="listTitle" style={{left:393}}>
                    <Col span={10}>成员名</Col>
                    <Col span={12}>所属团队</Col>
                  </Row>
                  <Transfer
                    dataSource={this.state.mockData}
                    showSearch
                    listStyle={{
                      width: 250,
                      height: 300,
                    }}
                    operations={['添加', '移除']}
                    targetKeys={this.state.targetKeys}
                    onChange={this.handleChange}
                    titles={['筛选用户','已选择用户']}
                    render={
                      item => (
                        <Row style={{display:'inline-block',width:'100%'}}>
                          <Col span={10} style={{overflow:'hidden'}}>{item.title}</Col>
                          <Col span={14} style={{overflow:'hidden'}}>{item.description}</Col>
                        </Row>
                      )
                    }
                  />
                </Modal>
              </Col>
            </Row>
            <Row>
              <MemberList />
            </Row>
          </Col>
          <Col span={3}/>
          <Col span={10}>
            <Row style={{marginBottom: 20}}>
              <Col span={6} style={{height: 36, lineHeight: '36px'}}>
                <Icon type="user" />
                团队空间 (2)
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
              <TeamList />
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
  const { team_id } = props.params
  console.log('state',state);
  const cluster = state.team.teamClusters
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
  return {
    teamID: team_id,
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